import { RichInput } from "@reactive-resume/ui";
import { cn } from "@reactive-resume/utils";
import type { Editor } from "@tiptap/react";
import React from "react";

export type SummarySectionFormProps = {
  values: {
    content: string;
  };
  errors?: Partial<Record<keyof SummarySectionFormProps["values"], string>>;
  onChange: (field: keyof SummarySectionFormProps["values"], value: unknown) => void;
  className?: string;
  footer?: (editor: Editor) => React.ReactNode;
};

export const SummarySectionForm: React.FC<SummarySectionFormProps> = ({
  values,
  errors = {},
  onChange,
  className,
  footer,
}) => {
  return (
    <section className={cn("grid gap-y-6", className)}>
      <main>
        <RichInput
          content={values.content}
          footer={footer}
          onChange={(value) => {
            onChange("content", value);
          }}
        />
      </main>
    </section>
  );
};
