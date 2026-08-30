import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import NetworkService from "@/NetworkService";

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const network = new NetworkService();
    network.request('ipc/register', 'POST', { username, email, password }, {}, (error: any, responseData: any) => {
      if (error) {
        console.error("Error registering:", error);
        return;
      }
      alert("Registration successful");
      navigate('/login');
    });
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
        <div>
          <label>Username:</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label>Email:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label>Password:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full p-2 border rounded-md"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded-md">Register</button>
      </form>
      <button onClick={() => navigate('/login')} className="mt-4 bg-gray-500 text-white p-2 rounded-md">Go to Login</button>
    </div>
  );
}

