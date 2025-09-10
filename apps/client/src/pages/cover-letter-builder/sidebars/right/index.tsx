import { t } from "@lingui/macro";
import { Button } from "@reactive-resume/ui";
import { Building2, Download, Paintbrush, Users } from "lucide-react";
import { useState } from "react";

import { CompanySection } from "./sections/company";
import { ContactsSection } from "./sections/contacts";
import { ExportSection } from "./sections/export";
import { StyleSection } from "./sections/style";

type Section = "style" | "export" | "company" | "contacts";

export const RightSidebar = () => {
  const [activeSection, setActiveSection] = useState<Section>("style");

  const sections = [
    {
      id: "style" as const,
      label: t`Style`,
      icon: Paintbrush,
      component: StyleSection,
    },
    {
      id: "export" as const,
      label: t`Export`,
      icon: Download,
      component: ExportSection,
    },
    {
      id: "company" as const,
      label: t`Company`,
      icon: Building2,
      component: CompanySection,
    },
    {
      id: "contacts" as const,
      label: t`Contacts`,
      icon: Users,
      component: ContactsSection,
    },
  ];

  const ActiveComponent = sections.find((s) => s.id === activeSection)?.component;

  return (
    <div className="flex h-full flex-col">
      {/* Section Tabs */}
      <div className="flex border-b">
        {sections.map((section) => (
          <Button
            key={section.id}
            variant={activeSection === section.id ? "primary" : "ghost"}
            size="sm"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            onClick={() => {
              setActiveSection(section.id);
            }}
          >
            <section.icon className="mr-2 size-4" />
            {section.label}
          </Button>
        ))}
      </div>

      {/* Section Content */}
      <div className="flex-1 overflow-y-auto">{ActiveComponent && <ActiveComponent />}</div>
    </div>
  );
};
