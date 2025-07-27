import type { Education } from "@reactive-resume/schema";
import { URLInput } from "../url-input";
import { Input, RichInput } from "@reactive-resume/ui";
import type { Editor } from "@tiptap/react";

export interface EducationSectionFormProps {
  values: Education;
  errors?: Record<string, string>;
  onChange: (field: keyof Education, value: Education[keyof Education]) => void;
  className?: string;
  footer?: (editor: Editor) => React.ReactNode;
}

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
        <label className="block text-sm font-medium mb-1">Institution</label>
        <Input
          value={values.institution}
          onChange={(e) => onChange("institution", e.target.value)}
          hasError={!!errors.institution}
        />
        {errors.institution && <div className="text-xs text-red-500 mt-1">{errors.institution}</div>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Type of Study</label>
        <Input
          value={values.studyType}
          onChange={(e) => onChange("studyType", e.target.value)}
          hasError={!!errors.studyType}
        />
        {errors.studyType && <div className="text-xs text-red-500 mt-1">{errors.studyType}</div>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Area of Study</label>
        <Input
          value={values.area}
          onChange={(e) => onChange("area", e.target.value)}
          hasError={!!errors.area}
        />
        {errors.area && <div className="text-xs text-red-500 mt-1">{errors.area}</div>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Score</label>
        <Input
          value={values.score}
          onChange={(e) => onChange("score", e.target.value)}
          hasError={!!errors.score}
          placeholder="9.2 GPA"
        />
        {errors.score && <div className="text-xs text-red-500 mt-1">{errors.score}</div>}
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium mb-1">Date or Date Range</label>
        <Input
          value={values.date}
          onChange={(e) => onChange("date", e.target.value)}
          hasError={!!errors.date}
          placeholder="March 2023 - Present"
        />
        {errors.date && <div className="text-xs text-red-500 mt-1">{errors.date}</div>}
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