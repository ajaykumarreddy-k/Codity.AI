import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Network, ArrowRight, Database, Server, Cog } from 'lucide-react';

export default function Architecture() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Architecture</h1>
        <p className="text-muted-foreground">High-level view of the Codity.ai distributed job scheduling platform.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Data Flow & Infrastructure</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-12 space-y-8">
            
            <div className="flex items-center gap-4">
              <div className="w-48 h-24 bg-card border rounded-lg flex flex-col items-center justify-center gap-2 shadow-sm">
                <Network className="h-6 w-6 text-primary" />
                <span className="font-semibold">React Dashboard</span>
                <span className="text-xs text-muted-foreground">Frontend (Codity.ai)</span>
              </div>
            </div>

            <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90" />

            <div className="flex items-center gap-4">
              <div className="w-48 h-24 bg-card border rounded-lg flex flex-col items-center justify-center gap-2 shadow-sm">
                <Server className="h-6 w-6 text-blue-500" />
                <span className="font-semibold">FastAPI Server</span>
                <span className="text-xs text-muted-foreground">API Gateway</span>
              </div>
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
              <div className="w-48 h-24 bg-card border rounded-lg flex flex-col items-center justify-center gap-2 shadow-sm">
                <Cog className="h-6 w-6 text-emerald-500" />
                <span className="font-semibold">Scheduler</span>
                <span className="text-xs text-muted-foreground">Cron & Retries</span>
              </div>
            </div>

            <div className="flex gap-16">
              <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90" />
              <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90" />
            </div>

            <div className="flex items-center gap-8">
              <div className="w-48 h-24 bg-card border rounded-lg flex flex-col items-center justify-center gap-2 shadow-sm">
                <Database className="h-6 w-6 text-rose-500" />
                <span className="font-semibold">Redis</span>
                <span className="text-xs text-muted-foreground">Queues & State (KV)</span>
              </div>
              <div className="w-48 h-24 bg-card border rounded-lg flex flex-col items-center justify-center gap-2 shadow-sm">
                <Database className="h-6 w-6 text-indigo-500" />
                <span className="font-semibold">PostgreSQL</span>
                <span className="text-xs text-muted-foreground">Persistent Storage</span>
              </div>
            </div>

            <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90" />

            <div className="flex items-center gap-4 p-6 border border-dashed rounded-xl bg-card/50">
              <div className="absolute -mt-16 text-sm font-medium text-muted-foreground">Distributed Worker Cluster</div>
              <div className="w-32 h-24 bg-card border rounded-lg flex flex-col items-center justify-center gap-2 shadow-sm">
                <Server className="h-5 w-5 text-muted-foreground" />
                <span className="font-semibold text-sm">Worker Node</span>
              </div>
              <div className="w-32 h-24 bg-card border rounded-lg flex flex-col items-center justify-center gap-2 shadow-sm">
                <Server className="h-5 w-5 text-muted-foreground" />
                <span className="font-semibold text-sm">Worker Node</span>
              </div>
              <div className="w-32 h-24 bg-card border rounded-lg flex flex-col items-center justify-center gap-2 shadow-sm">
                <Server className="h-5 w-5 text-muted-foreground" />
                <span className="font-semibold text-sm">Worker Node</span>
              </div>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
