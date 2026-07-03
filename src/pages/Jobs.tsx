import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, RotateCcw, XCircle, FileJson, Activity, Clock, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const MOCK_JOBS = Array.from({ length: 10 }).map((_, i) => ({
  id: `job_${Math.random().toString(36).substr(2, 9)}`,
  type: ['ProcessPayment', 'SendEmail', 'GenerateReport', 'ResizeImage'][Math.floor(Math.random() * 4)],
  queue: ['order-processing', 'webhook-delivery', 'daily-analytics', 'image-optimization'][Math.floor(Math.random() * 4)],
  worker: `wrk-${Math.floor(Math.random() * 100)}`,
  status: ['completed', 'running', 'failed', 'queued'][Math.floor(Math.random() * 4)],
  attempts: Math.floor(Math.random() * 3) + 1,
  runtime: `${Math.floor(Math.random() * 500) + 50}ms`,
  createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000)),
}));

const statusColors = {
  completed: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  running: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  failed: 'bg-destructive/10 text-destructive border-destructive/20',
  queued: 'bg-muted text-muted-foreground border-border',
};

export default function Jobs() {
  const [selectedJob, setSelectedJob] = useState(MOCK_JOBS[0]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [jobType, setJobType] = useState('immediate');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Jobs Explorer</h1>
          <p className="text-muted-foreground">Search and inspect individual job executions.</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2"/> Create Job
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Job</DialogTitle>
              <DialogDescription>
                Manually enqueue a new job into the system.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="queue">Target Queue</Label>
                <Select defaultValue="webhook-delivery">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="webhook-delivery">webhook-delivery</SelectItem>
                    <SelectItem value="order-processing">order-processing</SelectItem>
                    <SelectItem value="email-campaigns">email-campaigns</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Execution Type</Label>
                <Tabs defaultValue="immediate" onValueChange={setJobType} className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="immediate" className="text-[10px] md:text-xs">Immediate</TabsTrigger>
                    <TabsTrigger value="delayed" className="text-[10px] md:text-xs">Delayed</TabsTrigger>
                    <TabsTrigger value="scheduled" className="text-[10px] md:text-xs">Scheduled</TabsTrigger>
                    <TabsTrigger value="recurring" className="text-[10px] md:text-xs">Recurring</TabsTrigger>
                    <TabsTrigger value="batch" className="text-[10px] md:text-xs">Batch</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="delayed" className="mt-4">
                    <div className="grid gap-2">
                      <Label>Delay (seconds)</Label>
                      <Input type="number" defaultValue="60" />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="scheduled" className="mt-4">
                    <div className="grid gap-2">
                      <Label>Run At (UTC)</Label>
                      <Input type="datetime-local" />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="recurring" className="mt-4">
                    <div className="grid gap-2">
                      <Label>Cron Expression</Label>
                      <Input defaultValue="*/15 * * * *" />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="batch" className="mt-4">
                    <div className="grid gap-2">
                      <Label>Batch Size</Label>
                      <Input type="number" defaultValue="100" />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="grid gap-2">
                <Label>Payload (JSON)</Label>
                <div className="border rounded-md bg-black/90 p-3 font-mono text-xs text-blue-300">
                  <textarea 
                    className="w-full h-32 bg-transparent outline-none resize-none"
                    defaultValue={`{\n  "email": "test@example.com",\n  "templateId": "welcome_v2"\n}`}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={() => setIsCreateOpen(false)}>Enqueue Job</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 items-center bg-card p-4 rounded-md border">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search job ID, payload content..." className="pl-9" />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" /> Filters
        </Button>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Queue</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Attempts</TableHead>
              <TableHead className="text-right">Runtime</TableHead>
              <TableHead className="text-right">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_JOBS.map((job) => (
              <TableRow 
                key={job.id} 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => {
                  // If they click the row, we should probably link to JobDetails page now!
                  window.location.href = `/jobs/${job.id}`;
                }}
              >
                <TableCell className="font-mono text-xs">{job.id}</TableCell>
                <TableCell className="font-medium">{job.type}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{job.queue}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusColors[job.status as keyof typeof statusColors]}>
                    {job.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{job.attempts}</TableCell>
                <TableCell className="text-right font-mono text-xs">{job.runtime}</TableCell>
                <TableCell className="text-right text-muted-foreground text-sm">
                  {formatDistanceToNow(job.createdAt, { addSuffix: true })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[800px] sm:max-w-[800px] overflow-y-auto">
          <SheetHeader className="mb-6">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className={statusColors[selectedJob.status as keyof typeof statusColors]}>
                {selectedJob.status.toUpperCase()}
              </Badge>
              <div className="flex gap-2">
                <Button size="sm" variant="outline"><RotateCcw className="h-4 w-4 mr-2" /> Retry</Button>
                <Button size="sm" variant="destructive"><XCircle className="h-4 w-4 mr-2" /> Cancel</Button>
              </div>
            </div>
            <SheetTitle className="text-2xl mt-4">{selectedJob.type}</SheetTitle>
            <SheetDescription className="font-mono text-xs">{selectedJob.id}</SheetDescription>
          </SheetHeader>

          <Tabs defaultValue="payload" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-12 bg-transparent p-0 mb-6">
              <TabsTrigger value="payload" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full"><FileJson className="h-4 w-4 mr-2" /> Payload</TabsTrigger>
              <TabsTrigger value="timeline" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full"><Clock className="h-4 w-4 mr-2" /> Timeline</TabsTrigger>
              <TabsTrigger value="logs" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full"><Activity className="h-4 w-4 mr-2" /> Logs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="payload" className="space-y-4">
              <div className="rounded-md bg-muted p-4">
                <pre className="text-xs font-mono text-muted-foreground overflow-x-auto">
{`{
  "orderId": "ord_8f72h9dj2",
  "customerId": "cus_92h18dh",
  "amount": 12500,
  "currency": "USD",
  "items": [
    {
      "id": "item_1",
      "qty": 2
    }
  ]
}`}
                </pre>
              </div>
            </TabsContent>
            
            <TabsContent value="timeline" className="space-y-4">
              <div className="relative border-l border-muted ml-3 space-y-6">
                <div className="pl-6 relative">
                  <div className="absolute w-3 h-3 bg-emerald-500 rounded-full -left-[6.5px] top-1"></div>
                  <p className="text-sm font-medium">Job Completed</p>
                  <p className="text-xs text-muted-foreground">Today at 10:45:22 AM</p>
                </div>
                <div className="pl-6 relative">
                  <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[6.5px] top-1"></div>
                  <p className="text-sm font-medium">Processing Started</p>
                  <p className="text-xs text-muted-foreground">Today at 10:45:10 AM • Worker: {selectedJob.worker}</p>
                </div>
                <div className="pl-6 relative">
                  <div className="absolute w-3 h-3 bg-muted border border-muted-foreground rounded-full -left-[6.5px] top-1"></div>
                  <p className="text-sm font-medium">Added to Queue</p>
                  <p className="text-xs text-muted-foreground">Today at 10:45:00 AM</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="logs">
              <div className="rounded-md bg-black p-4 font-mono text-xs text-gray-300 h-[300px] overflow-y-auto">
                <div className="text-blue-400">[10:45:10.123] INFO: Starting execution of job {selectedJob.id}</div>
                <div>[10:45:10.450] INFO: Fetching order details from database...</div>
                <div>[10:45:11.002] INFO: Validating payment method...</div>
                <div>[10:45:12.891] INFO: Processing charge via Stripe...</div>
                <div>[10:45:21.905] INFO: Charge successful (ch_1298412894)</div>
                <div className="text-emerald-400">[10:45:22.012] SUCCESS: Job completed successfully in 11.89s</div>
              </div>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </div>
  );
}
