import { MagnifyingGlass, PencilSimple, Plus, TrashSimple, Upload } from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle } from "@reactive-resume/ui";
import { Button } from "@reactive-resume/ui";
import { Input } from "@reactive-resume/ui";
import { Badge } from "@reactive-resume/ui";
import { ScrollArea } from "@reactive-resume/ui";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@reactive-resume/ui";
import { cn } from "@reactive-resume/utils";
import { useState } from "react";

import { useToast } from "@/client/hooks/use-toast";
import {
  useAvailableSections,
  useContentBySection,
  useContentLibrary,
  useDeleteContentLibraryItem,
} from "@/client/services/content-library/content-library";

import { ContentEditDialog } from "./_components/content-edit-dialog";
import { CVUploadDialog } from "./_components/cv-upload-dialog";

const ContentLibraryPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<any>(null);

  const { data: allContent, isLoading: isLoadingAll, error: errorAll } = useContentLibrary();
  const { data: sections, isLoading: isLoadingSections } = useAvailableSections();
  const { data: sectionContent, isLoading: isLoadingSection } = useContentBySection(
    selectedSectionId || undefined,
  );

  // Get the first active section as default if none selected
  const defaultSection = sections?.find((section: any) => section.isActive) || sections?.[0];
  if (!selectedSectionId && defaultSection) {
    setSelectedSectionId(defaultSection.id);
  }

  // Filter content based on search
  const displayContent = sectionContent?.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      item.skills.some((skill: string) => skill.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
  });

  const selectedSection = sections?.find((section: any) => section.id === selectedSectionId);

  const handleEditContent = (content: any) => {
    setEditingContent(content);
    setEditDialogOpen(true);
  };

  const handleCreateContent = () => {
    setEditingContent(null);
    setEditDialogOpen(true);
  };

  if (isLoadingSections || isLoadingAll) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p>Loading your content library...</p>
        </div>
      </div>
    );
  }

  if (errorAll) {
    return (
      <div className="py-8 text-center">
        <p className="mb-4 text-red-600">Failed to load content library</p>
        <Button
          onClick={() => {
            window.location.reload();
          }}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Left Sidebar - Sections */}
      <div className="bg-card w-80 border-r">
        <div className="border-b p-6">
          <h1 className="mb-2 text-2xl font-bold">Content Library</h1>
          <p className="text-muted-foreground text-sm">Manage your professional content</p>

          {/* Actions */}
          <div className="mt-4 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="flex items-center gap-2"
              onClick={() => {
                setUploadDialogOpen(true);
              }}
            >
              <Upload className="size-4" />
              Upload CV
            </Button>
            <Button
              size="sm"
              className="flex items-center gap-2"
              disabled={!selectedSectionId}
              onClick={handleCreateContent}
            >
              <Plus className="size-4" />
              Add Content
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4">
            <h3 className="text-muted-foreground mb-3 text-sm font-semibold uppercase tracking-wide">
              Sections
            </h3>

            {/* Sections List */}
            <div className="space-y-1">
              {sections?.map((section: any) => {
                const contentCount =
                  allContent?.filter((item) => item.section.id === section.id).length || 0;
                const isSelected = selectedSectionId === section.id;

                return (
                  <button
                    key={section.id}
                    className={cn(
                      "hover:bg-accent w-full rounded-lg p-3 text-left transition-colors",
                      isSelected && "bg-accent border-l-4 border-primary",
                    )}
                    onClick={() => {
                      setSelectedSectionId(section.id);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{section.icon || "📄"}</span>
                        <div>
                          <div className="text-sm font-medium">{section.name}</div>
                          {section.description && (
                            <div className="text-muted-foreground line-clamp-1 text-xs">
                              {section.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {contentCount}
                        </Badge>
                        {section.isActive && (
                          <div className="size-2 rounded-full bg-green-500"></div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Right Panel - Content */}
      <div className="flex flex-1 flex-col">
        {selectedSection ? (
          <>
            {/* Header */}
            <div className="border-b p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selectedSection.icon || "📄"}</span>
                  <div>
                    <h2 className="text-xl font-bold">{selectedSection.name}</h2>
                    <p className="text-muted-foreground text-sm">{selectedSection.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <MagnifyingGlass className="text-muted-foreground absolute left-3 top-3 size-4" />
                    <Input
                      placeholder="Search content..."
                      value={searchQuery}
                      className="w-64 pl-10"
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                      }}
                    />
                  </div>
                  <Button onClick={handleCreateContent}>
                    <Plus className="mr-2 size-4" />
                    Add Content
                  </Button>
                </div>
              </div>
            </div>

            {/* Content List */}
            <ScrollArea className="flex-1">
              <div className="p-6">
                {isLoadingSection ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  </div>
                ) : displayContent && displayContent.length > 0 ? (
                  <div className="space-y-4">
                    {displayContent.map((item) => (
                      <ContentDetailCard
                        key={item.id}
                        item={item}
                        onEdit={() => {
                          handleEditContent(item);
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <div className="text-muted-foreground">
                      <p className="mb-2 text-lg">No content found</p>
                      <p className="mb-4 text-sm">
                        {searchQuery
                          ? `No content matches "${searchQuery}"`
                          : `Start by adding content to ${selectedSection.name.toLowerCase()}`}
                      </p>
                    </div>
                    <Button onClick={handleCreateContent}>
                      <Plus className="mr-2 size-4" />
                      Add Content
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-muted-foreground text-center">
              <p className="text-lg">Select a section to view content</p>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <CVUploadDialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen} />

      <ContentEditDialog
        open={editDialogOpen}
        content={editingContent}
        sectionId={selectedSectionId}
        onOpenChange={setEditDialogOpen}
      />
    </div>
  );
};

// Detailed Content Card Component
const ContentDetailCard = ({ item, onEdit }: { item: any; onEdit: () => void }) => {
  const { toast } = useToast();
  const deleteContentMutation = useDeleteContentLibraryItem();
  const getTypeIcon = (type: string | null | undefined) => {
    switch (type) {
      case "experience": {
        return "💼";
      }
      case "projects": {
        return "🚀";
      }
      case "skills": {
        return "💻";
      }
      case "education": {
        return "🎓";
      }
      case "certifications": {
        return "📜";
      }
      case "languages": {
        return "🌐";
      }
      case "volunteer": {
        return "❤️";
      }
      case "interests": {
        return "🎨";
      }
      case "awards": {
        return "🏆";
      }
      case "publications": {
        return "📚";
      }
      case "references": {
        return "👥";
      }
      case "profiles": {
        return "🔗";
      }
      default: {
        return "📄";
      }
    }
  };

  // Parse skills array safely
  const skills = Array.isArray(item.skills)
    ? item.skills
    : typeof item.skills === "string"
      ? JSON.parse(item.skills || "[]")
      : [];

  // Parse achievements array safely
  const achievements = Array.isArray(item.achievements)
    ? item.achievements
    : typeof item.achievements === "string"
      ? JSON.parse(item.achievements || "[]")
      : [];

  const handleDelete = async () => {
    try {
      await deleteContentMutation.mutateAsync(item.id);
      toast({
        title: "Content deleted",
        description: `"${item.title}" has been successfully deleted.`,
      });
    } catch (error) {
      console.error("Failed to delete content:", error);
      toast({
        title: "Error",
        description: "Failed to delete content. Please try again.",
        variant: "error",
      });
    }
  };

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">{getTypeIcon(item.section?.key)}</span>
            <div className="flex-1">
              <CardTitle className="text-lg">{item.title}</CardTitle>
              {(item.company || item.position) && (
                <p className="text-muted-foreground mt-1 text-sm">
                  {item.position && <span>{item.position}</span>}
                  {item.company && item.position && <span> at </span>}
                  {item.company && <span className="font-medium">{item.company}</span>}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={onEdit}>
              <PencilSimple className="size-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  disabled={deleteContentMutation.isPending}
                >
                  <TrashSimple className="size-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Content Item</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{item.title}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={deleteContentMutation.isPending}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={handleDelete}
                  >
                    {deleteContentMutation.isPending ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        {item.description && (
          <div>
            <h4 className="mb-2 text-sm font-medium">Description</h4>
            <p className="text-muted-foreground text-sm">{item.description}</p>
          </div>
        )}

        {/* Date Range */}
        {(item.startDate || item.endDate) && (
          <div>
            <h4 className="mb-2 text-sm font-medium">Period</h4>
            <p className="text-muted-foreground text-sm">
              {item.startDate && new Date(item.startDate).toLocaleDateString()}
              {item.startDate && item.endDate && " - "}
              {item.endDate && new Date(item.endDate).toLocaleDateString()}
              {item.isPresent && " - Present"}
            </p>
          </div>
        )}

        {/* Location */}
        {item.location && (
          <div>
            <h4 className="mb-2 text-sm font-medium">Location</h4>
            <p className="text-muted-foreground text-sm">{item.location}</p>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-medium">Skills</h4>
            <div className="flex flex-wrap gap-1">
              {skills.slice(0, 6).map((skill: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {skills.length > 6 && (
                <Badge variant="secondary" className="text-xs">
                  +{skills.length - 6} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Achievements */}
        {achievements.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-medium">Achievements</h4>
            <ul className="text-muted-foreground space-y-1 text-sm">
              {achievements.slice(0, 3).map((achievement: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1 text-primary">•</span>
                  <span>{achievement}</span>
                </li>
              ))}
              {achievements.length > 3 && (
                <li className="text-muted-foreground/70 text-xs">
                  +{achievements.length - 3} more achievements
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Additional Fields */}
        <div className="text-muted-foreground grid grid-cols-2 gap-4 text-xs">
          {item.issuer && (
            <div>
              <span className="font-medium">Issuer:</span> {item.issuer}
            </div>
          )}
          {item.score && (
            <div>
              <span className="font-medium">Score:</span> {item.score}
            </div>
          )}
          {item.proficiencyLevel && (
            <div>
              <span className="font-medium">Level:</span> {item.proficiencyLevel}%
            </div>
          )}
          {item.url && (
            <div className="col-span-2">
              <span className="font-medium">URL:</span>{" "}
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {item.url}
              </a>
            </div>
          )}
        </div>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-medium">Tags</h4>
            <div className="flex flex-wrap gap-1">
              {item.tags.map((tagItem: any, index: number) => {
                // Handle nested tag structure from API
                const tag = tagItem.tag || tagItem;
                return (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="gap-1 text-xs"
                    style={{
                      borderColor: tag.color || "#3B82F6",
                      color: tag.color || "#3B82F6",
                    }}
                  >
                    <div
                      className="size-2 rounded-full"
                      style={{ backgroundColor: tag.color || "#3B82F6" }}
                    />
                    {tag.name}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="text-muted-foreground border-t pt-2 text-xs">
          <div className="flex items-center justify-between">
            <span>Created: {new Date(item.createdAt).toLocaleDateString()}</span>
            <span>Updated: {new Date(item.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentLibraryPage;
