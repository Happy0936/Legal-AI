from rest_framework.decorators import api_view
from rest_framework.response import Response
from .rag_service import perform_rag_search

@api_view(['POST'])
def semantic_search_api(request):
    user_query = request.data.get('query', '')
    if not user_query:
        return Response({'error': 'Query parameter is required'}, status=400)
    
    try:
        results = perform_rag_search(user_query)
        return Response(results, status=200)
    except Exception as e:
        return Response({'error': str(e)}, status=500)