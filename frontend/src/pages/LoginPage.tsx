import { useState } from 'react';
import { Typography, Card, Form, Input, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import type { CurrentUser } from '@/types/auth';

const DEMO_USER: CurrentUser = {
  id: 1,
  username: 'demo',
  email: 'demo@nexus.dev',
  tenantId: 1,
  role: 'admin',
};

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = () => {
    setLoading(true);
    const token = 'demo-token-' + Date.now();
    setAuth(token, DEMO_USER.tenantId, DEMO_USER);
    navigate('/');
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'var(--color-bg)',
    }}>
      <Card style={{ width: 400 }}>
        <Typography.Title level={3} style={{ textAlign: 'center' }}>
          Nexus Teammate
        </Typography.Title>
        <Typography.Paragraph style={{ textAlign: 'center', color: '#8c8c8c', marginBottom: 24 }}>
          Sign in to your workspace
        </Typography.Paragraph>
        <Form layout="vertical">
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Please enter your username' }]}
          >
            <Input size="large" placeholder="Enter username" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password size="large" placeholder="Enter password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block>
              Sign In
            </Button>
          </Form.Item>
        </Form>
        <Button
          type="default"
          size="large"
          block
          onClick={handleDemoLogin}
          loading={loading}
          style={{ marginTop: 8 }}
        >
          Demo Login
        </Button>
      </Card>
    </div>
  );
}
