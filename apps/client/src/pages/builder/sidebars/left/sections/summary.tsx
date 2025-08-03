import { defaultSections } from "@reactive-resume/schema";
import { SummarySectionForm } from "@reactive-resume/ui";
import { useState } from "react";

import { AiActions } from "@/client/components/ai-actions";
import { ContentSelectionDialog } from "@/client/pages/builder/_components/content-selection-dialog";
import { useResumeStore } from "@/client/stores/resume";

import { SectionIcon } from "./shared/section-icon";
import { SectionOptions } from "./shared/section-options";

export const SummarySection = () => {
  const [contentSelectionOpen, setContentSelectionOpen] = useState(false);
  const setValue = useResumeStore((state) => state.setValue);
  const section = useResumeStore(
    (state) => state.resume.data.sections.summary ?? defaultSections.summary,
  );

  const handleChange = (field: string, value: unknown) => {
    setValue(`sections.summary.${field}`, value);
  };

  const handleSelectContent = () => {
    setContentSelectionOpen(true);
  };

  return (
    <section id="summary" className="grid gap-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-x-4">
          <SectionIcon id="summary" size={18} />
          <h2 className="line-clamp-1 text-2xl font-bold lg:text-3xl">{section.name}</h2>
        </div>

        <div className="flex items-center gap-x-2">
          <SectionOptions id="summary" onSelectContent={handleSelectContent} />
        </div>
      </header>

      <SummarySectionForm
        values={{ content: section.content }}
        footer={(editor) => (
          <AiActions
            value={editor.getText()}
            onChange={(value) => {
              editor.commands.setContent(value, true);
              setValue("sections.summary.content", value);
            }}
          />
        )}
        onChange={handleChange}
      />

      {/* Content Selection Dialog */}
      <ContentSelectionDialog
        open={contentSelectionOpen}
        sectionId="summary"
        sectionName={section.name}
        onOpenChange={setContentSelectionOpen}
      />
    </section>
  );
};
