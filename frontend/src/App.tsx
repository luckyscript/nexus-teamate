import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/layout/AppLayout';
import { AuthGuard } from '@/components/AuthGuard';
import { LoginPage } from '@/pages/LoginPage';
import { Dashboard } from '@/pages/Dashboard';
import { ProjectList } from '@/pages/ProjectList';
import { ProjectDetail } from '@/pages/ProjectDetail';
import { BoardView } from '@/pages/BoardView';
import { TaskDetail } from '@/pages/TaskDetail';
import { AgentList } from '@/pages/AgentList';
import { AgentDetail } from '@/pages/AgentDetail';
import { AutomationList } from '@/pages/AutomationList';
import { AnalyticsDashboard } from '@/pages/AnalyticsDashboard';
import { AssetMarketplace } from '@/pages/AssetMarketplace';
import { TemplateList } from '@/pages/TemplateList';
import { ConnectorList } from '@/pages/ConnectorList';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AuthGuard><AppLayout /></AuthGuard>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/projects" element={<ProjectList />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/boards/:id" element={<BoardView />} />
        <Route path="/tasks/:id" element={<TaskDetail />} />
        <Route path="/agents" element={<AgentList />} />
        <Route path="/agents/:id" element={<AgentDetail />} />
        <Route path="/automation" element={<AutomationList />} />
        <Route path="/analytics" element={<AnalyticsDashboard />} />
        <Route path="/assets" element={<AssetMarketplace />} />
        <Route path="/templates" element={<TemplateList />} />
        <Route path="/connectors" element={<ConnectorList />} />
      </Route>
    </Routes>
  );
}
