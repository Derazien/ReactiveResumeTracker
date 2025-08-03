import type { referenceSchema } from "@reactive-resume/schema";
import { defaultReference } from "@reactive-resume/schema";
import { ReferencesSectionForm } from "@reactive-resume/ui";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { AiActions } from "@/client/components/ai-actions";

import { SectionDialog } from "../sections/shared/section-dialog";

type FormValues = z.infer<typeof referenceSchema>;

export const ReferencesDialog = () => {
  const form = useForm<FormValues>({
    defaultValues: defaultReference,
  });

  return (
    <SectionDialog<FormValues> id="references" form={form} defaultValues={defaultReference}>
      <ReferencesSectionForm
        values={form.watch()}
        footer={(editor) => (
          <AiActions
            value={editor.getText()}
            onChange={(value) => {
              editor.commands.setContent(value, true);
              form.setValue("summary", value);
            }}
          />
        )}
        onChange={(field, value) => {
          form.setValue(field, value);
        }}
      />
    </SectionDialog>
  );
};
