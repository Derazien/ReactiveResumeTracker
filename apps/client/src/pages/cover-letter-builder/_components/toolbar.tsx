import { t } from "@lingui/macro";
import { CircleNotchIcon, FilePdfIcon, MagicWandIcon, SparkleIcon } from "@phosphor-icons/react";
import { Button, Separator, Tooltip } from "@reactive-resume/ui";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, Users } from "lucide-react";
import { useState } from "react";

import { useToast } from "@/client/hooks/use-toast";
import { useCoverLetterSync } from "@/client/hooks/use-cover-letter-sync";
import { useCoverLetterBuilderStore } from "@/client/stores/cover-letter-builder";
import { useJobApplicationStore } from "@/client/stores/job-application";

export const Toolbar = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConductingInterview, setIsConductingInterview] = useState(false);

  const jobApplication = useJobApplicationStore((state) => state.jobApplication);
  const generation = useCoverLetterBuilderStore((state) => state.generation);
  const template = useCoverLetterBuilderStore((state) => state.template);
  const coverLetterSync = useCoverLetterSync();

  const handleGenerateCoverLetter = async () => {
    if (!jobApplication) {
      toast({
        title: t`Error`,
        description: t`No job application selected`,
        variant: "error",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(
        `/api/job-applications/${jobApplication.id}/generate-tailored-cover-letter`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            templateName: template.selectedTemplate || "professional",
            tone: template.tone || "professional",
            maxParagraphs: 3,
          }),
        },
      );

      if (response.ok) {
        const result = await response.json();
        
        // Success message with details
        const usedContentCount = result.usedContent?.length || 0;
        const themes = result.companyThemes?.join(", ") || "general themes";
        const fitScore = result.metadata?.overallFitScore || 0;
        
        toast({
          title: t`Cover Letter Generated Successfully`,
          description: t`Used ${usedContentCount} stories addressing ${themes} (${fitScore}% fit)`,
        });

        // Log the complete result for debugging
        console.log("Cover Letter Generation Result:", result);
        
        // Update cover letter content and send to artboard
        coverLetterSync.updateContent(result.coverLetter);
        coverLetterSync.updateTemplate(result.template || template.selectedTemplate || "professional");
        coverLetterSync.updateTone(result.tone || template.tone || "professional");
        coverLetterSync.updateUsedContent(result.usedContent || []);
        
        // Update company information if available
        if (result.companyInfo) {
          coverLetterSync.updateCompanyInfo({
            companyName: result.companyInfo?.name || "",
            companyAddress: result.companyInfo?.address,
            recipientName: result.companyInfo?.hiringManager,
            recipientTitle: "Hiring Manager",
          });
        }
        
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to generate cover letter");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      
      toast({
        title: t`Cover Letter Generation Failed`,
        description: errorMessage.includes("No relevant cover letter content found") 
          ? t`Please add cover letter stories to your content library first`
          : errorMessage,
        variant: "error",
      });
      
      console.error("Cover Letter Generation Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConductInterview = async () => {
    if (!jobApplication) {
      toast({
        title: t`Error`,
        description: t`No job application selected`,
        variant: "error",
      });
      return;
    }

    setIsConductingInterview(true);
    try {
      const response = await fetch(`/api/cover-letter-content/conduct-interview-for-job/${jobApplication.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          interviewType: "cover_letter",
        }),
      });

      if (response.ok) {
        const _result = await response.json();
        toast({
          title: t`Success`,
          description: t`Interview questions generated`,
        });

        // Update interview questions in store
        // TODO: Properly integrate with interview store
      } else {
        throw new Error("Failed to conduct interview");
      }
    } catch {
      toast({
        title: t`Error`,
        description: t`Failed to conduct interview`,
        variant: "error",
      });
    } finally {
      setIsConductingInterview(false);
    }
  };

  const handleGenerateContactMessage = () => {
    if (!jobApplication) {
      toast({
        title: t`Error`,
        description: t`No job application selected`,
        variant: "error",
      });
      return;
    }

    // TODO: Implement contact message generation
    toast({
      title: t`Coming Soon`,
      description: t`Contact message generation will be available soon`,
    });
  };

  const handleExportCoverLetter = () => {
    // TODO: Implement cover letter export
    toast({
      title: t`Coming Soon`,
      description: t`Cover letter export will be available soon`,
    });
  };

  return (
    <motion.div className="fixed inset-x-0 bottom-0 mx-auto hidden py-6 text-center md:block">
      {/* Toolbar Container */}
      <div className="flex items-center justify-center gap-4">
        {/* Main Toolbar */}
        <div className="inline-flex items-center justify-center rounded-full bg-background px-4 shadow-xl">
          <Tooltip content={t`Generate Cover Letter`}>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-none"
              disabled={isGenerating || !jobApplication}
              onClick={handleGenerateCoverLetter}
            >
              {isGenerating ? <CircleNotchIcon className="animate-spin" /> : <SparkleIcon />}
            </Button>
          </Tooltip>

          <Separator orientation="vertical" className="h-9" />

          <Tooltip content={t`Conduct Interview`}>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-none"
              disabled={isConductingInterview || !jobApplication}
              onClick={handleConductInterview}
            >
              {isConductingInterview ? (
                <CircleNotchIcon className="animate-spin" />
              ) : (
                <MessageSquare />
              )}
            </Button>
          </Tooltip>

          <Tooltip content={t`Contact Messages`}>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-none"
              disabled={!jobApplication}
              onClick={handleGenerateContactMessage}
            >
              <Users />
            </Button>
          </Tooltip>

          <Separator orientation="vertical" className="h-9" />

          <Tooltip content={t`Export Cover Letter`}>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-none"
              disabled={!jobApplication}
              onClick={handleExportCoverLetter}
            >
              <FilePdfIcon />
            </Button>
          </Tooltip>
        </div>

        {/* Generation Status */}
        {generation.isGenerating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="inline-flex items-center gap-2 rounded-full bg-background px-4 py-2 shadow-xl"
          >
            <CircleNotchIcon className="size-4 animate-spin text-primary" />
            <span className="text-sm">{generation.currentStep || t`Processing...`}</span>
          </motion.div>
        )}

        {/* Primary Action Button */}
        <AnimatePresence mode="wait">
          <motion.div
            key="primary-action"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              size="icon"
              variant="primary"
              className="size-12 rounded-full shadow-lg"
              disabled={isGenerating || !jobApplication}
              onClick={handleGenerateCoverLetter}
            >
              <MagicWandIcon size={20} />
            </Button>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
