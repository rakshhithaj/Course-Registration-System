import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { StatCard, LoadingSpinner } from '../../components/UI';

export default function MyCourses() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      const { data } = await api.get('/registration/my-courses');
      setData(data);
    } catch {
      toast.error('Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDrop = async (courseId, courseName) => {
    if (!window.confirm(`Are you sure you want to drop ${courseName}?`)) return;

    try {
      const { data } = await api.delete('/registration/drop', {
        data: { course_id: courseId },
      });
      toast.success(data.message);
      fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to drop course.');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Registered Courses</h1>

      {/* Credit Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Registered Courses" value={data?.courses?.length || 0} icon="📚" color="blue" />
        <StatCard title="Total Credits" value={data?.totalCredits || 0} icon="📊" color="green" />
        <StatCard title="Remaining Credits" value={data?.availableCredits || 24} icon="✨" color="purple" />
      </div>

      {/* Course List */}
      {data?.courses?.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">You haven't registered for any courses yet.</p>
          <a href="/courses" className="text-primary-600 hover:underline mt-2 inline-block">
            Browse Course Catalog →
          </a>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credits</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faculty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data?.courses?.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-primary-600">{c.course_code}</td>
                  <td className="px-6 py-4 text-sm">{c.course_name}</td>
                  <td className="px-6 py-4 text-sm">{c.credits}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{c.faculty_name || 'TBA'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(c.registered_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDrop(c.id, `${c.course_code} - ${c.course_name}`)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Drop
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
