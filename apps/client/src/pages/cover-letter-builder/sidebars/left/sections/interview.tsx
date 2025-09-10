import { t } from "@lingui/macro";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@reactive-resume/ui";
import { MessageSquare, Play } from "lucide-react";
import { useState } from "react";

import { useCoverLetterBuilderStore } from "@/client/stores/cover-letter-builder";
import { useJobApplicationStore } from "@/client/stores/job-application";

export const InterviewSection = () => {
  const [currentAnswer, setCurrentAnswer] = useState("");
  const jobApplication = useJobApplicationStore((state) => state.jobApplication);
  const interview = useCoverLetterBuilderStore((state) => state.interview);
  const setAnswer = useCoverLetterBuilderStore((state) => state.interview.setAnswer);
  const setCurrentQuestion = useCoverLetterBuilderStore(
    (state) => state.interview.setCurrentQuestion,
  );

  const handleStartInterview = async () => {
    if (!jobApplication) return;

    try {
      const response = await fetch(`/api/cover-letter-content/conduct-interview-for-job/${jobApplication.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          interviewType: "cover_letter",
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // TODO: Update interview store with questions
        console.log("Interview started successfully:", result);
      } else {
        throw new Error("Failed to start interview");
      }
    } catch (error) {
      console.error("Failed to start interview:", error);
    }
  };

  const handleSubmitAnswer = () => {
    if (currentAnswer.trim()) {
      setAnswer(interview.currentQuestion, currentAnswer);
      setCurrentAnswer("");
      setCurrentQuestion(interview.currentQuestion + 1);
    }
  };

  const handleSkipQuestion = () => {
    setCurrentQuestion(interview.currentQuestion + 1);
  };

  const currentQuestionText = interview.questions[interview.currentQuestion] || "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t`Interview Flow`}</h3>
        <Badge variant={interview.isActive ? "primary" : "secondary"}>
          {interview.isActive ? t`Active` : t`Inactive`}
        </Badge>
      </div>

      {/* Interview Status */}
      {interview.isActive ? (
        <div className="space-y-4">
          {/* Progress */}
          <div className="flex items-center justify-between text-sm">
            <span>
              {t`Question`} {interview.currentQuestion + 1} {t`of`} {interview.questions.length}
            </span>
            <span className="text-muted-foreground">
              {Math.round(((interview.currentQuestion + 1) / interview.questions.length) * 100)}%
            </span>
          </div>

          {/* Current Question */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t`Current Question`}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm">{currentQuestionText}</p>
              <textarea
                placeholder={t`Type your answer here...`}
                value={currentAnswer}
                className="border-input resize-vertical min-h-[100px] w-full rounded-md border p-2"
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  setCurrentAnswer(e.target.value);
                }}
              />
              <div className="mt-4 flex gap-2">
                <Button disabled={!currentAnswer.trim()} onClick={handleSubmitAnswer}>
                  {t`Submit Answer`}
                </Button>
                <Button variant="outline" onClick={handleSkipQuestion}>
                  {t`Skip`}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Previous Answers */}
          {Object.keys(interview.answers).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{t`Previous Answers`}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(interview.answers).map(([questionIndex, answer]) => (
                    <div key={questionIndex} className="border-l-2 border-primary pl-3">
                      <p className="text-muted-foreground mb-1 text-xs">
                        {t`Question`} {Number.parseInt(questionIndex) + 1}
                      </p>
                      <p className="text-sm">{answer}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <MessageSquare className="size-4" />
              {t`Start Interview`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4 text-sm">
              {t`Conduct an AI-powered interview to extract relevant stories and experiences for your cover letter.`}
            </p>
            <Button className="w-full" onClick={handleStartInterview}>
              <Play className="mr-2 size-4" />
              {t`Start Interview`}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Interview Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{t`Interview Tips`}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-muted-foreground space-y-1 text-xs">
            <li>• {t`Be specific and provide concrete examples`}</li>
            <li>• {t`Focus on achievements and measurable results`}</li>
            <li>• {t`Connect your experiences to the job requirements`}</li>
            <li>• {t`Use the STAR method (Situation, Task, Action, Result)`}</li>
            <li>• {t`Be honest and authentic in your responses`}</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
