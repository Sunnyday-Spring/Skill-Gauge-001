import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AdminRoute from './components/AdminRoute';
import AdminSignup from './pages/admin/Signup';
import AdminSignupCredentials from './pages/admin/SignupCredentials';
import AdminWorkerRegistration from './pages/admin/AdminWorkerRegistration';
import WKDashboard from './pages/WKDashboard';
import PMProjectManager from './pages/PMProjectManager';
import PMProjects from './pages/PMProjects';
// นำเข้าไฟล์ที่แยกส่วนกัน
import WKCreateProject from './pages/WKCreateProject'; 
import WKProjectTasks from './pages/WKProject_Tasks';
import WKAssignWorker from './pages/WKAssignWorker'; 

import ForemanAssessment from './pages/ForemanAssessment';
import ForemanDashboard from './pages/ForemanDashboard';
import WorkerDashboard from './pages/WorkerDashboard';    
import SkillAssessmentTest from './pages/SkillAssessmentTest';
import WKSkillAssessmentTest from './pages/WKSkill_Assessment_Test';
import WKSkillAssessmentQuiz from './pages/WKSkill_Assessment_Quiz';
import ProjectDetail from './pages/ProjectDetail';

import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="services" element={<Services />} />
            <Route path="contact" element={<Contact />} />
            <Route path="login" element={<Login />} />
            
            {/* Admin Routes */}
            <Route path="admin/signup" element={<AdminRoute><AdminSignup /></AdminRoute>} />
            <Route path="admin/signup/credentials" element={<AdminRoute><AdminSignupCredentials /></AdminRoute>} />
            <Route path="admin/worker-registration" element={<AdminRoute><AdminWorkerRegistration /></AdminRoute>} />
            <Route path="admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="dashboard" element={<WKDashboard />} />
            
            {/* PM Pages - ปรับ Flow ใหม่ตรงนี้ */}
            <Route path="pm" element={<PMProjectManager />} />
            
            {/* 1. เมื่อคลิกเมนู Tasks ให้เข้าหน้าสร้างโครงการหลักก่อน */}
            <Route path="project-tasks" element={<WKCreateProject />} /> 
            
            {/* 2. หน้าสำหรับกำหนดงานย่อย (รับ State มาจากหน้าแรก) */}
            <Route path="define-tasks" element={<WKProjectTasks />} /> 
            
            <Route path="projects" element={<PMProjects />} /> 
            <Route path="assign-worker" element={<WKAssignWorker />} /> 
            
            {/* Foreman & Worker Pages */}
            <Route path="foreman" element={<ForemanDashboard />} />
            <Route path="foreman/assessment" element={<ForemanAssessment />} />
            <Route path="skill-assessment" element={<WKSkillAssessmentTest />} />
            <Route path="skill-assessment/quiz" element={<WKSkillAssessmentQuiz />} />
            <Route path="worker" element={<WorkerDashboard />} />
            <Route path="project-detail" element={<ProjectDetail />} />
          </Route>

          <Route path="/worker/test" element={<SkillAssessmentTest />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;