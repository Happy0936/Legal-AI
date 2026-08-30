import './App.css'
import { AppSidebar } from './AppSideBar'
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { TopBar } from './TopBar'
import { SearchPage } from '@/pages/SearchPage'
import { User, LogIn } from 'lucide-react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom"
import { Home } from './pages/Home'
import { Learn } from './pages/Learn'
import Community from './pages/Community'
import AddQuestionPage from './pages/AddQuestionPage'
import QuestionDetailsPage from './pages/QuestionDetailsPage'
import AddAnswerPage from './pages/AddAnswerPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import NetworkService from '@/NetworkService'
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Drawer } from "@/components/ui/Drawer"; // Assuming you have a Drawer component
import { Button } from "@/components/ui/button"; // Add this import
import Cookies from 'js-cookie'; // Import js-cookie
import { AIChatPage } from './pages/AIChatPage'
import { Bot } from "lucide-react";
interface AuthContextType {
  auth: { isAuthenticated: boolean; token: string | null; email: string | null };
  setAuth: (authState: { isAuthenticated: boolean; token: string | null; email: string | null }) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

function App() {
  const [auth, setAuth] = useState<{ isAuthenticated: boolean, token: string | null, email: string | null }>({ isAuthenticated: false, token: null, email: null });

  useEffect(() => {
    const token = Cookies.get('authToken');
    const email = Cookies.get('authEmail');
    if (token && email) {
      setAuth({ isAuthenticated: true, token, email });
    }
  }, []);

  const handleSetAuth = (authState: { isAuthenticated: boolean, token: string | null, email: string | null }) => {
    setAuth(authState);
    if (authState.isAuthenticated) {
      if (authState.token) {
        Cookies.set('authToken', authState.token);
      }
      if (authState.email) {
        Cookies.set('authEmail', authState.email);
      }
    } else {
      Cookies.remove('authToken');
      Cookies.remove('authEmail');
    }
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth: handleSetAuth }}>
      <Router>
        <SidebarProvider>
          <AppSidebar />
          <main>
            
          </main>
          <div className='w-full'>
            <div className="h-12 w-full shadow-lg p-2 flex">
              <SidebarTrigger />
              <div className="flex w-full justify-between">
                <span className='p-1'>Legal Aid</span>
                <UserIcon />
              </div>
            </div>

            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/community" element={<Community />} />
              <Route path="/add-question" element={<AddQuestionPage />} />
              <Route path="/question/:question_id" element={<QuestionDetailsPage />} />
              <Route path="/add-answer/:question_id" element={<AddAnswerPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/ai-chat" element={<AIChatPage />} />
            </Routes>
          </div>
        </SidebarProvider>
      </Router>
    </AuthContext.Provider>
  )
}

function UserIcon() {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error("AuthContext is null");
  }
  const { auth, setAuth } = authContext; // Add setAuth here
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleUserIconClick = () => {
    if (!auth.isAuthenticated) {
      navigate('/login');
    } else {
      setDrawerOpen(true);
    }
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
  };

  const handleLogout = () => {
    setAuth({ isAuthenticated: false, token: null, email: null });
    alert("You have been logged out successfully");
  };

  return (
    <>
      {auth.isAuthenticated ? (
        <User size={30} className="ml-4 cursor-pointer" onClick={handleUserIconClick} />
      ) : (
        <LogIn size={30} className="ml-4 cursor-pointer" onClick={handleUserIconClick} />
      )}
      <Drawer isOpen={drawerOpen} onClose={handleCloseDrawer}>
        <div className="p-4">
          <h2 className="text-xl font-bold">User Details</h2>
          <p>Email: {auth.email}</p>
          {/* Add more user details here */}
          <Button onClick={handleCloseDrawer} className="mt-4 bg-gray-500 text-white p-2 rounded-md">Close</Button>
          <Button onClick={handleLogout} className="mt-4 bg-red-500 text-white p-2 rounded-md">Logout</Button>
        </div>
      </Drawer>
    </>
  );
}

export default App;
