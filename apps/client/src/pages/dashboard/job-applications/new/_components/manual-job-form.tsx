import { t } from "@lingui/macro";
import { FileTextIcon, PlusIcon, XIcon } from "@phosphor-icons/react";
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
import { useCreateCompany, type Company } from "@/client/services/company";
import { CompanyAutocomplete } from "@/client/components/company-autocomplete";

type FormData = {
  title: string;
  company: string;
  companyId?: string;
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
    companyId: undefined,
    location: "",
    url: "",
    description: "",
    requirements: [""],
    notes: "",
  });

  const navigate = useNavigate();
  const { toast } = useToast();
  const { createJobApplication, loading: isCreating } = useCreateJobApplication();
  const { createCompany, loading: isCreatingCompany } = useCreateCompany();

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle company selection from autocomplete
  const handleCompanySelect = (company: Company | null) => {
    if (company) {
      setFormData((prev) => ({
        ...prev,
        company: company.name,
        companyId: company.id,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        company: "",
        companyId: undefined,
      }));
    }
  };

  // Handle creating new company
  const handleCreateNewCompany = async (companyName: string) => {
    try {
      const newCompany = await createCompany({
        name: companyName,
        description: t`Company created from job application`,
        values: "[]",
      });

      setFormData((prev) => ({
        ...prev,
        company: newCompany.name,
        companyId: newCompany.id,
      }));

      toast({
        title: t`Company Created`,
        description: t`${companyName} has been created and will be researched automatically.`,
      });
    } catch {
      toast({
        variant: "error",
        title: t`Error`,
        description: t`Failed to create company. Please try again.`,
      });
    }
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
        companyName: formData.company,
        companyId: formData.companyId,
        description: formData.description,
        url: formData.url,
        notes: formData.notes,
        requirements: formData.requirements.filter((req) => req.trim()),
        extractedTags: [], // Initialize as empty array for now
        status: "DRAFT", // Default status for new applications
      });

      toast({
        title: t`Success`,
        description: t`Job application created successfully`,
      });

      void navigate("/dashboard/job-applications");
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
          <FileTextIcon size={20} />
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
            <CompanyAutocomplete
              value={formData.company}
              placeholder={t`Search or create company...`}
              disabled={isCreatingCompany}
              onSelect={handleCompanySelect}
              onCreateNew={handleCreateNewCompany}
            />
            {isCreatingCompany && (
              <p className="mt-1 text-sm text-muted-foreground">
                {t`Creating company and researching details...`}
              </p>
            )}
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
                  <XIcon size={16} />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" className="gap-2" onClick={addRequirement}>
              <PlusIcon size={16} />
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
          <Button
            disabled={!isFormValid || isCreating || isCreatingCompany}
            className="flex-1"
            onClick={handleSave}
          >
            {isCreating ? t`Creating...` : t`Create Application`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
