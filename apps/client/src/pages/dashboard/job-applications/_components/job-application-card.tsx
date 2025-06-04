import { t } from "@lingui/macro";
import { Building, Calendar, Eye, Pencil, Trash } from "@phosphor-icons/react";
import type { JobApplicationDto } from "@reactive-resume/dto";
import { Badge, Button, Card, CardContent, CardFooter, CardHeader } from "@reactive-resume/ui";
import { cn } from "@reactive-resume/utils";
import { Link } from "react-router";

type Props = {
  application: JobApplicationDto;
};

const getStatusColor = (status: JobApplicationDto["status"]) => {
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
  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

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
          <Badge variant="secondary" className={cn("text-xs", getStatusColor(application.status))}>
            {getStatusLabel(application.status)}
          </Badge>
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

        {application.notes && (
          <p className="text-muted-foreground line-clamp-2 text-sm">{application.notes}</p>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 pt-3">
        <Button asChild variant="outline" size="sm" className="flex-1 gap-2">
          <Link to={`/dashboard/job-applications/${application.id}`}>
            <Eye size={14} />
            {t`View`}
          </Link>
        </Button>

        <Button asChild variant="outline" size="sm" className="gap-2">
          <Link to={`/dashboard/job-applications/${application.id}/edit`}>
            <Pencil size={14} />
          </Link>
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="hover:bg-destructive hover:text-destructive-foreground gap-2"
        >
          <Trash size={14} />
        </Button>
      </CardFooter>
    </Card>
  );
};
