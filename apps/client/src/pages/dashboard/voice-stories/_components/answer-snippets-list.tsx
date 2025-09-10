import { t } from "@lingui/macro";
import { Calendar, ChatTeardropText, Play, Tag } from "@phosphor-icons/react";
import { Badge, Button, Card, CardContent, CardHeader, ScrollArea } from "@reactive-resume/ui";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

type AnswerSnippet = {
  id: string;
  text: string;
  questionTag: string;
  tags: string[];
  skillTheme: string;
  tone: string;
  createdAt: string;
  updatedAt: string;
};

const QUESTION_TAG_LABELS: Record<string, string> = {
  why_company: "Why Company?",
  strength: "Strengths",
  weakness: "Weaknesses",
  challenge: "Challenges",
  achievement: "Achievements",
  goals: "Goals",
  general: "General",
};

export const AnswerSnippetsList = () => {
  const [answerSnippets, setAnswerSnippets] = useState<AnswerSnippet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnswerSnippets();
  }, []);

  const fetchAnswerSnippets = async () => {
    try {
      const response = await fetch("/voice/answer-snippets");
      if (response.ok) {
        const snippets = await response.json();
        setAnswerSnippets(
          snippets.map((snippet: any) => ({
            ...snippet,
            tags: JSON.parse(snippet.tags || "[]"),
          })),
        );
      }
    } catch (error) {
      console.error("Error fetching answer snippets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAnswer = (answerId: string) => {
    // TODO: Implement text-to-speech playback
    console.log("Playing answer:", answerId);
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

  if (answerSnippets.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <ChatTeardropText className="text-muted-foreground mb-4 size-12" />
          <h3 className="mb-2 text-lg font-medium">{t`No answer snippets yet`}</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            {t`Record answers to common interview questions`}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[600px]">
      <div className="space-y-4">
        {answerSnippets.map((answer) => (
          <Card key={answer.id} className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <ChatTeardropText size={12} />
                    {QUESTION_TAG_LABELS[answer.questionTag] || answer.questionTag}
                  </Badge>
                  <Badge outline className="text-xs">
                    {answer.tone}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1"
                  onClick={() => {
                    handlePlayAnswer(answer.id);
                  }}
                >
                  <Play size={12} />
                  {t`Preview`}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <p className="max-h-16 overflow-hidden text-sm leading-relaxed">{answer.text}</p>

              <div className="flex items-center gap-2">
                <Badge outline className="gap-1 text-xs">
                  <Tag size={10} />
                  {answer.skillTheme}
                </Badge>
                {answer.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} outline className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {answer.tags.length > 3 && (
                  <Badge outline className="text-xs">
                    +{answer.tags.length - 3}
                  </Badge>
                )}
              </div>

              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <Calendar size={12} />
                {dayjs(answer.createdAt).fromNow()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};
