import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { StatCard, LoadingSpinner } from '../../components/UI';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/dashboard');
        setStats(data);
      } catch {
        // handled by interceptor
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <StatCard title="Total Students" value={stats?.totalStudents || 0} icon="👩‍🎓" color="blue" />
        <StatCard title="Registered Accounts" value={stats?.totalAccounts || 0} icon="👤" color="green" />
        <StatCard title="Courses" value={stats?.totalCourses || 0} icon="📚" color="purple" />
        <StatCard title="Valid Registrations" value={stats?.totalRegistrations || 0} icon="📝" color="orange" />
        <StatCard title="Faculty" value={stats?.totalFaculty || 0} icon="👨‍🏫" color="red" />
      </div>

      {/* Invalid registrations warning */}
      {stats?.invalidRegistrations > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8 flex items-center justify-between">
          <div>
            <p className="text-yellow-800 font-semibold">
              ⚠️ {stats.invalidRegistrations} invalid legacy registration(s) found
            </p>
            <p className="text-yellow-600 text-sm">
              These registrations violate current department/semester rules and are hidden from students.
            </p>
          </div>
          <Link
            to="/admin/audit"
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 font-medium text-sm whitespace-nowrap"
          >
            View &amp; Cleanup
          </Link>
        </div>
      )}

      {/* Recent Registrations */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Registrations</h2>
        {stats?.recentRegistrations?.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No registrations yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats?.recentRegistrations?.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">
                      <p className="font-medium">{r.name}</p>
                      <p className="text-gray-500">{r.student_id}</p>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <p className="font-medium">{r.course_code}</p>
                      <p className="text-gray-500">{r.course_name}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(r.registered_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
