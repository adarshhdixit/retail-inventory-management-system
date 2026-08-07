import { Navigate } from 'react-router-dom';

export default function CustomerProtectedRoute({ children }) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/account" replace />;
  }

  return children;
}