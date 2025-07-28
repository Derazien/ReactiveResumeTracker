import { t } from "@lingui/macro";
import {
  CaretDown,
  ChatTeardropText,
  CircleNotch,
  Exam,
  MagicWand,
  PenNib,
  Plus,
  X,
} from "@phosphor-icons/react";
import {
  Badge,
  Button,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Label,
} from "@reactive-resume/ui";
import { cn } from "@reactive-resume/utils";
import { useState } from "react";

import { toast } from "../hooks/use-toast";
import { useLLMStore } from "../stores/llm";
import { useResumeStore } from "../stores/resume";

type Action = "improve" | "fix" | "tone" | "custom";
type Mood = "casual" | "professional" | "confident" | "friendly";

type Props = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

// Utility to call backend LLM action endpoint
const llmAction = async (
  action: Action,
  value: string,
  mood?: Mood,
  customPrompt?: string,
  includeJobContext?: boolean,
  resumeId?: string
): Promise<string> => {
  const res = await fetch("/api/llm/action", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      action, 
      value, 
      mood, 
      customPrompt, 
      includeJobContext,
      resumeId
    }),
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error || "Unknown error");
  return data.result;
};

export const AiActions = ({ value, onChange, className }: Props) => {
  const [loading, setLoading] = useState<Action | false>(false);
  const [showPromptInput, setShowPromptInput] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [includeJobContext, setIncludeJobContext] = useState(false);
  const aiEnabled = useLLMStore((state) => state.isConfigured());
  
  // Get resume data to check if it's linked to a job application
  const resume = useResumeStore((state) => state.resume);
  const hasJobContext = !!resume.jobApplicationId;



  if (!aiEnabled) return null;

  const onClick = async (action: Action, mood?: Mood) => {
    try {
      setLoading(action);

      const result = await llmAction(
        action, 
        value, 
        mood, 
        showPromptInput ? customPrompt : undefined,
        includeJobContext,
        resume.id
      );
      onChange(result);
      
      // Reset prompt input after successful action
      if (showPromptInput) {
        setShowPromptInput(false);
        setCustomPrompt("");
      }
    } catch (error) {
      toast({
        variant: "error",
        title: t`Oops, the server returned an error.`,
        description: (error as Error).message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "relative mt-4 rounded bg-secondary-accent/50 p-3 outline outline-secondary-accent",
        "flex flex-col gap-3",
        "pl-6", // Add left padding to prevent overlap with AI badge
        className,
      )}
    >
      <div className="absolute -left-2 top-1 z-10">
        <Badge
          outline
          variant="primary"
          className="-rotate-90 bg-background px-2 text-[10px] leading-[10px]"
        >
          <MagicWand size={10} className="mr-1" />
          {t`AI`}
        </Badge>
      </div>

      {/* Custom Prompt Input */}
      {showPromptInput && (
        <div className="space-y-3">
          <div className="flex items-center justify-center">
            <Label className="text-xs font-medium">{t`Custom Action`}</Label>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="absolute right-0"
              onClick={(e) => {
                e.stopPropagation();
                setShowPromptInput(false);
                setCustomPrompt("");
              }}
            >
              <X size={14} />
            </Button>
          </div>
          <Input
            placeholder={t`Enter your custom instructions for the AI...`}
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="text-xs"
          />
          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              variant="primary"
              disabled={!customPrompt.trim() || !!loading}
              onClick={(e) => {
                e.stopPropagation();
                if (customPrompt.trim()) {
                  onClick("custom");
                }
              }}
            >
              {loading === "custom" ? (
                <>
                  <CircleNotch className="animate-spin mr-2" size={14} />
                  {t`Processing...`}
                </>
              ) : (
                <>
                  <MagicWand size={14} className="mr-2" />
                  {t`Execute Custom Action`}
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Job Context Checkbox */}
      {hasJobContext && (
        <div className="flex items-center space-x-2 pl-2">
          <Checkbox
            id="include-job-context"
            checked={includeJobContext}
            onCheckedChange={(checked) => setIncludeJobContext(checked as boolean)}
          />
          <Label htmlFor="include-job-context" className="text-xs">
            {t`Include job context for better tailoring`}
          </Label>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button type="button" size="sm" variant="outline" disabled={!!loading} onClick={(e) => {
          e.stopPropagation();
          onClick("improve");
        }}>
          {loading === "improve" ? <CircleNotch className="animate-spin" /> : <PenNib />}
          <span className="ml-2 text-xs">{t`Improve Writing`}</span>
        </Button>

        <Button type="button" size="sm" variant="outline" disabled={!!loading} onClick={(e) => {
          e.stopPropagation();
          onClick("fix");
        }}>
          {loading === "fix" ? <CircleNotch className="animate-spin" /> : <Exam />}
          <span className="ml-2 text-xs">{t`Fix Spelling & Grammar`}</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              type="button"
              size="sm" 
              variant="outline" 
              disabled={!!loading}
              onClick={(e) => e.stopPropagation()}
            >
              {loading === "tone" ? <CircleNotch className="animate-spin" /> : <ChatTeardropText />}
              <span className="mx-2 text-xs">{t`Change Tone`}</span>
              <CaretDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              onClick("tone", "casual");
            }}>
              <span role="img" aria-label={t`Casual`}>
                🙂
              </span>
              <span className="ml-2">{t`Casual`}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              onClick("tone", "professional");
            }}>
              <span role="img" aria-label={t`Professional`}>
                💼
              </span>
              <span className="ml-2">{t`Professional`}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              onClick("tone", "confident");
            }}>
              <span role="img" aria-label={t`Confident`}>
                😎
              </span>
              <span className="ml-2">{t`Confident`}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              onClick("tone", "friendly");
            }}>
              <span role="img" aria-label={t`Friendly`}>
                😊
              </span>
              <span className="ml-2">{t`Friendly`}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Custom Action Toggle */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={!!loading}
          onClick={(e) => {
            e.stopPropagation();
            setShowPromptInput(!showPromptInput);
          }}
        >
          <Plus size={14} />
          <span className="ml-2 text-xs">{t`Custom Action`}</span>
        </Button>
      </div>
    </div>
  );
};
