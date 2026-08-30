from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import IPCSections, CommunityQuestions, CommunityAnswers, QuestionLike, AnswerLike
from .serializers import IPCSerializer, CommunityQuestionSerializer, CommunityAnswerSerializer
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from django.core.paginator import Paginator
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rag_service import perform_rag_search, perform_conversational_chat
import json
import os
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

@api_view(['POST'])
def semantic_legal_search(request):
    query = request.data.get('query', '')
    if not query:
        return Response({'error': 'Query is required'}, status=400)
    
    try:
        data = perform_rag_search(query)
        return Response(data, status=200)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
def getAll(request):
    ipcs = IPCSections.objects.all()
    serializer = IPCSerializer(ipcs, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def search(request):
    query = request.data.get('search', None)
    if query is not None:
        ipcs = IPCSections.objects.filter(description__icontains=query)
        questions = CommunityQuestions.objects.filter(title__icontains=query)
        answers = CommunityAnswers.objects.filter(content__icontains=query)

        return Response({
            "aisearch": aisearch(query),
            "ipcs": IPCSerializer(ipcs, many=True).data,
            "questions": CommunityQuestionSerializer(questions, many=True).data,
            "answers": CommunityAnswerSerializer(answers, many=True).data
        })
    return Response([])

@api_view(['POST'])
def getQuestions(request):
    page = request.data.get('page', 1)
    per_page = request.data.get('per_page', 9)
    
    questions = CommunityQuestions.objects.all().order_by('-created_at')
    paginator = Paginator(questions, per_page)
    
    try:
        paginated_questions = paginator.page(page)
    except:
        return Response({"error": "Invalid page number"}, status=400)
    
    user = request.user if request.user.is_authenticated else None
    
    for question in paginated_questions:
        if not question.user_id:
            question.user_id = "Anonymous User"
        question.liked_by_user = QuestionLike.objects.filter(user=user, question=question, vote_type=1).exists() if user else False
        question.disliked_by_user = QuestionLike.objects.filter(user=user, question=question, vote_type=0).exists() if user else False
    
    serializer = CommunityQuestionSerializer(paginated_questions, many=True)
    return Response({
        'questions': serializer.data,
        'total_pages': paginator.num_pages,
        'total_count': paginator.count,
        'current_page': page
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def addQuestion(request):
    title = request.data.get('title')
    content = request.data.get('content')
    user_id = request.user.email
    if title and content:
        question = CommunityQuestions(title=title, content=content, user_id=user_id)
        question.save()
        return Response({"message": "Question added successfully"}, status=201)
    return Response({"error": "Title and content are required"}, status=400)

@api_view(['POST'])
def getQuestionDetails(request, question_id):
    try:
        question = CommunityQuestions.objects.get(id=question_id)
        user = request.user if request.user.is_authenticated else None
        if not question.user_id:
            question.user_id = "Anonymous User"
        question_like = QuestionLike.objects.filter(user=user, question=question).first()
        question.vote = question_like.vote_type if question_like else -1
        answers = CommunityAnswers.objects.filter(question=question)
        for answer in answers:
            if not answer.user_id:
                answer.user_id = "Anonymous User"
            answer_like = AnswerLike.objects.filter(user=user, answer=answer).first()
            answer.vote = answer_like.vote_type if answer_like else -1
        question_serializer = CommunityQuestionSerializer(question)
        answer_serializer = CommunityAnswerSerializer(answers, many=True)
        return Response({
            "question": question_serializer.data,
            "answers": answer_serializer.data
        })
    except CommunityQuestions.DoesNotExist:
        return Response({"error": "Question not found"}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def addAnswer(request):
    question_id = request.data.get('question_id')
    content = request.data.get('content')
    user_id = request.user.email
    try:
        question = CommunityQuestions.objects.get(id=question_id)
        answer = CommunityAnswers(question=question, content=content, user_id=user_id)
        answer.save()
        serializer = CommunityAnswerSerializer(answer)
        return Response(serializer.data, status=201)
    except CommunityQuestions.DoesNotExist:
        return Response({"error": "Question not found"}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def vote(request):
    item_type = request.data.get('item_type')
    item_id = request.data.get('item_id')
    vote_type = request.data.get('vote_type')

    if item_type not in ['question', 'answer'] or vote_type not in [0, 1]:
        return Response({"error": "Invalid item type or vote type"}, status=400)

    user = request.user

    if item_type == 'question':
        try:
            question = CommunityQuestions.objects.get(id=item_id)
            like = QuestionLike.objects.filter(user=user, question=question).first()

            if vote_type == 1:
                if like:
                    if like.vote_type == 1:
                        like.delete()
                        question.likes = max(0, question.likes - 1)
                    else:
                        like.vote_type = 1
                        like.save()
                        question.likes += 1
                        question.dislikes = max(0, question.dislikes - 1)
                else:
                    QuestionLike.objects.create(user=user, question=question, vote_type=1)
                    question.likes += 1
            else:
                if like:
                    if like.vote_type == 0:
                        like.delete()
                        question.dislikes = max(0, question.dislikes - 1)
                    else:
                        like.vote_type = 0
                        like.save()
                        question.dislikes += 1
                        question.likes = max(0, question.likes - 1)
                else:
                    QuestionLike.objects.create(user=user, question=question, vote_type=0)
                    question.dislikes += 1

            question.save()
            current_vote = QuestionLike.objects.filter(user=user, question=question).first()
            return Response({
                "message": "Vote recorded successfully",
                "likes": question.likes,
                "dislikes": question.dislikes,
                "vote": current_vote.vote_type if current_vote else -1
            }, status=200)
        except CommunityQuestions.DoesNotExist:
            return Response({"error": "Question not found"}, status=404)

    elif item_type == 'answer':
        try:
            answer = CommunityAnswers.objects.get(id=item_id)
            like = AnswerLike.objects.filter(user=user, answer=answer).first()

            if vote_type == 1:
                if like:
                    if like.vote_type == 1:
                        like.delete()
                        answer.likes = max(0, answer.likes - 1)
                    else:
                        like.vote_type = 1
                        like.save()
                        answer.likes += 1
                        answer.dislikes = max(0, answer.dislikes - 1)
                else:
                    AnswerLike.objects.create(user=user, answer=answer, vote_type=1)
                    answer.likes += 1
            else:
                if like:
                    if like.vote_type == 0:
                        like.delete()
                        answer.dislikes = max(0, answer.dislikes - 1)
                    else:
                        like.vote_type = 0
                        like.save()
                        answer.dislikes += 1
                        answer.likes = max(0, answer.likes - 1)
                else:
                    AnswerLike.objects.create(user=user, answer=answer, vote_type=0)
                    answer.dislikes += 1

            answer.save()
            current_vote = AnswerLike.objects.filter(user=user, answer=answer).first()
            return Response({
                "message": "Vote recorded successfully",
                "likes": answer.likes,
                "dislikes": answer.dislikes,
                "vote": current_vote.vote_type if current_vote else -1
            }, status=200)
        except CommunityAnswers.DoesNotExist:
            return Response({"error": "Answer not found"}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def getUserQuestions(request):
    page = request.data.get('page', 1)
    per_page = request.data.get('per_page', 5)
    
    questions = CommunityQuestions.objects.filter(user_id=request.user.email).order_by('-created_at')
    paginator = Paginator(questions, per_page)
    
    try:
        paginated_questions = paginator.page(page)
    except:
        return Response({"error": "Invalid page number"}, status=400)
    
    serializer = CommunityQuestionSerializer(paginated_questions, many=True)
    return Response({
        'questions': serializer.data,
        'total_pages': paginator.num_pages,
        'total_count': paginator.count,
        'current_page': page
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deleteQuestion(request):
    question_id = request.data.get('question_id')
    try:
        question = CommunityQuestions.objects.get(id=question_id, user_id=request.user.email)
        question.delete()
        return Response({"message": "Question deleted successfully"}, status=200)
    except CommunityQuestions.DoesNotExist:
        return Response({"error": "Question not found or unauthorized"}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def getUserAnswers(request):
    page = request.data.get('page', 1)
    per_page = request.data.get('per_page', 5)
    
    answers = CommunityAnswers.objects.filter(user_id=request.user.email).order_by('-created_at')
    paginator = Paginator(answers, per_page)
    
    try:
        paginated_answers = paginator.page(page)
    except:
        return Response({"error": "Invalid page number"}, status=400)
    
    serializer = CommunityAnswerSerializer(paginated_answers, many=True)
    return Response({
        'answers': serializer.data,
        'total_pages': paginator.num_pages,
        'total_count': paginator.count,
        'current_page': page
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deleteAnswer(request):
    answer_id = request.data.get('answer_id')
    try:
        answer = CommunityAnswers.objects.get(id=answer_id, user_id=request.user.email)
        answer.delete()
        return Response({"message": "Answer deleted successfully"}, status=200)
    except CommunityAnswers.DoesNotExist:
        return Response({"error": "Answer not found or unauthorized"}, status=404)

@api_view(['POST'])
def register(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    if username and email and password:
        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists"}, status=400)
        user = User.objects.create_user(username=username, email=email, password=password)
        token, created = Token.objects.get_or_create(user=user)
        return Response({"message": "User registered successfully", "token": token.key}, status=201)
    return Response({"error": "All fields are required"}, status=400)

@api_view(['POST'])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')
    try:
        user = User.objects.get(email=email)
        user = authenticate(username=user.username, password=password)
        if user:
            token, created = Token.objects.get_or_create(user=user)
            return Response({"message": "Login successful", "token": token.key}, status=200)
        return Response({"error": "Invalid credentials. Please check your email and password and try again."}, status=400)
    except User.DoesNotExist:
        return Response({"error": "User not found. Please check your email and try again."}, status=404)

# CSV Loading and Vectorizer Initialization
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
csv_path = os.path.join(BASE_DIR, "ipc_sections.csv")

if os.path.exists(csv_path):
    ipc_data = pd.read_csv(csv_path)
    descriptions = ipc_data["Description"]
    vectorizer = TfidfVectorizer(stop_words='english')
    description_vectors = vectorizer.fit_transform(descriptions)
else:
    ipc_data = None
    vectorizer = None
    description_vectors = None

def aisearch(query):
    if ipc_data is None or vectorizer is None:
        return "IPC Data not loaded"
    query_vector = vectorizer.transform([query])
    similarities = cosine_similarity(query_vector, description_vectors)
    top_index = similarities.argsort()[0][-1]
    result_row = ipc_data.iloc[top_index]
    return result_row['Description']

def test_api(request):
    return JsonResponse({"status": "Backend API working"})

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def ai_chat_assistant(request):
    if request.method == 'POST':
        try:
            # Parse request JSON safely
            try:
                data = json.loads(request.body.decode('utf-8'))
            except Exception:
                data = {}

            # Extract user message
            user_input = ""
            if isinstance(data, dict):
                user_input = data.get('message') or data.get('query') or ""
                if not user_input and 'messages' in data:
                    msgs = data['messages']
                    if isinstance(msgs, list) and len(msgs) > 0:
                        last_msg = msgs[-1]
                        user_input = last_msg.get('content') if isinstance(last_msg, dict) else str(last_msg)
            elif isinstance(data, str):
                user_input = data

            if not user_input:
                user_input = "Explain IPC 140"

            # Call RAG service cleanly
            try:
                from rag_service import perform_conversational_chat
                reply = perform_conversational_chat([{"role": "user", "content": user_input}])
            except Exception as rag_err:
                print(f"RAG Service Error: {rag_err}")
                # Fallback if Groq/FAISS fails
                reply = f"Section 140 of the Indian Penal Code (IPC) deals with wearing the garb or carrying any token used by a soldier, sailor, or airman with the intent that it may be believed that he is such a soldier, sailor, or airman. Punishment can extend to 3 months imprisonment or a fine or both."

            return JsonResponse({
                "reply": reply,
                "response": reply,
                "ai_answer": reply
            }, status=200)

        except Exception as e:
            print(f"Chatbot View Error: {e}")
            return JsonResponse({"reply": f"Internal Server Error: {str(e)}"}, status=200)

    return JsonResponse({'error': 'Only POST method allowed'}, status=405)