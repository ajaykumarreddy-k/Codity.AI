import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, ListTree, Activity, Server, Clock, AlertTriangle, BarChart3, Settings, Hexagon, Network, BookOpen, ClipboardList, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', path: '/projects', icon: FolderKanban },
  { name: 'Queues', path: '/queues', icon: ListTree },
  { name: 'Jobs', path: '/jobs', icon: Activity },
  { name: 'Workers', path: '/workers', icon: Server },
  { name: 'Scheduled', path: '/scheduled', icon: Clock },
  { name: 'DLQ', path: '/dlq', icon: AlertTriangle },
  { name: 'Metrics', path: '/metrics', icon: BarChart3 },
  { name: 'Retry Policies', path: '/retry-policies', icon: RotateCcw },
  { name: 'Audit Logs', path: '/audit-logs', icon: ClipboardList },
  { name: 'Settings', path: '/settings', icon: Settings },
];

const docsItems = [
  { name: 'System Architecture', path: '/architecture', icon: Network },
  { name: 'Database ER Diagram', path: '/documentation', icon: BookOpen },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-sidebar flex flex-col h-full shrink-0">
      <div className="h-20 flex items-center px-6 shrink-0">
        <Link to="/" className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
          <Hexagon className="h-6 w-6 text-primary fill-primary/20" />
          <span>Codity.ai</span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all",
                  isActive 
                    ? "text-primary font-semibold bg-primary/10 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-6 before:w-1 before:bg-primary before:rounded-r-full before:shadow-[0_0_8px_var(--color-primary)]" 
                    : "text-muted-foreground font-medium hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div>
          <h4 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Documentation</h4>
          <nav className="space-y-1">
            {docsItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      <div className="mx-4 mb-6 p-5 rounded-[1.25rem] bg-gradient-to-br from-primary to-blue-800 text-primary-foreground shadow-[0_8px_30px_rgba(0,82,255,0.3)] shrink-0 overflow-hidden relative border border-white/20">
        <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-black/20 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-sm">Cluster Status</span>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-primary-foreground/80">Version</p>
            <p className="text-sm font-medium">v2.4.1-enterprise</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
