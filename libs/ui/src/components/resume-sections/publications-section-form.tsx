import type { Publication } from "@reactive-resume/schema";
import { Input, RichInput } from "@reactive-resume/ui";
import type { Editor } from "@tiptap/react";

import { URLInput } from "../url-input";

export type PublicationsSectionFormProps = {
  values: Publication;
  errors?: Record<string, string>;
  onChange: (field: keyof Publication, value: Publication[keyof Publication]) => void;
  className?: string;
  footer?: (editor: Editor) => React.ReactNode;
};

export const PublicationsSectionForm = ({
  values,
  errors = {},
  onChange,
  className = "",
  footer,
}: PublicationsSectionFormProps) => {
  return (
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${className}`}>
      <div>
        <label className="mb-1 block text-sm font-medium">Name</label>
        <Input
          value={values.name}
          hasError={!!errors.name}
          onChange={(e) => {
            onChange("name", e.target.value);
          }}
        />
        {errors.name && <div className="mt-1 text-xs text-red-500">{errors.name}</div>}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Publisher</label>
        <Input
          value={values.publisher}
          hasError={!!errors.publisher}
          onChange={(e) => {
            onChange("publisher", e.target.value);
          }}
        />
        {errors.publisher && <div className="mt-1 text-xs text-red-500">{errors.publisher}</div>}
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
