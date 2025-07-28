import { t, Trans } from "@lingui/macro";
import { createId } from "@paralleldrive/cuid2";
import { DotsSixVertical, Envelope, Plus, X } from "@phosphor-icons/react";
import type { CustomField as ICustomField } from "@reactive-resume/schema";
import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
} from "@reactive-resume/ui";
import { cn } from "@reactive-resume/utils";
import { AnimatePresence, Reorder, useDragControls } from "framer-motion";

import { useResumeStore } from "@/client/stores/resume";
import { CustomField } from "@reactive-resume/ui";

type Props = {
  className?: string;
};

export const CustomFieldsSection = ({ className }: Props) => {
  const setValue = useResumeStore((state) => state.setValue);
  const customFields = useResumeStore((state) => state.resume.data.basics.customFields);

  const onAddCustomField = () => {
    setValue("basics.customFields", [
      ...customFields,
      { id: createId(), icon: "envelope", name: "", value: "" },
    ]);
  };

  const onChangeCustomField = (field: ICustomField) => {
    const index = customFields.findIndex((item) => item.id === field.id);
    const newCustomFields = JSON.parse(JSON.stringify(customFields));
    newCustomFields[index] = field;

    setValue("basics.customFields", newCustomFields);
  };

  const onReorderCustomFields = (values: ICustomField[]) => {
    setValue("basics.customFields", values);
  };

  const onRemoveCustomField = (id: string) => {
    setValue(
      "basics.customFields",
      customFields.filter((field) => field.id !== id),
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      <AnimatePresence>
        <Reorder.Group
          axis="y"
          className="space-y-4"
          values={customFields}
          onReorder={onReorderCustomFields}
        >
          {customFields.map((field) => (
            <CustomField
              key={field.id}
              field={field}
              onChange={onChangeCustomField}
              onRemove={onRemoveCustomField}
            />
          ))}
        </Reorder.Group>
      </AnimatePresence>

      <Button variant="link" onClick={onAddCustomField}>
        <Plus className="mr-2" />
        <span>{t`Add a custom field`}</span>
      </Button>
    </div>
  );
};
