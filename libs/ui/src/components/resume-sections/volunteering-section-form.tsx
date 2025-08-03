import type { Volunteer } from "@reactive-resume/schema";
import { Input, RichInput } from "@reactive-resume/ui";
import type { Editor } from "@tiptap/react";

import { URLInput } from "../url-input";

export type VolunteeringSectionFormProps = {
  values: Volunteer;
  errors?: Record<string, string>;
  onChange: (field: keyof Volunteer, value: Volunteer[keyof Volunteer]) => void;
  className?: string;
  footer?: (editor: Editor) => React.ReactNode;
};

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
        <label className="mb-1 block text-sm font-medium">Organization</label>
        <Input
          value={values.organization}
          hasError={!!errors.organization}
          onChange={(e) => {
            onChange("organization", e.target.value);
          }}
        />
        {errors.organization && (
          <div className="mt-1 text-xs text-red-500">{errors.organization}</div>
        )}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Position</label>
        <Input
          value={values.position}
          hasError={!!errors.position}
          onChange={(e) => {
            onChange("position", e.target.value);
          }}
        />
        {errors.position && <div className="mt-1 text-xs text-red-500">{errors.position}</div>}
      </div>
      <div>
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
      <div>
        <label className="mb-1 block text-sm font-medium">Location</label>
        <Input
          value={values.location}
          hasError={!!errors.location}
          onChange={(e) => {
            onChange("location", e.target.value);
          }}
        />
        {errors.location && <div className="mt-1 text-xs text-red-500">{errors.location}</div>}
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
