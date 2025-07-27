import { defaultInterest, interestSchema } from "@reactive-resume/schema";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { InterestsSectionForm } from "@reactive-resume/ui";

import { SectionDialog } from "../sections/shared/section-dialog";

type FormValues = z.infer<typeof interestSchema>;

export const InterestsDialog = () => {
  const form = useForm<FormValues>({
    defaultValues: defaultInterest,
  });

  return (
    <SectionDialog<FormValues> id="interests" form={form} defaultValues={defaultInterest}>
      <InterestsSectionForm
        values={form.getValues()}
        onChange={(field, value) => {
          form.setValue(field, value);
                        }}
      />
    </SectionDialog>
  );
};
