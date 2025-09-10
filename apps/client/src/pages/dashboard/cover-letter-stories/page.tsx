import { MagnifyingGlassIcon, MicrophoneIcon, PlusIcon, TrashSimpleIcon } from "@phosphor-icons/react";
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
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  ScrollArea,
} from "@reactive-resume/ui";
import { cn } from "@reactive-resume/utils";
import { useState } from "react";

import { useToast } from "@/client/hooks/use-toast";
import {
  useCoverLetterContent,
  useDeleteCoverLetterContent,
  type CoverLetterContent,
} from "@/client/services/cover-letter-content";

import { CoverLetterStoryDialog } from "./_components/cover-letter-story-dialog";
import { StoryInterviewDialog } from "./_components/story-interview-dialog";

const CoverLetterStoriesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [storyDialogOpen, setStoryDialogOpen] = useState(false);
  const [interviewDialogOpen, setInterviewDialogOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<CoverLetterContent | null>(null);

  const { data: stories, isLoading, error } = useCoverLetterContent();
  const { toast } = useToast();

  // Filter stories based on search
  const filteredStories = stories?.filter((story) => {
    const matchesSearch =
      story.storyText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.skillTheme.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.contentType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleEditStory = (story: CoverLetterContent) => {
    setEditingStory(story);
    setStoryDialogOpen(true);
  };

  const handleCreateStory = () => {
    setEditingStory(null);
    setStoryDialogOpen(true);
  };

  const handleConductInterview = () => {
    setInterviewDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p>Loading your cover letter stories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="mb-4 text-red-600">Failed to load cover letter stories</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Cover Letter Stories</h1>
        <p className="text-muted-foreground">
          Create and manage compelling stories for your cover letter generation. These stories showcase your 
          skills and achievements that can be tailored to different job applications.
        </p>
      </div>

      {/* Actions & Search */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <Button onClick={handleCreateStory} className="flex items-center gap-2">
            <PlusIcon className="size-4" />
            Add Story
          </Button>
          <Button 
            variant="secondary" 
            onClick={handleConductInterview}
            className="flex items-center gap-2"
          >
            <MicrophoneIcon className="size-4" />
            Conduct Interview
          </Button>
        </div>

        <div className="relative w-full sm:w-80">
          <MagnifyingGlassIcon className="text-muted-foreground absolute left-3 top-3 size-4" />
          <Input
            placeholder="Search stories..."
            value={searchQuery}
            className="pl-10"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stories?.length || 0}</div>
              <div className="text-muted-foreground text-sm">Total Stories</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {new Set(stories?.map(s => s.contentType) || []).size}
              </div>
              <div className="text-muted-foreground text-sm">Story Types</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {filteredStories?.length || 0}
              </div>
              <div className="text-muted-foreground text-sm">Filtered Results</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stories Grid */}
      {filteredStories && filteredStories.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredStories.map((story) => (
            <CoverLetterStoryCard
              key={story.id}
              story={story}
              onEdit={() => handleEditStory(story)}
            />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <div className="mx-auto mb-4 size-16 rounded-full bg-muted flex items-center justify-center">
            <MicrophoneIcon className="size-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">No stories found</h3>
          <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
            {searchQuery
              ? `No stories match "${searchQuery}". Try a different search term.`
              : "Start by adding your first cover letter story or conducting an AI interview to extract stories from your experiences."}
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={handleCreateStory}>
              <PlusIcon className="mr-2 size-4" />
              Add Story
            </Button>
            <Button variant="secondary" onClick={handleConductInterview}>
              <MicrophoneIcon className="mr-2 size-4" />
              Conduct Interview
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <CoverLetterStoryDialog
        open={storyDialogOpen}
        story={editingStory}
        onOpenChange={setStoryDialogOpen}
      />

      <StoryInterviewDialog
        open={interviewDialogOpen}
        onOpenChange={setInterviewDialogOpen}
      />
    </div>
  );
};

// Story Card Component
const CoverLetterStoryCard = ({ 
  story, 
  onEdit 
}: { 
  story: CoverLetterContent; 
  onEdit: () => void 
}) => {
  const { toast } = useToast();
  const deleteStoryMutation = useDeleteCoverLetterContent();

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "PARAGRAPH_ANALYTICS": return "📊";
      case "PARAGRAPH_DIVERSITY": return "🌍";
      case "PARAGRAPH_LEADERSHIP": return "👑";
      case "PARAGRAPH_TECH": return "💻";
      case "PARAGRAPH_CHALLENGE": return "🎯";
      case "PARAGRAPH_COLLABORATION": return "🤝";
      case "PARAGRAPH_INNOVATION": return "💡";
      case "PARAGRAPH_IMPACT": return "📈";
      case "PARAGRAPH_GROWTH": return "🌱";
      case "PARAGRAPH_VALUES": return "⭐";
      default: return "✉️";
    }
  };

  const formatContentType = (type: string) => {
    return type.replace("PARAGRAPH_", "").toLowerCase().replace(/_/g, " ");
  };

  const handleDelete = async () => {
    try {
      await deleteStoryMutation.mutateAsync(story.id);
      toast({
        title: "Story deleted",
        description: "Cover letter story has been successfully deleted.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete story. Please try again.",
        variant: "error",
      });
    }
  };

  return (
    <Card className="transition-all hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <span className="text-2xl">{getContentTypeIcon(story.contentType)}</span>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg capitalize truncate">
                {formatContentType(story.contentType)}
              </CardTitle>
              <p className="text-muted-foreground text-sm font-medium truncate">
                {story.skillTheme}
              </p>
            </div>
          </div>
          <div className="flex gap-1 ml-2">
            <Button size="sm" variant="ghost" onClick={onEdit}>
              <PlusIcon className="size-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  disabled={deleteStoryMutation.isPending}
                >
                  <TrashSimpleIcon className="size-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Cover Letter Story</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this story? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={deleteStoryMutation.isPending}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={handleDelete}
                  >
                    {deleteStoryMutation.isPending ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Story Preview */}
        <div>
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
            {story.storyText}
          </p>
        </div>

        {/* Tags */}
        {story.tags && story.tags !== "[]" && (
          <div className="flex flex-wrap gap-1">
            {JSON.parse(story.tags).slice(0, 3).map((tag: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {JSON.parse(story.tags).length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{JSON.parse(story.tags).length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="text-muted-foreground border-t pt-2 text-xs flex justify-between">
          <span>{new Date(story.createdAt).toLocaleDateString()}</span>
          <span className="capitalize">{story.tone}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CoverLetterStoriesPage;