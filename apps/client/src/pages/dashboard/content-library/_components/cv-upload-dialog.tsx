import { t } from "@lingui/macro";
import { CheckCircle, FileText, Sparkle, Upload } from "@phosphor-icons/react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@reactive-resume/ui";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { useToast } from "@/client/hooks/use-toast";
import {
  type ExtractedContent,
  useExtractCVContent,
  useSaveExtractedContent,
} from "@/client/services/content-library/cv-extraction";

type CVUploadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const CVUploadDialog = ({ open, onOpenChange }: CVUploadDialogProps) => {
  const { toast } = useToast();
  const extractMutation = useExtractCVContent();
  const saveMutation = useSaveExtractedContent();

  const [file, setFile] = useState<File | null>(null);
  const [extractedContent, setExtractedContent] = useState<ExtractedContent[]>([]);
  const [stage, setStage] = useState<"upload" | "extract" | "review" | "complete">("upload");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUploadAndExtract = async () => {
    if (!file) return;

    setStage("extract");

    try {
      const result = await extractMutation.mutateAsync(file);

      if (!result.success) {
        throw new Error(result.error || "Content extraction failed");
      }

      // Add selection state - unique content selected by default, duplicates deselected
      const contentWithSelection = result.data.map((item) => ({
        ...item,
        id: item.id || `temp-${Date.now()}-${Math.random()}`,
        selected: !item.isDuplicate, // Select unique content by default
      }));

      setExtractedContent(contentWithSelection);
      setStage("review");
    } catch (error) {
      toast({
        variant: "error",
        title: t`CV Processing Failed`,
        description: error instanceof Error ? error.message : t`Failed to process CV`,
      });
      setStage("upload");
    }
  };

  const handleToggleSelection = (contentId: string) => {
    setExtractedContent((prev) =>
      prev.map((item) => (item.id === contentId ? { ...item, selected: !item.selected } : item)),
    );
  };

  const handleSelectAll = () => {
    setExtractedContent((prev) => prev.map((item) => ({ ...item, selected: true })));
  };

  const handleDeselectAll = () => {
    setExtractedContent((prev) => prev.map((item) => ({ ...item, selected: false })));
  };

  const handleSelectUnique = () => {
    setExtractedContent((prev) => prev.map((item) => ({ ...item, selected: !item.isDuplicate })));
  };

  const handleSaveContent = async () => {
    const selectedContent = extractedContent.filter((item) => item.selected);

    if (selectedContent.length === 0) {
      toast({
        variant: "error",
        title: t`No Content Selected`,
        description: t`Please select at least one content item to save`,
      });
      return;
    }

    try {
      const result = await saveMutation.mutateAsync(selectedContent);

      if (!result.success) {
        throw new Error(result.error || "Failed to save content");
      }

      toast({
        variant: "success",
        title: t`Content Saved Successfully`,
        description: t`Saved ${result.data.saved} items to your content library`,
      });

      setStage("complete");
    } catch (error) {
      toast({
        variant: "error",
        title: t`Save Failed`,
        description: error instanceof Error ? error.message : t`Failed to save content`,
      });
    }
  };

  const resetDialog = () => {
    setFile(null);
    setExtractedContent([]);
    setStage("upload");
  };

  const handleClose = () => {
    resetDialog();
    onOpenChange(false);
  };

  const getStageDescription = () => {
    switch (stage) {
      case "upload": {
        return t`Upload your CV file`;
      }
      case "extract": {
        return t`AI is analyzing your CV and extracting content...`;
      }
      case "review": {
        return t`Review and edit the extracted content`;
      }
      case "complete": {
        return t`Content successfully added to your library!`;
      }
      default: {
        return "";
      }
    }
  };

  const selectedCount = extractedContent.filter((item) => item.selected).length;
  const duplicateCount = extractedContent.filter((item) => item.isDuplicate).length;
  const uniqueCount = extractedContent.length - duplicateCount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkle className="size-5 text-primary" />
            {t`AI-Powered CV Content Extraction`}
          </DialogTitle>
          <DialogDescription>{getStageDescription()}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {extractMutation.isError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="font-medium text-red-800">{t`Error`}</p>
              <p className="text-sm text-red-600">{extractMutation.error.message}</p>
            </div>
          )}

          <AnimatePresence mode="wait">
            {stage === "upload" && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center transition-colors hover:border-primary/50">
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,.txt"
                    className="hidden"
                    id="cv-upload"
                    onChange={handleFileSelect}
                  />
                  <label htmlFor="cv-upload" className="cursor-pointer">
                    <Upload className="mx-auto mb-4 size-12 text-gray-400" />
                    <div className="space-y-2">
                      <p className="text-lg font-medium">{t`Click to upload your CV`}</p>
                      <p className="text-sm text-gray-500">
                        {t`Supports PDF, DOCX, DOC, and TXT files (up to 10MB)`}
                      </p>
                    </div>
                  </label>
                </div>

                {file && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <FileText className="size-8 text-primary" />
                        <div className="flex-1">
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setFile(null);
                          }}
                        >
                          {t`Remove`}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={handleClose}>
                    {t`Cancel`}
                  </Button>
                  <Button
                    disabled={!file || extractMutation.isPending}
                    className="flex items-center gap-2"
                    onClick={handleUploadAndExtract}
                  >
                    <Sparkle className="size-4" />
                    {extractMutation.isPending ? t`Processing...` : t`Extract Content`}
                  </Button>
                </div>
              </motion.div>
            )}

            {stage === "extract" && (
              <motion.div
                key="extract"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="py-8 text-center"
              >
                <Sparkle className="mx-auto mb-4 size-16 animate-pulse text-primary" />
                <h3 className="mb-2 text-xl font-semibold">{t`AI is analyzing your CV...`}</h3>
                <p className="text-gray-600">
                  {t`This may take a few moments while we extract and analyze your professional content.`}
                </p>
              </motion.div>
            )}

            {stage === "review" && (
              <motion.div
                key="review"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="py-4 text-center">
                  <CheckCircle className="mx-auto mb-2 size-12 text-green-500" />
                  <h3 className="text-lg font-semibold">
                    {t`Extracted ${extractedContent.length} pieces of content`}
                  </h3>
                  <p className="text-gray-600">
                    {t`Found ${uniqueCount} unique items and ${duplicateCount} potential duplicates`}
                  </p>
                </div>

                {/* Selection Controls */}
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">
                      {t`Selected: ${selectedCount}/${extractedContent.length}`}
                    </span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={handleSelectAll}>
                        {t`Select All`}
                      </Button>
                      <Button size="sm" variant="secondary" onClick={handleSelectUnique}>
                        {t`Select Unique`}
                      </Button>
                      <Button size="sm" variant="secondary" onClick={handleDeselectAll}>
                        {t`Deselect All`}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid max-h-96 gap-4 overflow-y-auto">
                  {extractedContent.map((content) => (
                    <Card
                      key={content.id}
                      className={`border-l-4 ${
                        content.isDuplicate
                          ? "border-l-orange-500 bg-orange-50/50"
                          : "border-l-primary"
                      } ${content.selected ? "ring-2 ring-primary/20" : ""}`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex flex-1 items-start gap-3">
                            <Checkbox
                              checked={content.selected}
                              className="mt-1"
                              onCheckedChange={() => {
                                handleToggleSelection(content.id!);
                              }}
                            />
                            <div className="flex-1">
                              <CardTitle className="text-base">{content.title}</CardTitle>
                              <p className="mt-1 text-sm text-gray-600">{content.description}</p>
                              {content.company && (
                                <p className="mt-1 text-sm text-gray-500">
                                  {content.company} {content.location && `• ${content.location}`}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{content.type.replace("_", " ")}</Badge>
                            <Badge variant={content.confidence > 0.9 ? "primary" : "secondary"}>
                              {Math.round(content.confidence * 100)}% {t`confidence`}
                            </Badge>
                            {content.isDuplicate && (
                              <Badge variant="warning" className="text-orange-600">
                                {t`Potential Duplicate`}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          {content.skills.length > 0 && (
                            <div>
                              <p className="mb-1 text-sm font-medium text-gray-700">{t`Skills:`}</p>
                              <div className="flex flex-wrap gap-1">
                                {content.skills.slice(0, 5).map((skill, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                                {content.skills.length > 5 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{content.skills.length - 5} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {content.isDuplicate && content.reason && (
                            <div className="rounded bg-orange-100 p-2 text-sm text-orange-800">
                              <strong>{t`Similarity:`}</strong> {content.reason}
                              {content.similarTo && (
                                <span className="mt-1 block text-xs">
                                  {t`Similar to: ${content.similarTo}`}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={handleClose}>
                    {t`Cancel`}
                  </Button>
                  <Button
                    disabled={selectedCount === 0 || saveMutation.isPending}
                    className="flex items-center gap-2"
                    onClick={handleSaveContent}
                  >
                    <CheckCircle className="size-4" />
                    {saveMutation.isPending
                      ? t`Saving...`
                      : t`Save ${selectedCount} Selected Items`}
                  </Button>
                </div>
              </motion.div>
            )}

            {stage === "complete" && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="py-8 text-center"
              >
                <CheckCircle className="mx-auto mb-4 size-16 text-green-500" />
                <h3 className="mb-2 text-xl font-semibold">{t`Content Successfully Added!`}</h3>
                <p className="mb-6 text-gray-600">
                  {t`Your CV content has been extracted and saved to your library. You can now use this content to generate tailored resumes for job applications.`}
                </p>
                <Button onClick={handleClose}>{t`View Content Library`}</Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};
