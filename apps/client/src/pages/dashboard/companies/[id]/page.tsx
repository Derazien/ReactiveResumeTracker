import { t } from "@lingui/macro";
import { ArrowLeft, Building, ArrowSquareOut, MapPin, Users, Globe, LinkedinLogo, TwitterLogo, FacebookLogo, InstagramLogo, YoutubeLogo, GithubLogo, MagnifyingGlass, Trash, Warning } from "@phosphor-icons/react";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Separator } from "@reactive-resume/ui";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@reactive-resume/ui";
import { useState } from "react";
import { useParams, useNavigate } from "react-router";

import { useToast } from "@/client/hooks/use-toast";
import { 
  useDeleteCompany, 
  useCompany, 
  useResearchCompany, 
  type Company, 
  type ResearchResult 
} from "@/client/services/company";

const CompanyDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { deleteCompany, loading: isDeleting } = useDeleteCompany();
  const { researchCompany, loading: researching } = useResearchCompany();
  
  const { data: company, isLoading: loading } = useCompany(id || "");
  const [researchResult, setResearchResult] = useState<ResearchResult | null>(null);

  const performResearch = async (strategy: "basic" | "comprehensive" | "deep" = "comprehensive") => {
    if (!id) return;

    try {
      const result = await researchCompany({ id, options: { strategy } });
      setResearchResult(result);
      
      toast({
        title: t`Research Complete`,
        description: t`Company information has been updated with the latest research.`,
      });
    } catch (error) {
      console.error("Research error:", error);
      toast({
        title: t`Research Failed`,
        description: error instanceof Error ? error.message : t`Manual input may be required.`,
      });
    }
  };

  const handleDeleteCompany = async () => {
    if (!company || !id) return;

    try {
      await deleteCompany(id);
      
      toast({
        title: t`Success`,
        description: t`Company deleted successfully`,
      });

      // Navigate back to companies list
      navigate("/dashboard/companies");
    } catch {
      toast({
        variant: "error",
        title: t`Error`,
        description: t`Failed to delete company. Please try again.`,
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const parseValues = (valuesString?: string) => {
    if (!valuesString) return [];
    try {
      return JSON.parse(valuesString);
    } catch {
      return [];
    }
  };

  const getConfidenceColor = (confidence: "high" | "medium" | "low") => {
    switch (confidence) {
      case "high":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const socialLinks = [
    { url: company?.linkedinUrl, icon: LinkedinLogo, label: "LinkedIn" },
    { url: company?.twitterUrl, icon: TwitterLogo, label: "Twitter" },
    { url: company?.facebookUrl, icon: FacebookLogo, label: "Facebook" },
    { url: company?.instagramUrl, icon: InstagramLogo, label: "Instagram" },
    { url: company?.youtubeUrl, icon: YoutubeLogo, label: "YouTube" },
    { url: company?.githubUrl, icon: GithubLogo, label: "GitHub" },
  ].filter(link => link.url);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p>{t`Loading company details...`}</p>
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
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/companies")}>
            <ArrowLeft className="mr-2 size-4" />
            {t`Back`}
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{company.name}</h1>
            <p className="text-muted-foreground">{t`Company Details`}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => performResearch("comprehensive")}
            disabled={researching}
          >
            <MagnifyingGlass className="mr-2 size-4" />
            {researching ? t`Researching...` : t`Research Company`}
          </Button>
          <Button variant="outline" onClick={() => navigate(`/dashboard/companies/${id}/edit`)}>
            {t`Edit Company`}
          </Button>
          <Button onClick={() => navigate(`/dashboard/job-applications/new?company=${company.id}`)}>
            {t`Add Job Application`}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="error">
                <Trash className="mr-2 size-4" />
                {t`Delete Company`}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <Warning size={20} className="text-red-500" />
                  {t`Delete Company`}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t`Are you sure you want to delete "${company?.name}"? This action cannot be undone.`}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t`Cancel`}</AlertDialogCancel>
                <AlertDialogAction
                  disabled={isDeleting}
                  className="bg-red-600 text-white hover:bg-red-700"
                  onClick={handleDeleteCompany}
                >
                  {isDeleting ? t`Deleting...` : t`Delete`}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Research Results */}
      {researchResult && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <MagnifyingGlass className="size-5" />
              {t`Research Completed`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Badge className={getConfidenceColor(researchResult.metadata.confidence)}>
                {t`Confidence: ${researchResult.metadata.confidence}`}
              </Badge>
              <Badge variant="secondary">
                {t`Strategy: ${researchResult.metadata.strategy}`}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {t`Updated: ${formatDate(researchResult.metadata.lastUpdated)}`}
              </span>
            </div>
            {researchResult.metadata.sources.length > 0 && (
              <div>
                <h4 className="mb-2 font-semibold">{t`Sources:`}</h4>
                <div className="flex flex-wrap gap-2">
                  {researchResult.metadata.sources.map((source: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {source}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="size-5" />
                {t`Company Overview`}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                {company.logo ? (
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="size-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="bg-muted flex size-16 items-center justify-center rounded-lg">
                    <Building className="size-8" />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <h2 className="text-xl font-semibold">{company.name}</h2>
                  <div className="flex flex-wrap gap-2">
                    {company.industry && (
                      <Badge variant="secondary">{company.industry}</Badge>
                    )}
                    {company.size && (
                      <Badge variant="secondary" outline className="flex items-center gap-1">
                        <Users className="size-3" />
                        {company.size}
                      </Badge>
                    )}
                    {company.location && (
                      <Badge variant="secondary" outline className="flex items-center gap-1">
                        <MapPin className="size-3" />
                        {company.location}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {company.description && (
                <div>
                  <h3 className="mb-2 font-semibold">{t`Description`}</h3>
                  <p className="text-muted-foreground">{company.description}</p>
                </div>
              )}

              {company.website && (
                <div>
                  <h3 className="mb-2 font-semibold">{t`Website`}</h3>
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    {company.website}
                    <ArrowSquareOut className="size-3" />
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mission & Culture */}
          {(company.mission || company.culture) && (
            <Card>
              <CardHeader>
                <CardTitle>{t`Mission & Culture`}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {company.mission && (
                  <div>
                    <h3 className="mb-2 font-semibold">{t`Mission`}</h3>
                    <p className="text-muted-foreground">{company.mission}</p>
                  </div>
                )}
                {company.culture && (
                  <div>
                    <h3 className="mb-2 font-semibold">{t`Culture`}</h3>
                    <p className="text-muted-foreground">{company.culture}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Company Values */}
          {company.values && parseValues(company.values).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t`Company Values`}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {parseValues(company.values).map((value: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {value}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>{t`Quick Stats`}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t`Job Applications`}</span>
                <span className="font-semibold">{company._count?.jobApplications || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t`Contacts`}</span>
                <span className="font-semibold">{company._count?.contacts || 0}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t`Created`}</span>
                <span className="text-sm">{formatDate(company.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t`Updated`}</span>
                <span className="text-sm">{formatDate(company.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          {socialLinks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t`Social Media`}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {socialLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <link.icon className="size-4" />
                      <span className="text-sm">{link.label}</span>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyDetailPage; 