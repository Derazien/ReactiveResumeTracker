import { t } from "@lingui/macro";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Separator, ContactSectionForm } from "@reactive-resume/ui";
import { PlusIcon, TrashIcon, FileTextIcon } from "@phosphor-icons/react";
import { useState } from "react";

import { useCoverLetterBuilderStore } from "@/client/stores/cover-letter-builder";
import { useCoverLetterContent } from "@/client/services/cover-letter-content";
import { useCoverLetterSync } from "@/client/hooks/use-cover-letter-sync";
import { StoryCreationDialog } from "../../../_components/story-creation-dialog";

export const ContentSection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [storyDialogOpen, setStoryDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'stories'>('editor');
  const selectedStories = useCoverLetterBuilderStore(
    (state) => state.contentSelection.selectedStories,
  );
  const addStory = useCoverLetterBuilderStore((state) => state.contentSelection.addStory);
  const removeStory = useCoverLetterBuilderStore((state) => state.contentSelection.removeStory);
  
  // Fetch all cover letter stories
  const { data: allStories, isLoading: isStoriesLoading } = useCoverLetterContent();
  
  // Get cover letter sync hook
  const coverLetter = useCoverLetterSync();
  
  // Get selected story objects from cover letter data  
  const coverLetterSelectedIds = coverLetter.data?.selectedStoryIds || [];
  const selectedStoryObjects = allStories?.filter(story => 
    selectedStories.includes(story.id) || coverLetterSelectedIds.includes(story.id)
  ) || [];

  const handleAddStory = () => {
    setStoryDialogOpen(true);
  };

  const handleStoryCreated = (storyId: string) => {
    // Add the newly created story to the selected stories
    addStory(storyId);
  };

  const handleRemoveStory = (storyId: string) => {
    removeStory(storyId);
  };

  const handleRegenerateCoverLetter = async () => {
    if (!coverLetter.data?.jobApplicationId || isLoading) return;

    setIsLoading(true);
    try {
      // Get selected story IDs (combine builder state + generated stories)
      const allSelectedIds = [
        ...selectedStories,
        ...coverLetterSelectedIds.filter(id => !selectedStories.includes(id))
      ];

      // Call regeneration API with selected stories
      const response = await fetch(`/api/job-applications/${coverLetter.data.jobApplicationId}/generate-cover-letter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access_token")}` || ""
        },
        body: JSON.stringify({
          templateName: coverLetter.data?.templateName || "professional",
          tone: coverLetter.data?.tone || "professional",
          maxParagraphs: 3,
          selectedStoryIds: allSelectedIds, // Include selected story preference
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update cover letter content
        if (result.coverLetter?.content) {
          coverLetter.updateContent(result.coverLetter.content);
        }

        // Update selected story IDs to reflect what was actually used
        if (result.selectedParagraphs) {
          const usedStoryIds = result.selectedParagraphs.map((p: any) => p.id);
          coverLetter.updateSelectedStories(usedStoryIds);
        }

        console.log("Cover letter regenerated with selected stories");
      } else {
        console.error("Failed to regenerate cover letter");
      }
    } catch (error) {
      console.error("Error regenerating cover letter:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const insertStoryIntoContent = (storyText: string) => {
    const currentContent = coverLetter.data?.content || "";
    const newContent = currentContent + "\n\n" + storyText;
    coverLetter.updateContent(newContent);
  };

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
        <Button
          size="sm"
          variant={activeTab === 'editor' ? 'primary' : 'ghost'}
          className="flex-1 h-8"
              onClick={() => {
                setActiveTab('editor');
              }}
        >
          <FileTextIcon className="size-3 mr-1" />
          {t`Editor`}
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'stories' ? 'primary' : 'ghost'}
          className="flex-1 h-8"
              onClick={() => {
                setActiveTab('stories');
              }}
        >
          <PlusIcon className="size-3 mr-1" />
          {t`Stories`}
        </Button>
      </div>

      {/* Content Editor Tab */}
      {activeTab === 'editor' && (
        <div className="space-y-4">
          {/* Contact Information - Using ContactSectionForm like resume builder */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">{t`Contact Information`}</h4>
            
            <ContactSectionForm
              values={{
                name: coverLetter.data?.basics?.name || coverLetter.data?.senderName || "",
                headline: coverLetter.data?.basics?.headline || coverLetter.data?.senderTitle || "",
                email: coverLetter.data?.basics?.email || coverLetter.data?.senderEmail || "",
                phone: coverLetter.data?.basics?.phone || coverLetter.data?.senderPhone || "",
                location: coverLetter.data?.basics?.location || coverLetter.data?.senderAddress || "",
                url: {
                  label: coverLetter.data?.basics?.url?.label || "",
                  href: coverLetter.data?.basics?.url?.href || "",
                },
                customFields: (coverLetter.data?.basics?.customFields || []).map(field => ({
                  id: field.id,
                  name: field.name,
                  value: field.value,
                  icon: field.icon || "envelope", // Provide default icon
                })),
              }}
              onChange={(field, value) => {
                const updatedBasics = {
                  ...coverLetter.data?.basics,
                  [field]: value,
                };
                coverLetter.updateSenderInfo({ basics: updatedBasics });
              }}
              onCustomFieldsChange={(fields) => {
                const updatedBasics = {
                  ...coverLetter.data?.basics,
                  customFields: fields,
                };
                coverLetter.updateSenderInfo({ basics: updatedBasics });
              }}
              className="text-xs"
            />
          </div>

          <Separator />

          {/* Company Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">{t`Company Details`}</h4>
            <div className="rounded-lg bg-muted/30 p-3">
              <div className="space-y-1 text-xs">
                <div><strong>{t`Company:`}</strong> {coverLetter.data?.jobApplicationData?.companyName || coverLetter.data?.companyName || t`Not specified`}</div>
                <div><strong>{t`Position:`}</strong> {coverLetter.data?.jobApplicationData?.title || t`Not specified`}</div>
                <div><strong>{t`Location:`}</strong> {coverLetter.data?.companyData?.location || t`Not specified`}</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Cover Letter Content */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">{t`Letter Content`}</h4>
              <Badge variant="primary" className="text-xs">
                {coverLetter.data?.content?.length || 0} {t`characters`}
              </Badge>
            </div>
            
            <div>
              <textarea
                placeholder="Write your cover letter content here..."
                value={coverLetter.data?.content || ""}
                onChange={(e) => coverLetter.updateContent(e.target.value)}
                className="min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                rows={12}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {t`Tip: Switch to Stories tab to manage story selection and regenerate.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stories Tab */}
      {activeTab === 'stories' && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">{t`Cover Letter Stories`}</h4>
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleAddStory}
            >
              <PlusIcon className="size-3" />
              {t`Add Story`}
            </Button>
          </div>

      {/* Available Stories */}
      <div className="space-y-2">
        <h4 className="text-muted-foreground text-sm font-medium">
          {t`Available Stories`} ({allStories?.length || 0})
        </h4>
        {isStoriesLoading ? (
          <div className="py-4 text-center">
            <div className="mx-auto size-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        ) : allStories && allStories.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {allStories.slice(0, 8).map((story) => {
              const isSelected = selectedStories.includes(story.id) || coverLetterSelectedIds.includes(story.id);
              const isFromGeneration = coverLetterSelectedIds.includes(story.id);
              
              return (
                <Badge 
                  key={story.id} 
                  variant={isSelected ? "primary" : "secondary"}
                  className="cursor-pointer text-xs relative"
                  onClick={() => {
                    if (selectedStories.includes(story.id)) {
                      removeStory(story.id);
                    } else {
                      addStory(story.id);
                    }
                  }}
                >
                  {story.skillTheme}
                  {isFromGeneration && (
                    <span className="ml-1 text-xs opacity-75">*</span>
                  )}
                </Badge>
              );
            })}
            {allStories.length > 8 && (
              <Badge variant="secondary" className="text-xs">
                +{allStories.length - 8} more
              </Badge>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground text-xs">No stories created yet</p>
        )}
        
        <p className="text-xs text-muted-foreground mt-2">
          {t`Stories marked with * were used in generation. Click to add/remove stories.`}
        </p>
      </div>

      {/* Selected Stories */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-muted-foreground text-sm font-medium">
            {t`Selected Stories`} ({selectedStoryObjects.length})
          </h4>
          {selectedStoryObjects.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-6 px-2"
              onClick={handleRegenerateCoverLetter}
              disabled={isLoading}
            >
              {isLoading ? t`Regenerating...` : t`Regenerate`}
            </Button>
          )}
        </div>

        {selectedStoryObjects.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center">
            <p className="text-sm">{t`No stories selected`}</p>
            <p className="mt-1 text-xs">{t`Select stories above or create new ones`}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {selectedStoryObjects.map((story) => (
              <Card key={story.id} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-sm capitalize">
                          {story.contentType.replace('PARAGRAPH_', '').toLowerCase().replace('_', ' ')}
                        </CardTitle>
                        {coverLetterSelectedIds.includes(story.id) && (
                          <Badge variant="secondary" className="text-xs px-1">
                            {t`Used`}
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-xs font-medium">
                        {story.skillTheme}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="size-6 p-0"
                      onClick={() => {
                        handleRemoveStory(story.id);
                      }}
                    >
                      <TrashIcon className="size-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {story.storyText.length > 120 
                      ? `${story.storyText.slice(0, 120)}...` 
                      : story.storyText
                    }
                  </p>
                  {story.tags && story.tags !== "[]" && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {JSON.parse(story.tags).slice(0, 3).map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 h-6 text-xs"
                    onClick={() => insertStoryIntoContent(story.storyText)}
                  >
                    {t`Insert into Letter`}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

          {/* Content Library Link */}
          <div className="border-t pt-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => {
                window.open('/dashboard/cover-letter-stories', '_blank');
              }}
            >
              {t`Manage Stories Library`}
            </Button>
          </div>
        </div>
      )}

      {/* Story Creation Dialog */}
      <StoryCreationDialog 
        open={storyDialogOpen}
        onOpenChange={setStoryDialogOpen}
        onStoryCreated={handleStoryCreated}
      />
    </div>
  );
};
