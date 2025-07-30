import { t } from "@lingui/macro";
import {
  ArrowClockwise,
  ArrowCounterClockwise,
  ArrowsOutCardinal,
  CaretDown,
  CircleNotch,
  ClockClockwise,
  CubeFocus,
  FilePdf,
  Hash,
  LineSegment,
  LinkSimple,
  MagnifyingGlass,
  MagnifyingGlassMinus,
  MagnifyingGlassPlus,
  MagicWand,
  PaperPlaneTilt,
  Sparkle,
  X,
} from "@phosphor-icons/react";
import { Button, Checkbox, Input, Label, Separator, Toggle, Tooltip } from "@reactive-resume/ui";
import { cn } from "@reactive-resume/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { useToast } from "@/client/hooks/use-toast";
import { usePrintResume } from "@/client/services/resume";
import { debouncedUpdateResume } from "@/client/services/resume/update";
import { useEditResume } from "@/client/services/resume/edit-resume";
import { useBuilderStore } from "@/client/stores/builder";
import { useResumeStore, useTemporalResumeStore } from "@/client/stores/resume";

// Available sections for editing
const EDITABLE_SECTIONS = [
  { value: "all", label: t`All Sections` },
  { value: "summary", label: t`Summary` },
  { value: "experience", label: t`Experience` },
  { value: "education", label: t`Education` },
  { value: "skills", label: t`Skills` },
  { value: "projects", label: t`Projects` },
  { value: "awards", label: t`Awards` },
  { value: "certifications", label: t`Certifications` },
  { value: "languages", label: t`Languages` },
  { value: "interests", label: t`Interests` },
  { value: "volunteer", label: t`Volunteer` },
  { value: "publications", label: t`Publications` },
  { value: "references", label: t`References` },
  { value: "profiles", label: t`Profiles` },
  { value: "basics", label: t`Contact Information` },
];

const SUGGESTIONS = [
  t`Make my experience section more impactful with action verbs`,
  t`Improve the summary to be more compelling and specific`,
  t`Add more technical skills and keywords for software engineering`,
  t`Make the language more professional and polished`,
  t`Optimize for ATS (Applicant Tracking System) compatibility`,
  t`Add quantifiable achievements to my work experience`,
  t`Improve the overall tone to be more confident and assertive`,
];

const openInNewTab = (url: string) => {
  const win = window.open(url, "_blank");
  if (win) win.focus();
};

