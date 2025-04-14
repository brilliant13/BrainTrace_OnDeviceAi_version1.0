// src/App.jsx
import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProjectListView from './components/layout/ProjectListView';
import MainLayout from './components/layout/MainLayout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProjectListView />} />
        <Route path="/project/:projectId" element={<MainLayout />} />
      </Routes>
    </Router>
  );
}

export default App;
