import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '../../components/UI';

export default function AdminAudit() {
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cleaning, setCleaning] = useState(false);

  const fetchAudit = async () => {
    try {
      const { data } = await api.get('/admin/audit-registrations');
      setAudit(data);
    } catch {
      toast.error('Failed to load audit data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, []);

  const handleCleanup = async () => {
    if (!window.confirm(`Are you sure you want to remove ${audit.invalidCount} invalid registration(s)? This cannot be undone.`)) {
      return;
    }
    setCleaning(true);
    try {
      const { data } = await api.delete('/admin/cleanup-registrations');
      toast.success(data.message);
      fetchAudit();
    } catch {
      toast.error('Cleanup failed.');
    } finally {
      setCleaning(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const violationBadge = (type) => {
    const colors = {
      DEPT_MISMATCH: 'bg-orange-100 text-orange-700',
      SEM_MISMATCH: 'bg-blue-100 text-blue-700',
      DEPT_AND_SEM_MISMATCH: 'bg-red-100 text-red-700',
    };
    const labels = {
      DEPT_MISMATCH: 'Department Mismatch',
      SEM_MISMATCH: 'Semester Mismatch',
      DEPT_AND_SEM_MISMATCH: 'Dept & Sem Mismatch',
    };
    return (
      <span className={`text-xs font-medium px-2 py-1 rounded ${colors[type] || 'bg-gray-100 text-gray-700'}`}>
        {labels[type] || type}
      </span>
    );
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Registration Audit</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <p className="text-sm text-gray-500">Total Registrations</p>
          <p className="text-3xl font-bold text-blue-600">{audit?.totalRegistrations || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <p className="text-sm text-gray-500">Valid Registrations</p>
          <p className="text-3xl font-bold text-green-600">{audit?.validCount || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
          <p className="text-sm text-gray-500">Invalid Registrations</p>
          <p className="text-3xl font-bold text-red-600">{audit?.invalidCount || 0}</p>
        </div>
      </div>

      {/* Invalid Registrations Table */}
      {audit?.invalidCount > 0 ? (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Invalid Legacy Registrations</h2>
            <button
              onClick={handleCleanup}
              disabled={cleaning}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium text-sm disabled:opacity-50"
            >
              {cleaning ? 'Cleaning...' : `Remove All (${audit.invalidCount})`}
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            These registrations were created before validation rules were enforced. They are hidden from student views.
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Dept/Sem</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course Dept/Sem</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Violation</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {audit.invalidRegistrations.map((r) => (
                  <tr key={r.registration_id} className="hover:bg-red-50">
                    <td className="px-4 py-3 text-sm">
                      <p className="font-medium">{r.student_name}</p>
                      <p className="text-gray-500 text-xs">{r.student_id}</p>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <p>{r.student_dept}</p>
                      <p className="text-gray-500 text-xs">Semester {r.student_sem}</p>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <p className="font-medium">{r.course_code}</p>
                      <p className="text-gray-500 text-xs">{r.course_name}</p>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <p>{r.course_dept}</p>
                      <p className="text-gray-500 text-xs">Semester {r.course_sem}</p>
                    </td>
                    <td className="px-4 py-3 text-sm">{violationBadge(r.violation_type)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(r.registered_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <p className="text-4xl mb-2">✅</p>
          <p className="text-green-800 font-semibold text-lg">All registrations are valid</p>
          <p className="text-green-600 text-sm mt-1">
            No legacy registrations violate current department/semester rules.
          </p>
        </div>
      )}
    </div>
  );
}
