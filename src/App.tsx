/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from 'next-themes';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Queues from './pages/Queues';
import Jobs from './pages/Jobs';
import Workers from './pages/Workers';
import ScheduledJobs from './pages/ScheduledJobs';
import DLQ from './pages/DLQ';
import Metrics from './pages/Metrics';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import Architecture from './pages/Architecture';
import Documentation from './pages/Documentation';
import QueueDetails from './pages/QueueDetails';
import WorkerDetails from './pages/WorkerDetails';
import ProjectDetails from './pages/ProjectDetails';
import JobDetails from './pages/JobDetails';
import AuditLogs from './pages/AuditLogs';
import RetryPolicies from './pages/RetryPolicies';

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
      <TooltipProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Navigate to="/login" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="projects" element={<Projects />} />
              <Route path="projects/:id" element={<ProjectDetails />} />
              <Route path="queues" element={<Queues />} />
              <Route path="queues/:id" element={<QueueDetails />} />
              <Route path="jobs" element={<Jobs />} />
              <Route path="jobs/:id" element={<JobDetails />} />
              <Route path="workers" element={<Workers />} />
              <Route path="workers/:id" element={<WorkerDetails />} />
              <Route path="scheduled" element={<ScheduledJobs />} />
              <Route path="dlq" element={<DLQ />} />
              <Route path="metrics" element={<Metrics />} />
              <Route path="settings" element={<Settings />} />
              <Route path="architecture" element={<Architecture />} />
              <Route path="documentation" element={<Documentation />} />
              <Route path="audit-logs" element={<AuditLogs />} />
              <Route path="retry-policies" element={<RetryPolicies />} />
            </Route>
          </Routes>
        </Router>
      </TooltipProvider>
    </ThemeProvider>
  );
}
