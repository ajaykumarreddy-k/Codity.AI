import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Settings, Search, Filter } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';

const queues = [
  { name: 'order-processing', project: 'E-commerce Core', status: 'active', priority: 'High', concurrency: 100, waiting: 45, running: 98, failed: 2, throughput: '45/s' },
  { name: 'image-optimization', project: 'E-commerce Core', status: 'paused', priority: 'Low', concurrency: 20, waiting: 1250, running: 0, failed: 0, throughput: '0/s' },
  { name: 'webhook-delivery', project: 'Notification Service', status: 'active', priority: 'Critical', concurrency: 500, waiting: 0, running: 342, failed: 12, throughput: '320/s' },
  { name: 'daily-analytics', project: 'Data Pipeline', status: 'active', priority: 'Medium', concurrency: 50, waiting: 5, running: 10, failed: 0, throughput: '2/s' },
  { name: 'email-campaigns', project: 'Notification Service', status: 'active', priority: 'Medium', concurrency: 200, waiting: 45000, running: 200, failed: 154, throughput: '180/s' },
];

export default function Queues() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Queues</h1>
          <p className="text-muted-foreground">Administer and monitor task queues across all projects.</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger render={<Button />}>
            Create Queue
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Queue</DialogTitle>
              <DialogDescription>
                Define a new job queue and its processing rules.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Queue Name</Label>
                <Input id="name" placeholder="e.g. video-transcoding" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select defaultValue="medium">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="concurrency">Concurrency Limit</Label>
                <Input id="concurrency" type="number" defaultValue="10" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="retry">Retry Policy</Label>
                <Select defaultValue="exponential">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exponential">Exponential Backoff</SelectItem>
                    <SelectItem value="linear">Linear Backoff</SelectItem>
                    <SelectItem value="fixed">Fixed Delay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maxRetries">Max Retries</Label>
                <Input id="maxRetries" type="number" defaultValue="3" />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" id="dlq" defaultChecked className="rounded border-input bg-transparent" />
                <Label htmlFor="dlq">Enable Dead Letter Queue</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={() => setIsCreateOpen(false)}>Create Queue</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search queues..." className="pl-9" />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" /> Filters
        </Button>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Queue Name</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead className="text-right">Concurrency</TableHead>
              <TableHead className="text-right">Waiting</TableHead>
              <TableHead className="text-right">Running</TableHead>
              <TableHead className="text-right">Throughput</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {queues.map((queue) => (
              <TableRow key={queue.name}>
                <TableCell className="font-medium">
                  <Link to={`/queues/${queue.name}`} className="hover:underline">{queue.name}</Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{queue.project}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={queue.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}>
                    {queue.status}
                  </Badge>
                </TableCell>
                <TableCell>{queue.priority}</TableCell>
                <TableCell className="text-right">{queue.concurrency}</TableCell>
                <TableCell className="text-right font-medium">{queue.waiting.toLocaleString()}</TableCell>
                <TableCell className="text-right">{queue.running.toLocaleString()}</TableCell>
                <TableCell className="text-right">{queue.throughput}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                      {queue.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" asChild>
                      <Link to={`/queues/${queue.name}`}><Settings className="h-4 w-4" /></Link>
                    </Button>
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
