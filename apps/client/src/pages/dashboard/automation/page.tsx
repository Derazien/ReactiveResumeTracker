import { useState, useEffect } from "react";
import { Button } from "@reactive-resume/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@reactive-resume/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@reactive-resume/ui";
import { Badge } from "@reactive-resume/ui";
import { Separator } from "@reactive-resume/ui";
import { useToast } from "@/client/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@reactive-resume/ui";
import { Input } from "@reactive-resume/ui";
import { Label } from "@reactive-resume/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@reactive-resume/ui";
import { useLingui } from "@lingui/react";
import { t } from "@lingui/macro";
import { Plus, Play, Trash, Gear, Robot, Lightning, MagicWand, Sparkle, Monitor } from "@phosphor-icons/react";
import { ChromeRemoteControl } from "@/client/components/chrome-remote-control";

// Workflow Template Types
type WorkflowTemplate = {
  workflowId: string;
  title: string;
  description?: string;
  workflowName?: string;
  platform: 'LinkedIn' | 'Indeed' | 'Custom';
  createdAt?: string;
  lastRun?: string;
};

type WorkflowRun = {
  runId: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'pending';
  startedAt: string;
  completedAt?: string;
  parameters: Record<string, any>;
  result?: any;
};

export const AutomationPage = () => {
  const { toast } = useToast();
  const [workflows, setWorkflows] = useState<WorkflowTemplate[]>([]);
  const [activeRuns, setActiveRuns] = useState<WorkflowRun[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<'LinkedIn' | 'Indeed' | 'Custom'>('LinkedIn');
  const [isCreating, setIsCreating] = useState(false);
  const [isRunning, setIsRunning] = useState<string | null>(null);

  // Workflow creation form
  const [createForm, setCreateForm] = useState({
    templateName: '',
    description: '',
    platform: 'LinkedIn' as const,
    linkedinUsername: '',
    linkedinPassword: '',
    defaultKeywords: '',
    defaultLocation: '',
  });

  // Workflow run form  
  const [runForm, setRunForm] = useState({
    jobKeywords: '',
    location: '',
    maxJobs: 5,
    datePosted: 'any',
    remoteType: ['any'],
    experienceLevel: ['any'], 
    jobType: ['full-time'],
    easyApplyOnly: false,
  });

  useEffect(() => {
    loadWorkflows();
    loadActiveRuns();
    const interval = setInterval(loadActiveRuns, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  const loadWorkflows = async () => {
    try {
      const response = await fetch('/api/automation/list-workflow-templates');
      const data = await response.json();
      setWorkflows(data.workflows || []);
    } catch (error) {
      console.error('Failed to load workflows:', error);
    }
  };

  const loadActiveRuns = async () => {
    try {
      const response = await fetch('/api/automation/active-runs');
      if (response.ok) {
        const data = await response.json();
        setActiveRuns(data.runs || []);
      }
    } catch (error) {
      console.error('Failed to load active runs:', error);
    }
  };

  const createWorkflow = async () => {
    if (!createForm.templateName.trim()) {
      toast({
        title: t`Error`,
        description: t`Template name is required`,
        variant: "error",
      });
      return;
    }

    setIsCreating(true);
    try {
      const endpoint = createForm.platform === 'LinkedIn' 
        ? '/api/automation/create-linkedin-workflow-template'
        : '/api/automation/create-generic-workflow-template';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: t`Workflow Created`,
          description: `Template "${result.workflowName}" created successfully`,
        });
        setCreateForm({
          templateName: '',
          description: '',
          platform: 'LinkedIn',
          linkedinUsername: '',
          linkedinPassword: '',
          defaultKeywords: '',
          defaultLocation: '',
        });
        await loadWorkflows();
      } else {
        throw new Error(result.message || 'Failed to create workflow');
      }
    } catch (error) {
      toast({
        title: t`Creation Failed`,
        description: (error as Error)?.message || 'Failed to create workflow template',
        variant: "error",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const runWorkflow = async (workflowId: string) => {
    if (!runForm.jobKeywords.trim() || !runForm.location.trim()) {
      toast({
        title: t`Error`,
        description: t`Job keywords and location are required`,
        variant: "error",
      });
      return;
    }

    setIsRunning(workflowId);
    try {
      const response = await fetch('/api/automation/run-workflow-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowId,
          parameters: {
            job_keywords: runForm.jobKeywords,
            location: runForm.location,
            max_jobs: runForm.maxJobs,
          }
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: t`Workflow Started`,
          description: t`Job search automation is now running`,
          action: (
            <Button
              size="sm"
              onClick={() => window.open(result.monitorUrl, "_blank")}
            >
              {t`Monitor`}
            </Button>
          ),
        });
        await loadActiveRuns();
      } else {
        throw new Error(result.message || 'Failed to run workflow');
      }
    } catch (error) {
      toast({
        title: t`Run Failed`,
        description: (error as Error)?.message || 'Failed to start workflow',
        variant: "error",
      });
    } finally {
      setIsRunning(null);
    }
  };

  const deleteWorkflow = async (workflowId: string, workflowName: string) => {
    try {
      const response = await fetch(`/api/automation/delete-workflow-template/${workflowId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: t`Workflow Deleted`,
          description: `Template "${workflowName}" has been deleted`,
        });
        await loadWorkflows();
      } else {
        throw new Error(result.message || 'Failed to delete workflow');
      }
    } catch (error) {
      toast({
        title: t`Deletion Failed`,
        description: (error as Error)?.message || 'Failed to delete workflow template',
        variant: "error",
      });
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'LinkedIn': return <Lightning className="h-4 w-4 text-blue-600" />;
      case 'Indeed': return <MagicWand className="h-4 w-4 text-purple-600" />;
      case 'Custom': return <Sparkle className="h-4 w-4 text-green-600" />;
      default: return <Robot className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      running: 'info',
      completed: 'success', 
      failed: 'error',
      pending: 'secondary',
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>{status}</Badge>;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t`Job Automation`}</h1>
          <p className="text-muted-foreground">
            {t`Create and manage automated job search workflows`}
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {t`New Workflow`}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t`Create Workflow Template`}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="templateName">{t`Template Name`}</Label>
                  <Input
                    id="templateName"
                    value={createForm.templateName}
                    onChange={(e) => setCreateForm(prev => ({...prev, templateName: e.target.value}))}
                    placeholder={t`My LinkedIn Job Search`}
                  />
                </div>
                <div>
                  <Label htmlFor="platform">{t`Platform`}</Label>
                  <Select 
                    value={createForm.platform}
                    onValueChange={(value: any) => setCreateForm(prev => ({...prev, platform: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LinkedIn">{t`LinkedIn`}</SelectItem>
                      <SelectItem value="Indeed">Indeed</SelectItem>
                      <SelectItem value="Custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

                <div>
                  <Label htmlFor="description">{t`Description`}</Label>
                  <Input
                    id="description"
                    value={createForm.description}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateForm(prev => ({...prev, description: e.target.value}))}
                    placeholder={t`Automated job search for software developer positions...`}
                  />
                </div>

              {createForm.platform === 'LinkedIn' && (
                <div className="space-y-4 border rounded-lg p-4 bg-blue-50 dark:bg-blue-950/20">
                  <h4 className="font-medium text-blue-700 dark:text-blue-300">{t`LinkedIn Credentials`}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="linkedinUsername">{t`Username/Email`}</Label>
                      <Input
                        id="linkedinUsername"
                        type="email"
                        value={createForm.linkedinUsername}
                        onChange={(e) => setCreateForm(prev => ({...prev, linkedinUsername: e.target.value}))}
                        placeholder={t`your.email@domain.com`}
                      />
                    </div>
                    <div>
                      <Label htmlFor="linkedinPassword">{t`Password`}</Label>
                      <Input
                        id="linkedinPassword"
                        type="password"
                        value={createForm.linkedinPassword}
                        onChange={(e) => setCreateForm(prev => ({...prev, linkedinPassword: e.target.value}))}
                        placeholder={t`Your LinkedIn password`}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="defaultKeywords">{t`Default Keywords`}</Label>
                      <Input
                        id="defaultKeywords"
                        value={createForm.defaultKeywords}
                        onChange={(e) => setCreateForm(prev => ({...prev, defaultKeywords: e.target.value}))}
                        placeholder={t`Software Developer`}
                      />
                    </div>
                    <div>
                      <Label htmlFor="defaultLocation">{t`Default Location`}</Label>
                      <Input
                        id="defaultLocation"
                        value={createForm.defaultLocation}
                        onChange={(e) => setCreateForm(prev => ({...prev, defaultLocation: e.target.value}))}
                        placeholder={t`San Francisco, CA`}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline">{t`Cancel`}</Button>
                <Button onClick={createWorkflow} disabled={isCreating}>
                  {isCreating ? t`Creating...` : t`Create Workflow`}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="templates">{t`Templates`}</TabsTrigger>
          <TabsTrigger value="runs">{t`Active Runs`}</TabsTrigger>
          <TabsTrigger value="history">{t`History`}</TabsTrigger>
          <TabsTrigger value="browser">{t`Live Browser`}</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workflows.map((workflow) => (
              <Card key={workflow.workflowId}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(workflow.platform)}
                      <CardTitle className="text-sm">{workflow.title}</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteWorkflow(workflow.workflowId, workflow.title)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription className="text-xs">
                    {workflow.description || `${workflow.platform} automation workflow`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">{t`Keywords`}</Label>
                      <Input
                        value={runForm.jobKeywords}
                        onChange={(e) => setRunForm(prev => ({...prev, jobKeywords: e.target.value}))}
                        placeholder={t`Software Developer`}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">{t`Location`}</Label>
                      <Input
                        value={runForm.location}
                        onChange={(e) => setRunForm(prev => ({...prev, location: e.target.value}))}
                        placeholder={t`Berlin`}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs">{t`Max Jobs`}</Label>
                      <Input
                        type="number"
                        value={runForm.maxJobs.toString()}
                        onChange={(e) => setRunForm(prev => ({...prev, maxJobs: parseInt(e.target.value) || 5}))}
                        min={1}
                        max={20}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">{t`Date Posted`}</Label>
                      <Select 
                        value={runForm.datePosted}
                        onValueChange={(value) => setRunForm(prev => ({...prev, datePosted: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any time</SelectItem>
                          <SelectItem value="24h">Past 24 hours</SelectItem>
                          <SelectItem value="week">Past week</SelectItem>
                          <SelectItem value="month">Past month</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">{t`Remote Type`}</Label>
                      <Select 
                        value={runForm.remoteType[0]}
                        onValueChange={(value) => setRunForm(prev => ({...prev, remoteType: [value]}))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any</SelectItem>
                          <SelectItem value="remote">Remote</SelectItem>
                          <SelectItem value="on-site">On-site</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">{t`Experience Level`}</Label>
                      <Select 
                        value={runForm.experienceLevel[0]}
                        onValueChange={(value) => setRunForm(prev => ({...prev, experienceLevel: [value]}))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any</SelectItem>
                          <SelectItem value="internship">Internship</SelectItem>
                          <SelectItem value="entry">Entry level</SelectItem>
                          <SelectItem value="associate">Associate</SelectItem>
                          <SelectItem value="mid-senior">Mid-Senior level</SelectItem>
                          <SelectItem value="director">Director</SelectItem>
                          <SelectItem value="executive">Executive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">{t`Job Type`}</Label>
                      <Select 
                        value={runForm.jobType[0]}
                        onValueChange={(value) => setRunForm(prev => ({...prev, jobType: [value]}))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-time">Full-time</SelectItem>
                          <SelectItem value="part-time">Part-time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="temporary">Temporary</SelectItem>
                          <SelectItem value="internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="easyApplyOnly"
                      checked={runForm.easyApplyOnly}
                      onChange={(e) => setRunForm(prev => ({...prev, easyApplyOnly: e.target.checked}))}
                    />
                    <Label htmlFor="easyApplyOnly" className="text-xs">{t`Easy Apply jobs only`}</Label>
                  </div>
                  <Button
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => runWorkflow(workflow.workflowId)}
                    disabled={isRunning === workflow.workflowId}
                  >
                    <Play className="h-3 w-3" />
                    {isRunning === workflow.workflowId ? t`Starting...` : t`Run Workflow`}
                  </Button>
                </CardContent>
              </Card>
            ))}

            {workflows.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="text-center py-8">
                  <Robot className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t`No Workflow Templates`}</h3>
                  <p className="text-muted-foreground mb-4">
                    {t`Create your first automation workflow to get started`}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="runs" className="space-y-4">
          <div className="space-y-4">
            {activeRuns.map((run) => (
              <Card key={run.runId}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">Run {run.runId.slice(0, 8)}</h4>
                      {getStatusBadge(run.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {run.parameters.job_keywords} in {run.parameters.location}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Started: {new Date(run.startedAt).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`http://localhost:8081/workflows/${run.runId}`, '_blank')}
                  >
                    <Monitor className="h-4 w-4 mr-1" />
                    {t`Monitor`}
                  </Button>
                </CardContent>
              </Card>
            ))}

              {activeRuns.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8">
                    <Gear className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{t`No Active Runs`}</h3>
                    <p className="text-muted-foreground">
                      {t`No workflows are currently running`}
                    </p>
                  </CardContent>
                </Card>
              )}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className="text-center py-8">
              <h3 className="text-lg font-semibold mb-2">{t`Workflow History`}</h3>
              <p className="text-muted-foreground mb-4">
                {t`View completed workflow runs and their results`}
              </p>
              <p className="text-sm text-muted-foreground">
                {t`History feature coming soon...`}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="browser">
          <ChromeRemoteControl />
        </TabsContent>
      </Tabs>
    </div>
  );
};