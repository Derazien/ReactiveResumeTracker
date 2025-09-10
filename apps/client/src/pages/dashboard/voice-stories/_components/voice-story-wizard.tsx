import { t } from "@lingui/macro";
import { ArrowLeft, ArrowRight, Microphone, MicrophoneSlash } from "@phosphor-icons/react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@reactive-resume/ui";
import { useEffect, useRef, useState } from "react";

type VoiceStoryWizardProps = {
  mode: "story" | "answer";
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const STORY_PROMPTS = [
  "Tell me about a time when you led a successful project from start to finish.",
  "Describe a challenging technical problem you solved and how you approached it.",
  "Share an example of when you had to work with a difficult team member or stakeholder.",
  "Talk about a time when you had to learn something new quickly for a project.",
  "Describe a situation where you had to make a difficult decision with limited information.",
];

const ANSWER_PROMPTS = [
  "Why do you want to work for this company?",
  "What are your greatest strengths?",
  "Tell me about a weakness you're working to improve.",
  "Where do you see yourself in 5 years?",
  "Why are you looking for a new opportunity?",
];

export const VoiceStoryWizard = ({ mode, open, onOpenChange }: VoiceStoryWizardProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [skillTheme, setSkillTheme] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tone, setTone] = useState("professional");
  const [questionTag, setQuestionTag] = useState("");
  const [tagInput, setTagInput] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const prompts = mode === "story" ? STORY_PROMPTS : ANSWER_PROMPTS;
  const totalSteps = prompts.length;

  const currentPrompt = prompts[currentStep];

  useEffect(() => {
    // Reset state when dialog opens
    if (open) {
      setCurrentStep(0);
      setTranscription("");
      setSkillTheme("");
      setTags([]);
      setQuestionTag("");
      setTagInput("");
    }
  }, [open]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await transcribeAudio(audioBlob);

        // Stop all tracks to free up the microphone
        for (const track of stream.getTracks()) track.stop();
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const response = await fetch("/voice/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Transcription failed");
      }

      const result = await response.json();
      setTranscription(result.text);
    } catch (error) {
      console.error("Error transcribing audio:", error);
      alert("Failed to transcribe audio. Please try again.");
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const saveStory = async () => {
    try {
      const endpoint = mode === "story" ? "/voice/story-block" : "/voice/answer-snippet";
      const payload =
        mode === "story"
          ? { text: transcription, tags, skillTheme, tone }
          : { text: transcription, tags, skillTheme, tone, questionTag };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      onOpenChange(false);
      // Optionally trigger a refresh of the lists
    } catch (error) {
      console.error("Error saving:", error);
      alert("Failed to save. Please try again.");
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      setTranscription("");
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isComplete =
    transcription.trim() && skillTheme.trim() && (mode === "story" || questionTag.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "story" ? t`Record Experience Story` : t`Record Answer Snippet`}
          </DialogTitle>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">
              {t`Step ${currentStep + 1} of ${totalSteps}`}
            </span>
            <div className="bg-muted h-2 flex-1 rounded-full">
              <div
                className="h-2 rounded-full bg-primary transition-all"
                style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Prompt */}
          <Card className="border-l-4 border-l-primary">
            <CardContent className="pt-4">
              <p className="text-sm font-medium">{currentPrompt}</p>
            </CardContent>
          </Card>

          {/* Recording Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <Button
                size="lg"
                variant={isRecording ? "error" : "primary"}
                className="size-32 rounded-full"
                onClick={isRecording ? stopRecording : startRecording}
              >
                {isRecording ? <MicrophoneSlash size={32} /> : <Microphone size={32} />}
              </Button>
            </div>

            <p className="text-muted-foreground text-center text-sm">
              {isRecording
                ? t`Recording... Click to stop`
                : t`Click to start recording your response`}
            </p>
          </div>

          {/* Transcription */}
          {transcription && (
            <div className="space-y-2">
              <Label>{t`Transcription`}</Label>
              <textarea
                className="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={transcription}
                rows={4}
                placeholder={t`Your transcribed response will appear here...`}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  setTranscription(e.target.value);
                }}
              />
            </div>
          )}

          {/* Metadata Form */}
          {transcription && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="skillTheme">{t`Primary Skill/Theme`}</Label>
                  <Input
                    id="skillTheme"
                    value={skillTheme}
                    placeholder={t`e.g., Leadership, Problem Solving`}
                    onChange={(e) => {
                      setSkillTheme(e.target.value);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tone">{t`Tone`}</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">{t`Professional`}</SelectItem>
                      <SelectItem value="casual">{t`Casual`}</SelectItem>
                      <SelectItem value="enthusiastic">{t`Enthusiastic`}</SelectItem>
                      <SelectItem value="confident">{t`Confident`}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {mode === "answer" && (
                <div className="space-y-2">
                  <Label htmlFor="questionTag">{t`Question Type`}</Label>
                  <Select value={questionTag} onValueChange={setQuestionTag}>
                    <SelectTrigger>
                      <SelectValue placeholder={t`Select question type`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="why_company">{t`Why Company?`}</SelectItem>
                      <SelectItem value="strength">{t`Strengths`}</SelectItem>
                      <SelectItem value="weakness">{t`Weaknesses`}</SelectItem>
                      <SelectItem value="challenge">{t`Challenges`}</SelectItem>
                      <SelectItem value="achievement">{t`Achievements`}</SelectItem>
                      <SelectItem value="goals">{t`Goals`}</SelectItem>
                      <SelectItem value="general">{t`General`}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>{t`Tags`}</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    placeholder={t`Add a tag...`}
                    onChange={(e) => {
                      setTagInput(e.target.value);
                    }}
                    onKeyPress={(e) => e.key === "Enter" && addTag()}
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    {t`Add`}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => {
                        removeTag(tag);
                      }}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              disabled={currentStep === 0}
              className="gap-2"
              onClick={prevStep}
            >
              <ArrowLeft size={16} />
              {t`Previous`}
            </Button>

            <div className="flex gap-2">
              {currentStep < totalSteps - 1 ? (
                <Button className="gap-2" onClick={nextStep}>
                  {t`Next Question`}
                  <ArrowRight size={16} />
                </Button>
              ) : (
                <Button disabled={!isComplete} className="gap-2" onClick={saveStory}>
                  {t`Save ${mode === "story" ? "Story" : "Answer"}`}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
