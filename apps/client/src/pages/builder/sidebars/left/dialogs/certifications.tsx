import { defaultCertification, certificationSchema } from "@reactive-resume/schema";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { AiActions } from "@/client/components/ai-actions";
import { CertificatesSectionForm } from "@reactive-resume/ui";

import { SectionDialog } from "../sections/shared/section-dialog";

type FormValues = z.infer<typeof certificationSchema>;

export const CertificationsDialog = () => {
  const form = useForm<FormValues>({
    defaultValues: defaultCertification,
  });

  return (
    <SectionDialog<FormValues> id="certifications" form={form} defaultValues={defaultCertification}>
      <CertificatesSectionForm
        values={form.getValues()}
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
