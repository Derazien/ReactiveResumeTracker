import { t } from "@lingui/macro";
import { Building, Calendar, DotsThreeVertical, Eye, FileText, Pencil, Trash, Warning } from "@phosphor-icons/react";
import type { JobApplicationDto } from "@reactive-resume/dto";
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
  CardFooter, 
  CardHeader,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@reactive-resume/ui";
import { cn } from "@reactive-resume/utils";
import { Link } from "react-router";

import { useToast } from "@/client/hooks/use-toast";
import { useDeleteJobApplication } from "@/client/services/job-application/delete";

type Props = {
  application: JobApplicationDto;
};

const getStatusColor = (status: JobApplicationDto["status"]) => {
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

const getStatusLabel = (status: JobApplicationDto["status"]) => {
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

export const JobApplicationCard = ({ application }: Props) => {
  const { toast } = useToast();
  const { deleteJobApplication, loading: isDeleting } = useDeleteJobApplication();

  const handleDelete = async () => {
    try {
      await deleteJobApplication(application.id);
      
      toast({
        title: t`Success`,
        description: t`Job application deleted successfully`,
      });
    } catch {
      toast({
        variant: "error",
        title: t`Error`,
        description: t`Failed to delete job application. Please try again.`,
      });
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  const resumeCount = application.resumes?.length || 0;
  const coverLetterCount = application.coverLetters?.length || 0;

  return (
    <Card className="group transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold leading-tight">{application.title}</h3>
            <div className="text-muted-foreground flex items-center gap-1 text-sm">
              <Building size={14} />
              <span>{application.company}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
          <Badge variant="secondary" className={cn("text-xs", getStatusColor(application.status))}>
            {getStatusLabel(application.status)}
          </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <DotsThreeVertical size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to={`/dashboard/job-applications/${application.id}`}>
                    <Eye size={16} className="mr-2" />
                    {t`View Details`}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={`/dashboard/job-applications/${application.id}/edit`}>
                    <Pencil size={16} className="mr-2" />
                    {t`Edit`}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem 
                      onSelect={(e) => e.preventDefault()}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash size={16} className="mr-2" />
                      {t`Delete`}
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <Warning size={20} className="text-red-500" />
                        {t`Delete Job Application`}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {t`Are you sure you want to delete "${application.title}" at ${application.company}? This action cannot be undone.`}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t`Cancel`}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-red-600 text-white hover:bg-red-700"
                      >
                        {isDeleting ? t`Deleting...` : t`Delete`}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="text-muted-foreground flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>
              {t`Created`}: {formatDate(application.createdAt)}
            </span>
          </div>
        </div>

        {application.appliedDate && (
          <div className="text-muted-foreground flex items-center gap-1 text-sm">
            <Calendar size={14} />
            <span>
              {t`Applied`}: {formatDate(application.appliedDate)}
            </span>
          </div>
        )}

        {/* Show resume and cover letter counts */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <FileText size={14} />
            <span className="text-muted-foreground">
              {resumeCount} {resumeCount === 1 ? t`Resume` : t`Resumes`}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <FileText size={14} />
            <span className="text-muted-foreground">
              {coverLetterCount} {coverLetterCount === 1 ? t`Cover Letter` : t`Cover Letters`}
            </span>
          </div>
        </div>

        {/* Show tags if available */}
        {Array.isArray(application.extractedTags) && application.extractedTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {application.extractedTags.slice(0, 3).map((tag: string, index: number) => (
              <span
                key={index}
                className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary"
              >
                {tag}
              </span>
            ))}
            {application.extractedTags.length > 3 && (
              <span className="text-xs text-muted-foreground self-center">
                +{application.extractedTags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Show description preview if available */}
        {application.description && (
          <p className="text-muted-foreground line-clamp-2 text-sm">
            {application.description.replace(/<[^>]*>/g, '').slice(0, 100)}...
          </p>
        )}
      </CardContent>

      <CardFooter className="pt-3">
        <Button asChild variant="outline" size="sm" className="w-full gap-2">
          <Link to={`/dashboard/job-applications/${application.id}`}>
            <Eye size={14} />
            {t`View Details`}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
