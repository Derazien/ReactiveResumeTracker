import { t } from "@lingui/macro";
import { HouseSimple } from "@phosphor-icons/react";
import { Button, ScrollArea, Separator } from "@reactive-resume/ui";
import { BookOpen, MessageSquare, Settings } from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router";

import { Icon } from "@/client/components/icon";
import { UserAvatar } from "@/client/components/user-avatar";
import { UserOptions } from "@/client/components/user-options";

import { ContentSection } from "./sections/content";
import { InterviewSection } from "./sections/interview";
import { SettingsSection } from "./sections/settings";

type Section = "content" | "interview" | "settings";

const SectionIcon = ({ 
  icon: IconComponent, 
  name, 
  isActive, 
  onClick 
}: { 
  icon: React.ComponentType<{ size?: string | number; className?: string }>; 
  name: string; 
  isActive: boolean; 
  onClick: () => void; 
}) => (
  <Button
    size="icon"
    variant={isActive ? "secondary" : "ghost"}
    className="size-8 rounded-sm"
    onClick={onClick}
    title={name}
  >
    <IconComponent size={16} />
  </Button>
);

export const LeftSidebar = () => {
  const [activeSection, setActiveSection] = useState<Section>("content");
  const containterRef = useRef<HTMLDivElement | null>(null);

  const sections = [
    {
      id: "content" as const,
      label: t`Content`,
      icon: BookOpen,
      component: ContentSection,
    },
    {
      id: "interview" as const,
      label: t`Interview`,
      icon: MessageSquare,
      component: InterviewSection,
    },
    {
      id: "settings" as const,
      label: t`Settings`,
      icon: Settings,
      component: SettingsSection,
    },
  ];

  const ActiveComponent = sections.find((s) => s.id === activeSection)?.component;

  const scrollIntoView = (selector: string) => {
    const section = containterRef.current?.querySelector(selector);
    section?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex bg-secondary-accent/30">
      <div className="hidden basis-12 flex-col items-center justify-between bg-secondary-accent/30 py-4 sm:flex">
        <Button asChild size="icon" variant="ghost" className="size-8 rounded-full">
          <Link to="/dashboard/job-applications">
            <Icon size={14} />
          </Link>
        </Button>

        <div className="flex flex-col items-center justify-center gap-y-2">
          {sections.map((section) => (
            <SectionIcon
              key={section.id}
              icon={section.icon}
              name={section.label}
              isActive={activeSection === section.id}
              onClick={() => setActiveSection(section.id)}
            />
          ))}
        </div>

        <UserOptions>
          <Button size="icon" variant="ghost" className="rounded-full">
            <UserAvatar size={28} />
          </Button>
        </UserOptions>
      </div>

      <ScrollArea orientation="vertical" className="h-screen flex-1 pb-16 lg:pb-0">
        <div ref={containterRef} className="@container/left">
          {/* Mobile Section Tabs */}
          <div className="flex border-b sm:hidden">
            {sections.map((section) => (
              <Button
                key={section.id}
                variant={activeSection === section.id ? "secondary" : "ghost"}
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
          <div className="p-6">
            {ActiveComponent && <ActiveComponent />}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
