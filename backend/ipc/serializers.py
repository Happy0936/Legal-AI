from rest_framework import serializers
from .models import IPCSections, CommunityQuestions, CommunityAnswers,QuestionLike,AnswerLike

class IPCSerializer(serializers.ModelSerializer):
    class Meta:
        model = IPCSections
        fields = '__all__'  # Or list specific fields

class CommunityQuestionSerializer(serializers.ModelSerializer):
    likes = serializers.IntegerField()
    dislikes = serializers.IntegerField()
    vote = serializers.SerializerMethodField()  # Change to SerializerMethodField
    
    class Meta:
        model = CommunityQuestions
        fields = '__all__'
    
    def get_vote(self, obj):
        request = self.context.get('request', None)
        if request and request.user.is_authenticated:
            question_like = QuestionLike.objects.filter(user=request.user, question=obj).first()
            return question_like.vote_type if question_like else -1
        return -1

class CommunityAnswerSerializer(serializers.ModelSerializer):
    likes = serializers.IntegerField()
    dislikes = serializers.IntegerField()
    vote = serializers.SerializerMethodField()  # Change to SerializerMethodField
    
    class Meta:
        model = CommunityAnswers
        fields = '__all__'
    
    def get_vote(self, obj):
        request = self.context.get('request', None)
        if request and request.user.is_authenticated:
            answer_like = AnswerLike.objects.filter(user=request.user, answer=obj).first()
            return answer_like.vote_type if answer_like else -1
        return -1
