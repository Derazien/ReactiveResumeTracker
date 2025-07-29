import { defaultProfile, profileSchema } from "@reactive-resume/schema";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { ProfilesSectionForm } from "@reactive-resume/ui";

import { SectionDialog } from "../sections/shared/section-dialog";

type FormValues = z.infer<typeof profileSchema>;

export const ProfilesDialog = () => {
  const form = useForm<FormValues>({
    defaultValues: defaultProfile,
  });

  return (
    <SectionDialog<FormValues> id="profiles" form={form} defaultValues={defaultProfile}>
      <ProfilesSectionForm
        values={form.watch()}
        onChange={(field, value) => {
          form.setValue(field, value);
        }}
      />
    </SectionDialog>
  );
};
