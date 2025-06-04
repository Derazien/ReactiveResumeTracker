import { t } from "@lingui/macro";
import { Plus } from "@phosphor-icons/react";
import { Button } from "@reactive-resume/ui";
import { motion } from "framer-motion";
import { Link } from "react-router";

import { useJobApplications } from "@/client/services/job-application";

import { JobApplicationCard } from "./_components/job-application-card";
import { JobApplicationsFilter } from "./_components/job-applications-filter";

const handleCreateNew = () => {
  // This will navigate to the create flow
};

export const JobApplicationsPage = () => {
  const { jobApplications, loading, error } = useJobApplications();

  // Ensure jobApplications is always an array
  const safeJobApplications = Array.isArray(jobApplications) ? jobApplications : [];

  // Handle loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t`Job Applications`}</h1>
            <p className="text-muted-foreground">
              {t`Track your job applications and generate tailored resumes for each opportunity.`}
            </p>
          </div>
          <Button asChild className="gap-2">
            <Link to="/dashboard/job-applications/new">
              <Plus size={16} />
              {t`New Application`}
            </Link>
          </Button>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">{t`Loading job applications...`}</div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t`Job Applications`}</h1>
            <p className="text-muted-foreground">
              {t`Track your job applications and generate tailored resumes for each opportunity.`}
            </p>
          </div>
          <Button asChild className="gap-2">
            <Link to="/dashboard/job-applications/new">
              <Plus size={16} />
              {t`New Application`}
            </Link>
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="text-destructive">{t`Error loading job applications`}</div>
          <div className="text-sm text-muted-foreground">
            {error?.message || t`Please check that the backend server is running on port 3000`}
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t`Job Applications`}</h1>
          <p className="text-muted-foreground">
            {t`Track your job applications and generate tailored resumes for each opportunity.`}
          </p>
        </div>

        <Button asChild className="gap-2">
          <Link to="/dashboard/job-applications/new">
            <Plus size={16} />
            {t`New Application`}
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <JobApplicationsFilter />

      {/* Applications Grid */}
      <div className="space-y-4">
        {safeJobApplications.length === 0 ? (
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
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {safeJobApplications.map((application, index) => (
              <motion.div
                key={application.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <JobApplicationCard application={application} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
