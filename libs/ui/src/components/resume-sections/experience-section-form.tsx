import { zodResolver } from "@hookform/resolvers/zod";
import { defaultExperience, experienceSchema } from "@reactive-resume/schema";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  RichInput,
} from "@reactive-resume/ui";
import { useForm } from "react-hook-form";
import { Plus, Trash } from "@phosphor-icons/react";
import type { z } from "zod";
import type { Editor } from "@tiptap/react";

import { URLInput } from "../url-input";

const formSchema = experienceSchema;
type FormValues = z.infer<typeof formSchema>;

export interface ExperienceSectionFormProps {
  values: FormValues;
  errors?: Record<string, string>;
  onChange: (field: keyof FormValues, value: FormValues[keyof FormValues]) => void;
  className?: string;
  footer?: (editor: Editor) => React.ReactNode;
}

export const ExperienceSectionForm: React.FC<ExperienceSectionFormProps> = ({
  values,
  errors = {},
  onChange,
  className,
  footer,
}) => {
  const form = useForm<FormValues>({
    defaultValues: values,
    resolver: zodResolver(formSchema),
  });

  // Watch contacts for dynamic updates
  const contacts = form.watch("contacts");

  return (
    <section className={className}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          name="company"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  value={values.company}
                  onChange={(e) => {
                    field.onChange(e);
                    onChange("company", e.target.value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="position"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Position</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  value={values.position}
                  onChange={(e) => {
                    field.onChange(e);
                    onChange("position", e.target.value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="date"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date or Date Range</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="March 2023 - Present"
                  value={values.date}
                  onChange={(e) => {
                    field.onChange(e);
                    onChange("date", e.target.value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="location"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  value={values.location}
                  onChange={(e) => {
                    field.onChange(e);
                    onChange("location", e.target.value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="url"
          control={form.control}
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Website</FormLabel>
              <FormControl>
                <URLInput 
                  {...field} 
                  value={values.url ?? { label: "", href: "" }}
                  onChange={(value) => {
                    field.onChange(value);
                    onChange("url", value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="summary"
          control={form.control}
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Summary</FormLabel>
              <FormControl>
                <RichInput
                  {...field}
                  content={values.summary}
                  footer={footer}
                  onChange={(value) => {
                    field.onChange(value);
                    onChange("summary", value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Contacts Field */}
        <div className="sm:col-span-2">
          <FormLabel>Contacts</FormLabel>
          <div className="space-y-2">
            {contacts?.length > 0 ? (
              contacts.map((contact, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Input
                    placeholder="Name"
                    value={contact.name}
                    onChange={e => {
                      const updated = [...contacts];
                      updated[idx] = { ...updated[idx], name: e.target.value };
                      form.setValue("contacts", updated, { shouldDirty: true });
                      onChange("contacts", updated);
                    }}
                  />
                  <Input
                    placeholder="Email"
                    value={contact.email}
                    onChange={e => {
                      const updated = [...contacts];
                      updated[idx] = { ...updated[idx], email: e.target.value };
                      form.setValue("contacts", updated, { shouldDirty: true });
                      onChange("contacts", updated);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = contacts.filter((_, i) => i !== idx);
                      form.setValue("contacts", updated, { shouldDirty: true });
                      onChange("contacts", updated);
                    }}
                    className="text-red-500 hover:text-red-700"
                    aria-label="Remove Contact"
                  >
                    <Trash size={18} />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground text-sm">No contacts added.</div>
            )}
            <button
              type="button"
              onClick={() => {
                const updated = [...(contacts || []), { name: "", email: "" }];
                form.setValue("contacts", updated, { shouldDirty: true });
                onChange("contacts", updated);
              }}
              className="flex items-center gap-1 text-primary hover:underline mt-2"
            >
              <Plus size={18} /> Add Contact
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}; 