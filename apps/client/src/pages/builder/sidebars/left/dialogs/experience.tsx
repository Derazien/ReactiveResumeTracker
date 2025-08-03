import { defaultExperience, experienceSchema } from "@reactive-resume/schema";
import { ExperienceSectionForm } from "@reactive-resume/ui";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { AiActions } from "@/client/components/ai-actions";

import { SectionDialog } from "../sections/shared/section-dialog";

const formSchema = experienceSchema;
type FormValues = z.infer<typeof formSchema>;

export const ExperienceDialog = () => {
  const form = useForm<FormValues>({
    defaultValues: defaultExperience,
  });

  return (
    <SectionDialog<FormValues> id="experience" form={form} defaultValues={defaultExperience}>
      <ExperienceSectionForm
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
