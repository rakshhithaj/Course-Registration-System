import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({
    student_id: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return toast.error('Passwords do not match.');
    }

    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      await api.post('/auth/register', payload);
      toast.success('Account created! Please log in.');
      navigate('/login');
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors?.length) {
        data.errors.forEach((e) => toast.error(e.msg));
      } else {
        toast.error(data?.error || 'Registration failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Create Account</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
            <input
              type="text"
              name="student_id"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="e.g., 1RV22CS001"
              value={form.student_id}
              onChange={handleChange}
            />
            <p className="text-xs text-gray-500 mt-1">Must match your official Student ID.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">College Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="yourname@university.edu"
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              name="phone"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="+91-XXXXXXXXXX"
              value={form.phone}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              minLength={8}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              value={form.password}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="Re-enter password"
              value={form.confirmPassword}
              onChange={handleChange}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-2.5 rounded-lg hover:bg-primary-700 font-medium transition disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
