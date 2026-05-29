import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';
import { LoadingSpinner } from '../../components/UI';

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [form, setForm] = useState({
    course_code: '', course_name: '', credits: 3, capacity: 60,
    department: '', semester: 1, faculty_id: '', description: '',
  });

  const fetchData = async () => {
    try {
      const [coursesRes, facultyRes] = await Promise.all([
        api.get('/courses'),
        api.get('/faculty'),
      ]);
      setCourses(coursesRes.data);
      setFaculty(facultyRes.data);
    } catch {
      toast.error('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAdd = () => {
    setEditCourse(null);
    setForm({
      course_code: '', course_name: '', credits: 3, capacity: 60,
      department: '', semester: 1, faculty_id: '', description: '',
    });
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditCourse(c);
    setForm({
      course_code: c.course_code, course_name: c.course_name,
      credits: c.credits, capacity: c.capacity, department: c.department,
      semester: c.semester, faculty_id: c.faculty_id || '', description: c.description || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editCourse) {
        await api.put(`/courses/${editCourse.id}`, form);
        toast.success('Course updated.');
      } else {
        await api.post('/courses', form);
        toast.success('Course created.');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed.');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete course ${name}?`)) return;
    try {
      await api.delete(`/courses/${id}`);
      toast.success('Course deleted.');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed.');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Courses</h1>
        <button onClick={openAdd} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
          + Add Course
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credits</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrolled</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faculty</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {courses.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 text-sm font-medium text-primary-600">{c.course_code}</td>
                <td className="px-4 py-4 text-sm">{c.course_name}</td>
                <td className="px-4 py-4 text-sm">{c.credits}</td>
                <td className="px-4 py-4 text-sm">{c.capacity}</td>
                <td className="px-4 py-4 text-sm">{c.enrolled}</td>
                <td className="px-4 py-4 text-sm text-gray-500">{c.faculty_name || 'TBA'}</td>
                <td className="px-4 py-4 text-sm space-x-2">
                  <button onClick={() => openEdit(c)} className="text-primary-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(c.id, c.course_code)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editCourse ? 'Edit Course' : 'Add Course'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
              <input type="text" required disabled={!!editCourse}
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                value={form.course_code}
                onChange={(e) => setForm({ ...form, course_code: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
              <input type="number" min={1} max={6} required
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
                value={form.credits}
                onChange={(e) => setForm({ ...form, credits: parseInt(e.target.value, 10) })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
            <input type="text" required
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
              value={form.course_name}
              onChange={(e) => setForm({ ...form, course_name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
              <input type="number" min={1} max={8} required
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: parseInt(e.target.value, 10) })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
              <input type="number" min={1} required
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value, 10) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Faculty</label>
              <select
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
                value={form.faculty_id}
                onChange={(e) => setForm({ ...form, faculty_id: e.target.value })}
              >
                <option value="">None</option>
                {faculty.map((f) => (
                  <option key={f.id} value={f.id}>{f.faculty_name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={3}
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <button type="submit" className="w-full bg-primary-600 text-white py-2.5 rounded-lg hover:bg-primary-700 font-medium">
            {editCourse ? 'Update' : 'Create Course'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
