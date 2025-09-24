import { t } from "@lingui/macro";
import { Monitor, ArrowSquareOut, Warning, CheckCircle } from "@phosphor-icons/react";
import { 
  Button, 
  Card, 
  CardContent, 
  Alert,
  Badge
} from "@reactive-resume/ui";
import { useState, useEffect } from "react";

interface ChromeRemoteControlProps {
  isAutomationRunning?: boolean;
}

export const ChromeRemoteControl = ({ isAutomationRunning = false }: ChromeRemoteControlProps) => {
  const [chromeStatus, setChromeStatus] = useState<'unknown' | 'accessible' | 'blocked'>('unknown');

  useEffect(() => {
    checkChromeAccess();
  }, []);

  const checkChromeAccess = async () => {
    try {
      // Test if Chrome debugging port is accessible
      const response = await fetch('http://localhost:9222/json', { 
        mode: 'no-cors',
        method: 'HEAD'
      });
      setChromeStatus('accessible');
    } catch (error) {
      setChromeStatus('blocked');
    }
  };

  const openChromeDevTools = () => {
    // Try multiple methods to open Chrome DevTools
    const methods = [
      'http://localhost:9222',
      'chrome-devtools://devtools/bundled/inspector.html?ws=localhost:9222/devtools/browser',
    ];
    
    methods.forEach(url => {
      window.open(url, '_blank', 'width=1200,height=800');
    });
  };

  const openLocalChrome = () => {
    // Instructions for manual Chrome setup
    const instructions = `
To enable manual browser control:

1. Close all Chrome windows
2. Open PowerShell as Administrator
3. Run this command:
   & "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --remote-debugging-port=9223 --user-data-dir="C:\\chrome-automation"
4. Login to LinkedIn in this Chrome window
5. Update docker-compose.skyvern.yml:
   - BROWSER_TYPE=cdp-connect
   - BROWSER_REMOTE_DEBUGGING_URL=http://host.docker.internal:9223/
6. Restart Skyvern: docker restart skyvern-api
7. Start automation - Skyvern will use your logged-in Chrome

This gives you full manual control during automation!
    `.trim();
    
    // Copy command to clipboard helper
    const copyToClipboard = () => {
      navigator.clipboard.writeText('& "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --remote-debugging-port=9223 --user-data-dir="C:\\chrome-automation"');
    };
    
    if (confirm(instructions + '\n\nClick OK to copy the PowerShell command to clipboard.')) {
      copyToClipboard();
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              <span className="font-medium">{t`Chrome Remote Control`}</span>
            </div>
            <Badge variant={chromeStatus === 'accessible' ? 'success' : 'secondary'}>
              {chromeStatus === 'accessible' ? t`Available` : t`Limited Access`}
            </Badge>
          </div>

          {chromeStatus === 'blocked' && (
            <Alert>
              <Warning className="h-4 w-4" />
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {t`Direct DevTools Access Blocked`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t`This is normal browser security behavior. Use the options below for manual browser control.`}
                </p>
              </div>
            </Alert>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {/* Method 1: External DevTools */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                {t`External DevTools`}
              </h4>
              <p className="text-xs text-muted-foreground mb-2">
                {t`Opens Chrome DevTools in separate window for browser control during automation.`}
              </p>
              <Button 
                size="sm"
                onClick={openChromeDevTools}
                className="w-full gap-1"
              >
                <ArrowSquareOut className="h-3 w-3" />
                {t`Open Chrome DevTools`}
              </Button>
            </div>

            {/* Method 2: Local Chrome Setup */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-blue-500" />
                {t`Local Chrome Control`}
              </h4>
              <p className="text-xs text-muted-foreground mb-2">
                {t`Set up your local Chrome for direct control during automation (recommended for frequent use).`}
              </p>
              <Button 
                size="sm"
                variant="outline"
                onClick={openLocalChrome}
                className="w-full gap-1"
              >
                <Monitor className="h-3 w-3" />
                {t`Setup Instructions`}
              </Button>
            </div>
          </div>

          {isAutomationRunning && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  {t`Automation Running - Browser Control Available`}
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  {t`Click "Open Chrome DevTools" above to control the automation browser for manual login.`}
                </p>
              </div>
            </Alert>
          )}

          <div className="text-xs text-muted-foreground bg-gray-50 dark:bg-gray-900 p-3 rounded">
            <p className="font-medium mb-1">{t`How browser control works:`}</p>
            <ul className="space-y-1 list-disc list-inside ml-2">
              <li>{t`Skyvern runs Chrome with debugging enabled on port 9222`}</li>
              <li>{t`Chrome DevTools connects to this port for full browser control`}</li>
              <li>{t`You can type, click, and navigate manually during automation pauses`}</li>
              <li>{t`Automation resumes automatically after manual interaction`}</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
