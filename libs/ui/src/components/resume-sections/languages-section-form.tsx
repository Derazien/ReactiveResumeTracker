import type { Language } from "@reactive-resume/schema";
import { Slider, Checkbox } from "@reactive-resume/ui";
import { Input } from "@reactive-resume/ui";

export interface LanguagesSectionFormProps {
  values: Language;
  errors?: Record<string, string>;
  onChange: (field: keyof Language, value: Language[keyof Language]) => void;
  className?: string;
}

export const LanguagesSectionForm = ({
  values,
  errors = {},
  onChange,
  className = "",
}: LanguagesSectionFormProps) => {
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
        <label className="block text-sm font-medium mb-1">Level</label>
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
        {errors.level && <div className="text-xs text-red-500 mt-1">{errors.level}</div>}
      </div>
    </div>
  );
}; 