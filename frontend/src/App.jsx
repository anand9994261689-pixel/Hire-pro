import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Upload from './pages/Upload';
import Results from './pages/Results';
import Login from './pages/Login';
import Register from './pages/Register';
import { getMe } from './services/api';
import { Loader } from 'lucide-react';

export const AppContext = createContext();

// Protected Route Component to restrict access to authenticated users
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  const [results, setResults] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const profile = await getMe();
          setUser(profile);
        } catch (error) {
          console.error("Failed to load user profile:", error);
          // Token is invalid/expired
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    fetchUser();
  }, [token]);

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-gray-100 font-sans">
        <Loader className="animate-spin text-brand mb-4" size={48} />
        <p className="text-gray-400 font-medium">Loading CandiMind AI...</p>
      </div>
    );
  }

  const isAuthenticated = token && user;

  return (
    <AppContext.Provider value={{ results, setResults, token, setToken, user, setUser, logout }}>
      <BrowserRouter>
        <div className="flex bg-background min-h-screen text-gray-100 font-sans">
          {isAuthenticated && <Sidebar />}
          <div className={`flex-1 p-8 transition-all duration-300 ${isAuthenticated ? 'ml-64' : 'w-full'}`}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} />
              <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" replace />} />

              {/* Protected Routes */}
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
              <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
              <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />

              {/* Fallback Redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </AppContext.Provider>
  );
}

export default App;
