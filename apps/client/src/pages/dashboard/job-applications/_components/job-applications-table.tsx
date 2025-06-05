import { t } from "@lingui/macro";
import { 
  Building, 
  DotsThreeVertical, 
  Eye, 
  FileText, 
  Pencil, 
  Plus, 
  Trash 
} from "@phosphor-icons/react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@reactive-resume/ui";
import { cn } from "@reactive-resume/utils";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router";

import { useToast } from "@/client/hooks/use-toast";
import { useDeleteJobApplication } from "@/client/services/job-application/delete";

type Props = {
  applications: JobApplicationDto[];
  loading: boolean;
  error: any;
};

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

const JobApplicationRow = ({ application, index }: { application: JobApplicationDto; index: number }) => {
  const navigate = useNavigate();
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

  const formatDate = (date: Date | string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  return (
    <motion.tr 
      className="border-b border-border hover:bg-muted/50 transition-colors"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0, transition: { delay: index * 0.05 } }}
    >
      <td className="p-4">
        <div className="space-y-1">
          <div className="font-medium">{application.title}</div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Building size={14} />
            {application.company}
          </div>
        </div>
      </td>

      <td className="p-4">
        <Badge variant="secondary" className={cn("text-xs", getStatusColor(application.status))}>
          {getStatusLabel(application.status)}
        </Badge>
      </td>

      <td className="p-4 text-sm text-muted-foreground">
        {formatDate(application.appliedDate)}
      </td>

      <td className="p-4">
        {application.resumes && application.resumes.length > 0 ? (
          <div className="flex flex-col gap-1">
            {application.resumes.slice(0, 2).map((resume) => (
              <Button
                key={resume.id}
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                asChild
              >
                <Link to={`/builder/${resume.id}`}>
                  <FileText size={12} className="mr-1" />
                  {resume.title}
                </Link>
              </Button>
            ))}
            {application.resumes.length > 2 && (
              <span className="text-xs text-muted-foreground">
                +{application.resumes.length - 2} more
              </span>
            )}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">{t`None`}</span>
        )}
      </td>

      <td className="p-4">
        {application.coverLetters && application.coverLetters.length > 0 ? (
          <div className="flex flex-col gap-1">
            {application.coverLetters.slice(0, 2).map((coverLetter) => (
              <Button
                key={coverLetter.id}
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
              >
                <FileText size={12} className="mr-1" />
                {t`Cover Letter`}
              </Button>
            ))}
            {application.coverLetters.length > 2 && (
              <span className="text-xs text-muted-foreground">
                +{application.coverLetters.length - 2} more
              </span>
            )}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">{t`None`}</span>
        )}
      </td>

      <td className="p-4 text-sm text-muted-foreground">
        {formatDate(application.createdAt)}
      </td>

      <td className="p-4">
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
                  <AlertDialogTitle>{t`Delete Job Application`}</AlertDialogTitle>
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
      </td>
    </motion.tr>
  );
};

export const JobApplicationsTable = ({ applications, loading, error }: Props) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t`Loading job applications...`}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="text-destructive">{t`Error loading job applications`}</div>
        <div className="text-sm text-muted-foreground">
          {error.message || t`Please check that the backend server is running on port 3000`}
        </div>
        <Button
          variant="outline"
          onClick={() => {
            window.location.reload();
          }}
        >
          {t`Retry`}
        </Button>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <div className="mb-4 rounded-full bg-secondary/50 p-6">
          <Plus size={32} className="text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">{t`No job applications yet`}</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          {t`Start tracking your job search by creating your first application. We'll help you generate the perfect resume for each opportunity.`}
        </p>
        <Button asChild>
          <Link to="/dashboard/job-applications/new">{t`Create Your First Application`}</Link>
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="rounded-md border bg-background overflow-hidden">
      <table className="w-full">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[250px]">
              {t`Job Title & Company`}
            </th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[120px]">
              {t`Status`}
            </th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[100px]">
              {t`Applied Date`}
            </th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[150px]">
              {t`Resumes`}
            </th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[150px]">
              {t`Cover Letters`}
            </th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[100px]">
              {t`Created`}
            </th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[60px]">
              {t`Actions`}
            </th>
          </tr>
        </thead>
        <tbody>
          {applications.map((application, index) => (
            <JobApplicationRow 
              key={application.id} 
              application={application} 
              index={index}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}; 