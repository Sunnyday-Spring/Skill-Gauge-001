import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

// ✅ 1. Auth (ถูกต้องแล้ว)
import Login from './pages/auth/Login';

// ❌ 2. General (ลบ Home/About ออก เพราะคุณไม่มีไฟล์จริง)
// ถ้าจะใช้ Dashboard ทั่วไป ต้องเรียกจาก general
// import Dashboard from './pages/general/Dashboard'; 

// ✅ 3. Admin (เรียกจากโฟลเดอร์ admin)
import AdminDashboard from './pages/admin/AdminDashboard'; 
import AdminRoute from './components/AdminRoute';
import AdminSignup from './pages/admin/Signup';
import AdminSignupCredentials from './pages/admin/SignupCredentials';
import AdminWorkerRegistration from './pages/admin/AdminWorkerRegistration';

// ✅ 4. PM (เรียกจากโฟลเดอร์ pm)
import WKDashboard from './pages/pm/WKDashboard';
import PMProjectManager from './pages/pm/PMProjectManager';
import PMProjects from './pages/pm/PMProjects';
import WKCreateProject from './pages/pm/WKCreateProject'; 
import WKProjectTasks from './pages/pm/WKProject_Tasks';
import WKAssignWorker from './pages/pm/WKAssignWorker'; 
import ProjectDetail from './pages/pm/ProjectDetail';
import PMSettings from './pages/pm/PMSettings';

// ✅ 5. Foreman (แก้ตัว f เป็น F ใหญ่ ตามชื่อโฟลเดอร์ของคุณ: src/pages/Foreman)
import ForemanDashboard from './pages/Foreman/ForemanDashboard';
import ForemanAssessment from './pages/Foreman/ForemanAssessment';
import ForemanReportSystem from './pages/Foreman/ForemanReportSystem';
import ForemanSettings from './pages/Foreman/ForemanSettings';
import ForemanHistory from './pages/Foreman/ForemanHistory';

// ✅ 6. Worker (แก้ตัว w เป็น W ใหญ่ ตามชื่อโฟลเดอร์ของคุณ: src/pages/Worker)
import WorkerDashboard from './pages/Worker/WorkerDashboard'; 
import WorkerTaskDetail from './pages/Worker/WorkerTaskDetail'; 
import WorkerSettings from './pages/Worker/WorkerSettings';  
import WorkerHistory from './pages/Worker/WorkerHistory';

// ✅ 7. Assessment (เรียกจากโฟลเดอร์ assessment)
import SkillAssessmentTest from './pages/assessment/SkillAssessmentTest';
import WKSkillAssessmentTest from './pages/assessment/WKSkill_Assessment_Test';
import WKSkillAssessmentQuiz from './pages/assessment/WKSkill_Assessment_Quiz';

import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Layout หลัก */}
          <Route element={<Layout />}>
            {/* ไม่มีหน้า Home ให้เด้งไป Login ทันที */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* หน้าอื่นๆ ถ้าไม่มีไฟล์จริง ให้ Comment ปิดไว้ก่อนกัน Error */}
            {/* <Route path="/about" element={<About />} /> */}
            {/* <Route path="/services" element={<Services />} /> */}
            {/* <Route path="/contact" element={<Contact />} /> */}
          </Route>

          {/* Login */}
          <Route path="/login" element={<Login />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/signup" element={<AdminRoute><AdminSignup /></AdminRoute>} />
          <Route path="/admin/signup/credentials" element={<AdminRoute><AdminSignupCredentials /></AdminRoute>} />
          <Route path="/admin/worker-registration" element={<AdminRoute><AdminWorkerRegistration /></AdminRoute>} />
          
          <Route path="/dashboard" element={<WKDashboard />} />
          
          {/* PM */}
          <Route path="/pm" element={<PMProjectManager />} />
          <Route path="/projects" element={<PMProjects />} />
          <Route path="/project-tasks" element={<WKCreateProject />} /> 
          <Route path="/define-tasks" element={<WKProjectTasks />} /> 
          <Route path="/assign-worker" element={<WKAssignWorker />} /> 
          <Route path="/project-detail" element={<ProjectDetail />} />
          <Route path="/pm-settings" element={<PMSettings />} />
          
          {/* Foreman */}
          <Route path="/foreman" element={<ForemanDashboard />} />
          <Route path="/foreman/assessment" element={<ForemanAssessment />} />
          <Route path="/foreman-reports" element={<ForemanReportSystem />} />
          <Route path="/foreman-reports" element={<ForemanReportSystem />} />
          <Route path="/foreman-settings" element={<ForemanSettings />} />
          <Route path="/foreman-history" element={<ForemanHistory />} />
          
          {/* Worker & Assessment */}
          <Route path="/worker" element={<WorkerDashboard />} />
          <Route path="/worker/test" element={<SkillAssessmentTest />} />
          <Route path="/skill-assessment" element={<WKSkillAssessmentTest />} />
          <Route path="/skill-assessment/quiz" element={<WKSkillAssessmentQuiz />} />
          <Route path="/worker/task-detail" element={<WorkerTaskDetail />} />
          <Route path="/worker-settings" element={<WorkerSettings />} />
          <Route path="/worker/history" element={<WorkerHistory/>} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;