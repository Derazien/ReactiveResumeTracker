import type { Reference } from "@reactive-resume/schema";
import { URLInput } from "../url-input";
import { Input, RichInput, Checkbox } from "@reactive-resume/ui";
import type { Editor } from "@tiptap/react";

export interface ReferencesSectionFormProps {
  values: Reference;
  errors?: Record<string, string>;
  onChange: (field: keyof Reference, value: Reference[keyof Reference]) => void;
  className?: string;
  footer?: (editor: Editor) => React.ReactNode;
}

export const ReferencesSectionForm = ({
  values,
  errors = {},
  onChange,
  className = "",
  footer,
}: ReferencesSectionFormProps) => {
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