import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Authors from './pages/Authors';
import Loans from './pages/Loans';
import Members from './pages/Members';
import Reports from './pages/Reports';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Settings from './pages/Settings';
import OAuthCallback from './pages/OAuthCallback';

function App() {

  return (

    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<SignUp />} />

        <Route path="/oauth/callback" element={<OAuthCallback />} />

        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />

          <Route path="books" element={<Books />} />
          <Route path="authors" element={<Authors />} />

          <Route path="loans" element={<Loans />} />

          <Route path="members" element={<Members />} />
          
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
