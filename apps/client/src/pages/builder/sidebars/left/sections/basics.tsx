import { t } from "@lingui/macro";
import { ContactSectionForm } from "@reactive-resume/ui";

import { useResumeStore } from "@/client/stores/resume";

import { PictureSection } from "./picture/section";
import { SectionIcon } from "./shared/section-icon";

export const BasicsSection = () => {
  const setValue = useResumeStore((state) => state.setValue);
  const basics = useResumeStore((state) => state.resume.data.basics);

  const handleChange = (field: string, value: any) => {
    setValue(`basics.${field}`, value);
  };

  const handleCustomFieldsChange = (fields: any[]) => {
    setValue("basics.customFields", fields);
  };

  return (
    <section id="basics" className="grid gap-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-x-4">
          <SectionIcon id="basics" size={18} />
          <h2 className="line-clamp-1 text-2xl font-bold lg:text-3xl">{t`Basics`}</h2>
        </div>
      </header>

      <main className="grid gap-4">
        <div className="sm:col-span-2">
          <PictureSection />
        </div>

        <ContactSectionForm
          values={basics}
          onChange={handleChange}
          onCustomFieldsChange={handleCustomFieldsChange}
        />
      </main>
    </section>
  );
};
