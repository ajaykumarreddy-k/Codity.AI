import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const auditLogs = [
  { id: 1, user: 'Ajay (Admin)', action: 'Created Queue', resource: 'queue:webhook-delivery', time: '2026-07-03 14:10:22', type: 'create' },
  { id: 2, user: 'Ajay (Admin)', action: 'Retried Job', resource: 'job:job_82epz6u', time: '2026-07-03 14:15:21', type: 'update' },
  { id: 3, user: 'System', action: 'Scaled Workers', resource: 'deployment:worker-pool', time: '2026-07-03 14:05:00', type: 'system' },
  { id: 4, user: 'Priya (Dev)', action: 'Paused Queue', resource: 'queue:image-optimization', time: '2026-07-03 13:45:11', type: 'update' },
  { id: 5, user: 'Ajay (Admin)', action: 'Updated Policy', resource: 'policy:exponential-backoff', time: '2026-07-03 11:22:15', type: 'update' },
  { id: 6, user: 'System', action: 'Node Terminated', resource: 'worker:wrk-99', time: '2026-07-03 10:15:22', type: 'delete' },
];

export default function AuditLogs() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">Compliance and security trail for all actions taken in the system.</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search logs by user, action, or resource..." className="pl-9" />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" /> Filter by Date
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-0">
          <CardTitle>Security Events</CardTitle>
          <CardDescription>Last 30 days of activity.</CardDescription>
        </CardHeader>
        <CardContent className="mt-4 p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm font-mono text-muted-foreground">{log.time}</TableCell>
                  <TableCell className="font-medium">{log.user}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={
                        log.type === 'create' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        log.type === 'update' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                        log.type === 'delete' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                        'bg-slate-500/10 text-slate-500 border-slate-500/20'
                      }>
                        {log.action}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{log.resource}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
