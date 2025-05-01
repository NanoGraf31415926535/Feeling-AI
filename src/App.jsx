// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import MainMenu from './components/MainMenu';
import ChatWindow from './components/ChatWindow';
import Journal from './components/Journal';
import SignIn from './components/SignIn';
import Register from './components/Register';
import Settings from './components/Settings';
import Support from './components/Support';
import CreateArticle from './components/CreateArticle';
import ArticleDetail from './components/ArticleDetail';
import RequireAuth from './components/RequireAuth'; 

function App() {

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<RequireAuth><MainMenu /></RequireAuth>} />
          <Route path="/chat" element={<RequireAuth><ChatWindow /></RequireAuth>} />
          <Route path="/journal" element={<RequireAuth><Journal /></RequireAuth>} />
          <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
          <Route path="/support" element={<RequireAuth><Support /></RequireAuth>} />
          <Route path="/create-article" element={<RequireAuth><CreateArticle /></RequireAuth>} />
          <Route path="/article/:id" element={<RequireAuth><ArticleDetail /></RequireAuth>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;