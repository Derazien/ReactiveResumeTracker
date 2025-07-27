import type { Award } from "@reactive-resume/schema";
import { URLInput } from "../url-input";
import { Input, RichInput } from "@reactive-resume/ui";
import type { Editor } from "@tiptap/react";

export interface AwardsSectionFormProps {
  values: Award;
  errors?: Record<string, string>;
  onChange: (field: keyof Award, value: Award[keyof Award]) => void;
  className?: string;
  footer?: (editor: Editor) => React.ReactNode;
}

export const AwardsSectionForm = ({
  values,
  errors = {},
  onChange,
  className = "",
  footer,
}: AwardsSectionFormProps) => {
  return (
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${className}`}>
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <Input
          value={values.title}
          onChange={(e) => onChange("title", e.target.value)}
          hasError={!!errors.title}
        />
        {errors.title && <div className="text-xs text-red-500 mt-1">{errors.title}</div>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Awarder</label>
        <Input
          value={values.awarder}
          onChange={(e) => onChange("awarder", e.target.value)}
          hasError={!!errors.awarder}
        />
        {errors.awarder && <div className="text-xs text-red-500 mt-1">{errors.awarder}</div>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Date</label>
        <Input
          value={values.date}
          onChange={(e) => onChange("date", e.target.value)}
          hasError={!!errors.date}
          placeholder="March 2023"
        />
        {errors.date && <div className="text-xs text-red-500 mt-1">{errors.date}</div>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Website</label>
        <URLInput
          value={values.url ?? { label: "", href: "" }}
          onChange={(value) => onChange("url", value)}
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
    </div>
  );
}; 