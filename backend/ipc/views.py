import os
import logging
from django.db import connection
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

# Import your AI services
from rag_service import perform_rag_search, perform_conversational_chat

logger = logging.getLogger(__name__)

# ==========================================
# 1. YOUR ORIGINAL APP VIEWS (STUBBED)
# You must paste your original database logic 
# back into these functions!
# ==========================================

@api_view(['GET', 'POST'])
def getAll(request):
    # TODO: RESTORE YOUR ORIGINAL CODE HERE
    return Response({"message": "Please restore your original getAll logic"}, status=status.HTTP_200_OK)

@api_view(['GET', 'POST'])
def search(request):
    # TODO: RESTORE YOUR ORIGINAL CODE HERE
    return Response({"message": "Please restore your original search logic"}, status=status.HTTP_200_OK)

@api_view(['GET'])
def getQuestions(request):
    # TODO: RESTORE YOUR ORIGINAL CODE HERE
    return Response([], status=status.HTTP_200_OK)

@api_view(['POST'])
def addQuestion(request):
    # TODO: RESTORE YOUR ORIGINAL CODE HERE
    return Response({"message": "Please restore your original addQuestion logic"}, status=status.HTTP_200_OK)

@api_view(['GET'])
def getQuestionDetails(request, question_id):
    # TODO: RESTORE YOUR ORIGINAL CODE HERE
    return Response({"id": question_id}, status=status.HTTP_200_OK)

@api_view(['POST'])
def addAnswer(request):
    # TODO: RESTORE YOUR ORIGINAL CODE HERE
    return Response({"message": "Please restore your original addAnswer logic"}, status=status.HTTP_200_OK)

@api_view(['POST'])
def register(request):
    # TODO: RESTORE YOUR ORIGINAL CODE HERE
    return Response({"message": "Please restore your original register logic"}, status=status.HTTP_200_OK)

@api_view(['POST'])
def login(request):
    # TODO: RESTORE YOUR ORIGINAL CODE HERE
    return Response({"message": "Please restore your original login logic"}, status=status.HTTP_200_OK)

@api_view(['POST'])
def vote(request):
    # TODO: RESTORE YOUR ORIGINAL CODE HERE
    return Response({"message": "Please restore your original vote logic"}, status=status.HTTP_200_OK)

@api_view(['GET'])
def getUserQuestions(request):
    # TODO: RESTORE YOUR ORIGINAL CODE HERE
    return Response([], status=status.HTTP_200_OK)

@api_view(['DELETE', 'POST'])
def deleteQuestion(request):
    # TODO: RESTORE YOUR ORIGINAL CODE HERE
    return Response({"message": "Please restore your original deleteQuestion logic"}, status=status.HTTP_200_OK)

@api_view(['GET'])
def getUserAnswers(request):
    # TODO: RESTORE YOUR ORIGINAL CODE HERE
    return Response([], status=status.HTTP_200_OK)

@api_view(['DELETE', 'POST'])
def deleteAnswer(request):
    # TODO: RESTORE YOUR ORIGINAL CODE HERE
    return Response({"message": "Please restore your original deleteAnswer logic"}, status=status.HTTP_200_OK)

@api_view(['GET'])
def test_api(request):
    return Response({"message": "Test API successful"}, status=status.HTTP_200_OK)


# ==========================================
# 2. NEW AI & RAG VIEWS
# ==========================================

@api_view(['POST'])
def semantic_search_api(request):
    user_query = request.data.get('query', '')
    if not user_query:
        logger.warning("[Semantic Search] Missing query parameter")
        return Response({'error': 'Query parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        results = perform_rag_search(user_query)
        return Response(results, status=status.HTTP_200_OK)
    except Exception as e:
        logger.exception("[Semantic Search] Execution failed")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def ai_chat_assistant(request):
    """
    Handles conversational history payload from the frontend.
    """
    chat_history = request.data.get('chat_history', [])
    
    if not chat_history:
        # Fallback in case frontend sends 'message' instead of 'chat_history'
        single_msg = request.data.get('message')
        if single_msg:
            chat_history = [{"role": "user", "content": single_msg}]
        else:
            logger.warning("[AI Chat] Missing chat_history parameter")
            return Response({'error': 'chat_history is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        response_text = perform_conversational_chat(chat_history)
        return Response({"response": response_text}, status=status.HTTP_200_OK)
    except Exception as e:
        logger.exception("[AI Chat] Execution failed")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def system_diagnostics(request):
    """
    Diagnostic endpoint to verify connections without triggering an LLM call.
    """
    health = {
        "database": "unknown",
        "faiss_index_exists": os.path.exists(os.path.join(os.path.dirname(__file__), '..', 'faiss_ipc_index', 'index.faiss')),
        "api_key_set": bool(os.getenv("GROQ_API_KEY")),
    }
    
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        health["database"] = "healthy"
    except Exception as e:
        health["database"] = f"error: {str(e)}"

    return Response(health)