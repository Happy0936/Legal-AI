import os
import re
from dotenv import load_dotenv
from langchain_community.document_loaders import CSVLoader
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

# 1. Absolute Path Resolution (Fixes file not found errors)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(BASE_DIR, ".env")
load_dotenv(env_path)

# 2. Safe Environment Key retrieval with fallback
GROQ_KEY = os.getenv("GROQ_API_KEY", "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")

# 3. Model Initialization
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
vectorstore_cache = None

def get_vector_store():
    global vectorstore_cache
    if vectorstore_cache is not None:
        return vectorstore_cache

    # Always use BASE_DIR for FAISS Index path
    index_path = os.path.join(BASE_DIR, "faiss_ipc_index")
    if os.path.exists(index_path):
        try:
            vectorstore_cache = FAISS.load_local(index_path, embeddings, allow_dangerous_deserialization=True)
            return vectorstore_cache
        except Exception as e:
            print(f"Error loading index, rebuilding: {e}")

    # Always use BASE_DIR for CSV path
    csv_path = os.path.join(BASE_DIR, "ipc_sections.csv")
    if os.path.exists(csv_path):
        loader = CSVLoader(file_path=csv_path, encoding="utf-8")
        docs = loader.load()
        vectorstore_cache = FAISS.from_documents(docs, embeddings)
        vectorstore_cache.save_local(index_path)
        return vectorstore_cache
    else:
        print(f"Error: ipc_sections.csv file not found at {csv_path}!")
        return None

def perform_rag_search(user_query):
    """
    Search bar feature with exact keyword sorting to prevent irrelevant IPC results.
    """
    vectorstore = get_vector_store()
    if not vectorstore:
        return {"ai_answer": "Database not available.", "semantic_matches": []}

    # Fetch top 10 raw vector matches
    raw_docs = vectorstore.similarity_search(user_query, k=10)
    
    # Extract query keywords for relevance scoring
    keywords = [word.lower() for word in re.findall(r'\w+', user_query) if len(word) > 2]
    
    scored_docs = []
    for doc in raw_docs:
        content_lower = doc.page_content.lower()
        score = sum(1 for kw in keywords if kw in content_lower)
        scored_docs.append((doc, score))
    
    # Sort docs: Highest keyword matches come first
    scored_docs.sort(key=lambda x: x[1], reverse=True)
    
    # Filter top relevant docs
    top_docs = [doc for doc, score in scored_docs if score > 0]
    if not top_docs:
        top_docs = [doc for doc, _ in scored_docs[:4]]
    else:
        top_docs = top_docs[:4]

    ipc_results = [{"content": doc.page_content, "metadata": doc.metadata} for doc in top_docs]
    context_str = "\n\n".join(doc.page_content for doc in top_docs)

    llm = ChatGroq(
        groq_api_key=GROQ_KEY, 
        model_name="llama-3.3-70b-versatile", 
        temperature=0.2
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert Indian Legal Assistant. STRICT RULE: Respond ONLY in clear, fluent, professional English. Answer the query precisely using the provided IPC context.\n\nContext:\n{context}"),
        ("human", "{input}")
    ])

    chain = prompt | llm | StrOutputParser()
    ai_answer = chain.invoke({"context": context_str, "input": user_query})
    
    return {
        "ai_answer": ai_answer,
        "semantic_matches": ipc_results
    }

def perform_conversational_chat(chat_history):
    """
    AI Chatbot with strict English enforcement and robust error handling.
    """
    try:
        latest_query = chat_history[-1]["content"] if chat_history else "Hello"
        context_str = ""

        try:
            vectorstore = get_vector_store()
            if vectorstore:
                retrieved_docs = vectorstore.similarity_search(latest_query, k=3)
                context_str = "\n\n".join(doc.page_content for doc in retrieved_docs)
        except Exception as e:
            print(f"Vectorstore Warning: {e}")
            context_str = "No specific IPC section found for this query."

        llm = ChatGroq(
            groq_api_key=GROQ_KEY, 
            model_name="llama-3.3-70b-versatile", 
            temperature=0.3
        )

        system_prompt = (
            "You are Legal Aid AI, an expert Indian Legal Assistant.\n"
            "STRICT LANGUAGE RULE: You MUST reply strictly and exclusively in clear, professional English.\n"
            "Provide accurate legal advice based on the IPC context below.\n\n"
            f"IPC Context:\n{context_str}"
        )

        messages = [("system", system_prompt)]
        for msg in chat_history:
            role = "human" if msg["role"] == "user" else "ai"
            messages.append((role, msg["content"]))

        response = llm.invoke(messages)
        return response.content

    except Exception as err:
        print(f"Chatbot Critical Error: {err}")
        return "I apologize, but I encountered an internal server error while processing your request. Please try again in a moment."