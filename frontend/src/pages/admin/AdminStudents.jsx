import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';
import { LoadingSpinner } from '../../components/UI';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [form, setForm] = useState({ student_id: '', name: '', department: '', semester: 1 });

  const fetchStudents = async () => {
    try {
      const { data } = await api.get('/students');
      setStudents(data);
    } catch {
      toast.error('Failed to load students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const openAdd = () => {
    setEditStudent(null);
    setForm({ student_id: '', name: '', department: '', semester: 1 });
    setModalOpen(true);
  };

  const openEdit = (s) => {
    setEditStudent(s);
    setForm({ student_id: s.student_id, name: s.name, department: s.department, semester: s.semester });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editStudent) {
        await api.put(`/students/${editStudent.student_id}`, form);
        toast.success('Student updated.');
      } else {
        await api.post('/students', form);
        toast.success('Student added.');
      }
      setModalOpen(false);
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete student ${id}?`)) return;
    try {
      await api.delete(`/students/${id}`);
      toast.success('Student deleted.');
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed.');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Students</h1>
        <button
          onClick={openAdd}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          + Add Student
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semester</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {students.map((s) => (
              <tr key={s.student_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium">{s.student_id}</td>
                <td className="px-6 py-4 text-sm">{s.name}</td>
                <td className="px-6 py-4 text-sm">{s.department}</td>
                <td className="px-6 py-4 text-sm">{s.semester}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{s.email || '—'}</td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <button onClick={() => openEdit(s)} className="text-primary-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(s.student_id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editStudent ? 'Edit Student' : 'Add Student'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
            <input
              type="text"
              required
              disabled={!!editStudent}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
              value={form.student_id}
              onChange={(e) => setForm({ ...form, student_id: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
            >
              <option value="">Select</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Electronics">Electronics</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
            <input
              type="number"
              min={1}
              max={8}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
              value={form.semester}
              onChange={(e) => setForm({ ...form, semester: parseInt(e.target.value, 10) })}
            />
          </div>
          <button type="submit" className="w-full bg-primary-600 text-white py-2.5 rounded-lg hover:bg-primary-700 font-medium">
            {editStudent ? 'Update' : 'Add Student'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
