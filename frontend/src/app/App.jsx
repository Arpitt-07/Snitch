import React, { useEffect, useState } from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import './App.css';
import LoginPage from '../features/auth/pages/LoginPage';
import SignupPage from '../features/auth/pages/SignupPage';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute';
import { useAuth } from '../features/auth/hooks/useAuth';

const AuthWrapper = () => {
  const { checkAuthUser } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const check = async () => {
      await checkAuthUser();
      setIsChecking(false);
    };
    check();
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="font-display-lg-mobile text-primary animate-pulse">SNITCH</div>
      </div>
    );
  }

  return <Outlet />;
};

const router = createBrowserRouter([
  {
    element: <AuthWrapper />,
    children: [
      {
        path: "/",
        element: (
          <ProtectedRoute>
            <div>Home Page</div>
          </ProtectedRoute>
        ),
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/signup",
        element: <SignupPage />,
      }
    ]
  }
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;