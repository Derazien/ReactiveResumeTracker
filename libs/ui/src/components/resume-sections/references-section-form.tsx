import type { Reference } from "@reactive-resume/schema";
import { Checkbox, Input, RichInput } from "@reactive-resume/ui";
import type { Editor } from "@tiptap/react";

import { URLInput } from "../url-input";

export type ReferencesSectionFormProps = {
  values: Reference;
  errors?: Record<string, string>;
  onChange: (field: keyof Reference, value: Reference[keyof Reference]) => void;
  className?: string;
  footer?: (editor: Editor) => React.ReactNode;
};

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
        <label className="mb-1 block text-sm font-medium">Description</label>
        <Input
          value={values.description}
          hasError={!!errors.description}
          onChange={(e) => {
            onChange("description", e.target.value);
          }}
        />
        {errors.description && (
          <div className="mt-1 text-xs text-red-500">{errors.description}</div>
        )}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={values.showDescription}
            onCheckedChange={(checked) => {
              onChange("showDescription", checked as boolean);
            }}
          />
          <span className="text-sm">Show Description</span>
        </div>
        {errors.showDescription && (
          <div className="mt-1 text-xs text-red-500">{errors.showDescription}</div>
        )}
      </div>
      <div className="sm:col-span-2">
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
