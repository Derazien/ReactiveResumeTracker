import { defaultAward, awardSchema } from "@reactive-resume/schema";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { AiActions } from "@/client/components/ai-actions";
import { AwardsSectionForm } from "@reactive-resume/ui";

import { SectionDialog } from "../sections/shared/section-dialog";

type FormValues = z.infer<typeof awardSchema>;

export const AwardsDialog = () => {
  const form = useForm<FormValues>({
    defaultValues: defaultAward,
  });

  return (
    <SectionDialog<FormValues> id="awards" form={form} defaultValues={defaultAward}>
      <AwardsSectionForm
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
