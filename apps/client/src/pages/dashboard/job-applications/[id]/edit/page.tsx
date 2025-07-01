import { t } from "@lingui/macro";
import { ArrowLeft, Building, Calendar, FileText, Plus, X } from "@phosphor-icons/react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  RichInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@reactive-resume/ui";
import { cn } from "@reactive-resume/utils";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { useToast } from "@/client/hooks/use-toast";
import { useJobApplication } from "@/client/services/job-application/job-application";
import { useUpdateJobApplication } from "@/client/services/job-application/update";

type FormData = {
  title: string;
  company: string;
  description: string;
  url: string;
  notes: string;
  requirements: string[];
  extractedTags: string[];
  status: string;
  appliedDate: string;
};

const statusOptions = [
  { value: "DRAFT", label: t`Draft`, color: "bg-gray-100 text-gray-800" },
  { value: "APPLIED", label: t`Applied`, color: "bg-blue-100 text-blue-800" },
  {
    value: "INTERVIEW_SCHEDULED",
    label: t`Interview Scheduled`,
    color: "bg-purple-100 text-purple-800",
  },
  { value: "INTERVIEWED", label: t`Interviewed`, color: "bg-yellow-100 text-yellow-800" },
  { value: "OFFER_RECEIVED", label: t`Offer Received`, color: "bg-green-100 text-green-800" },
  { value: "ACCEPTED", label: t`Accepted`, color: "bg-emerald-100 text-emerald-800" },
  { value: "REJECTED", label: t`Rejected`, color: "bg-red-100 text-red-800" },
  { value: "WITHDRAWN", label: t`Withdrawn`, color: "bg-gray-100 text-gray-800" },
];

export const JobApplicationEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { jobApplication, loading } = useJobApplication(id!);
  const { updateJobApplication, loading: isUpdating } = useUpdateJobApplication();

  const [formData, setFormData] = useState<FormData>({
    title: "",
    company: "",
    description: "",
    url: "",
    notes: "",
    requirements: [""],
    extractedTags: [],
    status: "DRAFT",
    appliedDate: "",
  });

  // Load data when job application is fetched
  useEffect(() => {
    if (jobApplication) {
      setFormData({
        title: jobApplication.title || "",
        company: jobApplication.company || "",
        description: jobApplication.description || "",
        url: jobApplication.url || "",
        notes: jobApplication.notes || "",
        requirements: jobApplication.requirements.length > 0 ? jobApplication.requirements : [""],
        extractedTags: jobApplication.extractedTags || [],
        status: jobApplication.status || "DRAFT",
        appliedDate: jobApplication.appliedDate
          ? new Date(jobApplication.appliedDate).toISOString().split("T")[0]
          : "",
      });
    }
  }, [jobApplication]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      };

      // Auto-set applied date when status changes to APPLIED
      if (field === "status" && value === "APPLIED" && !prev.appliedDate) {
        newData.appliedDate = new Date().toISOString().split("T")[0];
      }

      return newData;
    });
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

  const handleTagChange = (index: number, value: string) => {
    const newTags = [...formData.extractedTags];
    newTags[index] = value;
    setFormData((prev) => ({
      ...prev,
      extractedTags: newTags,
    }));
  };

  const addTag = () => {
    setFormData((prev) => ({
      ...prev,
      extractedTags: [...prev.extractedTags, ""],
    }));
  };

  const removeTag = (index: number) => {
    const newTags = formData.extractedTags.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      extractedTags: newTags,
    }));
  };

  const handleSave = async () => {
    if (!id) return;

    try {
      await updateJobApplication({
        id,
        data: {
          title: formData.title,
          company: formData.company,
          description: formData.description,
          url: formData.url || undefined,
          notes: formData.notes || undefined,
          requirements: formData.requirements.filter((req) => req.trim()),
          extractedTags: formData.extractedTags,
          status: formData.status as any,
          appliedDate: formData.appliedDate || undefined,
        },
      });

      toast({
        title: t`Success`,
        description: t`Job application updated successfully`,
      });

      navigate(`/dashboard/job-applications/${id}`);
    } catch {
      toast({
        variant: "error",
        title: t`Error`,
        description: t`Failed to update job application. Please try again.`,
      });
    }
  };

  const handleCancel = () => {
    navigate(`/dashboard/job-applications/${id}`);
  };

  const isFormValid = formData.title.trim() && formData.company.trim();

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p>{t`Loading job application...`}</p>
        </div>
      </div>
    );
  }

  if (!jobApplication) {
    return (
      <div className="py-8 text-center">
        <p className="mb-4 text-red-600">{t`Job application not found`}</p>
        <Button onClick={() => navigate("/dashboard/job-applications")}>
          {t`Back to Job Applications`}
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={handleCancel}>
          <ArrowLeft size={16} />
        </Button>
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{t`Edit Job Application`}</h1>
            {jobApplication && (
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs",
                  statusOptions.find((opt) => opt.value === jobApplication.status)?.color,
                )}
              >
                {statusOptions.find((opt) => opt.value === jobApplication.status)?.label ||
                  jobApplication.status}
              </Badge>
            )}
          </div>
          <div className="text-muted-foreground flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Building size={16} />
              <span>{jobApplication.company}</span>
            </div>
            {jobApplication.appliedDate && (
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>
                  {t`Applied`}: {new Date(jobApplication.appliedDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Form */}
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

          {/* Status and Applied Date */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>{t`Application Status`}</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => {
                  handleInputChange("status", value);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={cn("text-xs", option.color)}>
                          {option.label}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="appliedDate">{t`Applied Date`}</Label>
              <Input
                id="appliedDate"
                type="date"
                value={formData.appliedDate}
                onChange={(e) => {
                  handleInputChange("appliedDate", e.target.value);
                }}
              />
              <p className="text-muted-foreground mt-1 text-xs">
                {t`Leave empty if not yet applied`}
              </p>
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
            <p className="text-muted-foreground mb-2 text-sm">
              {t`List the key requirements for this position to help with resume optimization`}
            </p>
            <div className="space-y-3">
              {formData.requirements.map((requirement, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={requirement}
                    placeholder={t`e.g. 5+ years of React experience, Bachelor's degree, etc.`}
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

          {/* Extracted Tags */}
          <div>
            <Label>{t`Tags/Skills`}</Label>
            <p className="text-muted-foreground mb-2 text-sm">
              {t`Add relevant tags or skills extracted from the job posting`}
            </p>
            <div className="space-y-3">
              {formData.extractedTags.length > 0 ? (
                formData.extractedTags.map((tag, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={tag}
                      placeholder={t`e.g. React, TypeScript, AWS, etc.`}
                      onChange={(e) => {
                        handleTagChange(index, e.target.value);
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        removeTag(index);
                      }}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm italic">{t`No tags added yet`}</p>
              )}
              <Button type="button" variant="outline" className="gap-2" onClick={addTag}>
                <Plus size={16} />
                {t`Add Tag`}
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
          <div className="space-y-4 pt-4">
            {!isFormValid && (
              <div className="flex items-center gap-2 rounded-md bg-amber-50 p-3 text-sm text-amber-600">
                <X size={16} />
                {t`Please fill in the required fields: Job Title and Company`}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                disabled={isUpdating}
                className="flex-1"
                onClick={handleCancel}
              >
                {t`Cancel`}
              </Button>
              <Button disabled={!isFormValid || isUpdating} className="flex-1" onClick={handleSave}>
                {isUpdating ? (
                  <>
                    <div className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    {t`Saving Changes...`}
                  </>
                ) : (
                  t`Save Changes`
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
