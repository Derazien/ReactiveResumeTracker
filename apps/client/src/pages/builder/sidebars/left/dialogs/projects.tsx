import { defaultProject, projectSchema } from "@reactive-resume/schema";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { AiActions } from "@/client/components/ai-actions";
import { ProjectsSectionForm } from "@reactive-resume/ui";

import { SectionDialog } from "../sections/shared/section-dialog";

type FormValues = z.infer<typeof projectSchema>;

export const ProjectsDialog = () => {
  const form = useForm<FormValues>({
    defaultValues: defaultProject,
  });

  return (
    <SectionDialog<FormValues>
      id="projects"
      form={form}
      defaultValues={defaultProject}
    >
      <ProjectsSectionForm
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
