import type { interestSchema } from "@reactive-resume/schema";
import { defaultInterest } from "@reactive-resume/schema";
import { InterestsSectionForm } from "@reactive-resume/ui";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { SectionDialog } from "../sections/shared/section-dialog";

type FormValues = z.infer<typeof interestSchema>;

export const InterestsDialog = () => {
  const form = useForm<FormValues>({
    defaultValues: defaultInterest,
  });

  return (
    <SectionDialog<FormValues> id="interests" form={form} defaultValues={defaultInterest}>
      <InterestsSectionForm
        values={form.watch()}
        onChange={(field, value) => {
          form.setValue(field, value);
        }}
      />
    </SectionDialog>
  );
};
