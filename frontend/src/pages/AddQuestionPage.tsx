import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NetworkService from '@/NetworkService';
import { AuthContext } from '@/App';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trash2 } from 'lucide-react';

interface Question {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

interface PaginatedResponse {
  questions: Question[];
  total_pages: number;
  total_count: number;
  current_page: number;
}

interface Answer {
  id: number;
  content: string;
  created_at: string;
  question: {
    id: number;
    title: string;
  };
}

interface PaginatedAnswerResponse {
  answers: Answer[];
  total_pages: number;
  total_count: number;
  current_page: number;
}

const AddQuestionPage = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [userQuestions, setUserQuestions] = useState<Question[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Answer[]>([]);
  const [answerPage, setAnswerPage] = useState(1);
  const [totalAnswerPages, setTotalAnswerPages] = useState(1);
  const [isLoadingAnswers, setIsLoadingAnswers] = useState(false);
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);

  useEffect(() => {
    if (!authContext?.auth.isAuthenticated) {
      navigate('/login');
      return;
    }
    loadUserQuestions(1);
    loadUserAnswers(1);
  }, []);

  const loadUserQuestions = (page: number) => {
    setIsLoading(true);
    const network = new NetworkService();
    network.request(
      'ipc/getUserQuestions',
      'POST',
      { page, per_page: 5 },
      {},
      (error: any, responseData: PaginatedResponse) => {
        setIsLoading(false);
        if (error) {
          console.error("Error fetching questions:", error);
          return;
        }
        if (page === 1) {
          setUserQuestions(responseData.questions);
        } else {
          setUserQuestions(prev => [...prev, ...responseData.questions]);
        }
        setTotalPages(responseData.total_pages);
      }
    );
  };

  const loadUserAnswers = (page: number) => {
    setIsLoadingAnswers(true);
    const network = new NetworkService();
    network.request(
      'ipc/getUserAnswers',
      'POST',
      { page, per_page: 5 },
      {},
      (error: any, responseData: PaginatedAnswerResponse) => {
        setIsLoadingAnswers(false);
        if (error) {
          console.error("Error fetching answers:", error);
          return;
        }
        if (page === 1) {
          setUserAnswers(responseData.answers);
        } else {
          setUserAnswers(prev => [...prev, ...responseData.answers]);
        }
        setTotalAnswerPages(responseData.total_pages);
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const network = new NetworkService();
    network.request('ipc/addQuestion', 'POST', { title, content }, {}, (error: any, responseData: any) => {
      if (error) {
        console.error("Error adding question:", error);
        return;
      }
      loadUserQuestions(1); // Refresh the list after adding
      setTitle('');
      setContent('');
    });
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      loadUserQuestions(currentPage + 1);
    }
  };

  const handleQuestionClick = (id: number) => {
    navigate(`/question/${id}`);
  };

  const handleDelete = (e: React.MouseEvent, questionId: number) => {
    e.stopPropagation(); // Prevent triggering the card click
    if (window.confirm('Are you sure you want to delete this question?')) {
      setIsLoading(true);
      const network = new NetworkService();
      network.request(
        'ipc/deleteQuestion',
        'POST',
        { question_id: questionId },
        {},
        (error: any, responseData: any) => {
          setIsLoading(false);
          if (error) {
            console.error("Error deleting question:", error);
            return;
          }
          // Refresh the questions list
          loadUserQuestions(1);
        }
      );
    }
  };

  const handleDeleteAnswer = (e: React.MouseEvent, answerId: number) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this answer?')) {
      setIsLoadingAnswers(true);
      const network = new NetworkService();
      network.request(
        'ipc/deleteAnswer',
        'POST',
        { answer_id: answerId },
        {},
        (error: any, responseData: any) => {
          setIsLoadingAnswers(false);
          if (error) {
            console.error("Error deleting answer:", error);
            return;
          }
          loadUserAnswers(1);
        }
      );
    }
  };

  const handleLoadMoreAnswers = () => {
    if (answerPage < totalAnswerPages) {
      setAnswerPage(prev => prev + 1);
      loadUserAnswers(answerPage + 1);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Ask a Question</h1>
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label className="block mb-2">Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Content:</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border rounded"
            rows={4}
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Submit Question
        </button>
      </form>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Your Questions</h2>
        <div className="grid gap-4">
          {userQuestions.map(question => (
            <Card 
              key={question.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow duration-300 relative"
              onClick={() => handleQuestionClick(question.id)}
            >
              <Trash2
                className="absolute top-2 right-2 w-5 h-5 text-red-500 hover:text-red-700 cursor-pointer"
                onClick={(e) => handleDelete(e, question.id)}
              />
              <CardHeader>
                <CardTitle>{question.title}</CardTitle>
                <CardDescription>
                  <p className="text-sm text-gray-600">{question.content}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Asked on: {new Date(question.created_at).toLocaleString()}
                  </p>
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
        
        {currentPage < totalPages && (
          <button
            className="mt-4 bg-blue-500 text-white p-2 rounded-md mx-auto block"
            onClick={handleLoadMore}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </button>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Your Answers</h2>
        <div className="grid gap-4">
          {userAnswers.map(answer => (
            <Card 
              key={answer.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow duration-300 relative"
              onClick={() => handleQuestionClick(answer.question.id)}
            >
              <Trash2
                className="absolute top-2 right-2 w-5 h-5 text-red-500 hover:text-red-700 cursor-pointer"
                onClick={(e) => handleDeleteAnswer(e, answer.id)}
              />
              <CardHeader>
                <CardTitle>Re: {answer.question.title}</CardTitle>
                <CardDescription>
                  <p className="text-sm text-gray-600">{answer.content}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Answered on: {new Date(answer.created_at).toLocaleString()}
                  </p>
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
        
        {answerPage < totalAnswerPages && (
          <button
            className="mt-4 bg-blue-500 text-white p-2 rounded-md mx-auto block"
            onClick={handleLoadMoreAnswers}
            disabled={isLoadingAnswers}
          >
            {isLoadingAnswers ? 'Loading...' : 'Load More Answers'}
          </button>
        )}
      </div>
    </div>
  );
};

export default AddQuestionPage;