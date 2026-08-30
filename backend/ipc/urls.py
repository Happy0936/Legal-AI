"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from .views import test_api
from .views import *
from . import views

urlpatterns = [
    path("test/", test_api),
    path('getall', getAll),
    path('search', search),
    path('getQuestions', getQuestions),
    path('addQuestion', addQuestion),
    path('question/<int:question_id>/', getQuestionDetails),
    path('addAnswer', addAnswer),
    path('register', register),
    path('login', login),
    path('vote/', vote),
    path('ai-chat/', views.ai_chat_assistant, name='ai_chat_assistant'),
    path('getUserQuestions', getUserQuestions, name='get_user_questions'),
    path('deleteQuestion', deleteQuestion, name='delete_question'),
    path('getUserAnswers', getUserAnswers, name='get_user_answers'),
    path('deleteAnswer', deleteAnswer, name='delete_answer'),
path('semantic-search/', views.semantic_legal_search, name='semantic_search'),path('chat/', views.ai_chat_assistant, name='ai_chat')]
