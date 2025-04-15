import React, { useState } from 'react';
import { PrimeReactProvider } from 'primereact/api';
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import './App.css';
import Sidebar from './pages/Sidebar';
import Dashboard from './pages/Dashboard';
import CreateMeeting from './pages/CreateMeeting';
import LoginPage from './pages/LoginPage';
import MeetingPage from './pages/MeetingPage';
import Database from './pages/Database';
import Template from './pages/Template';
import Template1 from "./components/template1";
import Reports from './pages/Reports';
import Calendar from './components/Calendar';
import Cmeeting from './components/template1';
import JoinMeet from './pages/joinmeet';
import AdminChooser from './components/AdminChooser';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const value = {
    ripple: true,
    inputStyle: 'outlined',
    appendTo: 'self',
    pt: {
      button: {
        root: { className: 'p-button' }
      }
    }
  };

  return (
    <PrimeReactProvider value={value}>
      <Router>
        <div className="App">
          {isAuthenticated ? (
            <>
              <Sidebar className="sidebar" />
              <div className="main-content">
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/create-meeting" element={<CreateMeeting />} />
                  <Route path="/admin-access" element={<AdminChooser />} />
                  <Route path="/meeting" element={< JoinMeet />} />
                  <Route path="/meetingadmin" element={< MeetingPage />} />
                  <Route path="/database" element={<Database />} />
                  <Route path="/template" element={<Template />} />
                  <Route path="/template/edit/:templateId" element={<Template />} />
                  <Route path="/template1" element={<Template1 />} />
                  <Route path="/cmeeting" element={<Cmeeting />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/support" element={<div>Support</div>} />
                  <Route path="/logout" element={<div>Logout</div>} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  <Route path='/calendar' element={<Calendar />} />
                </Routes>
              </div>
            </>
          ) : (
            <Routes>
              <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          )}
        </div>
      </Router>
    </PrimeReactProvider>
  );
}

export default App;
