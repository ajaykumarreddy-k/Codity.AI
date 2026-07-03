import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const retryPolicies = [
  { id: 'pol-1', name: 'Exponential Backoff', strategy: 'Exponential', attempts: 5, delay: 'Base: 1s, Max: 60s' },
  { id: 'pol-2', name: 'Linear Backoff', strategy: 'Linear', attempts: 3, delay: 'Step: 5s' },
  { id: 'pol-3', name: 'Fixed Delay (1m)', strategy: 'Fixed', attempts: 10, delay: 'Delay: 60s' },
  { id: 'pol-4', name: 'No Retries', strategy: 'None', attempts: 0, delay: '-' },
];

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Platform Settings</h1>
        <p className="text-muted-foreground">Manage global configurations, authentication, and defaults.</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="workers">Worker Configuration</TabsTrigger>
          <TabsTrigger value="retry">Retry Policies</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
              <CardDescription>Global preferences for your Codity.ai environment.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="org-name">Organization Name</Label>
                <Input id="org-name" defaultValue="Acme Corp Engineering" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="data-retention">Default Data Retention</Label>
                <Select defaultValue="30">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 Days</SelectItem>
                    <SelectItem value="30">30 Days</SelectItem>
                    <SelectItem value="90">90 Days</SelectItem>
                    <SelectItem value="365">1 Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="workers">
          <Card>
            <CardHeader>
              <CardTitle>Worker Defaults</CardTitle>
              <CardDescription>Configure how workers connect and operate by default.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="heartbeat">Heartbeat Interval (ms)</Label>
                <Input id="heartbeat" type="number" defaultValue="30000" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="concurrency">Default Concurrency per Worker</Label>
                <Input id="concurrency" type="number" defaultValue="10" />
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button>Save Configuration</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="retry">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Retry Policies</h3>
                <p className="text-sm text-muted-foreground">Define reusable retry logic for queues and jobs.</p>
              </div>
              <Button><Plus className="h-4 w-4 mr-2" /> Create Policy</Button>
            </div>
            
            <div className="border rounded-md bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Policy Name</TableHead>
                    <TableHead>Strategy</TableHead>
                    <TableHead>Max Attempts</TableHead>
                    <TableHead>Delay Configuration</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {retryPolicies.map((policy) => (
                    <TableRow key={policy.id}>
                      <TableCell className="font-medium">{policy.name}</TableCell>
                      <TableCell>{policy.strategy}</TableCell>
                      <TableCell>{policy.attempts}</TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">{policy.delay}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
