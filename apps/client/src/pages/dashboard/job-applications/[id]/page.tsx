import { t } from "@lingui/macro";
import {
  ArrowLeft,
  Building,
  Calendar,
  Eye,
  FileText,
  MapPin,
  Pencil,
  Plus,
  Sparkle,
  Target,
  Trash,
  Users,
  Warning,
} from "@phosphor-icons/react";
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
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@reactive-resume/ui";
import { cn } from "@reactive-resume/utils";
import { MessageSquare } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

import { useToast } from "@/client/hooks/use-toast";
import { useDeleteJobApplication } from "@/client/services/job-application/delete";
import { useGenerateTailoredResume } from "@/client/services/job-application/generate-resume";
import { useJobApplication } from "@/client/services/job-application/job-application";
import {
  useGenerateCoverLetter,
  useDeleteCoverLetter,
} from "@/client/services/cover-letter/cover-letter";
import { useDeleteResume } from "@/client/services/resume/delete";

const getStatusColor = (status: string) => {
  switch (status) {
    case "DRAFT": {
      return "bg-gray-100 text-gray-800";
    }
    case "APPLIED": {
      return "bg-blue-100 text-blue-800";
    }
    case "INTERVIEW_SCHEDULED": {
      return "bg-purple-100 text-purple-800";
    }
    case "INTERVIEWED": {
      return "bg-yellow-100 text-yellow-800";
    }
    case "OFFER_RECEIVED": {
      return "bg-green-100 text-green-800";
    }
    case "ACCEPTED": {
      return "bg-emerald-100 text-emerald-800";
    }
    case "REJECTED": {
      return "bg-red-100 text-red-800";
    }
    case "WITHDRAWN": {
      return "bg-gray-100 text-gray-800";
    }
    default: {
      return "bg-gray-100 text-gray-800";
    }
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "DRAFT": {
      return t`Draft`;
    }
    case "APPLIED": {
      return t`Applied`;
    }
    case "INTERVIEW_SCHEDULED": {
      return t`Interview Scheduled`;
    }
    case "INTERVIEWED": {
      return t`Interviewed`;
    }
    case "OFFER_RECEIVED": {
      return t`Offer Received`;
    }
    case "ACCEPTED": {
      return t`Accepted`;
    }
    case "REJECTED": {
      return t`Rejected`;
    }
    case "WITHDRAWN": {
      return t`Withdrawn`;
    }
    default: {
      return status;
    }
  }
};

