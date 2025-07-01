import { t } from "@lingui/macro";
import { Link, MagnifyingGlass, Sparkle } from "@phosphor-icons/react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  RichInput,
} from "@reactive-resume/ui";
import { useState } from "react";
import { useNavigate } from "react-router";

import { useToast } from "@/client/hooks/use-toast";
import type { JobAnalysisResult } from "@/client/services/job-application/analyze-job";
import {
  useAnalyzeJobPosting,
  useCreateFromAnalysis,
} from "@/client/services/job-application/analyze-job";

export const JobUrlForm = () => {
  const [url, setUrl] = useState("");
  const [extractedData, setExtractedData] = useState<JobAnalysisResult | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const { analyzeJobPosting, loading: isAnalyzing } = useAnalyzeJobPosting();
  const { createFromAnalysis, loading: isCreating } = useCreateFromAnalysis();

  const handleAnalyze = async () => {
    if (!url.trim()) return;

    try {
      const result = await analyzeJobPosting({ jobText: url });

      setExtractedData(result.analysisResult);
      toast({
        title: t`Success`,
        description: t`Job posting analyzed successfully`,
      });
    } catch {
      toast({
        variant: "error",
        title: t`Error`,
        description: t`Failed to analyze job posting. Please try again.`,
      });
    }
  };

  const handleCreateApplication = async () => {
    if (!extractedData) return;

    try {
      const newApplication = await createFromAnalysis({
        analysisData: extractedData,
        url: url,
      });

      toast({
        title: t`Success`,
        description: t`Job application created successfully`,
      });

      // Navigate to the newly created application detail page
      navigate(`/dashboard/job-applications/${newApplication.id}`);
    } catch {
      toast({
        variant: "error",
        title: t`Error`,
        description: t`Failed to create job application. Please try again.`,
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link size={20} />
            {t`Analyze Job Posting from URL`}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">{t`Job Posting URL`}</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://company.com/jobs/position"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
              }}
            />
          </div>

          <Button disabled={!url.trim() || isAnalyzing} className="w-full" onClick={handleAnalyze}>
            <MagnifyingGlass size={16} className="mr-2" />
            {isAnalyzing ? t`Analyzing...` : t`Analyze Job Posting`}
          </Button>
        </CardContent>
      </Card>

      {extractedData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkle size={20} />
              {t`Extracted Job Information`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t`Job Title`}</Label>
                <div className="bg-muted rounded p-2">{extractedData.title}</div>
              </div>
              <div className="space-y-2">
                <Label>{t`Company`}</Label>
                <div className="bg-muted rounded p-2">{extractedData.company}</div>
              </div>
            </div>

            {extractedData.location && (
              <div className="space-y-2">
                <Label>{t`Location`}</Label>
                <div className="bg-muted rounded p-2">{extractedData.location}</div>
              </div>
            )}

            <div className="space-y-2">
              <Label>{t`Job Description`}</Label>
              <RichInput
                content={extractedData.description}
                className="min-h-32"
                onChange={() => {}} // Read-only
              />
            </div>

            {extractedData.requirements.length > 0 && (
              <div className="space-y-2">
                <Label>{t`Requirements`}</Label>
                <ul className="bg-muted list-inside list-disc space-y-1 rounded p-2">
                  {extractedData.requirements.map((req, index) => (
                    <li key={index} className="text-sm">
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {extractedData.extractedTags.length > 0 && (
              <div className="space-y-2">
                <Label>{t`Key Skills & Tags`}</Label>
                <div className="flex flex-wrap gap-2">
                  {extractedData.extractedTags.map((tag, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <Button disabled={isCreating} className="w-full" onClick={handleCreateApplication}>
              <Sparkle size={16} className="mr-2" />
              {isCreating ? t`Creating Application...` : t`Create Job Application`}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
