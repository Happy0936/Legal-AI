
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def test_api(request):
    return JsonResponse({"status": "Backend API working successfully 🚀"})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/test/', test_api),
    path('', include('ipc.urls')),
]

