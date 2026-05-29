import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { StatCard, LoadingSpinner } from '../../components/UI';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, notifsRes] = await Promise.all([
          api.get('/registration/my-courses'),
          api.get('/notifications'),
        ]);
        setData({
          ...coursesRes.data,
          notifications: notifsRes.data.filter((n) => !n.is_read).slice(0, 5),
        });
      } catch {
        // Error handled by interceptor
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Welcome, {user.name}!</h1>
      <p className="text-gray-600 mb-8">
        {user.department} — Semester {user.semester} — ID: {user.student_id}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="Registered Courses" value={data?.courses?.length || 0} icon="📚" color="blue" />
        <StatCard title="Total Credits" value={data?.totalCredits || 0} icon="📊" color="green" />
        <StatCard title="Available Credits" value={data?.availableCredits || 24} icon="✨" color="purple" />
        <StatCard
          title="Unread Notifications"
          value={data?.notifications?.length || 0}
          icon="🔔"
          color="orange"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Registered Courses */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">My Courses</h2>
            <Link to="/courses" className="text-primary-600 text-sm hover:underline">
              Browse More →
            </Link>
          </div>
          {data?.courses?.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No courses registered yet.</p>
          ) : (
            <div className="space-y-3">
              {data?.courses?.map((c) => (
                <div key={c.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{c.course_code}</p>
                    <p className="text-sm text-gray-600">{c.course_name}</p>
                  </div>
                  <span className="text-sm bg-primary-100 text-primary-700 px-2 py-1 rounded">
                    {c.credits} cr
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Notifications</h2>
            <Link to="/notifications" className="text-primary-600 text-sm hover:underline">
              View All →
            </Link>
          </div>
          {data?.notifications?.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No new notifications.</p>
          ) : (
            <div className="space-y-3">
              {data?.notifications?.map((n) => (
                <div key={n.id} className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
                  <p className="text-sm">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
