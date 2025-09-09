import { t } from "@lingui/macro";
import { ArrowLeft, Building, Plus, X } from "@phosphor-icons/react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "@reactive-resume/ui";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";

interface Company {
  id: string;
  name: string;
  description?: string;
  industry?: string;
  size?: string;
  location?: string;
  website?: string;
  logo?: string;
  values?: string;
  mission?: string;
  culture?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  githubUrl?: string;
}

interface FormData {
  name: string;
  description: string;
  industry: string;
  size: string;
  location: string;
  website: string;
  logo: string;
  values: string[];
  mission: string;
  culture: string;
  linkedinUrl: string;
  twitterUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  githubUrl: string;
}

const CompanyEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    industry: "",
    size: "",
    location: "",
    website: "",
    logo: "",
    values: [],
    mission: "",
    culture: "",
    linkedinUrl: "",
    twitterUrl: "",
    facebookUrl: "",
    instagramUrl: "",
    youtubeUrl: "",
    githubUrl: "",
  });

  useEffect(() => {
    if (id) {
      fetchCompany();
    }
  }, [id]);

  const fetchCompany = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/company/${id}`);
      if (response.ok) {
        const data = await response.json();
        setCompany(data);
        
        // Parse values from JSON string
        const values = data.values ? JSON.parse(data.values) : [];
        
        setFormData({
          name: data.name || "",
          description: data.description || "",
          industry: data.industry || "",
          size: data.size || "",
          location: data.location || "",
          website: data.website || "",
          logo: data.logo || "",
          values: values,
          mission: data.mission || "",
          culture: data.culture || "",
          linkedinUrl: data.linkedinUrl || "",
          twitterUrl: data.twitterUrl || "",
          facebookUrl: data.facebookUrl || "",
          instagramUrl: data.instagramUrl || "",
          youtubeUrl: data.youtubeUrl || "",
          githubUrl: data.githubUrl || "",
        });
      } else {
        console.error("Failed to fetch company");
      }
    } catch (error) {
      console.error("Failed to fetch company:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const addValue = () => {
    setFormData(prev => ({
      ...prev,
      values: [...prev.values, ""],
    }));
  };

  const updateValue = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      values: prev.values.map((v, i) => i === index ? value : v),
    }));
  };

  const removeValue = (index: number) => {
    setFormData(prev => ({
      ...prev,
      values: prev.values.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      const updateData = {
        ...formData,
        values: JSON.stringify(formData.values.filter(v => v.trim())), // Only save non-empty values
      };

      const response = await fetch(`/api/company/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        navigate(`/dashboard/companies/${id}`);
      } else {
        console.error("Failed to update company");
      }
    } catch (error) {
      console.error("Failed to update company:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p>{t`Loading company...`}</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <Building className="mx-auto mb-4 size-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">{t`Company not found`}</h3>
          <p className="text-muted-foreground mb-4">{t`The company you're looking for doesn't exist.`}</p>
          <Button onClick={() => navigate("/dashboard/companies")}>
            <ArrowLeft className="mr-2 size-4" />
            {t`Back to Companies`}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/companies/${id}`)}>
            <ArrowLeft className="mr-2 size-4" />
            {t`Back`}
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{t`Edit Company`}</h1>
            <p className="text-muted-foreground">{company.name}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="size-5" />
              {t`Basic Information`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="name">{t`Company Name`} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder={t`e.g. TechCorp Solutions`}
                  required
                />
              </div>
              <div>
                <Label htmlFor="industry">{t`Industry`}</Label>
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => handleInputChange("industry", e.target.value)}
                  placeholder={t`e.g. Technology, Healthcare`}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="size">{t`Company Size`}</Label>
                <Input
                  id="size"
                  value={formData.size}
                  onChange={(e) => handleInputChange("size", e.target.value)}
                  placeholder={t`e.g. 50-200 employees`}
                />
              </div>
              <div>
                <Label htmlFor="location">{t`Location`}</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder={t`e.g. San Francisco, CA`}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">{t`Description`}</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("description", e.target.value)}
                placeholder={t`Brief description of the company`}
                rows={3}
                className="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Website & Logo */}
        <Card>
          <CardHeader>
            <CardTitle>{t`Website & Logo`}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="website">{t`Website URL`}</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                placeholder={t`https://company.com`}
              />
            </div>
            <div>
              <Label htmlFor="logo">{t`Logo URL`}</Label>
              <Input
                id="logo"
                type="url"
                value={formData.logo}
                onChange={(e) => handleInputChange("logo", e.target.value)}
                placeholder={t`https://company.com/logo.png`}
              />
            </div>
          </CardContent>
        </Card>

        {/* Mission & Culture */}
        <Card>
          <CardHeader>
            <CardTitle>{t`Mission & Culture`}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="mission">{t`Mission Statement`}</Label>
              <textarea
                id="mission"
                value={formData.mission}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("mission", e.target.value)}
                placeholder={t`Company's mission and purpose`}
                rows={3}
                className="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div>
              <Label htmlFor="culture">{t`Company Culture`}</Label>
              <textarea
                id="culture"
                value={formData.culture}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("culture", e.target.value)}
                placeholder={t`Description of company culture and values`}
                rows={3}
                className="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Company Values */}
        <Card>
          <CardHeader>
            <CardTitle>{t`Company Values`}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {formData.values.map((value, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={value}
                    onChange={(e) => updateValue(index, e.target.value)}
                    placeholder={t`e.g. Innovation, Integrity, Excellence`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeValue(index)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addValue}>
                <Plus className="mr-2 size-4" />
                {t`Add Value`}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader>
            <CardTitle>{t`Social Media`}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="linkedinUrl">{t`LinkedIn URL`}</Label>
                <Input
                  id="linkedinUrl"
                  type="url"
                  value={formData.linkedinUrl}
                  onChange={(e) => handleInputChange("linkedinUrl", e.target.value)}
                  placeholder={t`https://linkedin.com/company/company-name`}
                />
              </div>
              <div>
                <Label htmlFor="twitterUrl">{t`Twitter URL`}</Label>
                <Input
                  id="twitterUrl"
                  type="url"
                  value={formData.twitterUrl}
                  onChange={(e) => handleInputChange("twitterUrl", e.target.value)}
                  placeholder={t`https://twitter.com/company`}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="facebookUrl">{t`Facebook URL`}</Label>
                <Input
                  id="facebookUrl"
                  type="url"
                  value={formData.facebookUrl}
                  onChange={(e) => handleInputChange("facebookUrl", e.target.value)}
                  placeholder={t`https://facebook.com/company`}
                />
              </div>
              <div>
                <Label htmlFor="instagramUrl">{t`Instagram URL`}</Label>
                <Input
                  id="instagramUrl"
                  type="url"
                  value={formData.instagramUrl}
                  onChange={(e) => handleInputChange("instagramUrl", e.target.value)}
                  placeholder={t`https://instagram.com/company`}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="youtubeUrl">{t`YouTube URL`}</Label>
                <Input
                  id="youtubeUrl"
                  type="url"
                  value={formData.youtubeUrl}
                  onChange={(e) => handleInputChange("youtubeUrl", e.target.value)}
                  placeholder={t`https://youtube.com/@company`}
                />
              </div>
              <div>
                <Label htmlFor="githubUrl">{t`GitHub URL`}</Label>
                <Input
                  id="githubUrl"
                  type="url"
                  value={formData.githubUrl}
                  onChange={(e) => handleInputChange("githubUrl", e.target.value)}
                  placeholder={t`https://github.com/company`}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/dashboard/companies/${id}`)}
          >
            {t`Cancel`}
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? t`Saving...` : t`Save Changes`}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CompanyEditPage; 