export const JobApplicationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isGeneratingCV, setIsGeneratingCV] = useState(false);

  const { jobApplication, loading, error } = useJobApplication(id!);

  const { deleteJobApplication, loading: isDeleting } = useDeleteJobApplication();
  const { generateTailoredResume, loading: isGeneratingResume } = useGenerateTailoredResume();
  const { generateCoverLetter, loading: isGeneratingCoverLetter } = useGenerateCoverLetter();
  const { deleteCoverLetter, loading: isDeletingCoverLetter } = useDeleteCoverLetter();
  const { deleteResume, loading: isDeletingResume } = useDeleteResume();
  const [isConductingInterview, setIsConductingInterview] = useState(false);
  const [isAnalyzingCompany, setIsAnalyzingCompany] = useState(false);

  const handleGenerateCV = async () => {
    if (!id) return;

    setIsGeneratingCV(true);

    try {
      const result = await generateTailoredResume({
        jobApplicationId: id,
        data: {}, // Let the backend auto-select the best content
      });

      toast({
        title: t`CV Generated Successfully`,
        description: t`A tailored CV has been created with ${result.selectedContent.length} relevant content pieces. Opening resume builder...`,
      });

      // Show suggestions to the user
      if (result.suggestions.length > 0) {
        console.log("Resume generation suggestions:", result.suggestions);
      }

      // Navigate directly to the resume builder for editing
      void navigate(`/builder/${result.resume.id}`);
    } catch (error: any) {
      toast({
        variant: "error",
        title: t`Error`,
        description: error?.message || t`Failed to generate CV. Please try again.`,
      });
    } finally {
      setIsGeneratingCV(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      await deleteJobApplication(id);

      toast({
        title: t`Success`,
        description: t`Job application deleted successfully`,
      });

      void navigate("/dashboard/job-applications");
    } catch {
      toast({
        variant: "error",
        title: t`Error`,
        description: t`Failed to delete job application. Please try again.`,
      });
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!id) return;

    try {
      // Generate tailored cover letter using the proper service
      const result = await generateCoverLetter({
        jobApplicationId: id,
        templateName: "professional",
        tone: "professional",
        maxParagraphs: 3,
      });

      toast({
        title: t`Cover Letter Generated Successfully`,
        description: t`Created tailored cover letter with ${result.usedContent?.length || 0} relevant stories. Opening editor...`,
      });

      // Navigate to cover letter builder with the generated cover letter ID
      void navigate(`/cover-letter-builder/${result.coverLetter.id}`);
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : t`Unknown error occurred`;
      
      toast({
        variant: "error",
        title: t`Cover Letter Generation Failed`,
        description: errorMessage.includes("No relevant cover letter content found") 
          ? t`Please add cover letter stories to your content library first`
          : errorMessage,
      });
      
      console.error("Cover Letter Generation Error:", error);
    }
  };

  const handleDeleteCoverLetter = async (coverLetterId: string) => {
    try {
      await deleteCoverLetter({ id: coverLetterId });
      
      toast({
        title: t`Cover Letter Deleted`,
        description: t`The cover letter has been successfully deleted.`,
      });
      
      // Refresh job application data
      window.location.reload();
    } catch (error) {
      console.error("Error deleting cover letter:", error);
      toast({
        title: t`Delete Failed`,
        description: t`Failed to delete cover letter. Please try again.`,
        variant: "error",
      });
    }
  };

  const handleDeleteResume = async (resumeId: string) => {
    try {
      await deleteResume({ id: resumeId });
      
      toast({
        title: t`Resume Deleted`,
        description: t`The resume has been successfully deleted.`,
      });
      
      // Refresh job application data
      window.location.reload();
    } catch (error) {
      console.error("Error deleting resume:", error);
      toast({
        title: t`Delete Failed`,
        description: t`Failed to delete resume. Please try again.`,
        variant: "error",
      });
    }
  };

  const handleConductInterview = async () => {
    if (!id) return;

    setIsConductingInterview(true);

    try {
      // Navigate to cover letter builder with interview mode
      navigate(`/cover-letter-builder/${id}`);

      toast({
        title: t`Interview Mode`,
        description: t`Opening interview mode to extract your stories...`,
      });
    } catch (error: any) {
      toast({
        variant: "error",
        title: t`Error`,
        description: error?.message || t`Failed to start interview. Please try again.`,
      });
    } finally {
      setIsConductingInterview(false);
    }
  };

  const handleAnalyzeCompany = async () => {
    if (!id) return;

    setIsAnalyzingCompany(true);

    try {
      // TODO: Implement company analysis API call
      toast({
        title: t`Company Analysis`,
        description: t`Analyzing company information...`,
      });
    } catch (error: any) {
      toast({
        variant: "error",
        title: t`Error`,
        description: error?.message || t`Failed to analyze company. Please try again.`,
      });
    } finally {
      setIsAnalyzingCompany(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

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

  if (error || !jobApplication) {
    return (
      <div className="py-8 text-center">
        <p className="mb-4 text-red-600">{t`Failed to load job application`}</p>
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
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/dashboard/job-applications")}
        >
          <ArrowLeft size={16} />
        </Button>
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{jobApplication.title}</h1>
            <Badge
              variant="secondary"
              className={cn("text-xs", getStatusColor(jobApplication.status))}
            >
              {getStatusLabel(jobApplication.status)}
            </Badge>
          </div>
          <div className="text-muted-foreground flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Building size={16} />
              <span>{jobApplication.companyName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              <span>
                {t`Created`}: {formatDate(jobApplication.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to={`/dashboard/job-applications/${jobApplication.id}/edit`}>
              <Pencil size={16} className="mr-2" />
              {t`Edit`}
            </Link>
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={isDeleting}>
                <Trash size={16} className="mr-2" />
                {isDeleting ? t`Deleting...` : t`Delete`}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <Warning size={20} className="text-red-500" />
                  {t`Delete Job Application`}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t`Are you sure you want to delete "${jobApplication.title}" at ${jobApplication.companyName}? This action cannot be undone and will permanently remove:`}
                  <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
                    <li>{t`Job application details and notes`}</li>
                    <li>{t`Generated resumes and cover letters`}</li>
                    <li>{t`Interview questions and preparation materials`}</li>
                    <li>{t`All analysis and content matching data`}</li>
                  </ul>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t`Cancel`}</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
                  onClick={handleDelete}
                >
                  {t`Delete Permanently`}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Job Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Job Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText size={20} />
                {t`Job Details`}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {jobApplication.url && (
                <div>
                  <label className="text-sm font-medium">{t`Job Posting URL`}</label>
                  <div className="mt-1">
                    <a
                      href={jobApplication.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-primary hover:underline"
                    >
                      {jobApplication.url}
                    </a>
                  </div>
                </div>
              )}

              {jobApplication.description && (
                <div>
                  <label className="text-sm font-medium">{t`Description`}</label>
                  <div className="bg-muted/30 mt-1 rounded-md border p-3">
                    <div
                      dangerouslySetInnerHTML={{ __html: jobApplication.description }}
                      className="prose prose-sm max-w-none"
                    />
                  </div>
                </div>
              )}

              {jobApplication.requirements && jobApplication.requirements.length > 0 && (
                <div>
                  <label className="text-sm font-medium">{t`Requirements`}</label>
                  <div className="mt-2 space-y-2">
                    {jobApplication.requirements.map((req: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="size-2 shrink-0 rounded-full bg-primary"></div>
                        <span className="text-sm">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {jobApplication.extractedTags && jobApplication.extractedTags.length > 0 && (
                <div>
                  <label className="text-sm font-medium">{t`Tags`}</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {jobApplication.extractedTags.map((tag: string, index: number) => (
                      <div
                        key={index}
                        className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                      >
                        {tag}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {jobApplication.notes && (
                <div>
                  <label className="text-sm font-medium">{t`Personal Notes`}</label>
                  <div className="bg-muted/30 mt-1 rounded-md border p-3">
                    <div
                      dangerouslySetInnerHTML={{ __html: jobApplication.notes }}
                      className="prose prose-sm max-w-none"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* CV Generation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkle size={20} />
                {t`Generate CV`}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">
                {t`Create a tailored CV for this job application using your content library and AI optimization.`}
              </p>

              <Button
                className="w-full gap-2"
                disabled={isGeneratingCV || isGeneratingResume}
                onClick={handleGenerateCV}
              >
                {isGeneratingCV || isGeneratingResume ? (
                  <>
                    <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    {t`Generating...`}
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    {t`Generate Tailored CV`}
                  </>
                )}
              </Button>

              {/* Show existing generated resumes */}
              {jobApplication.resumes && jobApplication.resumes.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">{t`Generated Resumes`}</div>
                  {jobApplication.resumes.map((resume) => (
                    <Button
                      key={resume.id}
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full justify-start gap-2"
                    >
                      <Link to={`/builder/${resume.id}`}>
                        <FileText size={14} />
                        {resume.title}
                      </Link>
                    </Button>
                  ))}
                </div>
              )}

              <div className="text-muted-foreground text-xs">
                {t`This will analyze your content library and create a CV optimized for this specific role.`}
              </div>
            </CardContent>
          </Card>

          {/* Cover Letter Generation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare size={20} />
                {t`Cover Letter`}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">
                {t`Create a tailored cover letter for this job application using AI-powered story extraction and company analysis.`}
              </p>

              <div className="space-y-2">
                <Button
                  className="w-full gap-2"
                  disabled={isGeneratingCoverLetter}
                  onClick={handleGenerateCoverLetter}
                >
                  {isGeneratingCoverLetter ? (
                    <>
                      <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      {t`Generating...`}
                    </>
                  ) : (
                    <>
                      <MessageSquare size={16} />
                      {t`Generate Tailored Cover Letter`}
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="w-full gap-2"
                  disabled={isConductingInterview}
                  onClick={handleConductInterview}
                >
                  {isConductingInterview ? (
                    <>
                      <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      {t`Starting...`}
                    </>
                  ) : (
                    <>
                      <Target size={16} />
                      {t`Conduct Interview`}
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="w-full gap-2"
                  disabled={isAnalyzingCompany}
                  onClick={handleAnalyzeCompany}
                >
                  {isAnalyzingCompany ? (
                    <>
                      <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      {t`Analyzing...`}
                    </>
                  ) : (
                    <>
                      <Building size={16} />
                      {t`Analyze Company`}
                    </>
                  )}
                </Button>
              </div>

              {/* Show existing generated cover letters */}
              {jobApplication.coverLetters && jobApplication.coverLetters.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">{t`Generated Cover Letters`}</div>
                  {jobApplication.coverLetters.map((coverLetter) => (
                    <Button
                      key={coverLetter.id}
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full justify-start gap-2"
                    >
                      <Link to={`/cover-letter-builder/${coverLetter.id}`}>
                        <MessageSquare size={14} />
                        {t`Cover Letter`} - {new Date(coverLetter.createdAt).toLocaleDateString()}
                      </Link>
                    </Button>
                  ))}
                </div>
              )}

              <div className="text-muted-foreground text-xs">
                {t`Use the cover letter builder to create personalized cover letters with AI-powered story extraction and company analysis.`}
              </div>
            </CardContent>
          </Card>

          {/* Application Status */}
          <Card>
            <CardHeader>
              <CardTitle>{t`Application Status`}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">{t`Current Status`}</span>
                <Badge
                  variant="secondary"
                  className={cn("text-xs", getStatusColor(jobApplication.status))}
                >
                  {getStatusLabel(jobApplication.status)}
                </Badge>
              </div>

              {jobApplication.appliedDate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t`Applied Date`}</span>
                  <span className="text-muted-foreground text-sm">
                    {formatDate(jobApplication.appliedDate)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm">{t`Created`}</span>
                <span className="text-muted-foreground text-sm">
                  {formatDate(jobApplication.createdAt)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">{t`Last Updated`}</span>
                <span className="text-muted-foreground text-sm">
                  {formatDate(jobApplication.updatedAt)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Company & Contacts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building size={20} />
                {t`Company & Contacts`}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">{t`Company`}</label>
                  <div className="mt-1 text-sm">
                    {jobApplication.companyName || t`No company information`}
                  </div>
                </div>

                {jobApplication.location && (
                  <div>
                    <label className="text-sm font-medium">{t`Location`}</label>
                    <div className="mt-1 text-sm">{jobApplication.location}</div>
                  </div>
                )}

                {jobApplication.salary && (
                  <div>
                    <label className="text-sm font-medium">{t`Salary`}</label>
                    <div className="mt-1 text-sm">{jobApplication.salary}</div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  disabled={isAnalyzingCompany}
                  onClick={handleAnalyzeCompany}
                >
                  {isAnalyzingCompany ? (
                    <>
                      <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      {t`Analyzing...`}
                    </>
                  ) : (
                    <>
                      <Target size={16} />
                      {t`Analyze Company`}
                    </>
                  )}
                </Button>

                <Button variant="outline" className="w-full gap-2">
                  <Users size={16} />
                  {t`Manage Contacts`}
                </Button>
              </div>

              <div className="text-muted-foreground text-xs">
                {t`Analyze company information and manage contacts for networking.`}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{t`Quick Actions`}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full gap-2">
                <Link to="/dashboard/content-library">
                  <Eye size={16} />
                  {t`View Content Library`}
                </Link>
              </Button>

              <Button
                variant="outline"
                className="w-full gap-2"
                disabled={isGeneratingResume}
                onClick={handleGenerateCV}
              >
                <FileText size={16} />
                {isGeneratingResume ? t`Generating...` : t`Generate Tailored Resume`}
              </Button>

              <Button
                variant="outline"
                className="w-full gap-2"
                disabled={isGeneratingCoverLetter}
                onClick={handleGenerateCoverLetter}
              >
                <MessageSquare size={16} />
                {isGeneratingCoverLetter ? t`Generating...` : t`Generate Tailored Cover Letter`}
              </Button>

              {/* Show existing cover letters */}
              {jobApplication.coverLetters && jobApplication.coverLetters.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">{t`Cover Letters`}</div>
                  {jobApplication.coverLetters.map((coverLetter) => (
                    <div key={coverLetter.id} className="flex items-center gap-2">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="flex-1 justify-start gap-2"
                      >
                        <Link to={`/cover-letter-builder/${coverLetter.id}`}>
                          <FileText size={14} />
                          {t`Cover Letter`} - {new Date(coverLetter.createdAt).toLocaleDateString()}
                        </Link>
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="px-2"
                            disabled={isDeletingCoverLetter}
                          >
                            <Trash size={14} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t`Delete Cover Letter`}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t`Are you sure you want to delete this cover letter? This action cannot be undone.`}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t`Cancel`}</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteCoverLetter(coverLetter.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {t`Delete`}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </div>
              )}

              {/* Show existing resumes */}
              {jobApplication.resumes && jobApplication.resumes.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">{t`Resumes`}</div>
                  {jobApplication.resumes.map((resume) => (
                    <div key={resume.id} className="flex items-center gap-2">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="flex-1 justify-start gap-2"
                      >
                        <Link to={`/builder/${resume.id}`}>
                          <FileText size={14} />
                          {resume.title || t`Resume`} - {new Date(resume.createdAt).toLocaleDateString()}
                        </Link>
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="px-2"
                            disabled={isDeletingResume}
                          >
                            <Trash size={14} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t`Delete Resume`}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t`Are you sure you want to delete this resume? This action cannot be undone.`}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t`Cancel`}</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteResume(resume.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {t`Delete`}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </div>
              )}

              <Button variant="outline" className="w-full gap-2">
                <MapPin size={16} />
                {t`Interview Prep`}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
