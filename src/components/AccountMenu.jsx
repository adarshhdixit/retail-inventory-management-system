import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';

function AccountMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    if (isLoggedIn) {
      api.get('/auth/me').then((res) => setUser(res.data)).catch(() => setUser(null));
    }
  }, [isLoggedIn]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/store');
    window.location.reload();
  };

  if (!isLoggedIn) {
    return (
      <Link
        to="/account"
        className="bg-gray-700 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800"
      >
        Login
      </Link>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-700 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800"
      >
        Account {isOpen ? '▲' : '▼'}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-10">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-800">
              {user?.name || 'Loading...'}
            </p>
            <p className="text-xs text-gray-500">{user?.phone}</p>
          </div>

          {/* Room to add more items later, e.g. My Orders, Addresses */}

          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}

export default AccountMenu;