from django.urls import path
from . import views

urlpatterns = [
    path('test/', views.test_api, name='test_api'),
    path('getall/', views.getAll, name='get_all'),
    path('search/', views.search, name='search'),
    path('getQuestions/', views.getQuestions, name='get_questions'),
    path('addQuestion/', views.addQuestion, name='add_question'),
    path('question/<int:question_id>/', views.getQuestionDetails, name='get_question_details'),
    path('addAnswer/', views.addAnswer, name='add_answer'),
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('vote/', views.vote, name='vote'),
    path('ai-chat/', views.ai_chat_assistant, name='ai_chat_assistant'),
    path('getUserQuestions/', views.getUserQuestions, name='get_user_questions'),
    path('deleteQuestion/', views.deleteQuestion, name='delete_question'),
    path('getUserAnswers/', views.getUserAnswers, name='get_user_answers'),
    path('deleteAnswer/', views.deleteAnswer, name='delete_answer'),
    path('semantic-search/', views.semantic_search_api, name='semantic_search'),
    path('chat/', views.ai_chat_assistant, name='ai_chat_alias'),
    path('diagnostics/', views.system_diagnostics, name='diagnostics'),
]