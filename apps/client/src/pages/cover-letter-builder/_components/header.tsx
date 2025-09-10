import { t } from "@lingui/macro";
import { HouseSimple, SidebarSimple } from "@phosphor-icons/react";
import { Button } from "@reactive-resume/ui";
import { cn } from "@reactive-resume/utils";
import { Link } from "react-router";

import { useCoverLetterBuilderStore } from "@/client/stores/cover-letter-builder";
import { useJobApplicationStore } from "@/client/stores/job-application";

export const Header = () => {
  const jobApplication = useJobApplicationStore((state) => state.jobApplication);
  
  const toggle = useCoverLetterBuilderStore((state) => state.toggle);
  const isDragging = useCoverLetterBuilderStore(
    (state) => state.panel.left.handle.isDragging || state.panel.right.handle.isDragging,
  );
  const leftPanelSize = useCoverLetterBuilderStore((state) => state.panel.left.size);
  const rightPanelSize = useCoverLetterBuilderStore((state) => state.panel.right.size);

  const onToggle = (side: "left" | "right") => {
    toggle(side);
  };

  return (
    <div
      style={{ left: `${leftPanelSize}%`, right: `${rightPanelSize}%` }}
      className={cn(
        "fixed inset-x-0 top-0 z-[60] h-16 bg-secondary-accent/50 backdrop-blur-lg lg:z-20",
        !isDragging && "transition-[left,right]",
      )}
    >
      <div className="flex h-full items-center justify-between px-4">
        <Button
          size="icon"
          variant="ghost"
          className="flex lg:hidden"
          onClick={() => {
            onToggle("left");
          }}
        >
          <SidebarSimple />
        </Button>

        <div className="flex items-center justify-center gap-x-1 lg:mx-auto">
          <Button asChild size="icon" variant="ghost">
            <Link to="/dashboard/job-applications">
              <HouseSimple />
            </Link>
          </Button>

          <span className="mr-2 text-xs opacity-40">{"/"}</span>

          <h1 className="font-medium">
            {jobApplication ? 
              `${t`Cover Letter`} - ${jobApplication.title} at ${jobApplication.companyName}` : 
              t`Cover Letter Builder`
            }
          </h1>
        </div>

        <Button
          size="icon"
          variant="ghost"
          className="flex lg:hidden"
          onClick={() => {
            onToggle("right");
          }}
        >
          <SidebarSimple className="-scale-x-100" />
        </Button>
      </div>
    </div>
  );
};
