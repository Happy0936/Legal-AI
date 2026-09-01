import os
import logging
from dotenv import load_dotenv
from langchain_groq import ChatGroq

logger = logging.getLogger(__name__)

# Absolute path se .env load karein
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

def get_llm_model(temperature=0.3, max_tokens=1500):

    groq_key = os.getenv("GROQ_API_KEY")
    
    if not groq_key:
        logger.error("GROQ_API_KEY .env file not found")
        raise ValueError("GROQ_API_KEY is missing from the .env environment variables.")

    try:
        llm = ChatGroq(
            groq_api_key=groq_key, 
            model_name="openai/gpt-oss-120b", 
            temperature=temperature,
            max_tokens=max_tokens,
            model_kwargs={
                "top_p": 0.95
            }
        )
        return llm
    except Exception as e:
        logger.exception(f"LLM Model initialize error : {e}")
        raise e