import type { Education } from "@reactive-resume/schema";
import { Input, RichInput } from "@reactive-resume/ui";
import type { Editor } from "@tiptap/react";

import { URLInput } from "../url-input";

export type EducationSectionFormProps = {
  values: Education;
  errors?: Record<string, string>;
  onChange: (field: keyof Education, value: Education[keyof Education]) => void;
  className?: string;
  footer?: (editor: Editor) => React.ReactNode;
};

export const EducationSectionForm = ({
  values,
  errors = {},
  onChange,
  className = "",
  footer,
}: EducationSectionFormProps) => {
  return (
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${className}`}>
      <div>
        <label className="mb-1 block text-sm font-medium">Institution</label>
        <Input
          value={values.institution}
          hasError={!!errors.institution}
          onChange={(e) => {
            onChange("institution", e.target.value);
          }}
        />
        {errors.institution && (
          <div className="mt-1 text-xs text-red-500">{errors.institution}</div>
        )}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Type of Study</label>
        <Input
          value={values.studyType}
          hasError={!!errors.studyType}
          onChange={(e) => {
            onChange("studyType", e.target.value);
          }}
        />
        {errors.studyType && <div className="mt-1 text-xs text-red-500">{errors.studyType}</div>}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Area of Study</label>
        <Input
          value={values.area}
          hasError={!!errors.area}
          onChange={(e) => {
            onChange("area", e.target.value);
          }}
        />
        {errors.area && <div className="mt-1 text-xs text-red-500">{errors.area}</div>}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Score</label>
        <Input
          value={values.score}
          hasError={!!errors.score}
          placeholder="9.2 GPA"
          onChange={(e) => {
            onChange("score", e.target.value);
          }}
        />
        {errors.score && <div className="mt-1 text-xs text-red-500">{errors.score}</div>}
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1 block text-sm font-medium">Date or Date Range</label>
        <Input
          value={values.date}
          hasError={!!errors.date}
          placeholder="March 2023 - Present"
          onChange={(e) => {
            onChange("date", e.target.value);
          }}
        />
        {errors.date && <div className="mt-1 text-xs text-red-500">{errors.date}</div>}
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
