import { t } from "@lingui/macro";
import { Calendar, Microphone, Play, Tag } from "@phosphor-icons/react";
import { Badge, Button, Card, CardContent, CardHeader, ScrollArea } from "@reactive-resume/ui";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

type StoryBlock = {
  id: string;
  text: string;
  tags: string[];
  skillTheme: string;
  tone: string;
  createdAt: string;
  updatedAt: string;
};

export const StoryBlocksList = () => {
  const [storyBlocks, setStoryBlocks] = useState<StoryBlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStoryBlocks();
  }, []);

  const fetchStoryBlocks = async () => {
    try {
      const response = await fetch("/voice/story-blocks");
      if (response.ok) {
        const blocks = await response.json();
        setStoryBlocks(
          blocks.map((block: any) => ({
            ...block,
            tags: JSON.parse(block.tags || "[]"),
          })),
        );
      }
    } catch (error) {
      console.error("Error fetching story blocks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayStory = (storyId: string) => {
    // TODO: Implement text-to-speech playback
    console.log("Playing story:", storyId);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="bg-muted h-4 w-1/3 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="bg-muted h-3 w-full rounded"></div>
                <div className="bg-muted h-3 w-2/3 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (storyBlocks.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Microphone className="text-muted-foreground mb-4 size-12" />
          <h3 className="mb-2 text-lg font-medium">{t`No story blocks yet`}</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            {t`Start recording your experiences to build your story library`}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[600px]">
      <div className="space-y-4">
        {storyBlocks.map((story) => (
          <Card key={story.id} className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <Microphone size={12} />
                    {story.skillTheme}
                  </Badge>
                  <Badge outline className="text-xs">
                    {story.tone}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1"
                  onClick={() => {
                    handlePlayStory(story.id);
                  }}
                >
                  <Play size={12} />
                  {t`Preview`}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <p className="max-h-16 overflow-hidden text-sm leading-relaxed">{story.text}</p>

              {story.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {story.tags.slice(0, 4).map((tag) => (
                    <Badge key={tag} outline className="gap-1 text-xs">
                      <Tag size={10} />
                      {tag}
                    </Badge>
                  ))}
                  {story.tags.length > 4 && (
                    <Badge outline className="text-xs">
                      +{story.tags.length - 4} more
                    </Badge>
                  )}
                </div>
              )}

              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <Calendar size={12} />
                {dayjs(story.createdAt).fromNow()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};
