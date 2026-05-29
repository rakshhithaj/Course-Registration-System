import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import Contact from './pages/public/Contact';

// Student pages
import Login from './pages/student/Login';
import Register from './pages/student/Register';
import Dashboard from './pages/student/Dashboard';
import Courses from './pages/student/Courses';
import MyCourses from './pages/student/MyCourses';
import Notifications from './pages/student/Notifications';

// Admin pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudents from './pages/admin/AdminStudents';
import AdminCourses from './pages/admin/AdminCourses';
import AdminFaculty from './pages/admin/AdminFaculty';
import AdminReports from './pages/admin/AdminReports';
import AdminAudit from './pages/admin/AdminAudit';

export default function App() {
  return (
    <Layout>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Student (protected) */}
        <Route path="/dashboard" element={<ProtectedRoute role="student"><Dashboard /></ProtectedRoute>} />
        <Route path="/courses" element={<ProtectedRoute role="student"><Courses /></ProtectedRoute>} />
        <Route path="/my-courses" element={<ProtectedRoute role="student"><MyCourses /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute role="student"><Notifications /></ProtectedRoute>} />

        {/* Admin (protected) */}
        <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/students" element={<ProtectedRoute role="admin"><AdminStudents /></ProtectedRoute>} />
        <Route path="/admin/courses" element={<ProtectedRoute role="admin"><AdminCourses /></ProtectedRoute>} />
        <Route path="/admin/faculty" element={<ProtectedRoute role="admin"><AdminFaculty /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute role="admin"><AdminReports /></ProtectedRoute>} />
        <Route path="/admin/audit" element={<ProtectedRoute role="admin"><AdminAudit /></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={
          <div className="text-center py-20">
            <h1 className="text-6xl font-bold text-gray-300">404</h1>
            <p className="text-xl text-gray-500 mt-4">Page not found</p>
          </div>
        } />
      </Routes>
    </Layout>
  );
}
