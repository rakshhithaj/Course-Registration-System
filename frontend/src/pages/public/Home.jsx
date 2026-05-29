import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <div className="text-center py-16">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
          Course Registration System
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          A modern, secure platform for students to browse courses, register for
          classes, and manage their academic schedule — all in one place.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/login"
            className="bg-primary-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary-700 transition"
          >
            Student Login
          </Link>
          <Link
            to="/register"
            className="border-2 border-primary-600 text-primary-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary-50 transition"
          >
            Create Account
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 py-12">
        {[
          {
            icon: '📖',
            title: 'Browse Courses',
            desc: 'Explore the full course catalog with filters by department, semester, and faculty.',
          },
          {
            icon: '✅',
            title: 'Smart Registration',
            desc: 'Automatic prerequisite validation, schedule conflict detection, and credit limit checks.',
          },
          {
            icon: '🔒',
            title: 'Secure & Reliable',
            desc: 'JWT authentication, encrypted passwords, and duplicate-prevention using Student ID verification.',
          },
          {
            icon: '📊',
            title: 'Real-time Availability',
            desc: 'See live seat counts and get notified when courses fill up.',
          },
          {
            icon: '🔔',
            title: 'Notifications',
            desc: 'Receive instant updates on registration status, deadlines, and announcements.',
          },
          {
            icon: '📋',
            title: 'Reports & Analytics',
            desc: 'Administrators can generate enrollment, course, and department reports.',
          },
        ].map((f) => (
          <div key={f.title} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
            <span className="text-4xl">{f.icon}</span>
            <h3 className="text-xl font-bold mt-4 mb-2">{f.title}</h3>
            <p className="text-gray-600">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
