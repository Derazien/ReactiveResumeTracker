import { X } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { Interest } from "@reactive-resume/schema";
import { Badge, BadgeInput, Checkbox, Input } from "@reactive-resume/ui";

export interface InterestsSectionFormProps {
  values: Interest;
  errors?: Record<string, string>;
  onChange: (field: keyof Interest, value: Interest[keyof Interest]) => void;
  className?: string;
}

export const InterestsSectionForm = ({
  values,
  errors = {},
  onChange,
  className = "",
}: InterestsSectionFormProps) => {
  const [pendingKeyword, setPendingKeyword] = useState("");

  return (
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${className}`}>
      <div className="col-span-2">
        <label className="block text-sm font-medium mb-1">Name</label>
        <Input
          value={values.name}
          onChange={(e) => onChange("name", e.target.value)}
          hasError={!!errors.name}
        />
        {errors.name && <div className="text-xs text-red-500 mt-1">{errors.name}</div>}
      </div>

      <div className="col-span-2 space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Keywords</label>
          <BadgeInput
            value={values.keywords}
            onChange={(value) => onChange("keywords", value)}
            setPendingKeyword={setPendingKeyword}
          />
          <p className="text-xs text-muted-foreground mt-1">
            You can add multiple keywords by separating them with a comma or pressing enter.
          </p>
          {errors.keywords && <div className="text-xs text-red-500 mt-1">{errors.keywords}</div>}
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            checked={values.showKeywords}
            onCheckedChange={(checked) => onChange("showKeywords", checked as boolean)}
          />
          <span className="text-sm">Show Keywords</span>
        </div>

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