import os
import re
import logging
from dotenv import load_dotenv
from langchain_community.document_loaders import CSVLoader
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from llm_model import get_llm_model

# Configure logging for this file
logger = logging.getLogger(__name__)

# 1. Absolute Path Resolution
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(BASE_DIR, ".env")
load_dotenv(env_path)

# 3. Model Initialization (Embeddings)
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
vectorstore_cache = None

def get_vector_store():
    global vectorstore_cache
    if vectorstore_cache is not None:
        return vectorstore_cache

    index_path = os.path.join(BASE_DIR, "faiss_ipc_index")
    if os.path.exists(index_path):
        try:
            vectorstore_cache = FAISS.load_local(index_path, embeddings, allow_dangerous_deserialization=True)
            logger.info("Successfully loaded FAISS index from disk.")
            return vectorstore_cache
        except Exception as e:
            logger.error(f"Error loading index, rebuilding: {e}")

    csv_path = os.path.join(BASE_DIR, "ipc_sections.csv")
    if os.path.exists(csv_path):
        logger.info("Building new FAISS index from CSV...")
        loader = CSVLoader(file_path=csv_path, encoding="utf-8")
        docs = loader.load()
        vectorstore_cache = FAISS.from_documents(docs, embeddings)
        vectorstore_cache.save_local(index_path)
        return vectorstore_cache
    else:
        logger.error(f"Error: ipc_sections.csv file not found at {csv_path}!")
        return None

def perform_rag_search(user_query):
    logger.info(f"[RAG Search] Query received: {user_query}")
    vectorstore = get_vector_store()
    if not vectorstore:
        return {"ai_answer": "Database not available.", "semantic_matches": []}

    try:
        raw_docs = vectorstore.similarity_search(user_query, k=5)
        keywords = [word.lower() for word in re.findall(r'\w+', user_query) if len(word) > 2]
        
        scored_docs = []
        for doc in raw_docs:
            content_lower = doc.page_content.lower()
            score = sum(1 for kw in keywords if kw in content_lower)
            scored_docs.append((doc, score))
        
        scored_docs.sort(key=lambda x: x[1], reverse=True)
        top_docs = [doc for doc, score in scored_docs if score > 0]
        if not top_docs:
            top_docs = [doc for doc, _ in scored_docs[:2]]
        else:
            top_docs = top_docs[:2]

        ipc_results = [{"content": doc.page_content, "metadata": doc.metadata} for doc in top_docs]
        context_str = "\n\n".join(doc.page_content for doc in top_docs)

        llm = get_llm_model(temperature=0.2, max_tokens=500)

        prompt = ChatPromptTemplate.from_messages([
        (
        "system",
        """You are Legal Aid AI, an expert assistant for Indian legal information.

        STRICT RULES:

        1. Respond ONLY in clear, fluent, professional English.
        2. Answer the user's question using ONLY the information provided in the context.
        3. Do NOT invent, assume, or add legal sections or facts that are not present in the context.
        4. If the provided context does not contain enough information to answer the question, clearly say:
        "The provided legal context does not contain sufficient information to answer this question accurately."
        5. Provide a precise, clear, and easy-to-understand answer.
        6. When relevant, mention the IPC section number provided in the context.
        7. Do not give misleading or unsupported legal conclusions.

        LEGAL CONTEXT:
        {context}
        """
        ),
        ("human", "{input}")
        ])

        chain = prompt | llm | StrOutputParser()
        ai_answer = chain.invoke({"context": context_str, "input": user_query})
        
        return {
            "ai_answer": ai_answer,
            "semantic_matches": ipc_results
        }
    except Exception as e:
        logger.exception(f"[RAG Search Failed]: {e}")
        raise e

def perform_conversational_chat(chat_history):
    logger.info(f"[Chat] Processing conversation history of length {len(chat_history)}")
    try:
        latest_query = chat_history[-1]["content"] if chat_history else "Hello"
        context_str = ""

        try:
            vectorstore = get_vector_store()
            if vectorstore:
                retrieved_docs = vectorstore.similarity_search(latest_query, k=2)
                context_str = "\n\n".join(doc.page_content for doc in retrieved_docs)
        except Exception as e:
            logger.warning(f"Vectorstore Warning: {e}")
            context_str = "No specific IPC section found for this query."

        llm = get_llm_model(temperature=0.2, max_tokens=500)

        system_prompt = (
            "You are Legal Aid AI, an expert Indian Legal Assistant.\n"
            "STRICT LANGUAGE RULE: You MUST reply strictly and exclusively in clear, professional English.\n"
            "Provide accurate legal advice based on the IPC context below.\n\n"
            f"IPC Context:\n{context_str}"
        )

        messages = [("system", system_prompt)]
        for msg in chat_history:
            role = "human" if msg.get("role") == "user" else "ai"
            messages.append((role, msg.get("content", "")))

        response = llm.invoke(messages)
        return response.content

    except Exception as err:
        logger.exception(f"[Chatbot Critical Error]: {err}")
        return "I apologize, but I encountered an internal server error while processing your request. Please try again in a moment."