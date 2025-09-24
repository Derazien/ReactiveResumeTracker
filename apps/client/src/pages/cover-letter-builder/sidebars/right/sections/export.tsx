import { t } from "@lingui/macro";
import { CircleNotch, FileJs, FilePdf } from "@phosphor-icons/react";
import { buttonVariants, Card, CardContent, CardDescription, CardTitle } from "@reactive-resume/ui";
import { cn } from "@reactive-resume/utils";
import { saveAs } from "file-saver";

import { useCoverLetterSync } from "@/client/hooks/use-cover-letter-sync";
import { usePrintCoverLetter } from "@/client/services/cover-letter/print";

const openInNewTab = (url: string) => {
  const win = window.open(url, "_blank");
  if (win) win.focus();
};

export const ExportSection = () => {
  const { data: coverLetter } = useCoverLetterSync();
  const { printCoverLetter, loading } = usePrintCoverLetter();

  const onJsonExport = () => {
    if (!coverLetter) return;
    
    const filename = `cover-letter-${coverLetter.id}.json`;
    const coverLetterJSON = JSON.stringify(coverLetter, null, 2);

    saveAs(new Blob([coverLetterJSON], { type: "application/json" }), filename);
  };

  const onPdfExport = async () => {
    if (!coverLetter) return;
    
    const { url } = await printCoverLetter({ id: coverLetter.id });
    openInNewTab(url);
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center gap-x-2">
        <FilePdf size={18} />
        <h3 className="text-lg font-semibold">{t`Export`}</h3>
      </div>

      <div className="grid gap-y-4">
        <Card
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "h-auto cursor-pointer flex-row items-center gap-x-5 px-4 pb-3 pt-1",
          )}
          onClick={onJsonExport}
        >
          <FileJs size={22} />
          <CardContent className="flex-1">
            <CardTitle className="text-sm">{t`JSON`}</CardTitle>
            <CardDescription className="font-normal">
              {t`Download a JSON snapshot of your cover letter. This file can be used to backup or share your cover letter data.`}
            </CardDescription>
          </CardContent>
        </Card>

        <Card
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "h-auto cursor-pointer flex-row items-center gap-x-5 px-4 pb-3 pt-1",
            loading && "pointer-events-none cursor-progress opacity-75",
          )}
          onClick={onPdfExport}
        >
          {loading ? <CircleNotch size={22} className="animate-spin" /> : <FilePdf size={22} />}

          <CardContent className="flex-1">
            <CardTitle className="text-sm">{t`PDF`}</CardTitle>
            <CardDescription className="font-normal">
              {t`Download a PDF of your cover letter. This file can be used to print your cover letter, send it to recruiters, or include with job applications.`}
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};













