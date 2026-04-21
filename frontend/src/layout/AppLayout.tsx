import { Outlet, useNavigate } from 'react-router-dom';
import { Layout, Menu, Typography } from 'antd';
import {
  DashboardOutlined,
  ProjectOutlined,
  RobotOutlined,
  ThunderboltOutlined,
  BarChartOutlined,
  ShopOutlined,
  FileTextOutlined,
  LinkOutlined,
} from '@ant-design/icons';

const { Sider, Content } = Layout;

export function AppLayout() {
  const navigate = useNavigate();

  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/projects', icon: <ProjectOutlined />, label: 'Projects' },
    { key: '/agents', icon: <RobotOutlined />, label: 'Agents' },
    { key: '/automation', icon: <ThunderboltOutlined />, label: 'Automation' },
    { key: '/analytics', icon: <BarChartOutlined />, label: 'Analytics' },
    { key: '/assets', icon: <ShopOutlined />, label: 'Assets' },
    { key: '/templates', icon: <FileTextOutlined />, label: 'Templates' },
    { key: '/connectors', icon: <LinkOutlined />, label: 'Connectors' },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="80">
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <Typography.Title level={4} style={{ color: '#fff', margin: 0 }}>
            Nexus
          </Typography.Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          defaultSelectedKeys={['/']}
        />
      </Sider>
      <Layout>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', borderRadius: 8 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
