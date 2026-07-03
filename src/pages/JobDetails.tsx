import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertTriangle, Clock, Server, Terminal, Play, RotateCcw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const executionLogs = `[2026-07-03 14:15:22.102] INFO  [Worker-7] Starting job processing
[2026-07-03 14:15:22.145] DEBUG [Worker-7] Fetching payload from storage
[2026-07-03 14:15:22.301] INFO  [Worker-7] Processing user data for ID: 89912
[2026-07-03 14:15:23.004] WARN  [Worker-7] Rate limit approaching for external API
[2026-07-03 14:15:23.511] ERROR [Worker-7] Connection reset by peer: api.stripe.com
[2026-07-03 14:15:23.520] INFO  [Worker-7] Marking job as failed. Triggering retry policy.`;

const payloadJson = {
  "user_id": 89912,
  "action": "process_subscription",
  "plan_id": "plan_premium_annual",
  "idempotency_key": "idemp_8172635123",
  "metadata": {
    "source": "web_checkout",
    "campaign": "summer_sale"
  }
};

const retryHistory = [
  { attempt: 1, time: '2026-07-03 14:10:00', worker: 'wrk-12', result: 'Failed', duration: '1.2s' },
  { attempt: 2, time: '2026-07-03 14:11:00', worker: 'wrk-45', result: 'Failed', duration: '1.5s' },
  { attempt: 3, time: '2026-07-03 14:15:22', worker: 'wrk-07', result: 'Failed', duration: '1.4s' },
];

export default function JobDetails() {
  const { id } = useParams();
  const jobId = id || 'job_82epz6u';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/jobs"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            Job: {jobId} 
            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-xs">FAILED</Badge>
          </h1>
          <p className="text-muted-foreground flex items-center gap-2">
            Queue: <Link to="/queues/webhook-delivery" className="text-primary hover:underline">webhook-delivery</Link>
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm"><RotateCcw className="h-4 w-4 mr-2" /> Force Retry</Button>
          <Button variant="destructive" size="sm">Kill Job</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          <Card>
            <CardHeader>
              <CardTitle>Status Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative border-l border-muted ml-3 space-y-6 pb-2">
                <div className="relative pl-6">
                  <div className="absolute left-[-17px] top-1 h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-emerald-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Queued</h4>
                    <p className="text-xs text-muted-foreground">Added to webhook-delivery queue</p>
                    <p className="text-xs text-muted-foreground mt-1">2026-07-03 14:09:59</p>
                  </div>
                </div>
                <div className="relative pl-6">
                  <div className="absolute left-[-17px] top-1 h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Play className="h-3 w-3 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Processing</h4>
                    <p className="text-xs text-muted-foreground">Claimed by worker <Link to="/workers/wrk-07" className="text-primary hover:underline">wrk-07</Link> (Attempt 3)</p>
                    <p className="text-xs text-muted-foreground mt-1">2026-07-03 14:15:22</p>
                  </div>
                </div>
                <div className="relative pl-6">
                  <div className="absolute left-[-17px] top-1 h-8 w-8 rounded-full bg-destructive/20 flex items-center justify-center">
                    <AlertTriangle className="h-3 w-3 text-destructive" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-destructive">Failed</h4>
                    <p className="text-xs text-muted-foreground">Connection reset by peer: api.stripe.com</p>
                    <p className="text-xs text-muted-foreground mt-1">2026-07-03 14:15:23</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-col overflow-hidden">
            <CardHeader className="pb-0">
              <div className="flex justify-between items-center">
                <CardTitle>Job Data</CardTitle>
                <Tabs defaultValue="logs" className="w-[300px]">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="logs">Execution Logs</TabsTrigger>
                    <TabsTrigger value="payload">Payload</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="p-0 mt-4">
              <div className="bg-black text-green-400 font-mono text-xs p-4 h-[300px] overflow-y-auto w-full">
                {/* Normally we'd conditionally render based on Tabs state, but for a mockup we'll show logs */}
                <pre>{executionLogs}</pre>
              </div>
            </CardContent>
          </Card>
          
          <Card className="flex flex-col overflow-hidden">
            <CardHeader>
              <CardTitle>Payload</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="bg-muted/30 text-foreground font-mono text-xs p-4 overflow-y-auto w-full border-t">
                <pre>{JSON.stringify(payloadJson, null, 2)}</pre>
              </div>
            </CardContent>
          </Card>

        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                <span className="text-muted-foreground">ID</span>
                <span className="font-mono">{jobId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                <span className="text-muted-foreground">Priority</span>
                <span className="font-medium">Critical</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                <span className="text-muted-foreground">Created At</span>
                <span className="font-medium">2026-07-03 14:09:59</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                <span className="text-muted-foreground">Attempts</span>
                <span className="font-medium">3 / 5</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Next Retry</span>
                <span className="font-medium">In 5 mins</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Server className="h-4 w-4" /> Worker Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-primary/5 border border-primary/20 rounded-md p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Server className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <Link to="/workers/wrk-07" className="font-medium text-sm hover:underline">wrk-07</Link>
                    <p className="text-xs text-muted-foreground">ip-10-0-24-112</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]">ONLINE</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Retry History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="text-right">Worker</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {retryHistory.map((retry) => (
                    <TableRow key={retry.attempt}>
                      <TableCell className="font-medium">{retry.attempt}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{retry.time}</TableCell>
                      <TableCell className="text-right text-xs font-mono">{retry.worker}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
