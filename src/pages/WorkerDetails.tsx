import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Activity, Cpu, MemoryStick, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const metricData = Array.from({ length: 20 }).map((_, i) => ({
  time: `-${20 - i}m`,
  cpu: Math.floor(Math.random() * 40) + 20,
  mem: Math.floor(Math.random() * 10) + 60,
}));

export default function WorkerDetails() {
  const { id } = useParams();
  const workerId = id || 'wrk-123';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/workers"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            {workerId} 
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs">ONLINE</Badge>
          </h1>
          <p className="text-muted-foreground font-mono text-sm">ip-10-0-24-112.ec2.internal</p>
        </div>
        <div className="ml-auto">
          <Button variant="destructive" size="sm">Terminate Node</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" /> Active Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">4</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium">Jobs Processed (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12,450</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium">Failure Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-500">0.01%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" /> Last Heartbeat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-sm mt-2">2 seconds ago</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Cpu className="h-5 w-5" /> CPU Utilization</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metricData}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                <XAxis dataKey="time" className="text-xs" tick={{fill: 'currentColor'}} stroke="none" />
                <YAxis className="text-xs" tick={{fill: 'currentColor'}} stroke="none" domain={[0, 100]} />
                <RechartsTooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} />
                <Area type="monotone" dataKey="cpu" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorCpu)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MemoryStick className="h-5 w-5" /> Memory Utilization</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metricData}>
                <defs>
                  <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                <XAxis dataKey="time" className="text-xs" tick={{fill: 'currentColor'}} stroke="none" />
                <YAxis className="text-xs" tick={{fill: 'currentColor'}} stroke="none" domain={[0, 100]} />
                <RechartsTooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} />
                <Area type="monotone" dataKey="mem" stroke="#10b981" fillOpacity={1} fill="url(#colorMem)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Heartbeat Timeline</CardTitle>
          <CardDescription>Recent check-ins from this worker node to the control plane.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>CPU</TableHead>
                <TableHead>Memory</TableHead>
                <TableHead>Active Jobs</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-sm">2026-07-03 14:15:20</TableCell>
                <TableCell><Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]">HEALTHY</Badge></TableCell>
                <TableCell>34%</TableCell>
                <TableCell>62%</TableCell>
                <TableCell>4</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">2026-07-03 14:15:15</TableCell>
                <TableCell><Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]">HEALTHY</Badge></TableCell>
                <TableCell>38%</TableCell>
                <TableCell>61%</TableCell>
                <TableCell>4</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">2026-07-03 14:15:10</TableCell>
                <TableCell><Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]">HEALTHY</Badge></TableCell>
                <TableCell>22%</TableCell>
                <TableCell>60%</TableCell>
                <TableCell>3</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
