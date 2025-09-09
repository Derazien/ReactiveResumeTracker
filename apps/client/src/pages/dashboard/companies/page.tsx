import { t } from "@lingui/macro";
import { Building, DotsThree, MagnifyingGlass, Plus, Trash, Warning } from "@phosphor-icons/react";
import { Button } from "@reactive-resume/ui";
import { Input } from "@reactive-resume/ui";
import { Badge } from "@reactive-resume/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@reactive-resume/ui";
import { Separator } from "@reactive-resume/ui";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@reactive-resume/ui";
import { useState } from "react";
import { useNavigate } from "react-router";

import { useToast } from "@/client/hooks/use-toast";
import { useDeleteCompany, useCompanies, type Company } from "@/client/services/company";

// Helper function to check if company analysis is complete
const isCompanyAnalysisComplete = (company: Company): boolean => {
  return !!(company.industry && company.size && company.location && company.mission);
};

// Helper function to get analysis status
const getAnalysisStatus = (company: Company): "complete" | "pending" | "basic" => {
  if (isCompanyAnalysisComplete(company)) {
    return "complete";
  }
  if (company.description?.includes("Company extracted from job posting")) {
    return "pending";
  }
  return "basic";
};

const CompaniesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { deleteCompany, loading: isDeleting } = useDeleteCompany();
  const { data: companies = [], isLoading: loading } = useCompanies();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterIndustry, setFilterIndustry] = useState("");


  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.industry?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesIndustry = !filterIndustry || company.industry === filterIndustry;

    return matchesSearch && matchesIndustry;
  });

  const industries = [...new Set(companies.map((c) => c.industry).filter(Boolean))];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleDeleteCompany = async (companyId: string, companyName: string) => {
    try {
      await deleteCompany(companyId);

      toast({
        title: t`Success`,
        description: t`Company deleted successfully`,
      });
    } catch {
      toast({
        variant: "error",
        title: t`Error`,
        description: t`Failed to delete company. Please try again.`,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p>{t`Loading companies...`}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t`Companies`}</h1>
          <p className="text-muted-foreground">
            {t`Manage and analyze companies for your job applications`}
          </p>
        </div>
        <Button>
          <Plus className="mr-2 size-4" />
          {t`Add Company`}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t`Search & Filter`}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlass className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                <Input
                  placeholder={t`Search companies...`}
                  value={searchQuery}
                  className="pl-10"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setSearchQuery(e.target.value);
                  }}
                />
              </div>
            </div>
            <div className="w-48">
              <select
                value={filterIndustry}
                className="border-input w-full rounded-md border bg-background px-3 py-2 text-sm"
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setFilterIndustry(e.target.value);
                }}
              >
                <option value="">{t`All Industries`}</option>
                {industries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Companies Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                 {filteredCompanies.map((company) => (
           <Card 
             key={company.id} 
             className="transition-shadow hover:shadow-md cursor-pointer" 
             onClick={() => navigate(`/dashboard/companies/${company.id}`)}
           >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {company.logo ? (
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="size-10 rounded-md object-cover"
                    />
                  ) : (
                    <div className="bg-muted flex size-10 items-center justify-center rounded-md">
                      <Building className="size-5" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <CardTitle className="truncate text-lg">{company.name}</CardTitle>
                    {company.industry && (
                      <Badge variant="secondary" className="mt-1">
                        {company.industry}
                      </Badge>
                    )}
                    {getAnalysisStatus(company) === "pending" && (
                      <Badge outline variant="secondary" className="ml-1 mt-1">
                        <div className="flex items-center gap-1">
                          <div className="size-2 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                          Analyzing...
                        </div>
                      </Badge>
                    )}
                  </div>
                </div>
                                 <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                     <Button 
                       variant="ghost" 
                       size="sm"
                       onClick={(e) => e.stopPropagation()}
                     >
                       <DotsThree className="size-4" />
                     </Button>
                   </DropdownMenuTrigger>
                                     <DropdownMenuContent align="end">
                     <DropdownMenuItem onClick={() => navigate(`/dashboard/companies/${company.id}`)}>
                       {t`View Details`}
                     </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => navigate(`/dashboard/companies/${company.id}/edit`)}>
                       {t`Edit Company`}
                     </DropdownMenuItem>
                     {getAnalysisStatus(company) === "pending" && (
                       <DropdownMenuItem disabled>
                         <div className="flex items-center gap-2">
                           <div className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                           {t`Analysis in Progress`}
                         </div>
                       </DropdownMenuItem>
                     )}
                     {getAnalysisStatus(company) !== "pending" && (
                       <DropdownMenuItem>{t`Analyze Company`}</DropdownMenuItem>
                     )}
                     <DropdownMenuSeparator />
                     <AlertDialog>
                       <AlertDialogTrigger asChild>
                         <DropdownMenuItem
                           className="text-red-600 focus:text-red-600"
                           onSelect={(e) => {
                             e.preventDefault();
                           }}
                         >
                           <Trash size={16} className="mr-2" />
                           {t`Delete`}
                         </DropdownMenuItem>
                       </AlertDialogTrigger>
                       <AlertDialogContent>
                         <AlertDialogHeader>
                           <AlertDialogTitle className="flex items-center gap-2">
                             <Warning size={20} className="text-red-500" />
                             {t`Delete Company`}
                           </AlertDialogTitle>
                           <AlertDialogDescription>
                             {t`Are you sure you want to delete "${company.name}"? This action cannot be undone.`}
                           </AlertDialogDescription>
                         </AlertDialogHeader>
                         <AlertDialogFooter>
                           <AlertDialogCancel>{t`Cancel`}</AlertDialogCancel>
                           <AlertDialogAction
                             disabled={isDeleting}
                             className="bg-red-600 text-white hover:bg-red-700"
                             onClick={() => handleDeleteCompany(company.id, company.name)}
                           >
                             {isDeleting ? t`Deleting...` : t`Delete`}
                           </AlertDialogAction>
                         </AlertDialogFooter>
                       </AlertDialogContent>
                     </AlertDialog>
                   </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {company.description && (
                <p className="text-muted-foreground line-clamp-2 text-sm">{company.description}</p>
              )}

              {getAnalysisStatus(company) === "pending" && (
                <div className="text-muted-foreground text-xs">
                  <p>Company analysis in progress...</p>
                </div>
              )}

              <div className="text-muted-foreground flex items-center gap-4 text-xs">
                {company.location && <span>{company.location}</span>}
                {company.size && <span>{company.size}</span>}
              </div>

              <Separator />

              <div className="text-muted-foreground flex items-center justify-between text-xs">
                <div className="flex items-center gap-4">
                  {company._count?.contacts !== undefined && (
                    <span>
                      {company._count.contacts} {t`contacts`}
                    </span>
                  )}
                  {company._count?.jobApplications !== undefined && (
                    <span>
                      {company._count.jobApplications} {t`applications`}
                    </span>
                  )}
                </div>
                <span>{formatDate(company.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building className="text-muted-foreground mb-4 size-12" />
            <h3 className="mb-2 text-lg font-semibold">
              {searchQuery || filterIndustry ? t`No companies found` : t`No companies yet`}
            </h3>
            <p className="text-muted-foreground mb-4 text-center">
              {searchQuery || filterIndustry
                ? t`Try adjusting your search or filter criteria`
                : t`Start by adding your first company to track and analyze`}
            </p>
            <Button>
              <Plus className="mr-2 size-4" />
              {t`Add Company`}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CompaniesPage;
