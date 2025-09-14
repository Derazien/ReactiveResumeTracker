import { t } from "@lingui/macro";
import { Robot, CircleNotch, Clock, CheckCircle, XCircle, Monitor } from "@phosphor-icons/react";
import { 
  Button, 
  Badge, 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ScrollArea
} from "@reactive-resume/ui";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";

import { useToast } from "@/client/hooks/use-toast";

interface AutomationStatus {
  skyvern: {
    status: 'running' | 'down';
    url: string;
    uiUrl: string;
  };
  message: string;
}

interface AutomationTask {
  taskId: string;
  instruction: string;
  status: 'running' | 'completed' | 'failed';
  createdAt: string;
  monitorUrl: string;
}

export const AutomationPage = () => {
  const { toast } = useToast();
  const [automationStatus, setAutomationStatus] = useState<AutomationStatus | null>(null);
  const [activeTasks, setActiveTasks] = useState<AutomationTask[]>([]);
  const [isTestingAutomation, setIsTestingAutomation] = useState(false);

  useEffect(() => {
    checkAutomationStatus();
    loadActiveTasks();
    
    // Refresh status every 30 seconds
    const interval = setInterval(() => {
      checkAutomationStatus();
      loadActiveTasks();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const checkAutomationStatus = async () => {
    try {
      const response = await fetch('/api/automation/status');
      const status = await response.json();
      setAutomationStatus(status);
    } catch (error) {
      console.error('Failed to check automation status:', error);
    }
  };

  const loadActiveTasks = async () => {
    // In a real implementation, you'd fetch active tasks from your backend
    // For now, we'll show placeholder data
    setActiveTasks([]);
  };

  const testAutomation = async () => {
    setIsTestingAutomation(true);
    
    try {
      const response = await fetch('/api/automation/test-automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}'
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: t`Test Successful`,
          description: t`Automation test completed successfully. Task ID: ${result.taskId}`,
          variant: "success",
        });
        
        // Add test task to active tasks
        const newTask: AutomationTask = {
          taskId: result.taskId,
          instruction: "Test automation on demo job board",
          status: 'running',
          createdAt: new Date().toISOString(),
          monitorUrl: result.monitorUrl
        };
        
        setActiveTasks(prev => [newTask, ...prev]);
      } else {
        throw new Error(result.message || 'Test failed');
      }
    } catch (error) {
      toast({
        title: t`Test Failed`,
        description: (error as Error)?.message || 'Automation test failed',
        variant: "error",
      });
    } finally {
      setIsTestingAutomation(false);
    }
  };

  const isAutomationAvailable = automationStatus?.skyvern?.status === 'running';

  return (
    <>
      <Helmet>
        <title>
          {t`Job Automation`} - {t`Reactive Resume`}
        </title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
            <Robot className="h-8 w-8 text-primary" />
            {t`Job Automation`}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t`Monitor and manage your automated job search activities. Use AI to find and apply to jobs across any job board.`}
          </p>
        </motion.div>

        {/* Automation Status Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}>
          <Card className="border-2 border-dashed border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Robot className="h-5 w-5 text-primary" />
                  {t`Automation Engine Status`}
                </div>
                <Badge variant={isAutomationAvailable ? "success" : "secondary"}>
                  {isAutomationAvailable ? t`Online` : t`Offline`}
                </Badge>
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {automationStatus?.message || t`Checking automation status...`}
                </p>

                {isAutomationAvailable ? (
                  <div className="flex gap-3">
                    <Button
                      onClick={() => window.open('http://localhost:8081', '_blank')}
                      variant="outline"
                      className="gap-2"
                    >
                      <Monitor className="h-4 w-4" />
                      {t`Open Skyvern UI`}
                    </Button>
                    
                    <Button
                      onClick={testAutomation}
                      disabled={isTestingAutomation}
                      className="gap-2"
                    >
                      {isTestingAutomation ? (
                        <CircleNotch className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      {isTestingAutomation ? t`Testing...` : t`Test Automation`}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      {t`Automation engine is not running. Start it with the complete system script.`}
                    </p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>{t`To enable automation:`}</p>
                      <code className="bg-muted px-2 py-1 rounded text-xs">
                        ./start-complete-system.ps1
                      </code>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Automation Tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}>
          <Tabs defaultValue="active" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active" className="gap-2">
              <CircleNotch className="h-4 w-4" />
              {t`Active Tasks`}
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <Clock className="h-4 w-4" />
                {t`Task History`}
              </TabsTrigger>
              <TabsTrigger value="controls" className="gap-2">
                <Robot className="h-4 w-4" />
                {t`Quick Controls`}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              <ScrollArea className="h-[400px]">
                {activeTasks.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Robot className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">{t`No Active Tasks`}</h3>
                      <p className="text-muted-foreground text-center max-w-md">
                        {t`Start job automation from the Job Applications page or use the Quick Controls tab to begin automating your job search.`}
                      </p>
                      <Button 
                        className="mt-4"
                        onClick={() => window.location.href = '/dashboard/job-applications'}
                      >
                        {t`Go to Job Applications`}
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {activeTasks.map((task) => (
                      <Card key={task.taskId}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${
                                task.status === 'running' ? 'bg-blue-500 animate-pulse' :
                                task.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                              }`} />
                              <div>
                                <p className="font-medium">{task.instruction}</p>
                                <p className="text-xs text-muted-foreground">
                                  Task ID: {task.taskId} • {new Date(task.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(task.monitorUrl, '_blank')}
                            >
                              {t`Monitor`}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t`Task History`}</h3>
                  <p className="text-muted-foreground text-center">
                    {t`Task history will be available in a future update. For now, use the Skyvern UI to view past tasks.`}
                  </p>
                  <Button 
                    className="mt-4"
                    onClick={() => window.open('http://localhost:8081', '_blank')}
                    disabled={!isAutomationAvailable}
                  >
                    {t`Open Skyvern UI`}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="controls">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Quick LinkedIn Search */}
                <Card className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => window.location.href = '/dashboard/job-applications'}>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Robot className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-2">{t`LinkedIn Jobs`}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t`Search and apply to LinkedIn job postings automatically`}
                    </p>
                  </CardContent>
                </Card>

                {/* Quick Indeed Search */}
                <Card className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => window.location.href = '/dashboard/job-applications'}>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Robot className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold mb-2">{t`Indeed Jobs`}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t`Automate job searches on Indeed with natural language`}
                    </p>
                  </CardContent>
                </Card>

                {/* Custom Automation */}
                <Card className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => window.location.href = '/dashboard/job-applications'}>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Robot className="h-6 w-6 text-emerald-600" />
                    </div>
                    <h3 className="font-semibold mb-2">{t`Any Job Board`}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t`Automate any job board or company career page`}
                    </p>
                  </CardContent>
                </Card>

                {/* Skyvern UI */}
                <Card className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => window.open('http://localhost:8080', '_blank')}>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Monitor className="h-6 w-6 text-slate-600" />
                    </div>
                    <h3 className="font-semibold mb-2">{t`Skyvern Monitor`}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t`Advanced task monitoring and browser automation viewer`}
                    </p>
                  </CardContent>
                </Card>

                {/* Task History */}
                <Card className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => window.open('http://localhost:8080', '_blank')}>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="h-6 w-6 text-amber-600" />
                    </div>
                    <h3 className="font-semibold mb-2">{t`Task History`}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t`View all past automation tasks and their results`}
                    </p>
                  </CardContent>
                </Card>

                {/* Test Automation */}
                <Card className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={testAutomation}>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      {isTestingAutomation ? (
                        <CircleNotch className="h-6 w-6 text-green-600 animate-spin" />
                      ) : (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      )}
                    </div>
                    <h3 className="font-semibold mb-2">{t`Test System`}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t`Run a test automation to verify everything is working`}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Getting Started */}
        {!isAutomationAvailable && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}>
            <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                  <XCircle className="h-5 w-5" />
                  {t`Automation Engine Offline`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    {t`The job automation engine is not currently running. To enable automation features:`}
                  </p>
                  <div className="bg-amber-100 dark:bg-amber-900/20 p-3 rounded-lg">
                    <code className="text-sm">./start-complete-system.ps1</code>
                  </div>
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    {t`This will start both your regular app and the automation engine.`}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Actions */}
        {isAutomationAvailable && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}>
            <Card>
              <CardHeader>
                <CardTitle>{t`Quick Actions`}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Button
                    onClick={() => window.location.href = '/dashboard/job-applications'}
                    className="gap-2"
                  >
                    <Robot className="h-4 w-4" />
                    {t`Start Job Automation`}
                  </Button>
                  
                  <Button
                    onClick={() => window.open('http://localhost:8080', '_blank')}
                    variant="outline"
                    className="gap-2"
                  >
                    <Monitor className="h-4 w-4" />
                    {t`Monitor Tasks`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </>
  );
};