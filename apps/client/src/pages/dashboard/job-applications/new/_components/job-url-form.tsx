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

export const JobUrlForm = () => {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!url.trim()) return;

    setIsAnalyzing(true);

    try {
      // TODO: Call backend API to analyze the URL
      // Simulating API call for now
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock extracted data
      setExtractedData({
        title: "Senior Frontend Developer",
        company: "TechCorp Inc.",
        location: "San Francisco, CA",
        description: "We are looking for a Senior Frontend Developer to join our team...",
        requirements: [
          "5+ years of React experience",
          "TypeScript proficiency",
          "Experience with modern build tools",
          "Strong CSS/HTML skills",
        ],
        extractedTags: ["react", "typescript", "frontend", "javascript", "css"],
      });
    } catch (error) {
      console.error("Error analyzing URL:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    // TODO: Save the job application to backend
    navigate("/dashboard/job-applications");
  };

  const handleStartOver = () => {
    setUrl("");
    setExtractedData(null);
  };

  return (
    <div className="space-y-6">
      {/* URL Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link size={20} />
            {t`Job Posting URL`}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="url">{t`Paste the job posting URL here`}</Label>
            <div className="mt-2 flex gap-2">
              <Input
                id="url"
                placeholder={t`https://linkedin.com/jobs/view/123456789...`}
                value={url}
                disabled={isAnalyzing}
                onChange={(e) => {
                  setUrl(e.target.value);
                }}
              />
              <Button
                disabled={!url.trim() || isAnalyzing}
                className="gap-2"
                onClick={handleAnalyze}
              >
                {isAnalyzing ? (
                  <>
                    <MagnifyingGlass size={16} className="animate-spin" />
                    {t`Analyzing...`}
                  </>
                ) : (
                  <>
                    <Sparkle size={16} />
                    {t`Analyze`}
                  </>
                )}
              </Button>
            </div>
          </div>

          {isAnalyzing && (
            <div className="py-8 text-center">
              <div className="animate-pulse space-y-2">
                <div className="mx-auto h-4 w-3/4 rounded bg-gray-200"></div>
                <div className="mx-auto h-4 w-1/2 rounded bg-gray-200"></div>
                <div className="mx-auto h-4 w-2/3 rounded bg-gray-200"></div>
              </div>
              <p className="text-muted-foreground mt-4">
                {t`Extracting job details from the posting...`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Extracted Data Section */}
      {extractedData && !isAnalyzing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkle size={20} />
              {t`Extracted Job Details`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>{t`Job Title`}</Label>
                <Input readOnly value={extractedData.title} />
              </div>
              <div>
                <Label>{t`Company`}</Label>
                <Input readOnly value={extractedData.company} />
              </div>
            </div>

            <div>
              <Label>{t`Location`}</Label>
              <Input readOnly value={extractedData.location} />
            </div>

            <div>
              <Label>{t`Job Description`}</Label>
              <RichInput
                readOnly
                content={extractedData.description}
                onChange={() => {}} // Read-only
              />
            </div>

            <div>
              <Label>{t`Requirements`}</Label>
              <div className="mt-2 space-y-2">
                {extractedData.requirements.map((req: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="size-2 shrink-0 rounded-full bg-primary"></div>
                    <span className="text-sm">{req}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>{t`Extracted Tags`}</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {extractedData.extractedTags.map((tag: string) => (
                  <span
                    key={tag}
                    className="rounded-md bg-primary/10 px-2 py-1 text-xs text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button className="flex-1" onClick={handleSave}>
                {t`Create Application`}
              </Button>
              <Button variant="outline" onClick={handleStartOver}>
                {t`Start Over`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
