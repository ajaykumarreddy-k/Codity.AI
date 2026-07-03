import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Search, Trash2, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';

const dlqJobs = Array.from({ length: 6 }).map((_, i) => ({
  id: `job_${Math.random().toString(36).substr(2, 9)}`,
  queue: ['webhook-delivery', 'email-campaigns'][Math.floor(Math.random() * 2)],
  error: ['Connection Timeout (HTTP 504)', 'Invalid Payload Schema', 'Rate Limit Exceeded (HTTP 429)'][Math.floor(Math.random() * 3)],
  attempts: Math.floor(Math.random() * 5) + 3,
  failedAt: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toLocaleString(),
}));

export default function DLQ() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-destructive flex items-center gap-2">
            <AlertTriangle className="h-6 w-6" /> Dead Letter Queue
          </h1>
          <p className="text-muted-foreground">Manage and recover jobs that exhausted their retry limits.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><RotateCcw className="h-4 w-4 mr-2" /> Retry All</Button>
          <Button variant="destructive"><Trash2 className="h-4 w-4 mr-2" /> Purge Queue</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-destructive">Total Failed Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">1,248</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Retry Success Rate (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">64.2%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Most Common Error</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">Connection Timeout (HTTP 504)</div>
            <p className="text-xs text-muted-foreground mt-1">42% of failures</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search error messages or job IDs..." className="pl-9" />
        </div>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job ID</TableHead>
              <TableHead>Queue</TableHead>
              <TableHead>Failure Reason</TableHead>
              <TableHead className="text-right">Attempts</TableHead>
              <TableHead className="text-right">Failed At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dlqJobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-mono text-xs">{job.id}</TableCell>
                <TableCell className="text-sm">{job.queue}</TableCell>
                <TableCell className="text-sm max-w-[300px] truncate text-destructive">
                  {job.error}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="outline">{job.attempts}</Badge>
                </TableCell>
                <TableCell className="text-right text-xs text-muted-foreground">{job.failedAt}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm"><RotateCcw className="h-4 w-4" /></Button>
                    <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
