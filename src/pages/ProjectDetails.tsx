import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, LayoutGrid, ListTree, Server, Activity } from 'lucide-react';

export default function ProjectDetails() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/projects"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notification Service</h1>
          <p className="text-muted-foreground font-mono text-sm">ID: {id || 'prj-3'}</p>
        </div>
        <div className="ml-auto">
          <Button variant="outline">Project Settings</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium flex items-center gap-2">
              <ListTree className="h-4 w-4" /> Total Queues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" /> Jobs Processed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">450K</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium flex items-center gap-2">
              <Server className="h-4 w-4" /> Active Workers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-bold mt-8 mb-4">Project Queues</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Reuse queue card styling concepts from Projects */}
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="text-lg"><Link to="/queues/webhook-delivery" className="hover:underline">webhook-delivery</Link></CardTitle>
            <CardDescription>Critical priority</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Waiting</span>
                <span className="font-medium">0</span>
             </div>
             <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-muted-foreground">Throughput</span>
                <span className="font-medium">320/s</span>
             </div>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="text-lg"><Link to="/queues/email-campaigns" className="hover:underline">email-campaigns</Link></CardTitle>
            <CardDescription>Medium priority</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Waiting</span>
                <span className="font-medium text-amber-500">45,000</span>
             </div>
             <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-muted-foreground">Throughput</span>
                <span className="font-medium">180/s</span>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
