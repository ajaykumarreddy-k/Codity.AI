import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Zap } from 'lucide-react';
import mermaid from 'mermaid';
import { useEffect, useState } from 'react';

const erDiagram = `
erDiagram
    Organizations ||--o{ Users : "has members"
    Organizations ||--o{ Projects : "owns"
    Users ||--o{ Projects : "creates"
    
    Projects ||--o{ Queues : "contains"
    Projects ||--o{ Scheduled_Jobs : "schedules"
    
    Queues ||--o{ Jobs : "queues"
    Queues ||--o{ Retry_Policies : "uses"
    Queues ||--o| DLQ : "forwards failed to"
    
    Workers ||--o{ Worker_Heartbeats : "sends"
    Workers ||--o{ Job_Executions : "processes"
    
    Jobs ||--o{ Job_Executions : "results in"
    Job_Executions ||--o{ Job_Logs : "generates"

    Organizations {
        uuid id PK
        varchar name
        timestamp created_at
    }
    
    Users {
        uuid id PK
        uuid org_id FK
        varchar email
        varchar password_hash
        timestamp created_at
    }

    Projects {
        uuid id PK
        uuid org_id FK
        uuid user_id FK
        varchar name
    }

    Queues {
        uuid id PK
        uuid project_id FK
        varchar name
        int concurrency_limit
        uuid retry_policy_id FK
    }

    Retry_Policies {
        uuid id PK
        varchar name
        varchar strategy
        int max_attempts
        varchar base_delay
    }

    Jobs {
        uuid id PK
        uuid queue_id FK
        jsonb payload
        enum status
        int attempts
        timestamp created_at
        timestamp next_retry_at
    }

    Scheduled_Jobs {
        uuid id PK
        uuid project_id FK
        varchar cron_expression
        jsonb payload_template
        boolean is_active
    }

    DLQ {
        uuid id PK
        uuid original_queue_id FK
        uuid job_id FK
        text error_reason
        timestamp dead_lettered_at
    }

    Workers {
        uuid id PK
        varchar hostname
        enum status
        timestamp created_at
    }

    Worker_Heartbeats {
        uuid id PK
        uuid worker_id FK
        int cpu_usage
        int mem_usage
        timestamp recorded_at
    }

    Job_Executions {
        uuid id PK
        uuid job_id FK
        uuid worker_id FK
        enum status
        timestamp started_at
        timestamp finished_at
    }

    Job_Logs {
        uuid id PK
        uuid execution_id FK
        text message
        enum level
        timestamp logged_at
    }
`;

export default function Documentation() {
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
    });
    
    mermaid.render('er-diagram-svg', erDiagram)
      .then((result) => {
        setSvgContent(result.svg);
      })
      .catch((e) => {
        console.error('Mermaid render error:', e);
        setError('Failed to render diagram. Check console.');
      });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Architecture & ER Diagram</h1>
        <p className="text-muted-foreground">Entity-Relationship model and core concurrency patterns for Codity.ai.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Database className="h-5 w-5" /> PostgreSQL Schema</CardTitle>
          </CardHeader>
          <CardContent className="overflow-auto p-6 bg-card rounded-md max-h-[800px]">
            <div className="flex justify-center w-full min-h-[600px]">
              {error ? (
                <div className="text-red-500 font-mono text-sm">{error}</div>
              ) : svgContent ? (
                <div 
                  dangerouslySetInnerHTML={{ __html: svgContent }} 
                  className="w-full flex justify-center [&>svg]:w-full [&>svg]:min-w-[1000px] [&>svg]:h-auto [&>svg]:max-w-none" 
                />
              ) : (
                <div className="text-muted-foreground animate-pulse">Rendering diagram...</div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-primary"><Zap className="h-5 w-5" /> Atomic Job Claiming</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p>
                To prevent race conditions where multiple workers attempt to process the same job simultaneously, the system uses PostgreSQL's native row-level locking.
              </p>
              <div className="bg-muted text-foreground p-3 rounded-md font-mono text-xs overflow-x-auto">
                <pre>{`BEGIN;

UPDATE jobs
SET status = 'processing',
    worker_id = $1,
    updated_at = NOW()
WHERE id = (
    SELECT id
    FROM jobs
    WHERE status = 'queued'
      AND queue_id = $2
      AND (next_retry_at IS NULL OR next_retry_at <= NOW())
    ORDER BY priority DESC, created_at ASC
    FOR UPDATE SKIP LOCKED
    LIMIT 1
)
RETURNING *;

COMMIT;`}</pre>
              </div>
              <p className="text-muted-foreground text-xs">
                The <code className="font-mono text-primary bg-primary/10 px-1 py-0.5 rounded">FOR UPDATE SKIP LOCKED</code> clause ensures that if a row is currently locked by another worker transaction, the query instantly skips it and grabs the next available row. This guarantees strict exactly-once execution semantics without blocking database connections.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="mt-12 space-y-8">
        <div>
          <h2 className="text-xl font-bold tracking-tight mb-4">Frequently Asked Questions</h2>
          <div className="space-y-6 text-sm text-muted-foreground">
            
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground text-base">How does the distributed scheduler work?</h3>
              <p>
                The system relies on <a href="https://www.postgresql.org/docs/current/sql-select.html#SQL-FOR-UPDATE-SHARE" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">PostgreSQL row-level locking</a> 
                to ensure that jobs are only claimed once. When workers poll the queue, they use <code>FOR UPDATE SKIP LOCKED</code>, which is an industry-standard mechanism for high-concurrency 
                task processing without external lock managers like Redis.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-foreground text-base">Where can I view the job execution status?</h3>
              <p>
                You can monitor overall system health on the <a href="/dashboard" className="text-primary hover:underline">Dashboard</a>, 
                or view individual task results by navigating to the <a href="/jobs" className="text-primary hover:underline">Jobs Explorer</a>. 
                If a job fails permanently, it will be moved to the <a href="/dlq" className="text-primary hover:underline">Dead Letter Queue (DLQ)</a>.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-foreground text-base">Is the API documentation available?</h3>
              <p>
                Yes! The backend is powered by <a href="https://fastapi.tiangolo.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">FastAPI</a>, 
                which automatically generates interactive OpenAPI documentation. When running locally, you can access the Swagger UI directly on the API port.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
