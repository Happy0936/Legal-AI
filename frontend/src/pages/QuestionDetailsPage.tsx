import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import NetworkService from "@/NetworkService";
import { Card, CardDescription, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AuthContext } from "@/App";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";

interface Answer {
  id: number;
  content: string;
  created_at: string;
  likes: number;
  dislikes: number;
  vote: number;
  user_id: string;
}

interface Question {
  id: number;
  title: string;
  content: string;
  created_at: string;
  likes: number;
  dislikes: number;
  vote:number;
  user_id: string;
}

const QuestionDetailsPage = () => {
  const { question_id } = useParams<{ question_id: string }>();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [newAnswer, setNewAnswer] = useState('');
  const network = new NetworkService();
  const { auth } = useContext(AuthContext);

  useEffect(() => {
    network.request(`ipc/question/${question_id}/`, 'POST', {}, {}, (error: any, responseData: any) => {
      if (error) {
        console.error("Error fetching data:", error);
        return;
      }
      setQuestion(responseData.question);
      const sortedAnswers = responseData.answers.sort((a: Answer, b: Answer) => {
        if (a.likes === b.likes) {
          return a.dislikes - b.dislikes;
        }
        return b.likes - a.likes;
      });
      setAnswers(sortedAnswers);
    });
  }, [question_id]);

  const handleVote = (type: 'question' | 'answer', id: number, action: 'upvote' | 'downvote') => {
    if (!auth.isAuthenticated) {
      alert(`You need to be logged in to ${action} a ${type}`);
      return;
    }
    
    const voteType = action === 'upvote' ? 1 : 0;
    
    network.request('ipc/vote/', 'POST', { item_type: type, item_id: id, vote_type: voteType }, {}, (error: any, responseData: any) => {
      if (error) {
        console.error(`Error toggling ${action} on ${type}:`, error);
        return;
      }
      if (type === 'question' && question) {
        setQuestion(prevQuestion => {
          if (!prevQuestion) return prevQuestion;

          return {
            ...prevQuestion,
            likes:  responseData.likes,
            dislikes: responseData.dislikes,
            vote: responseData.vote
          };
        });
      } else if (type === 'answer') {
    

        setAnswers(prevAnswers => prevAnswers.map(answer => 
          answer.id === id ? {
            ...answer,
            likes:  responseData.likes,
            dislikes: responseData.dislikes,
            vote: responseData.vote
            } : answer
        ));
      }
    });
  };

  const handleAddAnswer = () => {
  
    network.request(`ipc/addAnswer`, 'POST', { question_id, content: newAnswer }, {}, (error: any, responseData: any) => {
      if (error) {
        console.error("Error adding answer:", error);
        return;
      }
      alert("Answer added successfully");
      setNewAnswer('');
      setAnswers([...answers, responseData]);
    });
  };

  return (
    <div className="flex flex-col items-center p-4">
      {question && (
        <>
          <h1 className="text-3xl font-bold mb-4">{question.title}</h1>
          <p className="text-lg mb-2">{question.content}</p>
          <p className="text-sm text-gray-500 mb-2">Asked by: {question.user_id}</p>
          <p className="text-sm text-gray-500 mb-6">Asked on: {new Date(question.created_at).toLocaleString()}</p>
          <div className="flex gap-2 mb-4 items-center">
            <FaThumbsUp
              onClick={() => handleVote('question', question.id, 'upvote')}
              className={`cursor-pointer ${question.vote == 1 ? 'text-green-500' : 'text-gray-500'}`}
            />
            <span>{question.likes}</span>
            <FaThumbsDown
              onClick={() => handleVote('question', question.id, 'downvote')}
              className={`cursor-pointer ${question.vote == 0 ? 'text-red-500' : 'text-gray-500'}`}
            />
            <span>{question.dislikes}</span>
          </div>
          <div className="flex flex-col gap-4 w-full">
            {answers.map(answer => (
              <Card key={answer.id} className="shadow-md">
                <CardContent>
                  <CardDescription className="text-base">{answer.content}</CardDescription>
                  <p className="text-sm text-gray-500 mt-2">Answered by: {answer.user_id}</p>
                  <p className="text-sm text-gray-500 mt-2">Answered on: {new Date(answer.created_at).toLocaleString()}</p>
                  <div className="flex gap-2 mt-2 items-center">
                    <FaThumbsUp
                      onClick={() => handleVote('answer', answer.id, 'upvote')}
                      className={`cursor-pointer ${answer.vote == 1 ? 'text-green-500' : 'text-gray-500'}`}
                    />
                    <span>{answer.likes}</span>
                    <FaThumbsDown
                      onClick={() => handleVote('answer', answer.id, 'downvote')}
                      className={`cursor-pointer ${answer.vote == 0 ? 'text-red-500' : 'text-gray-500'}`}
                    />
                    <span>{answer.dislikes}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-6 w-full">
            <Textarea placeholder="Add your answer" value={newAnswer} onChange={(e) => setNewAnswer(e.target.value)} className="mb-4 p-2 border rounded-md" />
            <Button onClick={handleAddAnswer} className="bg-blue-500 text-white p-2 rounded-md">Submit Answer</Button>
          </div>
        </>
      )}
    </div>
  );
}

export default QuestionDetailsPage;