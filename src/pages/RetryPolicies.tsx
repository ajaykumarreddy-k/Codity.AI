import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings2, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const policies = [
  { name: 'Fixed Delay', strategy: 'Fixed', attempts: 3, delay: '5m', description: 'Retries exactly every 5 minutes until max attempts are reached.' },
  { name: 'Linear Backoff', strategy: 'Linear', attempts: 5, delay: '1m * attempt', description: 'Increases delay linearly (1m, 2m, 3m, 4m, 5m).' },
  { name: 'Exponential Backoff', strategy: 'Exponential', attempts: 10, delay: '2^attempt * 1s', description: 'Doubles the delay each time. Great for rate limits.' },
  { name: 'Immediate Webhook', strategy: 'Fixed', attempts: 2, delay: '0s', description: 'Retries immediately once, then drops to DLQ.' },
  { name: 'Long Polling', strategy: 'Linear', attempts: 24, delay: '1h', description: 'Retries once an hour for a full day.' },
];

export default function RetryPolicies() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Retry Policies</h1>
          <p className="text-muted-foreground">Configure global backoff strategies for failed job executions.</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Create Policy
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Retry Policy</DialogTitle>
              <DialogDescription>
                Configure a new backoff strategy for failed jobs.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Policy Name</Label>
                <Input placeholder="e.g. Aggressive Retries" />
              </div>
              <div className="grid gap-2">
                <Label>Strategy</Label>
                <Select defaultValue="exponential">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Delay</SelectItem>
                    <SelectItem value="linear">Linear Backoff</SelectItem>
                    <SelectItem value="exponential">Exponential Backoff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Max Attempts</Label>
                <Input type="number" defaultValue="5" />
              </div>
              <div className="grid gap-2">
                <Label>Base Delay (e.g., 5s, 1m)</Label>
                <Input defaultValue="10s" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Create Policy</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configured Strategies</CardTitle>
          <CardDescription>Assign these policies to individual queues to handle failure scenarios automatically.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Policy Name</TableHead>
                <TableHead>Strategy</TableHead>
                <TableHead>Max Attempts</TableHead>
                <TableHead>Base Delay / Logic</TableHead>
                <TableHead className="w-[400px]">Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies.map((policy) => (
                <TableRow key={policy.name}>
                  <TableCell className="font-medium text-primary">{policy.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-muted text-foreground">
                      {policy.strategy}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{policy.attempts}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{policy.delay}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{policy.description}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                      <Settings2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
