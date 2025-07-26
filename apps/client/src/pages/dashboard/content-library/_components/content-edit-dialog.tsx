import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@reactive-resume/ui";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@reactive-resume/ui";
import { Button } from "@reactive-resume/ui";
import { Input } from "@reactive-resume/ui";
import { Badge } from "@reactive-resume/ui";
import { ScrollArea } from "@reactive-resume/ui";
import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAvailableTags } from "@/client/services/content-library/content-library";
import { ContactSectionForm, ExperienceSectionForm, SummarySectionForm } from "@reactive-resume/ui";
import { 
  basicsSchema, 
  defaultBasics, 
  educationSchema, 
  defaultEducation,
  experienceSchema,
  defaultExperience,
  type CustomField 
} from "@reactive-resume/schema";

// Simple summary schema for content library
const summarySchema = z.object({
  content: z.string(),
});

const defaultSummary = {
  content: "",
};

// Define tag type for better type safety
type Tag = {
  id: string;
  name: string;
  color: string | null;
};

// Section mapping for different content types
const SECTION_FORM_MAP = {
  'contact': { 
    schema: basicsSchema, 
    default: defaultBasics, 
    component: ContactSectionForm,
    label: 'Contact Information'
  },
  'basics': { 
    schema: basicsSchema, 
    default: defaultBasics, 
    component: ContactSectionForm,
    label: 'Contact Information'
  },
  'education': { 
    schema: educationSchema, 
    default: defaultEducation, 
    component: null, // TODO: Create EducationSectionForm
    label: 'Education'
  },
  'experience': { 
    schema: experienceSchema, 
    default: defaultExperience, 
    component: null, // TODO: Create ExperienceSectionForm
    label: 'Experience'
  },
  'summary': { 
    schema: summarySchema, 
    default: defaultSummary, 
    component: null,
    label: 'Summary'
  },
  // Add more sections as needed
} as const;

type SectionKey = keyof typeof SECTION_FORM_MAP;

// Form schema for shared content fields
const contentSchema = z.object({
  title: z.string().min(1, "Content Title is required"),
  description: z.string().optional(),
  tags: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        color: z.string().nullable(),
      }),
    )
    .default([]),
});

type ContentFormData = z.infer<typeof contentSchema>;

type ContentEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content?: {
    id?: string;
    title?: string;
    description?: string;
    tags?: Tag[];
    section?: { key: SectionKey };
    data?: string; // JSON string
  };
  sectionId?: SectionKey | null;
};

// Parse tags from content data
const parseTags = (tagsData: any[] | undefined): Tag[] => {
  if (Array.isArray(tagsData)) {
    return tagsData.map((tagItem) => {
      if (tagItem.tag) {
        return {
          id: tagItem.tag.id,
          name: tagItem.tag.name,
          color: tagItem.tag.color,
        };
      }
      return {
        id: tagItem.id,
        name: tagItem.name,
        color: tagItem.color,
      };
    });
  }
  return [];
};

