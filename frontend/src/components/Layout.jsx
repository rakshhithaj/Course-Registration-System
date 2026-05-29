import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="bg-gray-800 text-gray-300 text-center py-4 text-sm">
        &copy; {new Date().getFullYear()} Course Registration System. All rights reserved.
      </footer>
    </div>
  );
}
