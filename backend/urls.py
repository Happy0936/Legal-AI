from django.contrib import admin
from django.urls import path, include
from ipc import views 

urlpatterns = [
    path('admin/', admin.site.urls),
    path('ipc/', include('ipc.urls')),
    
    # Map the /ai-chat/ URL to the ai_chat_assistant function
    path('ai-chat/', views.ai_chat_assistant, name='ai_chat'), 
]