import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";

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
  Trash,
  Warning
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
  RichInput 
} from "@reactive-resume/ui";
import { cn } from "@reactive-resume/utils";
import { motion } from "framer-motion";

import { useToast } from "@/client/hooks/use-toast";
import { useJobApplication } from "@/client/services/job-application/job-application";
import { useDeleteJobApplication } from "@/client/services/job-application/delete";
import { useGenerateTailoredResume } from "@/client/services/job-application/generate-resume";

const getStatusColor = (status: string) => {
  switch (status) {
    case "DRAFT":
      return "bg-gray-100 text-gray-800";
    case "APPLIED":
      return "bg-blue-100 text-blue-800";
    case "INTERVIEW_SCHEDULED":
      return "bg-purple-100 text-purple-800";
    case "INTERVIEWED":
      return "bg-yellow-100 text-yellow-800";
    case "OFFER_RECEIVED":
      return "bg-green-100 text-green-800";
    case "ACCEPTED":
      return "bg-emerald-100 text-emerald-800";
    case "REJECTED":
      return "bg-red-100 text-red-800";
    case "WITHDRAWN":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "DRAFT":
      return t`Draft`;
    case "APPLIED":
      return t`Applied`;
    case "INTERVIEW_SCHEDULED":
      return t`Interview Scheduled`;
    case "INTERVIEWED":
      return t`Interviewed`;
    case "OFFER_RECEIVED":
      return t`Offer Received`;
    case "ACCEPTED":
      return t`Accepted`;
    case "REJECTED":
      return t`Rejected`;
    case "WITHDRAWN":
      return t`Withdrawn`;
    default:
      return status;
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

  const handleGenerateCV = async () => {
    if (!id) return;
    
    setIsGeneratingCV(true);
    
    try {
      const result = await generateTailoredResume({
        jobApplicationId: id,
        data: {} // Let the backend auto-select the best content
      });
      
      toast({
        title: t`CV Generated Successfully`,
        description: t`A tailored CV has been created with ${result.selectedContent.length} relevant content pieces. Opening resume builder...`,
      });

      // Show suggestions to the user
      if (result.suggestions.length > 0) {
        console.log('Resume generation suggestions:', result.suggestions);
      }

      // Navigate directly to the resume builder for editing
      navigate(`/builder/${result.resume.id}`);
      
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
      
      navigate("/dashboard/job-applications");
    } catch {
      toast({
        variant: "error",
        title: t`Error`,
        description: t`Failed to delete job application. Please try again.`,
      });
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p>{t`Loading job application...`}</p>
        </div>
      </div>
    );
  }

  if (error || !jobApplication) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{t`Failed to load job application`}</p>
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
        <Button variant="outline" size="icon" onClick={() => navigate("/dashboard/job-applications")}>
          <ArrowLeft size={16} />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">{jobApplication.title}</h1>
            <Badge variant="secondary" className={cn("text-xs", getStatusColor(jobApplication.status))}>
              {getStatusLabel(jobApplication.status)}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-1">
              <Building size={16} />
              <span>{jobApplication.company}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              <span>{t`Created`}: {formatDate(jobApplication.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
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
                  {t`Are you sure you want to delete "${jobApplication.title}" at ${jobApplication.company}? This action cannot be undone and will permanently remove:`}
                  <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
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
                  onClick={handleDelete}
                  className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
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
        <div className="lg:col-span-2 space-y-6">
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
                      className="text-primary hover:underline break-all"
                    >
                      {jobApplication.url}
                    </a>
                  </div>
                </div>
              )}

              {jobApplication.description && (
                <div>
                  <label className="text-sm font-medium">{t`Description`}</label>
                  <div className="mt-1 p-3 border rounded-md bg-muted/30">
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: jobApplication.description }}
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
                  <div className="mt-1 p-3 border rounded-md bg-muted/30">
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: jobApplication.notes }}
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
              <p className="text-sm text-muted-foreground">
                {t`Create a tailored CV for this job application using your content library and AI optimization.`}
              </p>
              
              <Button 
                className="w-full gap-2" 
                disabled={isGeneratingCV || isGeneratingResume}
                onClick={handleGenerateCV}
              >
                {(isGeneratingCV || isGeneratingResume) ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
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
                      variant="outline"
                      size="sm"
                      className="w-full justify-start gap-2"
                      asChild
                    >
                      <Link to={`/builder/${resume.id}`}>
                        <FileText size={14} />
                        {resume.title}
                      </Link>
                    </Button>
                  ))}
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                {t`This will analyze your content library and create a CV optimized for this specific role.`}
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
                <Badge variant="secondary" className={cn("text-xs", getStatusColor(jobApplication.status))}>
                  {getStatusLabel(jobApplication.status)}
                </Badge>
              </div>

              {jobApplication.appliedDate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t`Applied Date`}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(jobApplication.appliedDate)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm">{t`Created`}</span>
                <span className="text-sm text-muted-foreground">
                  {formatDate(jobApplication.createdAt)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">{t`Last Updated`}</span>
                <span className="text-sm text-muted-foreground">
                  {formatDate(jobApplication.updatedAt)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{t`Quick Actions`}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full gap-2" asChild>
                <Link to="/dashboard/content-library">
                  <Eye size={16} />
                  {t`View Content Library`}
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full gap-2">
                <FileText size={16} />
                {t`Generate Cover Letter`}
              </Button>

              {/* Show existing cover letters */}
              {jobApplication.coverLetters && jobApplication.coverLetters.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">{t`Cover Letters`}</div>
                  {jobApplication.coverLetters.map((coverLetter) => (
                    <Button
                      key={coverLetter.id}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start gap-2"
                    >
                      <FileText size={14} />
                      {t`Cover Letter`} - {new Date(coverLetter.createdAt).toLocaleDateString()}
                    </Button>
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