import { useState, useContext } from "react";
import NetworkService from "@/NetworkService";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "@/App";

const AddAnswerPage = () => {
  const { question_id } = useParams<{ question_id: string }>();
  const [content, setContent] = useState('');
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);

  const handleSubmit = () => {
    if (!auth.isAuthenticated) {
      alert("You need to be logged in to add an answer");
      return;
    }
    const network = new NetworkService();
    
    network.request('ipc/addAnswer', 'POST', { question_id, content, user_id: auth.email }, {}, (error: any, responseData: any) => {
      if (error) {
        console.error("Error adding answer:", error);
        return;
      }
      alert("Answer added successfully");
      setContent('');
      navigate(`/question/${question_id}`);
    });
  }

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold mb-6">Add an Answer</h1>
      <Textarea placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} className="mb-4 p-2 border rounded-md w-full" />
      <Button onClick={handleSubmit} className="bg-blue-500 text-white p-2 rounded-md">Submit</Button>
    </div>
  );
}

export default AddAnswerPage;