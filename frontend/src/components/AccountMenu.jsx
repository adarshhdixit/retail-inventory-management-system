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
        className="flex items-center justify-center w-10 h-10 text-shop-text"
        aria-label="Login"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </Link>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full border border-shop-highlight/20 hover:border-shop-primary transition text-shop-text"
        aria-label="Account"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-shop-highlight/10 z-20">
          <div className="px-4 py-3 border-b border-shop-highlight/10">
            <p className="text-sm font-medium text-shop-text">
              {user?.name || 'Loading...'}
            </p>
            <p className="text-xs text-shop-highlight">{user?.phone}</p>
          </div>

          <Link
            to="/my-orders"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2 text-sm text-shop-text hover:bg-shop-bg"
          >
            My Orders
          </Link>

          <Link
            to="/addresses"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2 text-sm text-shop-text hover:bg-shop-bg"
          >
            My Addresses
          </Link>

          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-shop-error hover:bg-shop-bg"
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}

export default AccountMenu;