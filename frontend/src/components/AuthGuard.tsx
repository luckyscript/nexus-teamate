import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { getMe } from '@/api/services/auth';
import { Spin } from 'antd';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const navigate = useNavigate();
  const { isAuthenticated, setAuth } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyUser() {
      if (isAuthenticated()) {
        setLoading(false);
        return;
      }

      try {
        const user = await getMe();
        const token = localStorage.getItem('auth_token');
        if (token && user) {
          setAuth(token, user.tenantId, user);
        } else {
          navigate('/login');
        }
      } catch {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    }

    verifyUser();
  }, [isAuthenticated, setAuth, navigate]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated()) {
    return null;
  }

  return <>{children}</>;
}
