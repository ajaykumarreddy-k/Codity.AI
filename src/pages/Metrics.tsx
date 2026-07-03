import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Clock, Zap, Percent, ServerCrash, RefreshCcw } from 'lucide-react';

const timeSeriesData = Array.from({ length: 24 }).map((_, i) => ({
  time: `${i}:00`,
  throughput: Math.floor(Math.random() * 1000) + 500,
  success: Math.floor(Math.random() * 950) + 500,
  failures: Math.floor(Math.random() * 50),
  latency: Math.floor(Math.random() * 200) + 50,
}));

export default function Metrics() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Metrics & Observability</h1>
          <p className="text-muted-foreground">Deep dive into platform performance and historical trends.</p>
        </div>
        <Select defaultValue="24h">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">Last Hour</SelectItem>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center justify-center space-y-1">
            <Clock className="h-5 w-5 text-muted-foreground mb-1" />
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Avg Runtime</p>
            <p className="text-xl font-bold">124ms</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center justify-center space-y-1">
            <Zap className="h-5 w-5 text-muted-foreground mb-1" />
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">P95 Latency</p>
            <p className="text-xl font-bold">340ms</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center justify-center space-y-1">
            <Zap className="h-5 w-5 text-destructive mb-1" />
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">P99 Latency</p>
            <p className="text-xl font-bold">890ms</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center justify-center space-y-1">
            <Percent className="h-5 w-5 text-emerald-500 mb-1" />
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Worker Util.</p>
            <p className="text-xl font-bold">68%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center justify-center space-y-1">
            <RefreshCcw className="h-5 w-5 text-amber-500 mb-1" />
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Retry Rate</p>
            <p className="text-xl font-bold">1.2%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center justify-center space-y-1">
            <ServerCrash className="h-5 w-5 text-destructive mb-1" />
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">DLQ Rate</p>
            <p className="text-xl font-bold">0.05%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Throughput (Jobs/sec)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData}>
                <defs>
                  <linearGradient id="colorThroughput" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                <XAxis dataKey="time" className="text-xs" tick={{fill: 'currentColor'}} stroke="none" />
                <YAxis className="text-xs" tick={{fill: 'currentColor'}} stroke="none" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} />
                <Area type="monotone" dataKey="throughput" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorThroughput)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Processing Latency (ms)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                <XAxis dataKey="time" className="text-xs" tick={{fill: 'currentColor'}} stroke="none" />
                <YAxis className="text-xs" tick={{fill: 'currentColor'}} stroke="none" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} />
                <Line type="monotone" dataKey="latency" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Success vs Failures</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                <XAxis dataKey="time" className="text-xs" tick={{fill: 'currentColor'}} stroke="none" />
                <YAxis className="text-xs" tick={{fill: 'currentColor'}} stroke="none" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} />
                <Bar dataKey="success" stackId="a" fill="#10b981" />
                <Bar dataKey="failures" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Queue Depth Overview</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground border-2 border-dashed border-muted m-4 rounded-md">
            Data visualization requires multiple queue contexts
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
