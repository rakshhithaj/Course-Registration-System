import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [form, setForm] = useState({ username: '', password: '' });
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login('/auth/admin/login', form);
      toast.success('Admin login successful!');
      navigate('/admin/dashboard');
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
    <div className="max-w-md mx-auto mt-16">
      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="text-center mb-6">
          <span className="text-4xl">🔐</span>
          <h1 className="text-2xl font-bold mt-2">Admin Login</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
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
      </div>
    </div>
  );
}
