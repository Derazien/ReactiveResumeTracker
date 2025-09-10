import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, XIcon } from "@phosphor-icons/react";
import {
  Badge,
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

} from "@reactive-resume/ui";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useToast } from "@/client/hooks/use-toast";
import { useContentLibrary } from "@/client/services/content-library/content-library";
import {
  useCreateCoverLetterContent,
  type CoverLetterContentType,
} from "@/client/services/cover-letter-content";

const contentTypeOptions: { value: CoverLetterContentType; label: string; description: string }[] = [
  {
    value: "PARAGRAPH_ANALYTICS",
    label: "Analytics",
    description: "Data analysis, research, problem-solving through data",
  },
  {
    value: "PARAGRAPH_DIVERSITY", 
    label: "Diversity",
    description: "Cultural adaptability, global experience, inclusive teamwork",
  },
  {
    value: "PARAGRAPH_LEADERSHIP",
    label: "Leadership", 
    description: "Team management, mentoring, driving results, taking initiative",
  },
  {
    value: "PARAGRAPH_TECH",
    label: "Technical",
    description: "Software development, technology implementation, technical skills",
  },
  {
    value: "PARAGRAPH_CHALLENGE",
    label: "Challenge",
    description: "Overcoming obstacles, resilience, difficult situations",
  },
  {
    value: "PARAGRAPH_COLLABORATION",
    label: "Collaboration",
    description: "Teamwork, cross-functional work, communication",
  },
  {
    value: "PARAGRAPH_INNOVATION",
    label: "Innovation",
    description: "Creative problem-solving, new ideas, process improvement",
  },
  {
    value: "PARAGRAPH_IMPACT",
    label: "Impact",
    description: "Results-oriented, measurable outcomes, business value",
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
  contentId: z.string().optional(),
  storyText: z.string().min(20, "Story must be at least 20 characters long"),
  skillTheme: z.string().min(1, "Skill theme is required"),
  tone: z.string().default("professional"),
  tags: z.array(z.string()).default([]),
});

type FormValues = z.infer<typeof formSchema>;

interface StoryCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStoryCreated?: (storyId: string) => void;
}

export const StoryCreationDialog = ({ 
  open, 
  onOpenChange,
  onStoryCreated 
}: StoryCreationDialogProps) => {
  const { toast } = useToast();
  const [newTag, setNewTag] = useState("");
  
  const { data: contentLibrary } = useContentLibrary();
  const createStoryMutation = useCreateCoverLetterContent();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contentType: "PARAGRAPH_ANALYTICS",
      contentId: "",
      storyText: "",
      skillTheme: "",
      tone: "professional",
      tags: [],
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      // Generate a random contentId if not provided
      const contentId = data.contentId || `temp_${Date.now()}`;
      
      const storyData = {
        ...data,
        contentId,
        tags: JSON.stringify(data.tags),
      };

      const result = await createStoryMutation.mutateAsync(storyData);
      
      toast({
        title: "Story created", 
        description: "Cover letter story has been successfully created.",
      });

      // Call the callback with the new story ID
      onStoryCreated?.(result.id);

      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Failed to create story:", error);
      toast({
        title: "Error",
        description: "Failed to create story. Please try again.",
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

  const isLoading = createStoryMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Cover Letter Story</DialogTitle>
          <DialogDescription>
            Create a compelling story that showcases your skills and achievements.
            Keep it focused, specific, and include quantifiable results when possible.
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
                  <FormLabel>Story Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a story type" />
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
                    Choose the type of story that best matches your experience.
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
                  <FormLabel>Related Experience (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Link to existing experience (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {contentLibrary?.filter(content => 
                        content.section?.key === "experience" || 
                        content.section?.key === "projects" ||
                        content.section?.key === "volunteer"
                      ).map((content) => (
                        <SelectItem key={content.id} value={content.id}>
                          <div>
                            <div className="font-medium">{content.title}</div>
                            <div className="text-muted-foreground text-xs">
                              {content.section?.name} • {content.description?.slice(0, 40)}...
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Optionally link this story to an experience, project, or volunteer work from your content library.
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
                  <FormLabel>Skill Focus</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., analytical thinking, team leadership, technical innovation..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The main skill or competency this story demonstrates.
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
                  <FormLabel>Your Story</FormLabel>
                  <FormControl>
                    <textarea
                      placeholder="Write a specific story that demonstrates your skills. Include the situation, your actions, and the results. Use numbers and metrics when possible..."
                      className="flex min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Write 3-5 sentences using the STAR method (Situation, Task, Action, Result). Be specific and include quantifiable outcomes.
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
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                      <SelectItem value="confident">Confident</SelectItem>
                      <SelectItem value="conversational">Conversational</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The tone of voice for this story when used in cover letters.
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
                        placeholder="Add a tag (e.g., startup, remote, leadership)..."
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
                    Add tags to help categorize this story for better matching with job applications.
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
                {isLoading ? "Creating..." : "Create Story"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};