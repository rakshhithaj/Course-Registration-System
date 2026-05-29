import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ student_id: '', password: '' });
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login('/auth/login', form);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors?.length) {
        data.errors.forEach((e) => toast.error(e.msg));
      } else {
        toast.error(data?.error || 'Login failed.');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Student Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
            <input
              type="text"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="e.g., 1RV22CS001"
              value={form.student_id}
              onChange={(e) => setForm({ ...form, student_id: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-2.5 rounded-lg hover:bg-primary-700 font-medium transition disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 hover:underline font-medium">
            Register here
          </Link>
        </div>
        <div className="mt-2 text-center text-sm">
          <Link to="/forgot-password" className="text-gray-500 hover:underline">
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}
