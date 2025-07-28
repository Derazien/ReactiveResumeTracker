import { type CustomField as ICustomField } from "@reactive-resume/schema";
import { Input, Label } from "@reactive-resume/ui";
import { URLInput } from "@reactive-resume/ui";
import { CustomField } from "@reactive-resume/ui";
import { Button } from "@reactive-resume/ui";
import { Plus } from "@phosphor-icons/react";
import { AnimatePresence, Reorder } from "framer-motion";
import { cn } from "@reactive-resume/utils";
import React from "react";

export type ContactSectionFormProps = {
  values: {
    name: string;
    headline: string;
    email: string;
    url: { label: string; href: string };
    phone: string;
    location: string;
    customFields: ICustomField[];
  };
  errors?: Partial<Record<keyof ContactSectionFormProps["values"], string>>;
  onChange: (field: keyof ContactSectionFormProps["values"], value: unknown) => void;
  onCustomFieldsChange: (fields: ICustomField[]) => void;
  className?: string;
};

export const ContactSectionForm: React.FC<ContactSectionFormProps> = ({
  values,
  errors = {},
  onChange,
  onCustomFieldsChange,
  className,
}) => {
  // Custom fields handlers
  const onAddCustomField = () => {
    onCustomFieldsChange([
      ...values.customFields,
      { id: Date.now().toString(), icon: "envelope", name: "", value: "" },
    ]);
  };

  const onChangeCustomField = (field: ICustomField) => {
    const index = values.customFields.findIndex((item) => item.id === field.id);
    const newCustomFields = [...values.customFields];
    newCustomFields[index] = field;
    onCustomFieldsChange(newCustomFields);
  };

  const onReorderCustomFields = (fields: ICustomField[]) => {
    onCustomFieldsChange(fields);
  };

  const onRemoveCustomField = (id: string) => {
    onCustomFieldsChange(values.customFields.filter((field) => field.id !== id));
  };

  return (
    <section className={cn("grid gap-y-6", className)}>
      <main className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-4 sm:col-span-2">
          <Label htmlFor="contact.name">Full Name</Label>
          <Input
            id="contact.name"
            value={values.name}
            hasError={!!errors.name}
            onChange={(event) => onChange("name", event.target.value)}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="contact.headline">Headline</Label>
          <Input
            id="contact.headline"
            value={values.headline}
            onChange={(event) => onChange("headline", event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contact.email">Email</Label>
          <Input
            id="contact.email"
            placeholder="john.doe@example.com"
            value={values.email}
            hasError={!!errors.email}
            onChange={(event) => onChange("email", event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contact.url">Website</Label>
          <URLInput
            id="contact.url"
            value={values.url ?? { label: "", href: "" }}
            placeholder="https://example.com"
            onChange={(value) => onChange("url", value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contact.phone">Phone</Label>
          <Input
            id="contact.phone"
            placeholder="+1 (123) 4567 7890"
            value={values.phone}
            onChange={(event) => onChange("phone", event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contact.location">Location</Label>
          <Input
            id="contact.location"
            value={values.location}
            onChange={(event) => onChange("location", event.target.value)}
          />
        </div>
        {/* Custom Fields */}
        <div className="space-y-4 sm:col-span-2">
          <AnimatePresence>
            <Reorder.Group
              axis="y"
              className="space-y-4"
              values={values.customFields}
              onReorder={onReorderCustomFields}
            >
              {values.customFields?.map((field) => (
                <CustomField
                  key={field.id}
                  field={field}
                  onChange={onChangeCustomField}
                  onRemove={onRemoveCustomField}
                />
              ))}
            </Reorder.Group>
          </AnimatePresence>
          <Button variant="link" type="button" onClick={onAddCustomField}>
            <Plus className="mr-2" />
            <span>Add a custom field</span>
          </Button>
        </div>
      </main>
    </section>
  );
}; 