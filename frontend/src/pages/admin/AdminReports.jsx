import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '../../components/UI';

export default function AdminReports() {
  const [activeTab, setActiveTab] = useState('students');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReport = async (type) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/reports/${type}`);
      setData(data);
    } catch {
      toast.error('Failed to load report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(activeTab);
  }, [activeTab]);

  const exportCSV = () => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((row) =>
      Object.values(row).map((v) => `"${v ?? ''}"`).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { key: 'students', label: 'Student Enrollment' },
    { key: 'courses', label: 'Course Report' },
    { key: 'departments', label: 'Department Report' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Reports</h1>
        <button
          onClick={exportCSV}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Export CSV
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              activeTab === tab.key
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {activeTab === 'students' && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Courses</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"># Courses</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.map((r) => (
                  <tr key={r.student_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">{r.student_id}</td>
                    <td className="px-6 py-4 text-sm">{r.name}</td>
                    <td className="px-6 py-4 text-sm">{r.department}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{r.courses || '—'}</td>
                    <td className="px-6 py-4 text-sm">{r.course_count}</td>
                    <td className="px-6 py-4 text-sm">{r.total_credits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'courses' && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credits</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrolled</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.map((r) => (
                  <tr key={r.course_code} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-primary-600">{r.course_code}</td>
                    <td className="px-6 py-4 text-sm">{r.course_name}</td>
                    <td className="px-6 py-4 text-sm">{r.department}</td>
                    <td className="px-6 py-4 text-sm">{r.credits}</td>
                    <td className="px-6 py-4 text-sm">{r.capacity}</td>
                    <td className="px-6 py-4 text-sm">{r.enrolled}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        r.available_seats > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {r.available_seats}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'departments' && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Students</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Courses</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Registrations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.map((r) => (
                  <tr key={r.department} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">{r.department}</td>
                    <td className="px-6 py-4 text-sm">{r.total_students}</td>
                    <td className="px-6 py-4 text-sm">{r.total_courses}</td>
                    <td className="px-6 py-4 text-sm">{r.total_registrations}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {data.length === 0 && (
            <p className="text-center text-gray-500 py-12">No data available.</p>
          )}
        </div>
      )}
    </div>
  );
}
