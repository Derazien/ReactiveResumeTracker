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
import { Switch } from "@reactive-resume/ui";
import { ScrollArea } from "@reactive-resume/ui";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAvailableTags } from "@/client/services/content-library/content-library";

// Define tag type for better type safety
type Tag = {
  id: string;
  name: string;
  color: string | null;
};

// Form schema for content editing
const contentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isPresent: z.boolean().optional(),
  skills: z.array(z.string()).default([]),
  achievements: z.array(z.string()).default([]),
  courses: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  tags: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        color: z.string().nullable(),
      }),
    )
    .default([]),
  url: z.string().optional(),
  issuer: z.string().optional(),
  score: z.string().optional(),
  proficiencyLevel: z.number().min(0).max(100).optional(),
  category: z.string().optional(),
  contactPerson: z.string().optional(),
  contactInfo: z.string().optional(),
});

type ContentFormData = z.infer<typeof contentSchema>;

type ContentEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content?: any;
  sectionId?: string | null;
};

export const ContentEditDialog = ({
  open,
  onOpenChange,
  content,
  sectionId,
}: ContentEditDialogProps) => {
  const [skillInput, setSkillInput] = useState("");
  const [achievementInput, setAchievementInput] = useState("");
  const [courseInput, setCourseInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [tagInput, setTagInput] = useState("");

  const { data: availableTags } = useAvailableTags();
  const isEditing = !!content;

  const form = useForm<ContentFormData>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      title: "",
      description: "",
      company: "",
      position: "",
      location: "",
      startDate: "",
      endDate: "",
      isPresent: false,
      skills: [],
      achievements: [],
      courses: [],
      keywords: [],
      tags: [],
      url: "",
      issuer: "",
      score: "",
      proficiencyLevel: undefined,
      category: "",
      contactPerson: "",
      contactInfo: "",
    },
  });

  // Reset form when content changes
  useEffect(() => {
    if (content) {
      // Parse JSON strings safely
      const parseJsonArray = (value: any): string[] => {
        if (Array.isArray(value)) return value;
        if (typeof value === "string") {
          try {
            return JSON.parse(value) || [];
          } catch {
            return [];
          }
        }
        return [];
      };

      // Parse tags from content
      const parseTags = (tagsData: any) => {
        if (Array.isArray(tagsData)) {
          return tagsData.map((tagItem) => {
            // Handle the nested tag structure from the API
            if (tagItem.tag) {
              return {
                id: tagItem.tag.id,
                name: tagItem.tag.name,
                color: tagItem.tag.color,
              };
            }
            // Handle direct tag objects
            return {
              id: tagItem.id,
              name: tagItem.name,
              color: tagItem.color,
            };
          });
        }
        return [];
      };

      form.reset({
        title: content.title || "",
        description: content.description || "",
        company: content.company || "",
        position: content.position || "",
        location: content.location || "",
        startDate: content.startDate ? new Date(content.startDate).toISOString().split("T")[0] : "",
        endDate: content.endDate ? new Date(content.endDate).toISOString().split("T")[0] : "",
        isPresent: content.isPresent || false,
        skills: parseJsonArray(content.skills),
        achievements: parseJsonArray(content.achievements),
        courses: parseJsonArray(content.courses),
        keywords: parseJsonArray(content.keywords),
        tags: parseTags(content.tags),
        url: content.url || "",
        issuer: content.issuer || "",
        score: content.score || "",
        proficiencyLevel: content.proficiencyLevel,
        category: content.category || "",
        contactPerson: content.contactPerson || "",
        contactInfo: content.contactInfo || "",
      });
    } else {
      form.reset();
    }
  }, [content, form]);

  const addSkill = () => {
    if (skillInput.trim()) {
      const currentSkills = form.getValues("skills");
      if (!currentSkills.includes(skillInput.trim())) {
        form.setValue("skills", [...currentSkills, skillInput.trim()]);
      }
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const currentSkills = form.getValues("skills");
    form.setValue(
      "skills",
      currentSkills.filter((skill) => skill !== skillToRemove),
    );
  };

  const addAchievement = () => {
    if (achievementInput.trim()) {
      const currentAchievements = form.getValues("achievements");
      form.setValue("achievements", [...currentAchievements, achievementInput.trim()]);
      setAchievementInput("");
    }
  };

  const removeAchievement = (index: number) => {
    const currentAchievements = form.getValues("achievements");
    form.setValue(
      "achievements",
      currentAchievements.filter((_, i) => i !== index),
    );
  };

  const addCourse = () => {
    if (courseInput.trim()) {
      const currentCourses = form.getValues("courses");
      if (!currentCourses.includes(courseInput.trim())) {
        form.setValue("courses", [...currentCourses, courseInput.trim()]);
      }
      setCourseInput("");
    }
  };

  const removeCourse = (courseToRemove: string) => {
    const currentCourses = form.getValues("courses");
    form.setValue(
      "courses",
      currentCourses.filter((course) => course !== courseToRemove),
    );
  };

  const addKeyword = () => {
    if (keywordInput.trim()) {
      const currentKeywords = form.getValues("keywords");
      if (!currentKeywords.includes(keywordInput.trim())) {
        form.setValue("keywords", [...currentKeywords, keywordInput.trim()]);
      }
      setKeywordInput("");
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    const currentKeywords = form.getValues("keywords");
    form.setValue(
      "keywords",
      currentKeywords.filter((keyword) => keyword !== keywordToRemove),
    );
  };

  const addTag = (tagToAdd?: any) => {
    const tagName = tagToAdd ? tagToAdd.name : tagInput.trim();
    if (!tagName) return;

    const currentTags = form.getValues("tags");
    const tagExists = currentTags.some((tag) => tag.name.toLowerCase() === tagName.toLowerCase());

    if (!tagExists) {
      const newTag = tagToAdd || {
        id: `temp-${Date.now()}`, // Temporary ID for new tags
        name: tagName,
        color: "#3B82F6", // Default blue color
      };
      form.setValue("tags", [...currentTags, newTag]);
    }
    setTagInput("");
  };

  const removeTag = (tagToRemove: any) => {
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

  const onSubmit = async (data: ContentFormData) => {
    try {
      // Here you would make the API call to save/update the content
      console.log("Saving content:", data);
      // TODO: Implement actual API call
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save content:", error);
    }
  };

  const handleClose = () => {
    form.reset();
    setSkillInput("");
    setAchievementInput("");
    setCourseInput("");
    setKeywordInput("");
    setTagInput("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Content" : "Add New Content"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Make changes to your content item."
              : "Add a new content item to your library."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter title..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company/Organization</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter company..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position/Role</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter position..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter location..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter category..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <textarea
                          placeholder="Enter description..."
                          className="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[100px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date Range */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} disabled={form.watch("isPresent")} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isPresent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Current</FormLabel>
                          <div className="text-muted-foreground text-sm">Is this ongoing?</div>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Tags */}
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
                        onKeyPress={(e) => {
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
                                style={{ backgroundColor: tag.color || "#3B82F6" }}
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
                            borderColor: tag.color || "#3B82F6",
                            color: tag.color || "#3B82F6",
                          }}
                        >
                          <div
                            className="mr-1 size-2 rounded-full"
                            style={{ backgroundColor: tag.color || "#3B82F6" }}
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

                {/* Skills */}
                <div>
                  <FormLabel>Skills</FormLabel>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a skill..."
                        value={skillInput}
                        onChange={(e) => {
                          setSkillInput(e.target.value);
                        }}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                      />
                      <Button type="button" size="sm" onClick={addSkill}>
                        <Plus className="size-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {form.watch("skills").map((skill) => (
                        <Badge key={skill} variant="secondary" className="gap-1">
                          {skill}
                          <button
                            type="button"
                            className="hover:text-destructive ml-1"
                            onClick={() => {
                              removeSkill(skill);
                            }}
                          >
                            <X className="size-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Achievements */}
                <div>
                  <FormLabel>Achievements</FormLabel>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add an achievement..."
                        value={achievementInput}
                        onChange={(e) => {
                          setAchievementInput(e.target.value);
                        }}
                        onKeyPress={(e) =>
                          e.key === "Enter" && (e.preventDefault(), addAchievement())
                        }
                      />
                      <Button type="button" size="sm" onClick={addAchievement}>
                        <Plus className="size-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {form.watch("achievements").map((achievement, index) => (
                        <div key={index} className="flex items-start gap-2 rounded border p-2">
                          <span className="flex-1 text-sm">{achievement}</span>
                          <button
                            type="button"
                            className="text-destructive hover:text-destructive/80"
                            onClick={() => {
                              removeAchievement(index);
                            }}
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Additional Fields */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL/Website</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="issuer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Issuer/Institution</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter issuer..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="score"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Score/Grade</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter score..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="proficiencyLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proficiency Level (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="0-100"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e.target.value ? Number(e.target.value) : undefined);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactPerson"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Person</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter contact person..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Information</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter contact info..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Courses */}
                <div>
                  <FormLabel>Courses</FormLabel>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a course..."
                        value={courseInput}
                        onChange={(e) => {
                          setCourseInput(e.target.value);
                        }}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCourse())}
                      />
                      <Button type="button" size="sm" onClick={addCourse}>
                        <Plus className="size-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {form.watch("courses").map((course) => (
                        <Badge key={course} variant="secondary" className="gap-1">
                          {course}
                          <button
                            type="button"
                            className="hover:text-destructive ml-1"
                            onClick={() => {
                              removeCourse(course);
                            }}
                          >
                            <X className="size-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Keywords */}
                <div>
                  <FormLabel>Keywords</FormLabel>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a keyword..."
                        value={keywordInput}
                        onChange={(e) => {
                          setKeywordInput(e.target.value);
                        }}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())}
                      />
                      <Button type="button" size="sm" onClick={addKeyword}>
                        <Plus className="size-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {form.watch("keywords").map((keyword) => (
                        <Badge key={keyword} variant="secondary" outline={true} className="gap-1">
                          {keyword}
                          <button
                            type="button"
                            className="hover:text-destructive ml-1"
                            onClick={() => {
                              removeKeyword(keyword);
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

            <DialogFooter>
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
