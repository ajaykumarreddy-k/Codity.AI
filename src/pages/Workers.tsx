import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Server, Cpu, MemoryStick, Activity } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const workers = Array.from({ length: 8 }).map((_, i) => ({
  id: `wrk-${Math.random().toString(36).substr(2, 6)}`,
  host: `ip-10-0-${Math.floor(Math.random() * 255)}-${Math.floor(Math.random() * 255)}.ec2.internal`,
  status: i === 7 ? 'offline' : (Math.random() > 0.3 ? 'busy' : 'online'),
  jobs: i === 7 ? 0 : Math.floor(Math.random() * 10),
  cpu: Math.floor(Math.random() * 100),
  mem: Math.floor(Math.random() * 100),
  lastHeartbeat: i === 7 ? '2 hours ago' : '5 seconds ago',
}));

export default function Workers() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Worker Cluster</h1>
          <p className="text-muted-foreground">Monitor the health and utilization of your distributed worker nodes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {workers.map((worker) => (
          <Card key={worker.id} className={`transition-colors ${worker.status === 'offline' ? 'opacity-60 border-destructive/30' : ''}`}>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono text-sm font-semibold">{worker.id}</span>
                </div>
                <Badge variant="outline" className={
                  worker.status === 'busy' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                  worker.status === 'online' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                  'bg-destructive/10 text-destructive border-destructive/20'
                }>
                  {worker.status.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1 truncate" title={worker.host}>{worker.host}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                    <Activity className="h-3 w-3" /> Active Jobs
                  </div>
                  <div className="text-xl font-medium">{worker.jobs}</div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                    <Activity className="h-3 w-3" /> Heartbeat
                  </div>
                  <div className="text-xs font-medium mt-1">{worker.lastHeartbeat}</div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-muted-foreground"><Cpu className="h-3 w-3" /> CPU</span>
                    <span>{worker.cpu}%</span>
                  </div>
                  <Progress value={worker.cpu} className={`h-1.5 ${worker.cpu > 80 ? '[&>div]:bg-destructive' : ''}`} />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-muted-foreground"><MemoryStick className="h-3 w-3" /> Memory</span>
                    <span>{worker.mem}%</span>
                  </div>
                  <Progress value={worker.mem} className={`h-1.5 ${worker.mem > 85 ? '[&>div]:bg-destructive' : ''}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
