import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { loginSuccess, logout } from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken && !isAuthenticated) {
      // Verify token with backend
      fetch('http://localhost:8000/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${storedToken}`
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          dispatch(loginSuccess({ user: data.data.user, token: storedToken }));
        } else {
          localStorage.removeItem('token');
          dispatch(logout());
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
        dispatch(logout());
      });
    }
  }, [dispatch, isAuthenticated]);

  return {
    user,
    isAuthenticated,
    token
  };
};