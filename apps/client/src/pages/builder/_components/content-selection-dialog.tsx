import { t } from "@lingui/macro";
import { createId } from "@paralleldrive/cuid2";
import { Check, Database, MagnifyingGlass, Plus } from "@phosphor-icons/react";
import { Card, CardHeader, CardTitle } from "@reactive-resume/ui";
import { Button } from "@reactive-resume/ui";
import { Input } from "@reactive-resume/ui";
import { Badge } from "@reactive-resume/ui";
import { ScrollArea } from "@reactive-resume/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@reactive-resume/ui";
import { cn } from "@reactive-resume/utils";
import { useEffect, useMemo, useState } from "react";

import { useToast } from "@/client/hooks/use-toast";
import { useContentBySectionKey } from "@/client/services/content-library/content-library";
import { useResumeStore } from "@/client/stores/resume";

type ContentSelectionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionId: string; // This is the section key (e.g., "experience", "education")
  sectionName: string;
};

export const ContentSelectionDialog = ({
  open,
  onOpenChange,
  sectionId,
  sectionName,
}: ContentSelectionDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContentIds, setSelectedContentIds] = useState<string[]>([]);
  const { toast } = useToast();

  // Get content for the section key directly
  const { data: contentItems, isLoading: isLoadingContent } = useContentBySectionKey(sectionId);

  const setValue = useResumeStore((state) => state.setValue);
  const section = useResumeStore(
    (state) => state.resume.data.sections[sectionId as keyof typeof state.resume.data.sections],
  );

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedContentIds([]);
      setSearchQuery("");
    }
  }, [open]);

  // Check which content items are already in the resume
  const getContentStatus = (contentId: string) => {
    if (!section || !("items" in section)) return null;

    const items = Array.isArray(section.items) ? section.items : [];

    // Check if this content is directly added (contentId matches)
    const directMatch = items.find((item) => item.contentId === contentId);
    if (directMatch) {
      return { type: "added-from-library", item: directMatch };
    }

    // Check if this content is a variant (sourceContentId matches)
    const variantMatch = items.find((item) => item.sourceContentId === contentId);
    if (variantMatch) {
      return { type: "variant-from-library", item: variantMatch };
    }

    return null;
  };

  // Filter content based on search
  const filteredContent = useMemo(() => {
    if (!contentItems) return [];

    return contentItems.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        item.tags.some((tag) => tag.tag.name.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesSearch;
    });
  }, [contentItems, searchQuery]);

  const handleToggleSelection = (contentId: string) => {
    setSelectedContentIds((prev) => {
      const isSelected = prev.includes(contentId);
      return isSelected ? prev.filter((id) => id !== contentId) : [...prev, contentId];
    });
  };

  const handleSelectAll = () => {
    setSelectedContentIds(filteredContent.map((item) => item.id));
  };

  const handleDeselectAll = () => {
    setSelectedContentIds([]);
  };

  const handleAddToResume = () => {
    if (selectedContentIds.length === 0) {
      toast({
        variant: "error",
        title: t`No Content Selected`,
        description: t`Please select at least one content item to add to your resume`,
      });
      return;
    }

    try {
      // Get selected content items
      const selectedItems = filteredContent.filter((item) => selectedContentIds.includes(item.id));

      // Filter out items that are already in the resume
      const newItems = selectedItems.filter((content) => {
        const status = getContentStatus(content.id);
        return status === null; // Only add items not already in resume
      });

      if (newItems.length === 0) {
        toast({
          variant: "warning",
          title: t`No New Content to Add`,
          description: t`All selected items are already in your resume`,
        });
        return;
      }

      // Add each selected content item to the resume
      for (const content of newItems) {
        // The content field is already parsed by the backend
        const parsedData = content.content || {
          title: content.title,
          description: content.description,
        };

        // Create new item with contentId tracking
        const newItem = {
          ...parsedData,
          id: createId(),
          visible: true,
          contentId: content.id, // Track that this came from content library
          sourceContentId: null, // Not modified yet
        };

        // Add to the section using setValue
        if (section && "items" in section) {
          const currentItems = Array.isArray(section.items) ? section.items : [];
          setValue(`sections.${sectionId}.items`, [...currentItems, newItem]);
        }
      }

      const skippedCount = selectedItems.length - newItems.length;
      const message =
        skippedCount > 0
          ? t`Added ${newItems.length} item(s) to your ${sectionName} section. ${skippedCount} item(s) were already in your resume.`
          : t`Added ${newItems.length} item(s) to your ${sectionName} section`;

      toast({
        variant: "success",
        title: t`Content Added Successfully`,
        description: message,
      });

      // Reset and close dialog
      setSelectedContentIds([]);
      setSearchQuery("");
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "error",
        title: t`Failed to Add Content`,
        description:
          error instanceof Error ? error.message : t`An error occurred while adding content`,
      });
    }
  };

  const handleClose = () => {
    setSelectedContentIds([]);
    setSearchQuery("");
    onOpenChange(false);
  };

  // Show loading state while loading content
  const isLoading = isLoadingContent;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl">
        <DialogHeader>
          <DialogTitle>{t`Select Content for ${sectionName}`}</DialogTitle>
          <DialogDescription>
            {t`Choose content from your library to add to your resume. Selected items will be added with a link to your content library.`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Search and Controls */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <MagnifyingGlass className="text-muted-foreground absolute left-3 top-3 size-4" />
              <Input
                placeholder={t`Search content...`}
                value={searchQuery}
                className="pl-10"
                disabled={isLoading}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={isLoading || filteredContent.length === 0}
                onClick={handleSelectAll}
              >
                {t`Select All`}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={isLoading || selectedContentIds.length === 0}
                onClick={handleDeselectAll}
              >
                {t`Clear`}
              </Button>
            </div>
          </div>

          {/* Content List */}
          <ScrollArea className="max-h-[60vh]">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                <span className="text-muted-foreground ml-2">{t`Loading content...`}</span>
              </div>
            ) : filteredContent.length > 0 ? (
              <div className="space-y-3">
                {filteredContent.map((content) => {
                  const contentStatus = getContentStatus(content.id);
                  const isAlreadyInResume = contentStatus !== null;
                  const isSelected = selectedContentIds.includes(content.id);

                  // Get status configuration
                  const getStatusConfig = () => {
                    if (!contentStatus) return null;

                    switch (contentStatus.type) {
                      case "added-from-library": {
                        return {
                          icon: Database,
                          color: "text-green-600",
                          bgColor: "bg-green-100",
                          label: t`Added from Library`,
                        };
                      }
                      case "variant-from-library": {
                        return {
                          icon: Database,
                          color: "text-blue-600",
                          bgColor: "bg-blue-100",
                          label: t`Variant from Library`,
                        };
                      }
                      default: {
                        return null;
                      }
                    }
                  };

                  const statusConfig = getStatusConfig();
                  const StatusIcon = statusConfig?.icon;

                  return (
                    <Card
                      key={content.id}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        isSelected && "border-primary ring-2 ring-primary/20",
                        isAlreadyInResume && "opacity-75",
                      )}
                      onClick={() => {
                        handleToggleSelection(content.id);
                      }}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex flex-1 items-start gap-3">
                            <div
                              className={cn(
                                "mt-1 flex size-4 items-center justify-center rounded border-2",
                                isSelected
                                  ? "border-primary bg-primary"
                                  : (isAlreadyInResume
                                    ? "bg-muted border-muted"
                                    : "border-muted-foreground/30"),
                              )}
                            >
                              {isSelected && (
                                <Check size={12} className="text-primary-foreground" />
                              )}
                              {isAlreadyInResume && !isSelected && (
                                <Check size={12} className="text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <CardTitle className="text-base">{content.title}</CardTitle>
                                {statusConfig && (
                                  <Badge
                                    variant="secondary"
                                    className={cn(
                                      "text-xs",
                                      statusConfig.color,
                                      statusConfig.bgColor,
                                    )}
                                  >
                                    {StatusIcon && <StatusIcon className="mr-1 size-3" />}
                                    {statusConfig.label}
                                  </Badge>
                                )}
                              </div>
                              {content.description && (
                                <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                                  {content.description}
                                </p>
                              )}
                              {content.tags.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {content.tags.slice(0, 3).map((tag) => (
                                    <Badge
                                      key={tag.tag.id}
                                      variant="secondary"
                                      className="text-xs"
                                      style={{
                                        backgroundColor: (tag.tag.color || "#3B82F6") + "20",
                                        color: tag.tag.color || "#3B82F6",
                                      }}
                                    >
                                      {tag.tag.name}
                                    </Badge>
                                  ))}
                                  {content.tags.length > 3 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{content.tags.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="text-muted-foreground">
                  <p className="mb-2 text-lg">
                    {searchQuery ? t`No content matches "${searchQuery}"` : t`No content found`}
                  </p>
                  <p className="text-sm">
                    {searchQuery
                      ? t`Try adjusting your search terms`
                      : t`Add some content to your library first`}
                  </p>
                </div>
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter>
          <div className="flex w-full items-center justify-between">
            <div className="text-muted-foreground text-sm">
              {selectedContentIds.length > 0 && (
                <span>{t`${selectedContentIds.length} item(s) selected`}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleClose}>
                {t`Cancel`}
              </Button>
              <Button
                disabled={selectedContentIds.length === 0 || isLoading}
                onClick={handleAddToResume}
              >
                <Plus className="mr-2 size-4" />
                {t`Add to Resume`}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
