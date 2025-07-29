import { defaultVolunteer, volunteerSchema } from "@reactive-resume/schema";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { AiActions } from "@/client/components/ai-actions";
import { VolunteeringSectionForm } from "@reactive-resume/ui";

import { SectionDialog } from "../sections/shared/section-dialog";

type FormValues = z.infer<typeof volunteerSchema>;

export const VolunteerDialog = () => {
  const form = useForm<FormValues>({
    defaultValues: defaultVolunteer,
  });

  return (
    <SectionDialog<FormValues> id="volunteer" form={form} defaultValues={defaultVolunteer}>
      <VolunteeringSectionForm
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
