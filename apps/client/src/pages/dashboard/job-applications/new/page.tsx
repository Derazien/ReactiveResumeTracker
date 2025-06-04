import { t } from "@lingui/macro";
import { ArrowLeft, FileText, Link as LinkIcon } from "@phosphor-icons/react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@reactive-resume/ui";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router";

import { JobUrlForm } from "./_components/job-url-form";
import { ManualJobForm } from "./_components/manual-job-form";

type InputMethod = "url" | "manual" | null;

export const NewJobApplicationPage = () => {
  const [inputMethod, setInputMethod] = useState<InputMethod>(null);
  const navigate = useNavigate();

  const handleMethodSelect = (method: InputMethod) => {
    setInputMethod(method);
  };

  const handleBack = () => {
    if (inputMethod) {
      setInputMethod(null);
    } else {
      navigate("/dashboard/job-applications");
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={handleBack}>
          <ArrowLeft size={16} />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t`New Job Application`}</h1>
          <p className="text-muted-foreground">
            {inputMethod === null
              ? t`Choose how you'd like to add the job details`
              : inputMethod === "url"
                ? t`Paste the job posting URL and we'll extract the details`
                : t`Enter the job details manually`}
          </p>
        </div>
      </div>

      {/* Method Selection or Form */}
      {inputMethod === null ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-6 md:grid-cols-2"
        >
          {/* URL Method */}
          <Card
            className="cursor-pointer transition-colors hover:bg-secondary/50"
            onClick={() => {
              handleMethodSelect("url");
            }}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                <LinkIcon size={24} className="text-primary" />
              </div>
              <CardTitle>{t`Paste Job URL`}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                {t`Simply paste a link to the job posting and we'll automatically extract the job title, company, requirements, and description.`}
              </p>
              <div className="text-muted-foreground mt-4 text-sm">
                {t`Supports LinkedIn, Indeed, Glassdoor, and more`}
              </div>
            </CardContent>
          </Card>

          {/* Manual Method */}
          <Card
            className="cursor-pointer transition-colors hover:bg-secondary/50"
            onClick={() => {
              handleMethodSelect("manual");
            }}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                <FileText size={24} className="text-primary" />
              </div>
              <CardTitle>{t`Enter Manually`}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                {t`Fill out the job details manually if you don't have a URL or prefer to enter the information yourself.`}
              </p>
              <div className="text-muted-foreground mt-4 text-sm">
                {t`Perfect for referrals or offline opportunities`}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : inputMethod === "url" ? (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <JobUrlForm />
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <ManualJobForm />
        </motion.div>
      )}
    </div>
  );
};
