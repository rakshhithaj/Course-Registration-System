import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-primary-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold tracking-tight">
            📚 CourseReg
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="hover:bg-primary-600 px-3 py-2 rounded-md text-sm">
              Home
            </Link>
            <Link to="/about" className="hover:bg-primary-600 px-3 py-2 rounded-md text-sm">
              About
            </Link>
            <Link to="/contact" className="hover:bg-primary-600 px-3 py-2 rounded-md text-sm">
              Contact
            </Link>

            {!user && (
              <>
                <Link
                  to="/login"
                  className="hover:bg-primary-600 px-3 py-2 rounded-md text-sm"
                >
                  Student Login
                </Link>
                <Link
                  to="/admin/login"
                  className="bg-primary-500 hover:bg-primary-400 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Admin
                </Link>
              </>
            )}

            {user && user.role === 'student' && (
              <>
                <Link
                  to="/dashboard"
                  className="hover:bg-primary-600 px-3 py-2 rounded-md text-sm"
                >
                  Dashboard
                </Link>
                <Link
                  to="/courses"
                  className="hover:bg-primary-600 px-3 py-2 rounded-md text-sm"
                >
                  Courses
                </Link>
                <Link
                  to="/my-courses"
                  className="hover:bg-primary-600 px-3 py-2 rounded-md text-sm"
                >
                  My Courses
                </Link>
                <Link
                  to="/notifications"
                  className="hover:bg-primary-600 px-3 py-2 rounded-md text-sm"
                >
                  Notifications
                </Link>
              </>
            )}

            {user && user.role === 'admin' && (
              <>
                <Link
                  to="/admin/dashboard"
                  className="hover:bg-primary-600 px-3 py-2 rounded-md text-sm"
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/students"
                  className="hover:bg-primary-600 px-3 py-2 rounded-md text-sm"
                >
                  Students
                </Link>
                <Link
                  to="/admin/courses"
                  className="hover:bg-primary-600 px-3 py-2 rounded-md text-sm"
                >
                  Courses
                </Link>
                <Link
                  to="/admin/faculty"
                  className="hover:bg-primary-600 px-3 py-2 rounded-md text-sm"
                >
                  Faculty
                </Link>
                <Link
                  to="/admin/reports"
                  className="hover:bg-primary-600 px-3 py-2 rounded-md text-sm"
                >
                  Reports
                </Link>
                <Link
                  to="/admin/audit"
                  className="hover:bg-primary-600 px-3 py-2 rounded-md text-sm"
                >
                  Audit
                </Link>
              </>
            )}

            {user && (
              <div className="flex items-center space-x-3 ml-4 border-l border-primary-500 pl-4">
                <span className="text-sm font-medium">
                  {user.name || user.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-md text-sm"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Link to={user ? (user.role === 'admin' ? '/admin/dashboard' : '/dashboard') : '/login'}
              className="bg-primary-500 hover:bg-primary-400 px-4 py-2 rounded-md text-sm">
              {user ? 'Dashboard' : 'Login'}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
