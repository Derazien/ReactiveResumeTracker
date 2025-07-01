import type { DragEndEvent } from "@dnd-kit/core";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { t } from "@lingui/macro";
import { Database, PencilSimple, Plus } from "@phosphor-icons/react";
import type { SectionItem, SectionKey, SectionWithItem } from "@reactive-resume/schema";
import { Badge, Button, Tooltip } from "@reactive-resume/ui";
import { cn } from "@reactive-resume/utils";
import { AnimatePresence, motion } from "framer-motion";
import get from "lodash.get";

import { useDialog } from "@/client/stores/dialog";
import { useResumeStore } from "@/client/stores/resume";

import { SectionIcon } from "./section-icon";
import { SectionListItem } from "./section-list-item";
import { SectionOptions } from "./section-options";

type Props<T extends SectionItem> = {
  id: SectionKey;
  title: (item: T) => string;
  description?: (item: T) => string | undefined;
};

export const SectionBase = <T extends SectionItem>({ id, title, description }: Props<T>) => {
  const { open } = useDialog(id);

  const setValue = useResumeStore((state) => state.setValue);
  const section = useResumeStore((state) =>
    get(state.resume.data.sections, id),
  ) as SectionWithItem<T>;
  const resume = useResumeStore((state) => state.resume);

  // Check if this resume was generated from job application (has content library sources)
  const isJobGenerated =
    resume.jobApplicationId && resume.data.metadata.notes.includes("Content Library Items Used");

  // Check if item was sourced from content library (unmodified)
  const isFromContentLibrary = (item: SectionItem): boolean => {
    const itemWithIds = item as any;
    return !!itemWithIds.contentLibraryId && !itemWithIds.sourceContentLibraryId;
  };

  // Check if item was modified from content library source
  const isModifiedFromContentLibrary = (item: SectionItem): boolean => {
    const itemWithIds = item as any;
    return !!itemWithIds.sourceContentLibraryId;
  };

  // Check if item was manually created (no content library connection)
  const isManuallyCreated = (item: SectionItem): boolean => {
    const itemWithIds = item as any;
    return !itemWithIds.contentLibraryId && !itemWithIds.sourceContentLibraryId;
  };

  // Get item styling based on source
  const getItemStyling = (item: SectionItem) => {
    if (isFromContentLibrary(item)) {
      return "border border-blue-200 bg-blue-50/30 dark:border-blue-800 dark:bg-blue-900/20";
    }
    if (isModifiedFromContentLibrary(item)) {
      return "border border-orange-200 bg-orange-50/30 dark:border-orange-800 dark:bg-orange-900/20";
    }
    return "border border-transparent"; // Default styling for manual items
  };

  // Get content library badge for item
  const getContentLibraryBadge = (item: SectionItem) => {
    if (isFromContentLibrary(item)) {
      return (
        <Tooltip content="This content was sourced directly from your content library during job-based generation">
          <Badge variant="secondary" outline={true} className="mr-4 flex items-center gap-1">
            <Database size={10} />
            <span className="text-xs">Content Library</span>
          </Badge>
        </Tooltip>
      );
    }

    if (isModifiedFromContentLibrary(item)) {
      return (
        <Tooltip content="This content was originally from your content library but has been modified by AI optimization">
          <Badge variant="warning" outline={true} className="mr-4 flex items-center gap-1">
            <PencilSimple size={10} />
            <span className="text-xs">AI Modified</span>
          </Badge>
        </Tooltip>
      );
    }

    return null; // No badge for manually created items
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!section) return null;

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = section.items.findIndex((item) => item.id === active.id);
      const newIndex = section.items.findIndex((item) => item.id === over.id);

      const sortedList = arrayMove(section.items as T[], oldIndex, newIndex);
      setValue(`sections.${id}.items`, sortedList);
    }
  };

  const onCreate = () => {
    open("create", { id });
  };

  const onUpdate = (item: T) => {
    open("update", { id, item });
  };

  const onDuplicate = (item: T) => {
    open("duplicate", { id, item });
  };

  const onDelete = (item: T) => {
    open("delete", { id, item });
  };

  const onToggleVisibility = (index: number) => {
    const visible = get(section, `items[${index}].visible`, true);
    setValue(`sections.${id}.items[${index}].visible`, !visible);
  };

  return (
    <motion.section
      id={id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="grid gap-y-6"
    >
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-x-4">
          <SectionIcon id={id} size={18} />
          <h2 className="line-clamp-1 text-2xl font-bold lg:text-3xl">{section.name}</h2>
          {isJobGenerated && (
            <Tooltip content="This resume was generated from job analysis and content library matching">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Database size={12} />
                <span className="text-xs">AI Generated</span>
              </Badge>
            </Tooltip>
          )}
        </div>

        <div className="flex items-center gap-x-2">
          <SectionOptions id={id} />
        </div>
      </header>

      <main className={cn("grid transition-opacity", !section.visible && "opacity-50")}>
        {section.items.length === 0 && (
          <Button
            variant="outline"
            className="gap-x-2 border-dashed py-6 leading-relaxed hover:bg-secondary-accent"
            onClick={onCreate}
          >
            <Plus size={14} />
            <span className="font-medium">
              {t({
                message: "Add a new item",
                context: "For example, add a new work experience, or add a new profile.",
              })}
            </span>
          </Button>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToParentElement]}
          onDragEnd={onDragEnd}
        >
          <SortableContext items={section.items} strategy={verticalListSortingStrategy}>
            <AnimatePresence>
              {section.items.map((item, index) => (
                <div key={item.id} className={cn("rounded-lg", getItemStyling(item))}>
                  <div className="flex items-center gap-x-2">
                    <SectionListItem
                      id={item.id}
                      visible={item.visible}
                      title={title(item as T)}
                      description={description?.(item as T)}
                      onUpdate={() => {
                        onUpdate(item as T);
                      }}
                      onDelete={() => {
                        onDelete(item as T);
                      }}
                      onDuplicate={() => {
                        onDuplicate(item as T);
                      }}
                      onToggleVisibility={() => {
                        onToggleVisibility(index);
                      }}
                    />
                    {getContentLibraryBadge(item)}
                  </div>
                </div>
              ))}
            </AnimatePresence>
          </SortableContext>
        </DndContext>
      </main>

      {section.items.length > 0 && (
        <footer className="flex items-center justify-end">
          <Button
            variant="outline"
            className="ml-auto gap-x-2 text-xs lg:text-sm"
            onClick={onCreate}
          >
            <Plus />
            <span>
              {t({
                message: "Add a new item",
                context: "For example, add a new work experience, or add a new profile.",
              })}
            </span>
          </Button>
        </footer>
      )}
    </motion.section>
  );
};
