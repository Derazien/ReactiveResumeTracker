import { t } from "@lingui/macro";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@reactive-resume/ui";
import { Eye, FileText } from "lucide-react";

import { useCoverLetterSync } from "@/client/hooks/use-cover-letter-sync";
import { useCoverLetterBuilderStore } from "@/client/stores/cover-letter-builder";

export const PreviewSection = () => {
  const coverLetter = useCoverLetterSync();
  const template = useCoverLetterBuilderStore((state) => state.template);

  const handleRefreshPreview = () => {
    // TODO: Implement preview refresh
    console.log("Refreshing preview");
  };

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t`Cover Letter Preview`}</h3>
        <Button variant="outline" size="sm" onClick={handleRefreshPreview}>
          <Eye className="mr-2 size-4" />
          {t`Refresh`}
        </Button>
      </div>

      {/* Preview Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <FileText className="size-4" />
            {t`Current Content`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {coverLetter.data?.content ? (
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-sm">{coverLetter.data?.content || ""}</div>
            </div>
          ) : (
            <div className="text-muted-foreground py-8 text-center">
              <FileText className="mx-auto mb-2 size-8 opacity-50" />
              <p className="text-sm">{t`No cover letter content yet`}</p>
              <p className="mt-1 text-xs">{t`Generate a cover letter to see the preview`}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Template Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{t`Template Information`}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t`Template`}:</span>
              <span className="font-medium">{template.selectedTemplate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t`Tone`}:</span>
              <span className="font-medium">{template.tone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t`Custom Instructions`}:</span>
              <span className="font-medium">{template.customInstructions ? t`Yes` : t`None`}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Word Count */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{t`Statistics`}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t`Word Count`}:</span>
              <span className="font-medium">
                {coverLetter.data?.content ? coverLetter.data.content.split(/\s+/).length : 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t`Characters`}:</span>
              <span className="font-medium">
                {coverLetter.data?.content ? coverLetter.data.content.length : 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t`Last Updated`}:</span>
              <span className="font-medium">
                {coverLetter.data?.updatedAt
                  ? new Date(coverLetter.data.updatedAt).toLocaleDateString()
                  : t`Never`}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
