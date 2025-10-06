import { zodResolver } from "@hookform/resolvers/zod";
import { t } from "@lingui/macro";
import { PlusIcon, XIcon } from "@phosphor-icons/react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,

  Badge,
} from "@reactive-resume/ui";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useToast } from "@/client/hooks/use-toast";
import { useContentLibrary } from "@/client/services/content-library/content-library";
import {
  useCreateCoverLetterContent,
  useUpdateCoverLetterContent,
  type CoverLetterContent,
  type CoverLetterContentType,
} from "@/client/services/cover-letter-content";

const contentTypeOptions: { value: CoverLetterContentType; label: string; description: string }[] = [
  {
    value: "PARAGRAPH_ANALYTICS",
    label: "Analytics",
    description: "Data analysis, quantitative skills, research, problem-solving through data",
  },
  {
    value: "PARAGRAPH_DIVERSITY", 
    label: "Diversity",
    description: "Cultural adaptability, curiosity, global experience, diverse teams",
  },
  {
    value: "PARAGRAPH_LEADERSHIP",
    label: "Leadership", 
    description: "Team management, mentoring, driving results, taking initiative",
  },
  {
    value: "PARAGRAPH_TECH",
    label: "Technical",
    description: "Technical skills, software development, technology implementation",
  },
  {
    value: "PARAGRAPH_CHALLENGE",
    label: "Challenge",
    description: "Overcoming obstacles, resilience, handling difficult situations",
  },
  {
    value: "PARAGRAPH_COLLABORATION",
    label: "Collaboration",
    description: "Teamwork, cross-functional work, communication, relationship building",
  },
  {
    value: "PARAGRAPH_INNOVATION",
    label: "Innovation",
    description: "Creative problem-solving, new ideas, process improvement",
  },
  {
    value: "PARAGRAPH_IMPACT",
    label: "Impact",
    description: "Results-oriented, measurable outcomes, business impact",
  },
  {
    value: "PARAGRAPH_GROWTH",
    label: "Growth",
    description: "Learning ability, career development, adaptability",
  },
  {
    value: "PARAGRAPH_VALUES",
    label: "Values",
    description: "Company culture fit, ethical behavior, mission alignment",
  },
];

const formSchema = z.object({
  contentType: z.enum([
    "PARAGRAPH_ANALYTICS",
    "PARAGRAPH_DIVERSITY", 
    "PARAGRAPH_LEADERSHIP",
    "PARAGRAPH_TECH",
    "PARAGRAPH_CHALLENGE",
    "PARAGRAPH_COLLABORATION",
    "PARAGRAPH_INNOVATION",
    "PARAGRAPH_IMPACT",
    "PARAGRAPH_GROWTH",
    "PARAGRAPH_VALUES",
  ]),
  contentId: z.string().cuid2(),
  storyText: z.string().min(10, "Story must be at least 10 characters long"),
  skillTheme: z.string().min(1, "Skill theme is required"),
  tone: z.string().default("professional"),
  tags: z.array(z.string()).default([]),
});

type FormValues = z.infer<typeof formSchema>;

interface CoverLetterStoryDialogProps {
  open: boolean;
  story?: CoverLetterContent | null;
  onOpenChange: (open: boolean) => void;
}

