import React, { useCallback, useEffect } from 'react';
import AppRouter from './routes/AppRoutes';
import './assets/css/global.css'
import { useDispatch, useSelector } from 'react-redux';
import { restoreUserFromToken } from './redux/slices/authSlice';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie'
import { ToastContainer } from 'react-toastify';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading, error, userInfo } = useSelector((state) => state.user);
  useEffect(() => {
    dispatch(restoreUserFromToken())
  }, []);
  return (
    <div className="App">
      <AppRouter isAuthenticated={isAuthenticated} userInfo={userInfo} />
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        className="custom-toast-container"
      // limit={1}
      />
    </div>
  );
}

export default App;