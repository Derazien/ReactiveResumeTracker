import type { profileSchema } from "@reactive-resume/schema";
import { defaultProfile } from "@reactive-resume/schema";
import { ProfilesSectionForm } from "@reactive-resume/ui";
import { useForm } from "react-hook-form";
import type { z } from "zod";

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
