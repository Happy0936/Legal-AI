import React, { useState, useContext } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import NetworkService from "@/NetworkService";
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../App';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { setAuth } = useContext(AuthContext);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const network = new NetworkService();
    network.request('ipc/login', 'POST', { email, password }, {}, (error: any, responseData: any) => {
      if (error) {
        setErrorMessage("Invalid credentials. Please check your email and password and try again.");
        return;
      }
      alert("Login successful");
      setAuth({ isAuthenticated: true, token: responseData.token, email });
      navigate('/');
    });
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      {errorMessage && <div className="text-red-500 mb-4">{errorMessage}</div>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
        <div>
          <label>Email:</label>
          <Input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label>Password:</label>
          <Input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full p-2 border rounded-md"
          />
        </div>
        <Button type="submit" className="bg-blue-500 text-white p-2 rounded-md">Login</Button>
      </form>
      <Button onClick={() => navigate('/register')} className="mt-4 bg-gray-500 text-white p-2 rounded-md">Go to Register</Button>
    </div>
  );
}
