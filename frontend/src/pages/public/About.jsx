export default function About() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">About the System</h1>

      <div className="bg-white rounded-xl shadow-md p-8 space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2">Purpose</h2>
          <p className="text-gray-600">
            The Course Registration System is designed for colleges and universities
            to streamline the process of course enrollment. It replaces manual,
            paper-based registration with a secure, real-time digital platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Key Features</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>Student ID-based identity — prevents duplicate accounts</li>
            <li>Prerequisite validation before course registration</li>
            <li>Automatic schedule conflict detection</li>
            <li>Real-time seat availability tracking</li>
            <li>Credit limit enforcement (max 24 credits)</li>
            <li>Role-based access: Students and Administrators</li>
            <li>Notification system for registration events</li>
            <li>Comprehensive reporting for administrators</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Technology Stack</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-medium text-gray-800">Frontend</h3>
              <p className="text-gray-600">React.js, Tailwind CSS, React Router, Axios</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Backend</h3>
              <p className="text-gray-600">Node.js, Express.js, JWT, bcrypt</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Database</h3>
              <p className="text-gray-600">MySQL with normalized schema</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Security</h3>
              <p className="text-gray-600">Helmet, CORS, Rate Limiting, Input Validation</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
