import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import SubjectSelect from './pages/SubjectSelect';
import ModeSelect from './pages/ModeSelect';
import MCQTest from './pages/MCQTest';
import CodingTest from './pages/CodingTest';
import InterviewSession from './pages/InterviewSession';
import AnalysisPage from './pages/AnalysisPage';
import AdminPage from './pages/AdminPage';
import './index.css';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  return user?.role === 'admin' ? children : <Navigate to="/dashboard" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/technical/subjects" element={<PrivateRoute><SubjectSelect /></PrivateRoute>} />
          <Route path="/technical/:subject/mode" element={<PrivateRoute><ModeSelect /></PrivateRoute>} />
          <Route path="/technical/:subject/mcq" element={<PrivateRoute><MCQTest /></PrivateRoute>} />
          <Route path="/technical/:subject/coding" element={<PrivateRoute><CodingTest /></PrivateRoute>} />
          <Route path="/technical/:subject/interview" element={<PrivateRoute><InterviewSession category="Technical" /></PrivateRoute>} />
          <Route path="/hr/interview" element={<PrivateRoute><InterviewSession category="HR" /></PrivateRoute>} />
          <Route path="/communication/interview" element={<PrivateRoute><InterviewSession category="Communication" /></PrivateRoute>} />
          <Route path="/analysis" element={<PrivateRoute><AnalysisPage /></PrivateRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
