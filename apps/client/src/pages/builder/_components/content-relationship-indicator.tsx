import { t } from "@lingui/macro";
import { ArrowCounterClockwise, Database, PencilSimple, Plus } from "@phosphor-icons/react";
import { Button, Tooltip } from "@reactive-resume/ui";
import { cn } from "@reactive-resume/utils";
import { AnimatePresence } from "framer-motion";
import { useState } from "react";

type ContentRelationshipIndicatorProps = {
  contentId: string | null;
  sourceContentId: string | null;
  onAddToLibrary?: () => void;
  onRevertToOriginal?: () => void;
  className?: string;
};

export const ContentRelationshipIndicator = ({
  contentId,
  sourceContentId,
  onAddToLibrary,
  onRevertToOriginal,
  className,
}: ContentRelationshipIndicatorProps) => {
  const [isHovered, setIsHovered] = useState(false);

  // Determine relationship type
  const getRelationshipType = () => {
    if (contentId && !sourceContentId) return "added-from-library";
    if (contentId && sourceContentId) return "variant-from-library";
    if (!contentId && sourceContentId) return "modified";
    if (!contentId && !sourceContentId) return "new";
    return "none";
  };

  const relationshipType = getRelationshipType();

  const getIndicatorConfig = () => {
    switch (relationshipType) {
      case "added-from-library": {
        return {
          icon: Database,
          color: "text-green-600",
          bgColor: "bg-green-100",
          tooltip: t`Added from Content Library`,
          label: t`Added from Library`,
        };
      }
      case "variant-from-library": {
        return {
          icon: Database,
          color: "text-blue-600",
          bgColor: "bg-blue-100",
          tooltip: t`Variant from Content Library`,
          label: t`Variant from Library`,
        };
      }
      case "modified": {
        return {
          icon: PencilSimple,
          color: "text-orange-600",
          bgColor: "bg-orange-100",
          tooltip: t`Modified from Content Library`,
          label: t`Modified`,
        };
      }
      case "new": {
        return {
          icon: Plus,
          color: "text-gray-600",
          bgColor: "bg-gray-100",
          tooltip: t`New Content`,
          label: t`New`,
        };
      }
      default: {
        return {
          icon: Database,
          color: "text-gray-600",
          bgColor: "bg-gray-100",
          tooltip: t`Unknown Source`,
          label: t`Unknown`,
        };
      }
    }
  };

  const config = getIndicatorConfig();
  const IconComponent = config.icon;

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
    >
      {/* Relationship Badge */}
      <Tooltip content={config.tooltip}>
        <div
          className={cn(
            "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition-colors",
            config.color,
            config.bgColor,
            isHovered && "opacity-80",
          )}
        >
          <IconComponent className="size-3" />
          <span className="hidden sm:inline">{config.label}</span>
        </div>
      </Tooltip>

      {/* Action Buttons */}
      <AnimatePresence>
        {isHovered && (
          <div className="flex items-center gap-1">
            {/* Add to Library Button (for modified or new content) */}
            {(relationshipType === "modified" || relationshipType === "new") && onAddToLibrary && (
              <Tooltip content={t`Add to Content Library`}>
                <Button size="icon" variant="ghost" className="size-6" onClick={onAddToLibrary}>
                  <Plus className="size-3" />
                </Button>
              </Tooltip>
            )}

            {/* Revert Button (for modified content) */}
            {relationshipType === "modified" && onRevertToOriginal && (
              <Tooltip content={t`Revert to Original`}>
                <Button size="icon" variant="ghost" className="size-6" onClick={onRevertToOriginal}>
                  <ArrowCounterClockwise className="size-3" />
                </Button>
              </Tooltip>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Hook to get content relationship info
export const useContentRelationship = (
  contentId: string | null,
  sourceContentId: string | null,
) => {
  const getRelationshipType = () => {
    if (contentId && !sourceContentId) return "added-from-library";
    if (contentId && sourceContentId) return "variant-from-library";
    if (!contentId && sourceContentId) return "modified";
    if (!contentId && !sourceContentId) return "new";
    return "none";
  };

  const relationshipType = getRelationshipType();

  const isAddedFromLibrary = relationshipType === "added-from-library";
  const isVariantFromLibrary = relationshipType === "variant-from-library";
  const isModified = relationshipType === "modified";
  const isNew = relationshipType === "new";

  return {
    relationshipType,
    isAddedFromLibrary,
    isVariantFromLibrary,
    isModified,
    isNew,
    contentId,
    sourceContentId,
  };
};
