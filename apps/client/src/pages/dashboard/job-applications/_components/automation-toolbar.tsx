import { t } from "@lingui/macro";
import { 
  Button, 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  Badge,
  Separator,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@reactive-resume/ui";
import { Lightning, MagicWand, Sparkle, Play, CircleNotch, Monitor, Robot } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useToast } from "@/client/hooks/use-toast";

type AutomationStatus = {
  skyvern: {
    status: "running" | "down";
    url: string;
    uiUrl: string;
  };
  message: string;
};

type AutomationResult = {
  success: boolean;
  taskId?: string;
  message: string;
  monitorUrl?: string;
  error?: string;
};

export const AutomationToolbar = () => {
  const { toast } = useToast();
  const [automationStatus, setAutomationStatus] = useState<AutomationStatus | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeTask, setActiveTask] = useState<string | null>(null);

  useEffect(() => {
    void checkAutomationStatus();
  }, []);

  const checkAutomationStatus = async () => {
    try {
      const response = await fetch("/api/automation/status");
      const status: AutomationStatus = await response.json();
      setAutomationStatus(status);
    } catch (error) {
      console.error("Failed to check automation status:", error);
    }
  };

  const executeJobAutomation = async (
    instruction: string,
    targetUrl: string,
    workflowConfig?: any,
  ) => {
    if (!instruction.trim()) {
      toast({
        title: t`Configuration Required`,
        description: t`Please configure the automation parameters.`,
        variant: "error",
      });
      return;
    }

    setIsExecuting(true);
    try {
      let response;
      
      if (workflowConfig) {
        // LinkedIn workflow with configuration
        response = await fetch("/api/automation/execute-linkedin-workflow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(workflowConfig),
        });
      } else {
        // Generic job search
        response = await fetch("/api/automation/execute-job-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            instruction,
            targetUrl: targetUrl || undefined,
            maxJobs: 5,
          }),
        });
      }

      const result: AutomationResult = await response.json();
      
      if (result.success && result.taskId) {
        setActiveTask(result.taskId);
        toast({
          title: t`Automation Started`,
          description: `${result.message}. Task ID: ${result.taskId}`,
          action: (
            <Button
              size="sm"
              onClick={() => window.open(result.monitorUrl, "_blank")}
            >
              {t`Monitor Task`}
            </Button>
          ),
        });
      } else {
        throw new Error(result.message || "Automation failed");
      }
    } catch (error) {
      toast({
        title: t`Automation Failed`,
        description: (error as Error)?.message || "Failed to start job automation",
        variant: "error",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const openSkyvernUI = () => {
    window.open("http://localhost:8081", "_blank");
  };

  const isAutomationAvailable = automationStatus?.skyvern?.status === "running";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Robot className="size-5 text-gray-500" />
          <h3 className="text-lg font-medium">{t`Job Automation`}</h3>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg mb-4">
          <div className="flex items-center gap-2">
            <div className={`size-2 rounded-full ${isAutomationAvailable ? "bg-green-500" : "bg-red-500"}`} />
            <span className="text-sm">
              {isAutomationAvailable ? t`Automation Ready` : t`Automation Offline`}
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={openSkyvernUI}
            className="gap-1"
          >
            <Monitor className="size-3" />
            {t`Skyvern UI`}
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {/* LinkedIn Automation */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="flex h-auto flex-col gap-2 p-3"
                disabled={!isAutomationAvailable}
              >
                <Lightning className="size-5 text-blue-600" />
                <span className="text-xs font-medium">{t`LinkedIn Jobs`}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Lightning className="size-5 text-blue-600" />
                  {t`LinkedIn Job Automation`}
                </DialogTitle>
              </DialogHeader>
              <AutomationDialog 
                platform="LinkedIn"
                defaultUrl="https://linkedin.com/jobs"
                onExecute={executeJobAutomation}
                isExecuting={isExecuting}
              />
            </DialogContent>
          </Dialog>

          {/* Indeed Automation */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="flex h-auto flex-col gap-2 p-3"
                disabled={!isAutomationAvailable}
              >
                <MagicWand className="size-5 text-purple-600" />
                <span className="text-xs font-medium">{t`Indeed Jobs`}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <MagicWand className="size-5 text-purple-600" />
                  {t`Indeed Job Automation`}
                </DialogTitle>
              </DialogHeader>
              <AutomationDialog 
                platform="Indeed"
                defaultUrl="https://indeed.com"
                onExecute={executeJobAutomation}
                isExecuting={isExecuting}
              />
            </DialogContent>
          </Dialog>

          {/* Custom Automation */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="flex h-auto flex-col gap-2 p-3"
                disabled={!isAutomationAvailable}
              >
                <Sparkle className="size-5 text-green-600" />
                <span className="text-xs font-medium">{t`Custom Jobs`}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkle className="size-5 text-green-600" />
                  {t`Custom Job Automation`}
                </DialogTitle>
              </DialogHeader>
              <AutomationDialog 
                platform="Custom"
                defaultUrl=""
                onExecute={executeJobAutomation}
                isExecuting={isExecuting}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Active Task Status */}
        {activeTask && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <CircleNotch className="size-4 animate-spin text-blue-600" />
              <span className="text-sm font-medium">{t`Task Running`}</span>
              <Badge variant="success">{activeTask}</Badge>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {t`Monitor progress in Skyvern UI`}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(`http://localhost:8081/tasks/${activeTask}`, "_blank")}
              className="mt-2"
            >
              {t`View Task`}
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Reusable automation dialog component
type AutomationDialogProps = {
  platform: "LinkedIn" | "Indeed" | "Custom";
  defaultUrl: string;
  onExecute: (instruction: string, targetUrl: string, workflowConfig?: any) => Promise<void>;
  isExecuting: boolean;
};

const AutomationDialog = ({ platform, defaultUrl, onExecute, isExecuting }: AutomationDialogProps) => {
  const [localInstruction, setLocalInstruction] = useState("");
  const [localUrl, setLocalUrl] = useState(defaultUrl);
  
  // LinkedIn workflow configuration state
  const [workflowConfig, setWorkflowConfig] = useState({
    jobKeywords: "",
    location: "",
    remoteStatus: "any", // any, remote, on-site, hybrid
    timePeriod: "any", // any, past24h, pastWeek, pastMonth
    maxJobs: 5,
    includeCompanyResearch: true,
    includeContactExtraction: true,
    waitForUserLogin: true,
  });

  const handleExecute = async () => {
    if (platform === "LinkedIn") {
      // Create comprehensive LinkedIn workflow instruction
      const workflowInstruction = `
        LinkedIn Job Automation Workflow:
        1. Search for "${workflowConfig.jobKeywords}" jobs in "${workflowConfig.location}"
        2. Remote status: ${workflowConfig.remoteStatus}
        3. Time period: ${workflowConfig.timePeriod}
        4. Extract job details and create job applications
        5. ${workflowConfig.includeCompanyResearch ? "Research companies and create company records" : ""}
        6. ${workflowConfig.includeContactExtraction ? "Extract employee contacts and create contact records" : ""}
        7. ${workflowConfig.waitForUserLogin ? "Wait for user to login to LinkedIn if needed" : ""}
      `;
      
      await onExecute(workflowInstruction, localUrl, workflowConfig);
    } else {
      await onExecute(localInstruction, localUrl);
    }
  };

  const exampleInstructions: Record<"LinkedIn" | "Indeed" | "Custom", string[]> = {
    LinkedIn: [
      "Find React developer jobs in San Francisco",
      "Search for remote frontend engineer positions",
      "Apply to senior software engineer roles at tech companies",
    ],
    Indeed: [
      "Find JavaScript developer jobs with salary over $100k",
      "Search for remote software engineering positions",
      "Apply to full-stack developer roles",
    ],
    Custom: [
      "Navigate to company career page and find open positions", 
      "Search for specific job titles and extract company information",
      "Find and apply to developer positions matching my skills",
    ],
  };

  return (
    <div className="space-y-4">
      {platform === "LinkedIn" ? (
        // LinkedIn-specific workflow configuration
        <>
          {/* Job Search Configuration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">{t`Job Keywords`}</label>
              <Input
                value={workflowConfig.jobKeywords}
                onChange={(e) => {
                  setWorkflowConfig((prev) => ({ ...prev, jobKeywords: e.target.value }));
                }}
                placeholder="React Developer"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t`Location`}</label>
              <Input
                value={workflowConfig.location}
                onChange={(e) => {
                  setWorkflowConfig((prev) => ({ ...prev, location: e.target.value }));
                }}
                placeholder="San Francisco, CA"
                className="mt-1"
              />
            </div>
          </div>

          {/* LinkedIn Filters */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">{t`Remote Status`}</label>
              <Select
                value={workflowConfig.remoteStatus}
                onValueChange={(value) => {
                  setWorkflowConfig((prev) => ({ ...prev, remoteStatus: value }));
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">{t`Any`}</SelectItem>
                  <SelectItem value="remote">{t`Remote`}</SelectItem>
                  <SelectItem value="on-site">{t`On-site`}</SelectItem>
                  <SelectItem value="hybrid">{t`Hybrid`}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">{t`Time Period`}</label>
              <Select
                value={workflowConfig.timePeriod}
                onValueChange={(value) => {
                  setWorkflowConfig((prev) => ({ ...prev, timePeriod: value }));
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">{t`Any time`}</SelectItem>
                  <SelectItem value="past24h">{t`Past 24 hours`}</SelectItem>
                  <SelectItem value="pastWeek">{t`Past week`}</SelectItem>
                  <SelectItem value="pastMonth">{t`Past month`}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Max Jobs */}
          <div>
            <label className="text-sm font-medium">{t`Maximum Jobs to Process`}</label>
            <Input
              type="number"
              value={workflowConfig.maxJobs}
              onChange={(e) => {
                setWorkflowConfig((prev) => ({ ...prev, maxJobs: Number.parseInt(e.target.value) || 5 }));
              }}
              min="1"
              max="20"
              className="mt-1"
            />
          </div>

          {/* Workflow Options */}
          <div className="space-y-3">
            <label className="text-sm font-medium">{t`Workflow Options`}</label>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeCompanyResearch"
                checked={workflowConfig.includeCompanyResearch}
                onChange={(e) => {
                  setWorkflowConfig((prev) => ({
                    ...prev,
                    includeCompanyResearch: e.target.checked,
                  }));
                }}
                className="rounded"
              />
              <label htmlFor="includeCompanyResearch" className="text-sm">
                {t`Include company research and website analysis`}
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeContactExtraction"
                checked={workflowConfig.includeContactExtraction}
                onChange={(e) => {
                  setWorkflowConfig((prev) => ({
                    ...prev,
                    includeContactExtraction: e.target.checked,
                  }));
                }}
                className="rounded"
              />
              <label htmlFor="includeContactExtraction" className="text-sm">
                {t`Extract employee contacts from LinkedIn`}
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="waitForUserLogin"
                checked={workflowConfig.waitForUserLogin}
                onChange={(e) => {
                  setWorkflowConfig((prev) => ({ ...prev, waitForUserLogin: e.target.checked }));
                }}
                className="rounded"
              />
              <label htmlFor="waitForUserLogin" className="text-sm">
                {t`Wait for user to login to LinkedIn`}
              </label>
            </div>
          </div>
        </>
      ) : (
        // Generic automation for other platforms
        <>
          <div>
            <label className="text-sm font-medium">{t`Job Board URL`}</label>
            <Input
              value={localUrl}
              onChange={(e) => setLocalUrl(e.target.value)}
              placeholder={`https://${platform.toLowerCase()}.com/jobs`}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">{t`Automation Instructions`}</label>
            <textarea
              value={localInstruction}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                setLocalInstruction(e.target.value);
              }}
              placeholder={t`Tell the AI what to do...`}
              className="mt-1 h-24 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:ring-offset-gray-900 dark:placeholder:text-gray-400 dark:focus-visible:ring-blue-400"
            />
          </div>

          {/* Example Instructions */}
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400">{t`Example Instructions:`}</label>
            <div className="mt-1 space-y-1">
              {exampleInstructions[platform]?.map((example: string, index: number) => (
                <button
                  key={index}
                  onClick={() => {
                    setLocalInstruction(example);
                  }}
                  className="block text-left text-xs text-blue-600 hover:text-blue-800 hover:underline"
                >
                  "{example}"
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <Separator />

      <Button 
        onClick={handleExecute}
        disabled={
          isExecuting ||
          (platform === "LinkedIn" ? !workflowConfig.jobKeywords.trim() : !localInstruction.trim())
        }
        className="w-full gap-2"
      >
        {isExecuting ? (
          <>
            <CircleNotch className="size-4 animate-spin" />
            {platform === "LinkedIn" ? t`Starting LinkedIn Automation...` : t`Starting Automation...`}
          </>
        ) : (
          <>
            <Play className="size-4" />
            {platform === "LinkedIn" ? t`Start LinkedIn Automation` : t`Start Job Automation`}
          </>
        )}
      </Button>
    </div>
  );
};
