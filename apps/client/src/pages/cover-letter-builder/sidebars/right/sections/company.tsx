import { t } from "@lingui/macro";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@reactive-resume/ui";
import { Building2, Globe, Target } from "lucide-react";

import { useCoverLetterStore } from "@/client/stores/cover-letter";

export const CompanySection = () => {
  const coverLetter = useCoverLetterStore((state) => state.coverLetter);
  const companyData = coverLetter?.companyData;
  const jobApplicationData = coverLetter?.jobApplicationData;

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t`Company Information`}</h3>
      </div>

      {/* Company Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Building2 className="size-4" />
            {t`Company Details`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {companyData || jobApplicationData?.companyName ? (
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium">{companyData?.name || jobApplicationData?.companyName}</h4>
                <p className="text-muted-foreground text-xs">{jobApplicationData?.title}</p>
              </div>

              {jobApplicationData?.description && (
                <div>
                  <p className="text-sm">{jobApplicationData.description.slice(0, 200)}...</p>
                </div>
              )}

              <div className="flex flex-wrap gap-1">
                {companyData?.industry && (
                  <Badge variant="secondary" className="text-xs">
                    {companyData.industry}
                  </Badge>
                )}
                {companyData?.size && (
                  <Badge variant="secondary" className="text-xs">
                    {companyData.size}
                  </Badge>
                )}
                {companyData?.location && (
                  <Badge variant="secondary" className="text-xs">
                    {companyData.location}
                  </Badge>
                )}
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground py-4 text-center">
              <Building2 className="mx-auto mb-2 size-8 opacity-50" />
              <p className="text-sm">{t`No company information available`}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Company Values */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Target className="size-4" />
            {t`Company Values`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {companyData?.values && companyData.values.length > 0 ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1">
                {companyData.values.map((value, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {value}
                  </Badge>
                ))}
              </div>
              
              {companyData.mission && (
                <div>
                  <h5 className="text-xs font-medium mb-1">{t`Mission`}</h5>
                  <p className="text-xs text-muted-foreground">{companyData.mission}</p>
                </div>
              )}
              
              {companyData.culture && (
                <div>
                  <h5 className="text-xs font-medium mb-1">{t`Culture`}</h5>
                  <p className="text-xs text-muted-foreground">{companyData.culture.slice(0, 150)}...</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-muted-foreground py-4 text-center">
              <Target className="mx-auto mb-2 size-8 opacity-50" />
              <p className="text-sm">{t`Company values will be displayed here`}</p>
              <p className="mt-1 text-xs">{t`Analyze company to extract values`}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Company Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Globe className="size-4" />
            {t`Company Links`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {companyData && (companyData.website || companyData.linkedinUrl || companyData.twitterUrl) ? (
            <div className="space-y-2">
              {companyData.website && (
                <div className="flex items-center gap-2">
                  <Globe className="size-3" />
                  <a 
                    href={companyData.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    {t`Website`}
                  </a>
                </div>
              )}
              {companyData.linkedinUrl && (
                <div className="flex items-center gap-2">
                  <Globe className="size-3" />
                  <a 
                    href={companyData.linkedinUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    {t`LinkedIn`}
                  </a>
                </div>
              )}
              {companyData.twitterUrl && (
                <div className="flex items-center gap-2">
                  <Globe className="size-3" />
                  <a 
                    href={companyData.twitterUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    {t`Twitter`}
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="text-muted-foreground py-4 text-center">
              <Globe className="mx-auto mb-2 size-8 opacity-50" />
              <p className="text-sm">{t`Company links will be displayed here`}</p>
              <p className="mt-1 text-xs">{t`Website, LinkedIn, etc.`}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
