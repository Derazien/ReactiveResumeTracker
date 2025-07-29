import { defaultReference, referenceSchema } from "@reactive-resume/schema";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { AiActions } from "@/client/components/ai-actions";
import { ReferencesSectionForm } from "@reactive-resume/ui";

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
