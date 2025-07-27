import type { Publication } from "@reactive-resume/schema";
import { URLInput } from "../url-input";
import { Input, RichInput } from "@reactive-resume/ui";
import type { Editor } from "@tiptap/react";

export interface PublicationsSectionFormProps {
  values: Publication;
  errors?: Record<string, string>;
  onChange: (field: keyof Publication, value: Publication[keyof Publication]) => void;
  className?: string;
  footer?: (editor: Editor) => React.ReactNode;
}

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
        <label className="block text-sm font-medium mb-1">Name</label>
        <Input
          value={values.name}
          onChange={(e) => onChange("name", e.target.value)}
          hasError={!!errors.name}
        />
        {errors.name && <div className="text-xs text-red-500 mt-1">{errors.name}</div>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Publisher</label>
        <Input
          value={values.publisher}
          onChange={(e) => onChange("publisher", e.target.value)}
          hasError={!!errors.publisher}
        />
        {errors.publisher && <div className="text-xs text-red-500 mt-1">{errors.publisher}</div>}
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