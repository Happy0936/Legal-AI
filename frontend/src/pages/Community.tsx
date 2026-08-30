import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import NetworkService from "@/NetworkService";
import { useNavigate } from "react-router-dom";

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

const Community = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const loadQuestions = (page: number) => {
    setIsLoading(true);
    const network = new NetworkService();
    network.request(
      'ipc/getQuestions',
      'POST',
      { page, per_page: 9 },
      {},
      (error: any, responseData: PaginatedResponse) => {
        setIsLoading(false);
        if (error) {
          console.error("Error fetching data:", error);
          return;
        }
        if (page === 1) {
          setQuestions(responseData.questions);
        } else {
          setQuestions(prev => [...prev, ...responseData.questions]);
        }
        setTotalPages(responseData.total_pages);
      }
    );
  };

  useEffect(() => {
    loadQuestions(1);
  }, []);

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      loadQuestions(currentPage + 1);
    }
  };

  const handleAddQuestion = () => {
    navigate('/add-question');
  }

  const handleQuestionClick = (id: number) => {
    navigate(`/question/${id}`);
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className='text-3xl font-bold mb-6 text-center'>Community Questions</h1>
      <button className="bg-blue-500 text-white p-2 rounded-md mb-4 mx-auto block" onClick={handleAddQuestion}>Add Question</button>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {questions.map(question => (
          <Card key={question.id} onClick={() => handleQuestionClick(question.id)} className="cursor-pointer hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">{question.title}</CardTitle>
            </CardHeader>
            <CardDescription>
              <p className='p-3'>{question.content}</p>
              <p className="text-sm text-gray-500 mt-2 p-2">Asked {formatTimeAgo(question.created_at)}</p>
            </CardDescription>
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
  );
};

export default Community;
