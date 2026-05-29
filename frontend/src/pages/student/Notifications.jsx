import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '../../components/UI';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
    } catch {
      toast.error('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch {
      toast.error('Failed to mark as read.');
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast.success('All marked as read.');
    } catch {
      toast.error('Failed to update.');
    }
  };

  if (loading) return <LoadingSpinner />;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-gray-600">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-primary-600 hover:text-primary-800 text-sm font-medium"
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <p className="text-gray-500">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`bg-white rounded-lg shadow-sm p-4 border-l-4 ${
                n.is_read
                  ? 'border-gray-200'
                  : 'border-primary-500 bg-primary-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className={`text-sm ${n.is_read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                    {n.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </div>
                {!n.is_read && (
                  <button
                    onClick={() => markRead(n.id)}
                    className="text-xs text-primary-600 hover:underline ml-4 whitespace-nowrap"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
