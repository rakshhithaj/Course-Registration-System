export default function Contact() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>

      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Get in Touch</h2>
            <div className="space-y-4 text-gray-600">
              <div>
                <h3 className="font-medium text-gray-800">Registration Office</h3>
                <p>Room 101, Admin Block</p>
                <p>University Campus</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Email</h3>
                <p>registrar@university.edu</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Phone</h3>
                <p>+91-80-1234-5678</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Office Hours</h3>
                <p>Monday–Friday: 9:00 AM – 5:00 PM</p>
                <p>Saturday: 9:00 AM – 1:00 PM</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Send a Message</h2>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="How can we help?"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 font-medium transition"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
