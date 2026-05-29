import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';
import { LoadingSpinner } from '../../components/UI';

export default function AdminFaculty() {
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editFaculty, setEditFaculty] = useState(null);
  const [form, setForm] = useState({ faculty_name: '', department: '', email: '' });

  const fetchFaculty = async () => {
    try {
      const { data } = await api.get('/faculty');
      setFacultyList(data);
    } catch {
      toast.error('Failed to load faculty.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  const openAdd = () => {
    setEditFaculty(null);
    setForm({ faculty_name: '', department: '', email: '' });
    setModalOpen(true);
  };

  const openEdit = (f) => {
    setEditFaculty(f);
    setForm({ faculty_name: f.faculty_name, department: f.department, email: f.email || '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editFaculty) {
        await api.put(`/faculty/${editFaculty.id}`, form);
        toast.success('Faculty updated.');
      } else {
        await api.post('/faculty', form);
        toast.success('Faculty added.');
      }
      setModalOpen(false);
      fetchFaculty();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed.');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    try {
      await api.delete(`/faculty/${id}`);
      toast.success('Faculty deleted.');
      fetchFaculty();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed.');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Faculty</h1>
        <button onClick={openAdd} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
          + Add Faculty
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {facultyList.map((f) => (
              <tr key={f.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm">{f.id}</td>
                <td className="px-6 py-4 text-sm font-medium">{f.faculty_name}</td>
                <td className="px-6 py-4 text-sm">{f.department}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{f.email || '—'}</td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <button onClick={() => openEdit(f)} className="text-primary-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(f.id, f.faculty_name)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editFaculty ? 'Edit Faculty' : 'Add Faculty'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input type="text" required
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
              value={form.faculty_name}
              onChange={(e) => setForm({ ...form, faculty_name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select required
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email"
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <button type="submit" className="w-full bg-primary-600 text-white py-2.5 rounded-lg hover:bg-primary-700 font-medium">
            {editFaculty ? 'Update' : 'Add Faculty'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
