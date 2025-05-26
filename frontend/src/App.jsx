// src/App.jsx
import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProjectListView from './components/layout/ProjectListView';
import Login from './components/layout/Login';
import Register from './components/layout/Register';
import MainLayout from './components/layout/MainLayout';
import GraphViewStandalone from './components/panels/GraphViewStandalone';

function App() {

  const isLoggedIn = !!localStorage.getItem('userId');
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={isLoggedIn ? <ProjectListView /> : <Navigate to="/login" replace />}
        />
        <Route path="/project/:projectId" element={<MainLayout />} />
        <Route path="/graph-view" element={<GraphViewStandalone />} />
      </Routes>
    </Router>
  );
}

export default App;
