import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, MoreVertical, LayoutGrid, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const initialProjects = [
  { id: 'prj-1', name: 'E-commerce Core', desc: 'Order processing and inventory sync jobs', queues: 8, jobs: '1.2M', workers: 45, activity: '2 mins ago' },
  { id: 'prj-2', name: 'Data Pipeline', desc: 'ETL and analytical data processing', queues: 12, jobs: '8.4M', workers: 120, activity: 'Just now' },
  { id: 'prj-3', name: 'Notification Service', desc: 'Email, SMS, and push notifications', queues: 3, jobs: '450K', workers: 12, activity: '15 mins ago' },
];

export default function Projects() {
  const [projects, setProjects] = useState(initialProjects);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleCreate = () => {
    if (!newName.trim()) return;
    const id = `prj-${projects.length + 1}`;
    setProjects([...projects, {
      id,
      name: newName.trim(),
      desc: newDesc.trim() || 'No description provided.',
      queues: 0,
      jobs: '0',
      workers: 0,
      activity: 'Just now',
    }]);
    setNewName('');
    setNewDesc('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Manage your organization's workspaces and job groupings.</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <Card key={project.id} className="hover:border-primary/50 transition-colors cursor-pointer group">
            <CardHeader className="pb-4 border-b">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-primary/10 text-primary rounded-md">
                  <LayoutGrid className="h-5 w-5" />
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="mt-4">{project.name}</CardTitle>
              <CardDescription className="line-clamp-1">{project.desc}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Queues</p>
                  <p className="font-medium">{project.queues}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Total Jobs</p>
                  <p className="font-medium">{project.jobs}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Workers</p>
                  <p className="font-medium">{project.workers}</p>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs text-muted-foreground border-t pt-4">
                <span>ID: {project.id}</span>
                <span>Active {project.activity}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* New Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Create New Project</h2>
                <p className="text-sm text-muted-foreground">Add a new workspace for your job queues.</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)} className="rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="proj-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Project Name</Label>
                <Input
                  id="proj-name"
                  placeholder="e.g. Payment Processing"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                  className="h-11"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proj-desc" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description <span className="normal-case font-normal">(optional)</span></Label>
                <Input
                  id="proj-desc"
                  placeholder="Brief description of this project..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="h-11"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button
                className="flex-1 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-[0_4px_14px_rgba(0,82,255,0.25)]"
                onClick={handleCreate}
                disabled={!newName.trim()}
              >
                <Plus className="mr-2 h-4 w-4" /> Create Project
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
