import { t } from "@lingui/macro";
import { FileText, Plus, X } from "@phosphor-icons/react";
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
import { useCreateJobApplication } from "@/client/services/job-application/create";

type FormData = {
  title: string;
  company: string;
  location: string;
  url: string;
  description: string;
  requirements: string[];
  notes: string;
};

export const ManualJobForm = () => {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    company: "",
    location: "",
    url: "",
    description: "",
    requirements: [""],
    notes: "",
  });

  const navigate = useNavigate();
  const { toast } = useToast();
  const { createJobApplication, loading: isCreating } = useCreateJobApplication();

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRequirementChange = (index: number, value: string) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = value;
    setFormData((prev) => ({
      ...prev,
      requirements: newRequirements,
    }));
  };

  const addRequirement = () => {
    setFormData((prev) => ({
      ...prev,
      requirements: [...prev.requirements, ""],
    }));
  };

  const removeRequirement = (index: number) => {
    if (formData.requirements.length > 1) {
      const newRequirements = formData.requirements.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        requirements: newRequirements,
      }));
    }
  };

  const handleSave = async () => {
    try {
      await createJobApplication({
        title: formData.title,
        company: formData.company,
        description: formData.description,
        url: formData.url,
        notes: formData.notes,
      });

      toast({
        title: t`Success`,
        description: t`Job application created successfully`,
      });

      navigate("/dashboard/job-applications");
    } catch {
      toast({
        variant: "error",
        title: t`Error`,
        description: t`Failed to create job application. Please try again.`,
      });
    }
  };

  const isFormValid = formData.title.trim() && formData.company.trim();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText size={20} />
          {t`Job Details`}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="title">{t`Job Title`} *</Label>
            <Input
              id="title"
              value={formData.title}
              placeholder={t`e.g. Senior Frontend Developer`}
              onChange={(e) => {
                handleInputChange("title", e.target.value);
              }}
            />
          </div>
          <div>
            <Label htmlFor="company">{t`Company`} *</Label>
            <Input
              id="company"
              value={formData.company}
              placeholder={t`e.g. TechCorp Inc.`}
              onChange={(e) => {
                handleInputChange("company", e.target.value);
              }}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="location">{t`Location`}</Label>
            <Input
              id="location"
              value={formData.location}
              placeholder={t`e.g. San Francisco, CA`}
              onChange={(e) => {
                handleInputChange("location", e.target.value);
              }}
            />
          </div>
          <div>
            <Label htmlFor="url">{t`Job Posting URL`}</Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              placeholder={t`https://company.com/careers/job-123`}
              onChange={(e) => {
                handleInputChange("url", e.target.value);
              }}
            />
          </div>
        </div>

        {/* Job Description */}
        <div>
          <Label>{t`Job Description`}</Label>
          <RichInput
            content={formData.description}
            placeholder={t`Paste or write the job description here...`}
            onChange={(value) => {
              handleInputChange("description", value);
            }}
          />
        </div>

        {/* Requirements */}
        <div>
          <Label>{t`Requirements`}</Label>
          <div className="mt-2 space-y-3">
            {formData.requirements.map((requirement, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={requirement}
                  placeholder={t`e.g. 5+ years of React experience`}
                  onChange={(e) => {
                    handleRequirementChange(index, e.target.value);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={formData.requirements.length === 1}
                  onClick={() => {
                    removeRequirement(index);
                  }}
                >
                  <X size={16} />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" className="gap-2" onClick={addRequirement}>
              <Plus size={16} />
              {t`Add Requirement`}
            </Button>
          </div>
        </div>

        {/* Notes */}
        <div>
          <Label>{t`Personal Notes`}</Label>
          <RichInput
            content={formData.notes}
            placeholder={t`Add any personal notes about this opportunity...`}
            onChange={(value) => {
              handleInputChange("notes", value);
            }}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button disabled={!isFormValid || isCreating} className="flex-1" onClick={handleSave}>
            {isCreating ? t`Creating...` : t`Create Application`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
