import type { Skill } from "@reactive-resume/schema";
import { BadgeInput, Slider, Checkbox, Badge } from "@reactive-resume/ui";
import { Input } from "@reactive-resume/ui";
import { X } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export interface SkillsSectionFormProps {
  values: Skill;
  errors?: Record<string, string>;
  onChange: (field: keyof Skill, value: Skill[keyof Skill]) => void;
  className?: string;
}

export const SkillsSectionForm = ({
  values,
  errors = {},
  onChange,
  className = "",
}: SkillsSectionFormProps) => {
  const [pendingKeyword, setPendingKeyword] = useState("");

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
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium mb-1">Level</label>
        <div className="flex items-center gap-x-4 py-2">
          <Slider
            min={0}
            max={5}
            value={[values.level]}
            orientation="horizontal"
            onValueChange={(value) => {
              onChange("level", value[0]);
            }}
          />
          {values.level > 0 ? (
            <span className="text-base font-bold">{values.level}</span>
          ) : (
            <span className="text-base font-bold">Hidden</span>
          )}
        </div>
        {errors.level && <div className="text-xs text-red-500 mt-1">{errors.level}</div>}
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
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0, transition: { delay: index * 0.1 } }}
                exit={{ opacity: 0, x: -50 }}
              >
                <Badge
                  className="cursor-pointer"
                  onClick={() => {
                    onChange("keywords", values.keywords.filter((v) => item !== v));
                  }}
                >
                  <span className="mr-1">{item}</span>
                  <X size={12} weight="bold" />
                </Badge>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}; 