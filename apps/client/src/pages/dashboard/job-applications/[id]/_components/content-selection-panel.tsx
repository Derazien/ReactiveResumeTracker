import { t } from "@lingui/macro";
import { Check, Clock, Star, X } from "@phosphor-icons/react";
import { Button, Card, Checkbox, Tooltip } from "@reactive-resume/ui";
import { cn } from "@reactive-resume/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { useToast } from "@/client/hooks/use-toast";
import {
  type ContentSelectionItem,
  useGetMatchedContent,
  useUpdateContentSelection,
} from "@/client/services/content-selection";

type ContentSelectionPanelProps = {
  jobApplicationId: string;
  isOpen: boolean;
  onClose: () => void;
  onContentSelectionChange: (selectedContent: ContentSelectionItem[]) => void;
};

export const ContentSelectionPanel = ({
  jobApplicationId,
  isOpen,
  onClose,
  onContentSelectionChange,
}: ContentSelectionPanelProps) => {
  const { toast } = useToast();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const { data: matchedContent, isLoading, error } = useGetMatchedContent(jobApplicationId);
  const { mutateAsync: updateSelection, isPending } = useUpdateContentSelection();

  const handleItemToggle = (contentId: string, isSelected: boolean) => {
    const newSelected = new Set(selectedItems);
    if (isSelected) {
      newSelected.add(contentId);
    } else {
      newSelected.delete(contentId);
    }
    setSelectedItems(newSelected);
  };

  const handleSaveSelection = async () => {
    if (!matchedContent?.data) return;

    const selectedContent = matchedContent.data.map((item) => ({
      ...item,
      isSelected: selectedItems.has(item.contentId),
    }));

    try {
      await updateSelection({ jobApplicationId, selectedContent });
      onContentSelectionChange(selectedContent.filter((item) => item.isSelected));
      onClose();

      toast({
        variant: "success",
        title: t`Success`,
        description: t`Content selection updated successfully!`,
      });
    } catch {
      toast({
        variant: "error",
        title: t`Error`,
        description: t`Failed to update content selection. Please try again.`,
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    if (score >= 40) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  };

  const getSectionIcon = (sectionKey: string) => {
    switch (sectionKey) {
      case "experience": {
        return "💼";
      }
      case "education": {
        return "🎓";
      }
      case "skills": {
        return "⚡";
      }
      case "projects": {
        return "🚀";
      }
      case "certifications": {
        return "🏆";
      }
      default: {
        return "📄";
      }
    }
  };

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-600">{t`Failed to load content. Please try again.`}</p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="max-h-[80vh] w-full max-w-4xl overflow-hidden rounded-lg bg-background shadow-xl"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b p-4">
              <div className="flex items-center gap-2">
                <Star className="size-5 text-primary" />
                <h2 className="text-lg font-semibold">{t`Select Content for Resume`}</h2>
              </div>
              <Button size="icon" variant="ghost" onClick={onClose}>
                <X className="size-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="size-8 animate-spin rounded-full border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {matchedContent?.data?.map((item) => (
                    <ContentMatchCard
                      key={item.contentId}
                      item={item}
                      isSelected={selectedItems.has(item.contentId)}
                      getScoreColor={getScoreColor}
                      getSectionIcon={getSectionIcon}
                      onToggle={handleItemToggle}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t p-4">
              <div className="text-muted-foreground text-sm">
                {t`Selected ${selectedItems.size} items`}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  {t`Cancel`}
                </Button>
                <Button disabled={isPending} onClick={handleSaveSelection}>
                  {isPending ? (
                    <div className="size-4 animate-spin rounded-full border-b-2 border-white"></div>
                  ) : (
                    <Check className="size-4" />
                  )}
                  {t`Save Selection`}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

type ContentMatchCardProps = {
  item: ContentSelectionItem;
  isSelected: boolean;
  onToggle: (contentId: string, isSelected: boolean) => void;
  getScoreColor: (score: number) => string;
  getSectionIcon: (sectionKey: string) => string;
};

const ContentMatchCard = ({
  item,
  isSelected,
  onToggle,
  getScoreColor,
  getSectionIcon,
}: ContentMatchCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="p-4 transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        <Checkbox
          checked={isSelected}
          className="mt-1"
          onCheckedChange={(checked) => {
            onToggle(item.contentId, checked as boolean);
          }}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-lg">{getSectionIcon(item.sectionKey)}</span>
                <h3 className="truncate font-medium">{item.title}</h3>
                {item.isCurrentJob && (
                  <Tooltip content={t`Current Position`}>
                    <Clock className="size-4 text-green-600" />
                  </Tooltip>
                )}
              </div>

              <div className="mb-2 flex items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-2 py-1 text-xs font-medium",
                    getScoreColor(item.matchScore),
                  )}
                >
                  {item.matchScore}% Match
                </span>
                <span className="text-muted-foreground text-xs capitalize">
                  {item.sectionKey.replace("_", " ")}
                </span>
              </div>
            </div>
          </div>

          {/* Match Reasons */}
          {item.matchReasons.length > 0 && (
            <div className="mb-2">
              <p className="text-muted-foreground text-sm">
                {item.matchReasons.slice(0, 2).join(" • ")}
              </p>
            </div>
          )}

          {/* Expandable Details */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground h-auto p-0 text-xs hover:text-foreground"
              onClick={() => {
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? t`Show less` : t`Show details`}
            </Button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2 border-t pt-2">
                    {/* All Match Reasons */}
                    {item.matchReasons.length > 0 && (
                      <div>
                        <h4 className="mb-1 text-xs font-medium">{t`Why this matches:`}</h4>
                        <ul className="text-muted-foreground space-y-1 text-xs">
                          {item.matchReasons.map((reason, index) => (
                            <li key={index} className="flex items-start gap-1">
                              <span className="text-primary">•</span>
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Suggestions */}
                    {item.matchSuggestions.length > 0 && (
                      <div>
                        <h4 className="mb-1 text-xs font-medium">{t`Suggestions:`}</h4>
                        <ul className="text-muted-foreground space-y-1 text-xs">
                          {item.matchSuggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-start gap-1">
                              <span className="text-blue-500">💡</span>
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Card>
  );
};