export const BuilderToolbar = () => {
  const { toast } = useToast();

  const [panMode, setPanMode] = useState<boolean>(true);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiExpanded, setIsAiExpanded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [includeJobContext, setIncludeJobContext] = useState(false);
  const [selectedSections, setSelectedSections] = useState<string[]>(["all"]);

  const setValue = useResumeStore((state) => state.setValue);
  const undo = useTemporalResumeStore((state) => state.undo);
  const redo = useTemporalResumeStore((state) => state.redo);
  const frameRef = useBuilderStore((state) => state.frame.ref);

  const id = useResumeStore((state) => state.resume.id);
  const isPublic = useResumeStore((state) => state.resume.visibility === "public");
  const pageOptions = useResumeStore((state) => state.resume.data.metadata?.page?.options);
  const resume = useResumeStore((state) => state.resume);
  const hasJobContext = !!resume.jobApplicationId;

  const { printResume, loading } = usePrintResume();
  const { editResume, loading: aiLoading } = useEditResume();

  const onPrint = async () => {
    const { url } = await printResume({ id });

    openInNewTab(url);
  };

  const onCopy = async () => {
    const { url } = await printResume({ id });
    await navigator.clipboard.writeText(url);

    toast({
      variant: "success",
      title: t`A link has been copied to your clipboard.`,
      description: t`Anyone with this link can view and download the resume. Share it on your profile or with recruiters.`,
    });
  };

  const onZoomIn = () => frameRef?.contentWindow?.postMessage({ type: "ZOOM_IN" }, "*");
  const onZoomOut = () => frameRef?.contentWindow?.postMessage({ type: "ZOOM_OUT" }, "*");
  const onResetView = () => frameRef?.contentWindow?.postMessage({ type: "RESET_VIEW" }, "*");
  const onCenterView = () => frameRef?.contentWindow?.postMessage({ type: "CENTER_VIEW" }, "*");
  const onTogglePanMode = () => {
    setPanMode(!panMode);
    frameRef?.contentWindow?.postMessage({ type: "TOGGLE_PAN_MODE", panMode: !panMode }, "*");
  };

  const handleAiSubmit = async () => {
    if (!aiPrompt.trim()) {
      toast({
        variant: "error",
        title: t`Error`,
        description: t`Please enter a prompt to edit your resume.`,
      });
      return;
    }

    try {
      const result = await editResume({
        prompt: aiPrompt.trim(),
        resumeData: resume.data,
        includeJobContext,
        selectedSections: selectedSections.includes("all") ? undefined : selectedSections,
      });

      if (result.success && result.data) {
        // Update the resume with the edited data
        console.log("AI Edit Result:", result.data);
        
        // The result.data is the complete resume data object, not just the data field
        // We need to update the entire resume object
        const updatedResume = {
          ...resume,
          data: result.data
        };
        
        // Update the store with the complete resume object
        console.log("Updating resume store with:", updatedResume);
        useResumeStore.setState({ resume: updatedResume });
        
        // Trigger save to backend
        void debouncedUpdateResume(JSON.parse(JSON.stringify(updatedResume)));
        
        // Force sync to artboard after a short delay
        setTimeout(() => {
          if (frameRef?.contentWindow) {
            console.log("Forcing sync to artboard");
            const message = { type: "SET_RESUME", payload: result.data };
            frameRef.contentWindow.postMessage(message, "*");
          }
        }, 100);
        
        // The useResumeSync hook in the builder page will handle form synchronization
        // No additional force updates needed here
        
        toast({
          variant: "success",
          title: t`Success`,
          description: t`Your resume has been updated successfully!`,
        });
        setAiPrompt("");
        setIsAiExpanded(false);
      } else {
        toast({
          variant: "error",
          title: t`Error`,
          description: result.error ?? t`Failed to edit resume. Please try again.`,
        });
      }
    } catch {
      toast({
        variant: "error",
        title: t`Error`,
        description: t`An unexpected error occurred. Please try again.`,
      });
    }
  };

  const handleAiKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleAiSubmit();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setAiPrompt(suggestion);
    setShowSuggestions(false);
  };

  const handleSectionChange = (sections: string[]) => {
    setSelectedSections(sections);
  };

  return (
    <motion.div className="fixed inset-x-0 bottom-0 mx-auto hidden py-6 text-center md:block">
      {/* AI Prompt Box - Expanded State */}
      <AnimatePresence mode="wait">
        {isAiExpanded && (
          <motion.div
            key="ai-expanded"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="mb-4"
          >
            <div className="mx-auto inline-block w-auto rounded-lg border bg-background/95 p-4 shadow-xl backdrop-blur-sm">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Sparkle size={16} className="text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm">{t`AI Resume Editor`}</h3>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => {
                    setIsAiExpanded(false);
                  }}
                >
                  <X size={14} />
                </Button>
              </div>

              {/* Input Area */}
              <div className="space-y-3">
                {/* Section Selection */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">{t`Select Sections to Edit`}</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {EDITABLE_SECTIONS.map((section) => (
                      <div key={section.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`section-${section.value}`}
                          checked={selectedSections.includes(section.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              if (section.value === "all") {
                                setSelectedSections(["all"]);
                              } else {
                                setSelectedSections(prev => 
                                  prev.filter(s => s !== "all").concat(section.value)
                                );
                              }
                            } else {
                              setSelectedSections(prev => 
                                prev.filter(s => s !== section.value)
                              );
                            }
                          }}
                        />
                        <Label htmlFor={`section-${section.value}`} className="text-xs">
                          {section.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {selectedSections.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      {t`Please select at least one section to edit.`}
                    </p>
                  )}
                </div>

                <div className="relative">
                  <Input
                    value={aiPrompt}
                    onChange={(e) => {
                      setAiPrompt(e.target.value);
                    }}
                    onKeyDown={handleAiKeyDown}
                    placeholder={t`Describe how you want to improve your resume...`}
                    className="pr-10"
                    disabled={aiLoading}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                    onClick={handleAiSubmit}
                    disabled={aiLoading || !aiPrompt.trim() || selectedSections.length === 0}
                  >
                    <PaperPlaneTilt size={14} />
                  </Button>
                </div>

                {/* Suggestions */}
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setShowSuggestions(!showSuggestions);
                    }}
                  >
                    <CaretDown 
                      size={12} 
                      className={cn(
                        "mr-1 transition-transform", 
                        showSuggestions && "rotate-180"
                      )} 
                    />
                    {t`Show Examples`}
                  </Button>
                  
                  <AnimatePresence>
                    {showSuggestions && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-1"
                      >
                        {SUGGESTIONS.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              handleSuggestionClick(suggestion);
                            }}
                            className="block w-full text-left text-xs text-muted-foreground hover:text-foreground p-2 rounded hover:bg-secondary/50 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Job Context Checkbox */}
                {hasJobContext && (
                  <div className="flex items-center space-x-2 pt-2 border-t">
                    <Checkbox
                      id="toolbar-job-context"
                      checked={includeJobContext}
                      onCheckedChange={(checked) => setIncludeJobContext(checked as boolean)}
                    />
                    <Label htmlFor="toolbar-job-context" className="text-xs">
                      {t`Include job context for better tailoring`}
                    </Label>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    {t`AI will preserve your resume structure while making improvements.`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t`Press Enter to submit`}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toolbar Container */}
      <div className="flex items-center justify-center gap-4">
        {/* Main Toolbar */}
        <div className="inline-flex items-center justify-center rounded-full bg-background px-4 shadow-xl">
          <Tooltip content={t`Undo`}>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-none"
              onClick={() => {
                undo();
              }}
            >
              <ArrowCounterClockwise />
            </Button>
          </Tooltip>

          <Tooltip content={t`Redo`}>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-none"
              onClick={() => {
                redo();
              }}
            >
              <ArrowClockwise />
            </Button>
          </Tooltip>

          <Separator orientation="vertical" className="h-9" />

          <Tooltip content={panMode ? t`Scroll to Pan` : t`Scroll to Zoom`}>
            <Toggle className="rounded-none" pressed={panMode} onPressedChange={onTogglePanMode}>
              {panMode ? <ArrowsOutCardinal /> : <MagnifyingGlass />}
            </Toggle>
          </Tooltip>

          <Separator orientation="vertical" className="h-9" />

          <Tooltip content={t`Zoom In`}>
            <Button size="icon" variant="ghost" className="rounded-none" onClick={onZoomIn}>
              <MagnifyingGlassPlus />
            </Button>
          </Tooltip>

          <Tooltip content={t`Zoom Out`}>
            <Button size="icon" variant="ghost" className="rounded-none" onClick={onZoomOut}>
              <MagnifyingGlassMinus />
            </Button>
          </Tooltip>

          <Tooltip content={t`Reset Zoom`}>
            <Button size="icon" variant="ghost" className="rounded-none" onClick={onResetView}>
              <ClockClockwise />
            </Button>
          </Tooltip>

          <Tooltip content={t`Center Artboard`}>
            <Button size="icon" variant="ghost" className="rounded-none" onClick={onCenterView}>
              <CubeFocus />
            </Button>
          </Tooltip>

          <Separator orientation="vertical" className="h-9" />

          <Tooltip content={t`Toggle Page Break Line`}>
            <Toggle
              className="rounded-none"
              pressed={pageOptions.breakLine}
              onPressedChange={(pressed) => {
                setValue("metadata.page.options.breakLine", pressed);
              }}
            >
              <LineSegment />
            </Toggle>
          </Tooltip>

          <Tooltip content={t`Toggle Page Numbers`}>
            <Toggle
              className="rounded-none"
              pressed={pageOptions.pageNumbers}
              onPressedChange={(pressed) => {
                setValue("metadata.page.options.pageNumbers", pressed);
              }}
            >
              <Hash />
            </Toggle>
          </Tooltip>

          <Separator orientation="vertical" className="h-9" />

          <Tooltip content={t`Copy Link to Resume`}>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-none"
              disabled={!isPublic}
              onClick={onCopy}
            >
              <LinkSimple />
            </Button>
          </Tooltip>

          <Tooltip content={t`Download PDF`}>
            <Button
              size="icon"
              variant="ghost"
              disabled={loading}
              className="rounded-none"
              onClick={onPrint}
            >
              {loading ? <CircleNotch className="animate-spin" /> : <FilePdf />}
            </Button>
          </Tooltip>
        </div>

        {/* AI Prompt Button */}
        <AnimatePresence mode="wait">
          <motion.div
            key="ai-button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              size="icon"
              variant={"primary"}
              className="size-12 rounded-full shadow-lg"
              onClick={() => {
                setIsAiExpanded(!isAiExpanded);
              }}
            >
              {isAiExpanded ? <X size={20} /> : <MagicWand size={20} />}
            </Button>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