export const CoverLetterStoryDialog = ({ 
  open, 
  story, 
  onOpenChange 
}: CoverLetterStoryDialogProps) => {
  const { toast } = useToast();
  const [newTag, setNewTag] = useState("");
  
  const { data: contentLibrary } = useContentLibrary();
  const createStoryMutation = useCreateCoverLetterContent();
  const updateStoryMutation = useUpdateCoverLetterContent();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contentType: story?.contentType || "PARAGRAPH_ANALYTICS",
      contentId: story?.contentId || "",
      storyText: story?.storyText || "",
      skillTheme: story?.skillTheme || "",
      tone: story?.tone || "professional",
      tags: story?.tags ? JSON.parse(story.tags) : [],
    },
  });

  // Reset form when story changes
  React.useEffect(() => {
    if (story) {
      form.reset({
        contentType: story.contentType,
        contentId: story.contentId,
        storyText: story.storyText,
        skillTheme: story.skillTheme,
        tone: story.tone,
        tags: story.tags ? JSON.parse(story.tags) : [],
      });
    } else {
      form.reset({
        contentType: "PARAGRAPH_ANALYTICS",
        contentId: "",
        storyText: "",
        skillTheme: "",
        tone: "professional",
        tags: [],
      });
    }
  }, [story, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      const storyData = {
        ...data,
        tags: JSON.stringify(data.tags),
      };

      if (story) {
        await updateStoryMutation.mutateAsync({
          id: story.id,
          data: storyData,
        });
        toast({
          title: "Story updated",
          description: "Cover letter story has been successfully updated.",
        });
      } else {
        await createStoryMutation.mutateAsync(storyData);
        toast({
          title: "Story created", 
          description: "Cover letter story has been successfully created.",
        });
      }

      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Failed to save story:", error);
      toast({
        title: "Error",
        description: "Failed to save story. Please try again.",
        variant: "error",
      });
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !form.getValues("tags").includes(newTag.trim())) {
      const currentTags = form.getValues("tags");
      form.setValue("tags", [...currentTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags");
    form.setValue("tags", currentTags.filter(tag => tag !== tagToRemove));
  };

  const isLoading = createStoryMutation.isPending || updateStoryMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {story ? t`Edit Cover Letter Story` : t`Create Cover Letter Story`}
          </DialogTitle>
          <DialogDescription>
            Create a compelling story that can be used in cover letter generation.
            Each story should be 3-5 sentences and demonstrate specific skills or achievements.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Content Type */}
            <FormField
              control={form.control}
              name="contentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paragraph Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t`Select a paragraph type`} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {contentTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-muted-foreground text-xs">{option.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the type of story this represents for better content matching.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Content Library Reference */}
            <FormField
              control={form.control}
              name="contentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Related Content</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t`Select related content (optional)`} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {contentLibrary?.map((content) => (
                        <SelectItem key={content.id} value={content.id}>
                          <div>
                            <div className="font-medium">{content.title}</div>
                            <div className="text-muted-foreground text-xs">
                              {content.section?.name} • {content.description?.slice(0, 50)}...
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Link this story to an item in your content library (experience, project, etc.).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Story Text */}
            <FormField
              control={form.control}
              name="storyText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Story Text</FormLabel>
                  <FormControl>
                    <textarea
                      placeholder={t`Write a compelling 3-5 sentence story demonstrating your skills and achievements...`}
                      className="flex min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Write a specific story with quantifiable results. This will be used directly in cover letters.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Skill Theme */}
            <FormField
              control={form.control}
              name="skillTheme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skill Theme</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={t`e.g., analytical thinking, leadership, problem-solving...`}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The main skill or theme this story demonstrates.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tone */}
            <FormField
              control={form.control}
              name="tone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tone</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t`Select tone`} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                      <SelectItem value="confident">Confident</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The tone of voice for this story.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tags */}
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder={t`Add a tag...`}
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                      />
                      <Button type="button" onClick={handleAddTag} size="sm">
                        <PlusIcon className="size-4" />
                      </Button>
                    </div>
                    {field.value.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {field.value.map((tag) => (
                          <Badge key={tag} variant="secondary" className="gap-1">
                            {tag}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="size-4 p-0 hover:bg-transparent"
                              onClick={() => handleRemoveTag(tag)}
                            >
                              <XIcon className="size-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <FormDescription>
                    Add tags to help categorize and search for this story.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading 
                  ? (story ? "Updating..." : "Creating...")
                  : (story ? t`Update Story` : t`Create Story`)
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};