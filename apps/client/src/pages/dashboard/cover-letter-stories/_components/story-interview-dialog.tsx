import { MicrophoneIcon, PaperPlaneIcon, StopIcon } from "@phosphor-icons/react";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  ScrollArea,
  Checkbox,
} from "@reactive-resume/ui";
import { useState, useRef, useEffect } from "react";

import { useToast } from "@/client/hooks/use-toast";
import {
  useCreateCoverLetterContent,
  type CoverLetterContent,
  type CoverLetterContentType,
} from "@/client/services/cover-letter-content";

interface ExtractedStory {
  contentType: CoverLetterContentType;
  storyText: string;
  skillTheme: string;
  tone: string;
  tags: string[];
  selected: boolean;
}

interface InterviewResponse {
  question: string;
  answer: string;
  timestamp: Date;
}

interface StoryInterviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StoryInterviewDialog = ({ 
  open, 
  onOpenChange 
}: StoryInterviewDialogProps) => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<InterviewResponse[]>([]);
  const [extractedStories, setExtractedStories] = useState<ExtractedStory[]>([]);
  const [currentResponse, setCurrentResponse] = useState("");
  const [interviewPhase, setInterviewPhase] = useState<"intro" | "questions" | "review" | "complete">("intro");
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const createStoryMutation = useCreateCoverLetterContent();

  const interviewQuestions = [
    "Tell me about a time when you had to analyze complex data or information to solve a problem. What was the situation and what did you discover?",
    "Describe a situation where you had to lead a team or take initiative. What was the challenge and how did you handle it?",
    "Can you share an example of a technical project or solution you worked on? What technologies did you use and what was the outcome?",
    "Tell me about a significant challenge you faced at work. How did you overcome it and what did you learn?",
    "Describe a time when you had to collaborate with others to achieve a goal. What was your role and how did you contribute?",
    "Share an example of when you came up with an innovative solution or improved an existing process. What was the impact?",
    "Tell me about an achievement you're particularly proud of. What was the result and how did it benefit your organization?",
    "Describe a time when you had to learn something new quickly or adapt to change. How did you approach it?",
  ];

  useEffect(() => {
    if (!open) {
      // Reset state when dialog closes
      setInterviewPhase("intro");
      setCurrentQuestion(0);
      setResponses([]);
      setExtractedStories([]);
      setCurrentResponse("");
      setIsRecording(false);
      setIsProcessing(false);
    }
  }, [open]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        transcribeAudio(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      toast({
        title: "Microphone Error",
        description: "Could not access microphone. Please check permissions and try again.",
        variant: "error",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      setIsProcessing(true);
      
      // Create FormData for the Whisper API
      const formData = new FormData();
      formData.append('file', audioBlob, 'interview_response.wav');
      
      // Call our backend transcription service
      const response = await fetch('/api/transcription/whisper', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Transcription failed: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.transcription) {
        setCurrentResponse(result.transcription);
        toast({
          title: "Audio Transcribed",
          description: "Your response has been converted to text. You can edit it before submitting.",
        });
      } else {
        throw new Error(result.error || "No transcription received");
      }
      
    } catch (error) {
      console.error("Transcription error:", error);
      
      // Show error and allow manual input
      toast({
        title: "Transcription Failed",
        description: error instanceof Error 
          ? `${error.message}. Please type your response instead.`
          : "Could not transcribe audio. Please type your response instead.",
        variant: "error",
      });
      
      // Set placeholder text to encourage manual input
      setCurrentResponse("");
      
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResponseSubmit = () => {
    if (!currentResponse.trim()) return;

    const newResponse: InterviewResponse = {
      question: interviewQuestions[currentQuestion],
      answer: currentResponse,
      timestamp: new Date(),
    };

    setResponses(prev => [...prev, newResponse]);
    setCurrentResponse("");

    if (currentQuestion < interviewQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // All questions answered, extract stories
      extractStoriesFromResponses([...responses, newResponse]);
    }
  };

  const extractStoriesFromResponses = async (allResponses: InterviewResponse[]) => {
    setIsProcessing(true);
    
    try {
      // Call LLM service to extract stories
      const response = await fetch('/api/cover-letter-content/extract-from-interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          responses: allResponses.map(r => ({
            question: r.question,
            answer: r.answer,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to extract stories');
      }

      const extractedData = await response.json();
      
      // Convert to ExtractedStory format
      const stories: ExtractedStory[] = extractedData.stories.map((story: any) => ({
        ...story,
        tags: Array.isArray(story.tags) ? story.tags : JSON.parse(story.tags || '[]'),
        selected: true, // Default to selected
      }));

      setExtractedStories(stories);
      setInterviewPhase("review");
    } catch (error) {
      toast({
        title: "Extraction Failed",
        description: "Failed to extract stories from interview. Please try again.",
        variant: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStoryToggle = (index: number) => {
    setExtractedStories(prev => 
      prev.map((story, i) => 
        i === index ? { ...story, selected: !story.selected } : story
      )
    );
  };

  const handleSaveSelectedStories = async () => {
    const selectedStories = extractedStories.filter(story => story.selected);
    
    if (selectedStories.length === 0) {
      toast({
        title: "No Stories Selected",
        description: "Please select at least one story to save.",
        variant: "warning",
      });
      return;
    }

    setIsProcessing(true);

    try {
      for (const story of selectedStories) {
        await createStoryMutation.mutateAsync({
          contentType: story.contentType,
          contentId: `interview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          storyText: story.storyText,
          skillTheme: story.skillTheme,
          tone: story.tone,
          tags: JSON.stringify(story.tags),
        });
      }

      toast({
        title: "Stories Saved",
        description: `Successfully saved ${selectedStories.length} ${selectedStories.length === 1 ? 'story' : 'stories'} to your cover letter library.`,
      });

      setInterviewPhase("complete");
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save stories. Please try again.",
        variant: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const startNewInterview = () => {
    setInterviewPhase("questions");
    setCurrentQuestion(0);
    setResponses([]);
    setCurrentResponse("");
  };

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            AI Interview for Cover Letter Stories
          </DialogTitle>
          <DialogDescription>
            I'll ask you questions about your experiences to help extract compelling stories for your cover letters.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          {interviewPhase === "intro" && (
            <div className="space-y-6 p-4">
              <div className="text-center">
                <MicrophoneIcon className="mx-auto mb-4 size-16 text-primary" />
                <h3 className="mb-2 text-lg font-semibold">Ready to Begin Interview</h3>
                <p className="text-muted-foreground mb-6">
                  I'll ask you 8 questions about your professional experiences. You can respond by voice or typing.
                  The AI will then extract and categorize compelling stories for your cover letters.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <h4 className="font-medium">🎤 Voice Responses</h4>
                  <p className="text-muted-foreground text-sm mt-1">
                    Click the microphone to record your answers naturally
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <h4 className="font-medium">⌨️ Text Responses</h4>
                  <p className="text-muted-foreground text-sm mt-1">
                    Type your responses if you prefer written answers
                  </p>
                </div>
              </div>

              <div className="text-center">
                <Button onClick={startNewInterview} size="lg">
                  Start Interview
                </Button>
              </div>
            </div>
          )}

          {interviewPhase === "questions" && (
            <div className="space-y-6 p-4">
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Question {currentQuestion + 1} of {interviewQuestions.length}</span>
                  <span>{Math.round(((currentQuestion + 1) / interviewQuestions.length) * 100)}% Complete</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${((currentQuestion + 1) / interviewQuestions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Current Question */}
              <div className="rounded-lg bg-muted p-4">
                <h3 className="font-medium mb-2">Question {currentQuestion + 1}:</h3>
                <p className="text-muted-foreground">{interviewQuestions[currentQuestion]}</p>
              </div>

              {/* Response Input */}
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    variant={isRecording ? "error" : "secondary"}
                    size="sm"
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isProcessing}
                  >
                    {isRecording ? (
                      <>
                        <StopIcon className="mr-2 size-4" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <MicrophoneIcon className="mr-2 size-4" />
                        Record Answer
                      </>
                    )}
                  </Button>
                  {isProcessing && <span className="text-sm text-muted-foreground self-center">Processing...</span>}
                </div>

                <div className="space-y-2">
                  <textarea
                    placeholder="Type your response here or use voice recording above..."
                    value={currentResponse}
                    onChange={(e) => setCurrentResponse(e.target.value)}
                    className="w-full min-h-32 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    disabled={isProcessing}
                  />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-xs">
                      {currentResponse.length} characters
                    </span>
                    <Button
                      onClick={handleResponseSubmit}
                      disabled={!currentResponse.trim() || isProcessing}
                      size="sm"
                    >
                      <PaperPlaneIcon className="mr-2 size-4" />
                      {currentQuestion < interviewQuestions.length - 1 ? "Next Question" : "Extract Stories"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Previous Responses */}
              {responses.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Previous Responses:</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {responses.map((response, index) => (
                      <div key={index} className="text-sm border-l-2 border-primary pl-3">
                        <div className="font-medium">Q{index + 1}: {response.question.slice(0, 50)}...</div>
                        <div className="text-muted-foreground">{response.answer.slice(0, 100)}...</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {interviewPhase === "review" && (
            <div className="space-y-6 p-4">
              <div className="text-center">
                <h3 className="mb-2 text-lg font-semibold">Review Extracted Stories</h3>
                <p className="text-muted-foreground">
                  I've analyzed your responses and extracted {extractedStories.length} compelling stories. 
                  Review and select which ones to add to your cover letter library.
                </p>
              </div>

              <div className="space-y-4">
                {extractedStories.map((story, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={story.selected}
                        onCheckedChange={() => handleStoryToggle(index)}
                      />
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getContentTypeIcon(story.contentType)}</span>
                          <h4 className="font-medium capitalize">
                            {formatContentType(story.contentType)}
                          </h4>
                          <Badge variant="secondary" className="text-xs">
                            {story.skillTheme}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {story.storyText}
                        </p>

                        {story.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {story.tags.map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between">
                <Button variant="secondary" onClick={() => setInterviewPhase("questions")}>
                  Back to Interview
                </Button>
                <Button 
                  onClick={handleSaveSelectedStories}
                  disabled={isProcessing || extractedStories.filter(s => s.selected).length === 0}
                >
                  {isProcessing ? "Saving..." : `Save ${extractedStories.filter(s => s.selected).length} Selected Stories`}
                </Button>
              </div>
            </div>
          )}

          {interviewPhase === "complete" && (
            <div className="space-y-6 p-4 text-center">
              <div className="mx-auto mb-4 size-16 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="mb-2 text-lg font-semibold">Stories Successfully Saved!</h3>
              <p className="text-muted-foreground">
                Your cover letter stories have been added to your library and are ready to use in tailored cover letter generation.
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => onOpenChange(false)}>
                  Close
                </Button>
                <Button variant="secondary" onClick={() => setInterviewPhase("intro")}>
                  Start New Interview
                </Button>
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};