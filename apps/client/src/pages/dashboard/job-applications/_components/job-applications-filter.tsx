import { t } from "@lingui/macro";
import { Funnel, MagnifyingGlass } from "@phosphor-icons/react";
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@reactive-resume/ui";
import { useState } from "react";

type JobApplicationStatus =
  | "ALL"
  | "DRAFT"
  | "APPLIED"
  | "INTERVIEW_SCHEDULED"
  | "INTERVIEWED"
  | "OFFER_RECEIVED"
  | "REJECTED"
  | "ACCEPTED"
  | "WITHDRAWN";

export const JobApplicationsFilter = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<JobApplicationStatus>("ALL");

  const statusOptions = [
    { value: "ALL", label: t`All Status` },
    { value: "DRAFT", label: t`Draft` },
    { value: "APPLIED", label: t`Applied` },
    { value: "INTERVIEW_SCHEDULED", label: t`Interview Scheduled` },
    { value: "INTERVIEWED", label: t`Interviewed` },
    { value: "OFFER_RECEIVED", label: t`Offer Received` },
    { value: "ACCEPTED", label: t`Accepted` },
    { value: "REJECTED", label: t`Rejected` },
    { value: "WITHDRAWN", label: t`Withdrawn` },
  ];

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    // TODO: Implement search functionality
  };

  const handleStatusChange = (value: JobApplicationStatus) => {
    setStatusFilter(value);
    // TODO: Implement status filtering
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    // TODO: Clear all filters
  };

  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div className="flex max-w-md flex-1 gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <MagnifyingGlass
            size={16}
            className="text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2"
          />
          <Input
            placeholder={t`Search by company or position...`}
            value={searchTerm}
            className="pl-10"
            onChange={(e) => {
              handleSearch(e.target.value);
            }}
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-48">
            <div className="flex items-center gap-2">
              <Funnel size={16} />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters */}
      {(searchTerm || statusFilter !== "ALL") && (
        <Button variant="outline" className="shrink-0" onClick={clearFilters}>
          {t`Clear Filters`}
        </Button>
      )}
    </div>
  );
};
