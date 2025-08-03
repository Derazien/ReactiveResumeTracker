import type { Award } from "@reactive-resume/schema";
import { Input, RichInput } from "@reactive-resume/ui";
import type { Editor } from "@tiptap/react";

import { URLInput } from "../url-input";

export type AwardsSectionFormProps = {
  values: Award;
  errors?: Record<string, string>;
  onChange: (field: keyof Award, value: Award[keyof Award]) => void;
  className?: string;
  footer?: (editor: Editor) => React.ReactNode;
};

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
        <label className="mb-1 block text-sm font-medium">Title</label>
        <Input
          value={values.title}
          hasError={!!errors.title}
          onChange={(e) => {
            onChange("title", e.target.value);
          }}
        />
        {errors.title && <div className="mt-1 text-xs text-red-500">{errors.title}</div>}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Awarder</label>
        <Input
          value={values.awarder}
          hasError={!!errors.awarder}
          onChange={(e) => {
            onChange("awarder", e.target.value);
          }}
        />
        {errors.awarder && <div className="mt-1 text-xs text-red-500">{errors.awarder}</div>}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Date</label>
        <Input
          value={values.date}
          hasError={!!errors.date}
          placeholder="March 2023"
          onChange={(e) => {
            onChange("date", e.target.value);
          }}
        />
        {errors.date && <div className="mt-1 text-xs text-red-500">{errors.date}</div>}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Website</label>
        <URLInput
          value={values.url ?? { label: "", href: "" }}
          onChange={(value) => {
            onChange("url", value);
          }}
        />
        {errors.url && <div className="mt-1 text-xs text-red-500">{errors.url}</div>}
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1 block text-sm font-medium">Summary</label>
        <RichInput
          content={values.summary}
          footer={footer}
          onChange={(value) => {
            onChange("summary", value);
          }}
        />
        {errors.summary && <div className="mt-1 text-xs text-red-500">{errors.summary}</div>}
      </div>
    </div>
  );
};
