import { useState } from "react";
import { CheckCircle, FileText, Sparkle, Upload, X } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { t } from "@lingui/macro";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@reactive-resume/ui";

type ExtractedContent = {
  id: string;
  type: string;
  title: string;
  description: string;
  content: Record<string, unknown>;
  skills: string[];
  achievements: string[];
  tags: string[];
  confidence: number;
};

type CVUploadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const CVUploadDialog = ({ open, onOpenChange }: CVUploadDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractedContent, setExtractedContent] = useState<ExtractedContent[]>([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<"upload" | "extract" | "review" | "complete">("upload");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUploadAndExtract = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Stage 1: Upload file
      setStage("upload");
      const formData = new FormData();
      formData.append('cv', file);

      setProgress(25);

      // Stage 2: Extract content using LLM
      setStage("extract");
      setExtracting(true);
      setProgress(50);

      // For now, simulate LLM extraction with mock data
      // In production, this would call the actual LLM service
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockExtractedContent: ExtractedContent[] = [
        {
          id: '1',
          type: 'WORK_EXPERIENCE',
          title: t`Senior Software Engineer at TechCorp`,
          description: t`Led development of scalable web applications`,
          content: {
            responsibilities: [
              t`Developed React applications`,
              t`Led team of 5 developers`,
              t`Implemented CI/CD pipelines`
            ],
            technologies: ['React', 'Node.js', 'TypeScript', 'AWS']
          },
          skills: ['React', 'Node.js', 'TypeScript', 'Leadership'],
          achievements: [t`40% performance improvement`, t`Led successful product launch`],
          tags: ['frontend', 'leadership', 'senior-level', 'react'],
          confidence: 0.95
        },
        {
          id: '2',
          type: 'PROJECT',
          title: t`E-commerce Platform`,
          description: t`Built full-stack e-commerce solution`,
          content: {
            features: [t`User authentication`, t`Payment processing`, t`Inventory management`],
            technologies: ['React', 'Node.js', 'MongoDB', 'Stripe']
          },
          skills: ['React', 'Node.js', 'MongoDB', 'Payment Integration'],
          achievements: [t`Handles 10K+ users`, t`99.9% uptime`],
          tags: ['fullstack', 'ecommerce', 'mongodb', 'stripe'],
          confidence: 0.88
        },
        {
          id: '3',
          type: 'TECHNICAL_SKILL',
          title: t`JavaScript/TypeScript`,
          description: t`Advanced proficiency in JavaScript and TypeScript`,
          content: {
            proficiencyLevel: 'Expert',
            yearsOfExperience: 8,
            projects: ['E-commerce Platform', 'Analytics Dashboard']
          },
          skills: ['JavaScript', 'TypeScript'],
          achievements: [t`8+ years experience`, t`Expert level`],
          tags: ['javascript', 'typescript', 'programming', 'expert'],
          confidence: 0.92
        }
      ];

      setExtractedContent(mockExtractedContent);
      setProgress(100);
      setStage("review");

    } catch (err) {
      setError(err instanceof Error ? err.message : t`Failed to process CV`);
    } finally {
      setUploading(false);
      setExtracting(false);
    }
  };

  const handleSaveContent = async () => {
    try {
      // Save all extracted content to the database
      for (const content of extractedContent) {
        const response = await fetch('/api/content-library', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: content.title,
            description: content.description,
            content: content.content,
            type: content.type,
            skills: content.skills,
            achievements: content.achievements,
          }),
        });

        if (!response.ok) {
          throw new Error(t`Failed to save ${content.title}`);
        }
      }

      // Create tags
      const allTags = [...new Set(extractedContent.flatMap(c => c.tags))];
      for (const tagName of allTags) {
        try {
          await fetch('/api/tags', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: tagName,
              color: '#3B82F6',
            }),
          });
        } catch {
          // Tag might already exist
        }
      }

      setStage("complete");
    } catch (err) {
      setError(err instanceof Error ? err.message : t`Failed to save content`);
    }
  };

  const resetDialog = () => {
    setFile(null);
    setUploading(false);
    setExtracting(false);
    setExtractedContent([]);
    setProgress(0);
    setError(null);
    setStage("upload");
  };

  const handleClose = () => {
    resetDialog();
    onOpenChange(false);
  };

  const getStageDescription = () => {
    switch (stage) {
      case "upload": return t`Upload your CV file`;
      case "extract": return t`AI is analyzing your CV and extracting content...`;
      case "review": return t`Review and edit the extracted content`;
      case "complete": return t`Content successfully added to your library!`;
      default: return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkle className="h-5 w-5 text-primary" />
            {t`AI-Powered CV Content Extraction`}
          </DialogTitle>
          <DialogDescription>
            {getStageDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          {stage !== "upload" && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t`Progress`}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <X className="h-4 w-4 text-red-600" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Stage Content */}
          <AnimatePresence mode="wait">
            {stage === "upload" && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  <input 
                    type="file" 
                    accept=".pdf,.docx,.doc,.txt"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="cv-upload"
                  />
                  <label htmlFor="cv-upload" className="cursor-pointer">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <div className="space-y-2">
                      <p className="text-lg font-medium">
                        {t`Click to upload your CV`}
                      </p>
                      <p className="text-sm text-gray-500">
                        {t`Supports PDF, DOCX, DOC, and TXT files`}
                      </p>
                    </div>
                  </label>
                </div>

                {file && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-primary" />
                        <div className="flex-1">
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setFile(null)}
                        >
                          {t`Remove`}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={handleClose}>
                    {t`Cancel`}
                  </Button>
                  <Button
                    onClick={handleUploadAndExtract}
                    disabled={!file || uploading}
                    className="flex items-center gap-2"
                  >
                    <Sparkle className="h-4 w-4" />
                    {uploading ? t`Processing...` : t`Extract Content`}
                  </Button>
                </div>
              </motion.div>
            )}

            {(stage === "extract" || stage === "review") && extractedContent.length > 0 && (
              <motion.div
                key="review"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="text-center py-4">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold">
                    {t`Extracted ${extractedContent.length} pieces of content`}
                  </h3>
                  <p className="text-gray-600">
                    {t`Review the content below and save to your library`}
                  </p>
                </div>

                <div className="grid gap-4 max-h-96 overflow-y-auto">
                  {extractedContent.map((content) => (
                    <Card key={content.id} className="border-l-4 border-l-primary">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">{content.title}</CardTitle>
                            <p className="text-sm text-gray-600 mt-1">
                              {content.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{content.type.replace('_', ' ')}</Badge>
                            <Badge variant={content.confidence > 0.9 ? "primary" : "secondary"}>
                              {Math.round(content.confidence * 100)}% {t`confidence`}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* Skills */}
                        <div>
                          <p className="text-sm font-medium mb-2">{t`Skills:`}</p>
                          <div className="flex flex-wrap gap-1">
                            {content.skills.map((skill, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Tags */}
                        <div>
                          <p className="text-sm font-medium mb-2">{t`AI-Generated Tags:`}</p>
                          <div className="flex flex-wrap gap-1">
                            {content.tags.map((tag, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={resetDialog}>
                    {t`Start Over`}
                  </Button>
                  <Button onClick={handleSaveContent} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    {t`Save to Library`}
                  </Button>
                </div>
              </motion.div>
            )}

            {stage === "complete" && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-8"
              >
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {t`Content Successfully Added!`}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t`Your CV content has been extracted and saved to your library. You can now use this content to generate tailored resumes for job applications.`}
                </p>
                <Button onClick={handleClose}>
                  {t`View Content Library`}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 