export const ContentEditDialog = ({
  open,
  onOpenChange,
  content,
  sectionId,
}: ContentEditDialogProps) => {
  const [tagInput, setTagInput] = useState("");
  const { data: availableTags } = useAvailableTags();
  const isEditing = !!content;

  // Determine section configuration (only when dialog is open)
  const sectionConfig = useMemo(() => {
    if (!open) return null;
    
    const sectionKey = content?.section?.key ?? sectionId;
    const config = sectionKey ? SECTION_FORM_MAP[sectionKey] : null;
    
    return config;
  }, [open, content?.section?.key, sectionId]);

  // Prepare section data BEFORE rendering (prevents multiple re-renders)
  const [sectionValues, setSectionValues] = useState<any>({});
  const preparedSectionData = useMemo(() => {
    if (!open || !sectionConfig) {
      return null; // Not ready to render
    }

    // Prepare default values
    let sectionValues = sectionConfig.default;
    
    // Parse data if available
    if (content?.data) {
      try {
        sectionValues = JSON.parse(content.data);
      } catch {
        sectionValues = sectionConfig.default;
      }
    }
    setSectionValues(sectionValues);
    return {
      values: sectionValues,
      errors: {},
      config: sectionConfig
    };
  }, [open, content?.data, content?.id, sectionConfig]);

  // Shared form for title, description, tags
  const form = useForm<ContentFormData>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: [],
    },
  });

  // Initialize section values directly with prepared data (no useEffect needed)
  const [sectionErrors, setSectionErrors] = useState<Record<string, string>>({});

  // Update section values when prepared data changes (only when dialog is open)
  useEffect(() => {
    if (!open || !preparedSectionData) return;

    console.log('ContentFormData Triggering dialog set rest values');
    // Initialize shared form
    form.reset({
      title: content?.title ?? "",
      description: content?.description ?? "",
      tags: parseTags(content?.tags),
    });

    // Update section values with prepared data
    setSectionValues(preparedSectionData.values);
    setSectionErrors({});
  }, [open, content?.id, preparedSectionData, form]);

  // Handler for section form changes
  const handleSectionChange = (field: string, value: any) => {
    setSectionValues((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleCustomFieldsChange = (fields: CustomField[]) => {
    setSectionValues((prev: any) => ({ ...prev, customFields: fields }));
  };

  // Tag management
  const addTag = (tagToAdd?: Tag) => {
    const tagName = tagToAdd ? tagToAdd.name : tagInput.trim();
    if (!tagName) return;

    const currentTags = form.getValues("tags");
    const tagExists = currentTags.some((tag) => tag.name.toLowerCase() === tagName.toLowerCase());

    if (!tagExists) {
      const newTag = tagToAdd || {
        id: `temp-${Date.now()}`,
        name: tagName,
        color: "#3B82F6",
      };
      form.setValue("tags", [...currentTags, newTag]);
    }
    setTagInput("");
  };

  const removeTag = (tagToRemove: Tag) => {
    const currentTags = form.getValues("tags");
    form.setValue(
      "tags",
      currentTags.filter((tag) => tag.id !== tagToRemove.id),
    );
  };

  // Get filtered available tags for autocomplete
  const filteredTags =
    availableTags?.filter((tag: Tag) => {
      const currentTags = form.watch("tags");
      const isAlreadySelected = currentTags.some((selectedTag) => selectedTag.id === tag.id);
      const matchesInput = tag.name.toLowerCase().includes(tagInput.toLowerCase());
      return !isAlreadySelected && matchesInput;
    }) || [];

  // Validate and submit
  const onSubmit = async (data: ContentFormData) => {
    try {
      if (!sectionConfig) {
        console.error("No section configuration found");
        return;
      }

      // Validate section data
      const result = sectionConfig.schema.safeParse(sectionValues);
      if (!result.success) {
        const errors: Record<string, string> = {};
        for (const err of result.error.errors) {
          if (err.path?.[0]) {
            errors[err.path[0] as string] = err.message;
          }
        }
        setSectionErrors(errors);
        return;
      }

      // Prepare data for save
      const saveData = {
        title: data.title,
        description: data.description,
        tags: data.tags,
        data: JSON.stringify(sectionValues), // Convert to JSON string
      };

      // TODO: Implement actual API call
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save content:", error);
    }
  };

  const handleClose = () => {
    form.reset();
    setTagInput("");
    setSectionValues({});
    setSectionErrors({});
    onOpenChange(false);
  };

  // Render section-specific form
  const renderSectionForm = () => {
    // Don't render until data is prepared
    console.log('ContentFormData RENDER', preparedSectionData, sectionConfig, sectionValues);
    if (!preparedSectionData || !sectionConfig?.component) {
      if (!sectionConfig) {
        return (
          <div className="p-4 text-center text-muted-foreground">
            Select a content type to continue.
          </div>
        );
      }
      
      if (!sectionConfig.component) {
        return (
          <div className="p-4 text-center text-muted-foreground">
            Form for {sectionConfig?.label ?? 'this section'} is not yet implemented.
          </div>
        );
      }
      
      // Data is being prepared
      return (
        <div className="p-4 text-center text-muted-foreground">
          Loading {sectionConfig.label} form...
        </div>
      );
    }

    const sectionKey = content?.section?.key ?? sectionId;
    
    if (sectionKey === 'contact' || sectionKey === 'basics') {
      return (
        <ContactSectionForm
          values={sectionValues}
          errors={sectionErrors}
          onChange={handleSectionChange}
          onCustomFieldsChange={handleCustomFieldsChange}
        />
      );
    }


    if (sectionKey === 'summary') {
      return (
        <SummarySectionForm
          values={sectionValues}
          errors={sectionErrors}
          onChange={handleSectionChange}
        />
      );
    }

    return null;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent 
        className="max-h-[95vh] max-w-5xl w-[95vw]"
        key={`${content?.id ?? 'new'}-${content?.section?.key ?? sectionId ?? 'unknown'}`}
      >
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{isEditing ? "Edit Content" : "Add New Content"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Make changes to your content item."
              : "Add a new content item to your library."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex flex-col h-full" onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="flex-1 max-h-[70vh] pr-4">
              <div className="space-y-6 pb-4">
                {/* Shared Fields - Title and Description */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter content title..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content Description</FormLabel>
                        <FormControl>
                          <textarea
                            placeholder="Enter content description..."
                            className="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[100px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Section-Specific Form */}
                {open && sectionConfig && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">{sectionConfig.label}</h3>
                    {renderSectionForm()}
                  </div>
                )}

                {/* Tags - At the bottom */}
                <div>
                  <FormLabel>Tags</FormLabel>
                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        placeholder="Add a tag..."
                        value={tagInput}
                        onChange={(e) => {
                          setTagInput(e.target.value);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                      />
                      {tagInput && filteredTags.length > 0 && (
                        <div className="absolute z-10 mt-1 max-h-40 w-full overflow-y-auto rounded-md border bg-background shadow-lg">
                          {filteredTags.map((tag: Tag) => (
                            <button
                              key={tag.id}
                              type="button"
                              className="hover:bg-accent flex w-full items-center gap-2 px-3 py-2 text-left transition-colors"
                              onClick={() => {
                                addTag(tag);
                              }}
                            >
                              <div
                                className="size-3 rounded-full"
                                style={{ backgroundColor: tag.color ?? "#3B82F6" }}
                              />
                              {tag.name}
                            </button>
                          ))}
                          {tagInput.trim() &&
                            !filteredTags.some(
                              (tag: Tag) => tag.name.toLowerCase() === tagInput.toLowerCase(),
                            ) && (
                              <button
                                type="button"
                                className="hover:bg-accent flex w-full items-center gap-2 border-t px-3 py-2 text-left transition-colors"
                                onClick={() => {
                                  addTag();
                                }}
                              >
                                <Plus className="size-3" />
                                Create "{tagInput}"
                              </button>
                            )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {form.watch("tags").map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="secondary"
                          className="gap-1 pr-1"
                          style={{
                            borderColor: tag.color ?? "#3B82F6",
                            color: tag.color ?? "#3B82F6",
                          }}
                        >
                          <div
                            className="mr-1 size-2 rounded-full"
                            style={{ backgroundColor: tag.color ?? "#3B82F6" }}
                          />
                          {tag.name}
                          <button
                            type="button"
                            className="hover:text-destructive ml-1"
                            onClick={() => {
                              removeTag(tag);
                            }}
                          >
                            <X className="size-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>

            <DialogFooter className="flex-shrink-0 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit">{isEditing ? "Update Content" : "Add Content"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
