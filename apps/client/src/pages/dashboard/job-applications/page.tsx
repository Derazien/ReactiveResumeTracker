import { t } from "@lingui/macro";
import { List, Plus, SquaresFour } from "@phosphor-icons/react";
import { Button, ScrollArea, Tabs, TabsContent, TabsList, TabsTrigger } from "@reactive-resume/ui";
import { motion } from "framer-motion";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router";

import { useJobApplications } from "@/client/services/job-application";

import { JobApplicationCard } from "./_components/job-application-card";
import { JobApplicationsFilter } from "./_components/job-applications-filter";
import { JobApplicationsTable } from "./_components/job-applications-table";

type Layout = "grid" | "list";

export const JobApplicationsPage = () => {
  const [layout, setLayout] = useState<Layout>("grid");
  const { jobApplications, loading, error } = useJobApplications();

  // Ensure jobApplications is always an array
  const safeJobApplications = Array.isArray(jobApplications) ? jobApplications : [];

  return (
    <>
      <Helmet>
        <title>
          {t`Job Applications`} - {t`Reactive Resume`}
        </title>
      </Helmet>

      <Tabs
        value={layout}
        className="space-y-4"
        onValueChange={(value) => {
          setLayout(value as Layout);
        }}
      >
        <div className="flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl font-bold tracking-tight">{t`Job Applications`}</h1>
            <p className="text-muted-foreground">
              {t`Track your job applications and generate tailored resumes for each opportunity.`}
            </p>
          </motion.div>

          <div className="flex items-center gap-4">
            <TabsList>
              <TabsTrigger value="grid" className="size-8 p-0 sm:h-8 sm:w-auto sm:px-4">
                <SquaresFour />
                <span className="ml-2 hidden sm:block">{t`Grid`}</span>
              </TabsTrigger>
              <TabsTrigger value="list" className="size-8 p-0 sm:h-8 sm:w-auto sm:px-4">
                <List />
                <span className="ml-2 hidden sm:block">{t`Table`}</span>
              </TabsTrigger>
            </TabsList>

            <Button asChild className="gap-2">
              <Link to="/dashboard/job-applications/new">
                <Plus size={16} />
                {t`New Application`}
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <JobApplicationsFilter />

        <ScrollArea
          allowOverflow
          className="h-[calc(100vh-200px)] overflow-visible lg:h-[calc(100vh-140px)]"
        >
          <TabsContent value="grid">
            {/* Grid View */}
            {(() => {
              if (loading) {
                return (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                      <p className="text-muted-foreground">{t`Loading job applications...`}</p>
                    </div>
                  </div>
                );
              }

              if (error) {
                return (
                  <div className="flex flex-col items-center justify-center space-y-4 py-12">
                    <div className="text-destructive">{t`Error loading job applications`}</div>
                    <div className="text-muted-foreground text-sm">
                      {error.message ||
                        t`Please check that the backend server is running on port 3000`}
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

              if (safeJobApplications.length === 0) {
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
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {safeJobApplications.map((application, index) => (
                    <motion.div
                      key={application.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: index * 0.1 } }}
                    >
                      <JobApplicationCard application={application} />
                    </motion.div>
                  ))}
                </div>
              );
            })()}
          </TabsContent>

          <TabsContent value="list">
            {/* Table View */}
            <JobApplicationsTable
              applications={safeJobApplications}
              loading={loading}
              error={error}
            />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </>
  );
};
