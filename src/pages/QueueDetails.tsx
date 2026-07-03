import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Settings, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const recentJobs = Array.from({ length: 5 }).map((_, i) => ({
  id: `job_${Math.random().toString(36).substr(2, 9)}`,
  status: i === 1 ? 'failed' : i === 0 ? 'running' : 'completed',
  worker: `wrk-${Math.floor(Math.random() * 100)}`,
  runtime: `${Math.floor(Math.random() * 500) + 50}ms`,
  createdAt: '2 mins ago',
}));

export default function QueueDetails() {
  const { id } = useParams();
  // Using dummy queue name based on parameter, or fallback
  const queueName = id || 'webhook-delivery';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/queues"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            {queueName} 
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs">ACTIVE</Badge>
          </h1>
          <p className="text-muted-foreground">Project: Notification Service</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm"><Pause className="h-4 w-4 mr-2" /> Pause Queue</Button>
          <Button variant="outline" size="sm"><Settings className="h-4 w-4 mr-2" /> Configure</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium">Waiting</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45,210</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium">Running</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">342</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium">Active Workers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium">Throughput</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">320/s</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium">Error Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">0.4%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Jobs</CardTitle>
                <CardDescription>Latest executions in this queue</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild><Link to="/jobs">View All</Link></Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Worker</TableHead>
                    <TableHead className="text-right">Runtime</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-mono text-xs"><Link to="/jobs" className="hover:underline">{job.id}</Link></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {job.status === 'completed' && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                          {job.status === 'failed' && <AlertTriangle className="h-3 w-3 text-destructive" />}
                          {job.status === 'running' && <Activity className="h-3 w-3 text-blue-500" />}
                          <span className="capitalize text-sm">{job.status}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{job.worker}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{job.runtime}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Workers Consuming Queue</CardTitle>
              <CardDescription>Active nodes currently polling and processing from this queue.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Worker Node</TableHead>
                    <TableHead>Active Jobs</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium"><Link to="/workers/wrk-07" className="text-primary hover:underline">wrk-07</Link></TableCell>
                    <TableCell className="text-muted-foreground">4</TableCell>
                    <TableCell><Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]">POLLING</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium"><Link to="/workers/wrk-12" className="text-primary hover:underline">wrk-12</Link></TableCell>
                    <TableCell className="text-muted-foreground">2</TableCell>
                    <TableCell><Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]">POLLING</Badge></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Priority</span>
                <span className="font-medium">Critical</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Concurrency Limit</span>
                <span className="font-medium">500</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Retry Policy</span>
                <span className="font-medium">Exponential Backoff</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Max Retries</span>
                <span className="font-medium">5</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Dead Letter Queue</span>
                <span className="font-medium">Enabled</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Queue Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Concurrency Usage</span>
                  <span>68% (342/500)</span>
                </div>
                <Progress value={68} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
