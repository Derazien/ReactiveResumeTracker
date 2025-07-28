import { defaultPublication, publicationSchema } from "@reactive-resume/schema";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { AiActions } from "@/client/components/ai-actions";
import { PublicationsSectionForm } from "@reactive-resume/ui";

import { SectionDialog } from "../sections/shared/section-dialog";

type FormValues = z.infer<typeof publicationSchema>;

export const PublicationsDialog = () => {
  const form = useForm<FormValues>({
    defaultValues: defaultPublication,
  });

  return (
    <SectionDialog<FormValues> id="publications" form={form} defaultValues={defaultPublication}>
      <PublicationsSectionForm
        values={form.getValues()}
        onChange={(field, value) => {
          form.setValue(field, value);
        }}
        footer={(editor) => (
          <AiActions
            value={editor.getText()}
            onChange={(value) => {
              editor.commands.setContent(value, true);
              form.setValue("summary", value);
            }}
          />
        )}
      />
    </SectionDialog>
  );
};
