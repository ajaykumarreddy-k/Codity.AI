import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Database, Server, CheckCircle2, XCircle, Clock, Zap, ArrowUpRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const stats = [
  { title: "Total Jobs", value: "24.5M", change: "+12%", trend: "up" },
  { title: "Running Jobs", value: "1,249", change: "Steady", trend: "neutral" },
  { title: "Completed (24h)", value: "842K", change: "+5%", trend: "up" },
  { title: "Failed (24h)", value: "124", change: "-2%", trend: "down" },
  { title: "Active Workers", value: "156", change: "+3", trend: "up" },
  { title: "Queue Count", value: "24", change: "0", trend: "neutral" },
  { title: "Throughput/sec", value: "850", change: "+15%", trend: "up" },
  { title: "Success Rate", value: "99.98%", change: "+0.01%", trend: "up" },
];

const health = [
  { name: "API Server", status: "operational", ping: "8ms", icon: Zap, extra: "" },
  { name: "PostgreSQL", status: "operational", ping: "12ms", icon: Database, extra: "" },
  { name: "Redis", status: "operational", ping: "2ms", icon: Database, extra: "" },
  { name: "Scheduler", status: "operational", ping: "45ms", icon: Clock, extra: "Last heartbeat: 2s ago" },
  { name: "Worker Cluster", status: "degraded", ping: "150ms", icon: Server, extra: "3 nodes offline" },
];

const chartData = Array.from({ length: 24 }).map((_, i) => ({
  time: `${i}:00`,
  throughput: Math.floor(Math.random() * 1000) + 500,
  failures: Math.floor(Math.random() * 20),
}));

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Platform Overview</h1>
          <p className="text-muted-foreground">Executive overview of Codity.ai health and metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className={i === 0 ? "bg-gradient-to-br from-primary to-blue-800 text-primary-foreground border-white/10 shadow-[0_8px_30px_rgba(0,82,255,0.3)] relative overflow-hidden" : "border border-black/5 dark:border-white/5 shadow-[0_4px_24px_rgba(0,0,0,0.02)] bg-card transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]"}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`text-base font-medium ${i === 0 ? 'text-primary-foreground/90' : 'text-foreground'}`}>
                {stat.title}
              </CardTitle>
              <div className={`p-1.5 rounded-full border ${i === 0 ? 'border-primary-foreground/20 text-primary-foreground' : 'border-border text-muted-foreground'}`}>
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-4xl font-bold mb-4">{stat.value}</div>
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                i === 0 
                  ? 'bg-white/20 text-white' 
                  : stat.trend === 'up' ? 'bg-emerald-500/10 text-emerald-600' : stat.trend === 'down' ? 'bg-rose-500/10 text-rose-600' : 'bg-muted text-muted-foreground'
              }`}>
                <span className="bg-white/40 rounded px-1">{stat.change}</span>
                <span className={i === 0 ? "text-primary-foreground/70" : "text-muted-foreground font-normal"}>Increased from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-2 border border-black/5 dark:border-white/5 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <CardHeader>
            <CardTitle>Job Throughput</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                <XAxis dataKey="time" className="text-xs" tick={{fill: 'currentColor'}} stroke="none" />
                <YAxis className="text-xs" tick={{fill: 'currentColor'}} stroke="none" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                />
                <Line type="monotone" dataKey="throughput" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border border-black/5 dark:border-white/5 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <CardHeader>
            <CardTitle>Infrastructure Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {health.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-md ${
                    item.status === 'operational' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{item.ping} latency</span>
                      {item.extra && (
                        <>
                          <span>•</span>
                          <span>{item.extra}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <Badge variant={item.status === 'operational' ? 'default' : 'secondary'} className={
                  item.status === 'operational' ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
                }>
                  {item.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
