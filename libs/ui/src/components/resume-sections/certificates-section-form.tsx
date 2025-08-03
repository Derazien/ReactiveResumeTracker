import type { Certification } from "@reactive-resume/schema";
import { Input, RichInput } from "@reactive-resume/ui";
import type { Editor } from "@tiptap/react";

import { URLInput } from "../url-input";

export type CertificatesSectionFormProps = {
  values: Certification;
  errors?: Record<string, string>;
  onChange: (field: keyof Certification, value: Certification[keyof Certification]) => void;
  className?: string;
  footer?: (editor: Editor) => React.ReactNode;
};

export const CertificatesSectionForm = ({
  values,
  errors = {},
  onChange,
  className = "",
  footer,
}: CertificatesSectionFormProps) => {
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
        <label className="mb-1 block text-sm font-medium">Issuer</label>
        <Input
          value={values.issuer}
          hasError={!!errors.issuer}
          onChange={(e) => {
            onChange("issuer", e.target.value);
          }}
        />
        {errors.issuer && <div className="mt-1 text-xs text-red-500">{errors.issuer}</div>}
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
          placeholder="https://udemy.com/certificate/UC-..."
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
