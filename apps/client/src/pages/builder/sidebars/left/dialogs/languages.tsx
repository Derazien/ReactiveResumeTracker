import { defaultLanguage, languageSchema } from "@reactive-resume/schema";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { LanguagesSectionForm } from "@reactive-resume/ui";

import { SectionDialog } from "../sections/shared/section-dialog";

type FormValues = z.infer<typeof languageSchema>;

export const LanguagesDialog = () => {
  const form = useForm<FormValues>({
    defaultValues: defaultLanguage,
  });

  return (
    <SectionDialog<FormValues> id="languages" form={form} defaultValues={defaultLanguage}>
      <LanguagesSectionForm
        values={form.watch()}
        onChange={(field, value) => {
          form.setValue(field, value);
        }}
      />
    </SectionDialog>
  );
};
