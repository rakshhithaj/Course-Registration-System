import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '../../components/UI';
import Modal from '../../components/Modal';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ department: '', semester: '', search: '' });
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [registering, setRegistering] = useState(false);

  const fetchCourses = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.department) params.append('department', filters.department);
      if (filters.semester) params.append('semester', filters.semester);
      if (filters.search) params.append('search', filters.search);

      const { data } = await api.get(`/courses?${params.toString()}`);
      setCourses(data);
    } catch {
      toast.error('Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [filters.department, filters.semester]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCourses();
  };

  const handleRegister = async (courseId) => {
    setRegistering(true);
    try {
      const { data } = await api.post('/registration/register', { course_id: courseId });
      toast.success(data.message);
      setSelectedCourse(null);
      fetchCourses();
    } catch (err) {
      const errData = err.response?.data;
      let msg = errData?.error || 'Registration failed.';
      if (errData?.missing) {
        msg += '\nMissing: ' + errData.missing.join(', ');
      }
      toast.error(msg);
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Course Catalog</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            >
              <option value="">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Electronics">Electronics</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
              value={filters.semester}
              onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
            >
              <option value="">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Search by name or code..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
              <button
                type="submit"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
              >
                Search
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Course Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition cursor-pointer"
            onClick={() => setSelectedCourse(course)}
          >
            <div className="flex justify-between items-start mb-3">
              <span className="bg-primary-100 text-primary-700 text-xs font-medium px-2.5 py-1 rounded">
                {course.course_code}
              </span>
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded ${
                  course.available_seats > 0
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {course.available_seats > 0
                  ? `${course.available_seats} seats`
                  : 'Full'}
              </span>
            </div>
            <h3 className="text-lg font-semibold mb-1">{course.course_name}</h3>
            <p className="text-sm text-gray-500 mb-3">{course.department}</p>
            <div className="flex justify-between text-sm text-gray-600">
              <span>{course.credits} Credits</span>
              <span>{course.faculty_name || 'TBA'}</span>
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && (
        <p className="text-center text-gray-500 py-12">No courses found.</p>
      )}

      {/* Course Detail Modal */}
      <Modal
        isOpen={!!selectedCourse}
        onClose={() => setSelectedCourse(null)}
        title={selectedCourse?.course_name || ''}
      >
        {selectedCourse && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Code:</span>
                <p className="font-medium">{selectedCourse.course_code}</p>
              </div>
              <div>
                <span className="text-gray-500">Credits:</span>
                <p className="font-medium">{selectedCourse.credits}</p>
              </div>
              <div>
                <span className="text-gray-500">Department:</span>
                <p className="font-medium">{selectedCourse.department}</p>
              </div>
              <div>
                <span className="text-gray-500">Faculty:</span>
                <p className="font-medium">{selectedCourse.faculty_name || 'TBA'}</p>
              </div>
              <div>
                <span className="text-gray-500">Capacity:</span>
                <p className="font-medium">{selectedCourse.capacity}</p>
              </div>
              <div>
                <span className="text-gray-500">Available:</span>
                <p className={`font-medium ${selectedCourse.available_seats > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedCourse.available_seats}
                </p>
              </div>
            </div>
            {selectedCourse.description && (
              <div>
                <span className="text-gray-500 text-sm">Description:</span>
                <p className="text-sm mt-1">{selectedCourse.description}</p>
              </div>
            )}
            <button
              onClick={() => handleRegister(selectedCourse.id)}
              disabled={registering || selectedCourse.available_seats <= 0}
              className="w-full bg-primary-600 text-white py-2.5 rounded-lg hover:bg-primary-700 font-medium transition disabled:opacity-50"
            >
              {registering
                ? 'Registering...'
                : selectedCourse.available_seats <= 0
                ? 'Course Full'
                : 'Register for this Course'}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
