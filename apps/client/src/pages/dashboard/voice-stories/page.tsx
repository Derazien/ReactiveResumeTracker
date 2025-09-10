import { t } from "@lingui/macro";
import { ChatTeardropText, Microphone, Plus } from "@phosphor-icons/react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@reactive-resume/ui";
import { useState } from "react";

import { AnswerSnippetsList } from "./_components/answer-snippets-list";
import { StoryBlocksList } from "./_components/story-blocks-list";
import { VoiceStoryWizard } from "./_components/voice-story-wizard";

export const VoiceStoriesPage = () => {
  const [showWizard, setShowWizard] = useState(false);
  const [wizardMode, setWizardMode] = useState<"story" | "answer">("story");

  const handleCreateStory = () => {
    setWizardMode("story");
    setShowWizard(true);
  };

  const handleCreateAnswer = () => {
    setWizardMode("answer");
    setShowWizard(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t`Voice Stories`}</h1>
          <p className="text-muted-foreground">
            {t`Capture your experiences and answers with voice recordings`}
          </p>
        </div>

        <div className="flex gap-2">
          <Button className="gap-2" onClick={handleCreateStory}>
            <Microphone size={16} />
            {t`Record Story`}
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleCreateAnswer}>
            <ChatTeardropText size={16} />
            {t`Record Answer`}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t`Story Blocks`}</CardTitle>
            <Microphone className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-muted-foreground text-xs">{t`Experience stories recorded`}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t`Answer Snippets`}</CardTitle>
            <ChatTeardropText className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-muted-foreground text-xs">{t`Prepared answers saved`}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t`Cover Letters`}</CardTitle>
            <Plus className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-muted-foreground text-xs">{t`Generated this month`}</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t`Story Blocks`}</h2>
            <Button size="sm" variant="outline" onClick={handleCreateStory}>
              <Plus size={16} className="mr-2" />
              {t`Add Story`}
            </Button>
          </div>
          <StoryBlocksList />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t`Answer Snippets`}</h2>
            <Button size="sm" variant="outline" onClick={handleCreateAnswer}>
              <Plus size={16} className="mr-2" />
              {t`Add Answer`}
            </Button>
          </div>
          <AnswerSnippetsList />
        </div>
      </div>

      {/* Voice Wizard Dialog */}
      {showWizard && (
        <VoiceStoryWizard mode={wizardMode} open={showWizard} onOpenChange={setShowWizard} />
      )}
    </div>
  );
};
