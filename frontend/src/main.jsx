import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'  
import 'animate.css';
import { AuthProvider } from './context/AuthContext.tsx';
import { BrowserRouter as Router } from 'react-router-dom'; // Import BrowserRouter here
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router> {/* This is the ONE and ONLY Router */}
      <AuthProvider>
        {/* SocketProvider should be inside Router if it uses React Router hooks,
            but outside AuthProvider if AuthProvider depends on SocketProvider,
            or if SocketProvider needs auth context.
            Based on previous code, SocketProvider uses useAuth, so it should be inside AuthProvider.
            The AppContent (which contains SocketProvider) is now directly rendered by App.
        */}
        <App />
        <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      </AuthProvider>
    </Router>
  </React.StrictMode>,
)
