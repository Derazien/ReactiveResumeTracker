import type { Project } from "@reactive-resume/schema";
import { URLInput, RichInput, BadgeInput, Checkbox, Badge } from "@reactive-resume/ui";
import { Input } from "@reactive-resume/ui";
import { X } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { Editor } from "@tiptap/react";

export interface ProjectsSectionFormProps {
  values: Project;
  errors?: Record<string, string>;
  onChange: (field: keyof Project, value: Project[keyof Project]) => void;
  className?: string;
  footer?: (editor: Editor) => React.ReactNode;
}

export const ProjectsSectionForm = ({
  values,
  errors = {},
  onChange,
  className = "",
  footer,
}: ProjectsSectionFormProps) => {
  const [pendingKeyword, setPendingKeyword] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (
    e: React.DragEvent,
    dropIndex: number,
  ) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const newKeywords = [...values.keywords];
    const [draggedItem] = newKeywords.splice(draggedIndex, 1);
    newKeywords.splice(dropIndex, 0, draggedItem);

    onChange("keywords", newKeywords);
    setDraggedIndex(null);
  };

  return (
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${className}`}>
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <Input
          value={values.name}
          onChange={(e) => onChange("name", e.target.value)}
          hasError={!!errors.name}
        />
        {errors.name && <div className="text-xs text-red-500 mt-1">{errors.name}</div>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Input
          value={values.description}
          onChange={(e) => onChange("description", e.target.value)}
          hasError={!!errors.description}
        />
        {errors.description && <div className="text-xs text-red-500 mt-1">{errors.description}</div>}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={values.showDescription}
            onCheckedChange={(checked) => onChange("showDescription", checked as boolean)}
          />
          <span className="text-sm">Show Description</span>
        </div>
        {errors.showDescription && <div className="text-xs text-red-500 mt-1">{errors.showDescription}</div>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Date or Date Range</label>
        <Input
          value={values.date}
          onChange={(e) => onChange("date", e.target.value)}
          hasError={!!errors.date}
          placeholder="March 2023 - Present"
        />
        {errors.date && <div className="text-xs text-red-500 mt-1">{errors.date}</div>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Website</label>
        <URLInput
          value={values.url ?? { label: "", href: "" }}
          onChange={(value) => onChange("url", value)}
          placeholder="https://rxresu.me"
        />
        {errors.url && <div className="text-xs text-red-500 mt-1">{errors.url}</div>}
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium mb-1">Summary</label>
        <RichInput
          content={values.summary}
          onChange={(value) => onChange("summary", value)}
          footer={footer}
        />
        {errors.summary && <div className="text-xs text-red-500 mt-1">{errors.summary}</div>}
      </div>
      <div className="space-y-3 sm:col-span-2">
        <div>
          <label className="block text-sm font-medium mb-1">Keywords</label>
          <BadgeInput
            value={values.keywords}
            onChange={(value) => onChange("keywords", value)}
            setPendingKeyword={setPendingKeyword}
            hasError={!!errors.keywords}
          />
          <div className="text-xs text-muted-foreground mt-1">
            You can add multiple keywords by separating them with a comma or pressing enter.
          </div>
          {errors.keywords && <div className="text-xs text-red-500 mt-1">{errors.keywords}</div>}
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={values.showKeywords}
            onCheckedChange={(checked) => onChange("showKeywords", checked as boolean)}
          />
          <span className="text-sm">Show Keywords</span>
        </div>
        {errors.showKeywords && <div className="text-xs text-red-500 mt-1">{errors.showKeywords}</div>}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-3">
          <AnimatePresence>
            {values.keywords.map((item, index) => (
              <motion.div
                key={item}
                layout
                draggable
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0, transition: { delay: index * 0.1 } }}
                exit={{ opacity: 0, x: -50 }}
                onDragStart={() => {
                  setDraggedIndex(index);
                }}
                onDragOver={handleDragOver}
                onDrop={(e) => {
                  handleDrop(e, index);
                }}
              >
                <Badge className="cursor-move">
                  <span className="mr-1">{item}</span>
                  <X
                    className="cursor-pointer"
                    size={12}
                    weight="bold"
                    onClick={() => {
                      onChange("keywords", values.keywords.filter((v) => item !== v));
                    }}
                  />
                </Badge>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}; 