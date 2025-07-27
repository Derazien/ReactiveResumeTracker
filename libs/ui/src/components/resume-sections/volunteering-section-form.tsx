import type { Volunteer } from "@reactive-resume/schema";
import { URLInput } from "../url-input";
import { Input, RichInput } from "@reactive-resume/ui";
import type { Editor } from "@tiptap/react";

export interface VolunteeringSectionFormProps {
  values: Volunteer;
  errors?: Record<string, string>;
  onChange: (field: keyof Volunteer, value: Volunteer[keyof Volunteer]) => void;
  className?: string;
  footer?: (editor: Editor) => React.ReactNode;
}

export const VolunteeringSectionForm = ({
  values,
  errors = {},
  onChange,
  className = "",
  footer,
}: VolunteeringSectionFormProps) => {
  return (
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${className}`}>
      <div>
        <label className="block text-sm font-medium mb-1">Organization</label>
        <Input
          value={values.organization}
          onChange={(e) => onChange("organization", e.target.value)}
          hasError={!!errors.organization}
        />
        {errors.organization && <div className="text-xs text-red-500 mt-1">{errors.organization}</div>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Position</label>
        <Input
          value={values.position}
          onChange={(e) => onChange("position", e.target.value)}
          hasError={!!errors.position}
        />
        {errors.position && <div className="text-xs text-red-500 mt-1">{errors.position}</div>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Date or Date Range</label>
        <Input
          value={values.date}
          onChange={(e) => onChange("date", e.target.value)}
          hasError={!!errors.date}
          placeholder="March 2023 - Present"
        />
        {errors.date && <div className="text-xs text-red-500 mt-1">{errors.date}</div>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Location</label>
        <Input
          value={values.location}
          onChange={(e) => onChange("location", e.target.value)}
          hasError={!!errors.location}
        />
        {errors.location && <div className="text-xs text-red-500 mt-1">{errors.location}</div>}
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