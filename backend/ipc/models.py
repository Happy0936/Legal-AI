from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

# Create your models here.
class IPCSections(models.Model):
    id = models.AutoField(primary_key=True)
    section_number = models.CharField(max_length=10)
    description = models.TextField(default="")
    offense = models.TextField(default="")
    punishment = models.TextField(default="")

    def __str__(self):
        return f"Section {self.section_number}: {self.description[:50]}"

class CommunityQuestions(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    content = models.TextField()
    likes = models.IntegerField(default=0)
    dislikes = models.IntegerField(default=0)
    created_at = models.DateTimeField(default=timezone.now)
    user_id = models.CharField(max_length=255, null=True, blank=True)  # Add default value null

    def __str__(self):
        return self.title

class CommunityAnswers(models.Model):
    id = models.AutoField(primary_key=True)
    question = models.ForeignKey(CommunityQuestions, on_delete=models.CASCADE)
    content = models.TextField()
    likes = models.IntegerField(default=0)
    dislikes = models.IntegerField(default=0)
    created_at = models.DateTimeField(default=timezone.now)
    user_id = models.CharField(max_length=255, null=True, blank=True)  # Add default value null

    def __str__(self):
        return f"Answer to {self.question.title}"

class QuestionLike(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    question = models.ForeignKey(CommunityQuestions, on_delete=models.CASCADE)
    vote_type = models.IntegerField(default=1)  # 1 for like, 0 for dislike

class AnswerLike(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    answer = models.ForeignKey(CommunityAnswers, on_delete=models.CASCADE)
    vote_type = models.IntegerField(default=1)  # 1 for like, 0 for dislike