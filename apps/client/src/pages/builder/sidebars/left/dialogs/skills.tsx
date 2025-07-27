import { defaultSkill, skillSchema } from "@reactive-resume/schema";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { SkillsSectionForm } from "@reactive-resume/ui";

import { SectionDialog } from "../sections/shared/section-dialog";

type FormValues = z.infer<typeof skillSchema>;

export const SkillsDialog = () => {
  const form = useForm<FormValues>({
    defaultValues: defaultSkill,
  });

  return (
    <SectionDialog<FormValues>
      id="skills"
      form={form}
      defaultValues={defaultSkill}
    >
      <SkillsSectionForm
        values={form.getValues()}
        onChange={(field, value) => {
          form.setValue(field, value);
                        }}
      />
    </SectionDialog>
  );
};
