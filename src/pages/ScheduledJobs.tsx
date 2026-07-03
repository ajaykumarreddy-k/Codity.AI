import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, MoreHorizontal, Clock, Plus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';

const schedules = [
  { id: 'sch-1', name: 'Daily Analytics Aggregation', cron: '0 0 * * *', next: 'in 5 hours', last: '19 hours ago', status: 'active', project: 'Data Pipeline' },
  { id: 'sch-2', name: 'Weekly Newsletter Send', cron: '0 9 * * 1', next: 'in 2 days', last: '5 days ago', status: 'active', project: 'Notification Service' },
  { id: 'sch-3', name: 'Database Backup', cron: '0 */6 * * *', next: 'in 2 hours', last: '4 hours ago', status: 'active', project: 'E-commerce Core' },
  { id: 'sch-4', name: 'Stale Session Cleanup', cron: '*/15 * * * *', next: 'in 4 mins', last: '11 mins ago', status: 'paused', project: 'E-commerce Core' },
];

export default function ScheduledJobs() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Scheduled Jobs</h1>
          <p className="text-muted-foreground">Manage recurring tasks using standard Cron expressions.</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Create Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Schedule</DialogTitle>
              <DialogDescription>
                Set up a new recurring job using cron syntax.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <p className="text-sm text-muted-foreground">This feature requires backend cron integration which is currently in development.</p>
              </div>
            </div>
            <DialogFooter>
              <Button>Acknowledge</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Schedule Name</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Cron Expression</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Next Run</TableHead>
              <TableHead>Last Run</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedules.map((schedule) => (
              <TableRow key={schedule.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {schedule.name}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{schedule.project}</TableCell>
                <TableCell>
                  <code className="bg-muted px-2 py-1 rounded text-xs font-mono text-primary">{schedule.cron}</code>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={schedule.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}>
                    {schedule.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{schedule.next}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{schedule.last}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="relative h-8 w-8 rounded-md inline-flex shrink-0 items-center justify-center hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 outline-none border-0 bg-transparent text-muted-foreground hover:text-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        {schedule.status === 'active' ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                        {schedule.status === 'active' ? 'Pause Schedule' : 'Resume Schedule'}
                      </DropdownMenuItem>
                      <DropdownMenuItem>Edit Configuration</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete Schedule</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
