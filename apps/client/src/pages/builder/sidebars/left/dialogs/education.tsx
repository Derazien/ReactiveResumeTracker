import type { educationSchema } from "@reactive-resume/schema";
import { defaultEducation } from "@reactive-resume/schema";
import { EducationSectionForm } from "@reactive-resume/ui";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { AiActions } from "@/client/components/ai-actions";

import { SectionDialog } from "../sections/shared/section-dialog";

type FormValues = z.infer<typeof educationSchema>;

export const EducationDialog = () => {
  const form = useForm<FormValues>({
    defaultValues: defaultEducation,
  });

  return (
    <SectionDialog<FormValues> id="education" form={form} defaultValues={defaultEducation}>
      <EducationSectionForm
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
