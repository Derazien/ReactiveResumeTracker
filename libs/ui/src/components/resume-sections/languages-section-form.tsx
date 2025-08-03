import type { Language } from "@reactive-resume/schema";
import { Checkbox, Slider } from "@reactive-resume/ui";
import { Input } from "@reactive-resume/ui";

export type LanguagesSectionFormProps = {
  values: Language;
  errors?: Record<string, string>;
  onChange: (field: keyof Language, value: Language[keyof Language]) => void;
  className?: string;
};

export const LanguagesSectionForm = ({
  values,
  errors = {},
  onChange,
  className = "",
}: LanguagesSectionFormProps) => {
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
        <label className="mb-1 block text-sm font-medium">Level</label>
        <div className="flex items-center gap-x-4 py-2">
          <Slider
            min={0}
            max={5}
            value={[values.level]}
            onValueChange={(value) => {
              onChange("level", value[0]);
            }}
          />
          {values.level > 0 ? (
            <span className="text-base font-bold">{values.level}</span>
          ) : (
            <span className="text-base font-bold">Hidden</span>
          )}
        </div>
        {errors.level && <div className="mt-1 text-xs text-red-500">{errors.level}</div>}
      </div>
    </div>
  );
};
