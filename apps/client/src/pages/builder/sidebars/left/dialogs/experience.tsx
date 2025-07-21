import { zodResolver } from "@hookform/resolvers/zod";
import { t } from "@lingui/macro";
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
import type { z } from "zod";

import { AiActions } from "@/client/components/ai-actions";
import { Plus, Trash } from "@phosphor-icons/react";

import { SectionDialog } from "../sections/shared/section-dialog";
import { URLInput } from "../sections/shared/url-input";

const formSchema = experienceSchema;

type FormValues = z.infer<typeof formSchema>;

export const ExperienceDialog = () => {
  const form = useForm<FormValues>({
    defaultValues: defaultExperience,
    resolver: zodResolver(formSchema),
  });

  const contacts = form.watch("contacts");

  return (
    <SectionDialog<FormValues> id="experience" form={form} defaultValues={defaultExperience}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          name="company"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t`Company`}</FormLabel>
              <FormControl>
                <Input {...field} />
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
              <FormLabel>
                {t({
                  message: "Position",
                  context: "Position held at a company, for example, Software Engineer",
                })}
              </FormLabel>
              <FormControl>
                <Input {...field} />
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
              <FormLabel>{t`Date or Date Range`}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t`March 2023 - Present`} />
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
              <FormLabel>{t`Location`}</FormLabel>
              <FormControl>
                <Input {...field} />
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
              <FormLabel>{t`Website`}</FormLabel>
              <FormControl>
                <URLInput {...field} />
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
              <FormLabel>{t`Summary`}</FormLabel>
              <FormControl>
                <RichInput
                  {...field}
                  content={field.value}
                  footer={(editor) => (
                    <AiActions
                      value={editor.getText()}
                      onChange={(value) => {
                        editor.commands.setContent(value, true);
                        field.onChange(value);
                      }}
                    />
                  )}
                  onChange={(value) => {
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Contacts Field */}
        <div className="sm:col-span-2">
          <FormLabel>{t`Contacts`}</FormLabel>
          <div className="space-y-2">
            {contacts?.length > 0 ? (
              contacts.map((contact, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Input
                    placeholder={t`Name`}
                    value={contact.name}
                    onChange={e => {
                      const updated = [...contacts];
                      updated[idx] = { ...updated[idx], name: e.target.value };
                      form.setValue("contacts", updated, { shouldDirty: true });
                    }}
                  />
                  <Input
                    placeholder={t`Email`}
                    value={contact.email}
                    onChange={e => {
                      const updated = [...contacts];
                      updated[idx] = { ...updated[idx], email: e.target.value };
                      form.setValue("contacts", updated, { shouldDirty: true });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = contacts.filter((_, i) => i !== idx);
                      form.setValue("contacts", updated, { shouldDirty: true });
                    }}
                    className="text-red-500 hover:text-red-700"
                    aria-label={t`Remove Contact`}
                  >
                    <Trash size={18} />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground text-sm">{t`No contacts added.`}</div>
            )}
            <button
              type="button"
              onClick={() => {
                form.setValue("contacts", [...(contacts || []), { name: "", email: "" }], { shouldDirty: true });
              }}
              className="flex items-center gap-1 text-primary hover:underline mt-2"
            >
              <Plus size={18} /> {t`Add Contact`}
            </button>
          </div>
        </div>
      </div>
    </SectionDialog>
  );
};
