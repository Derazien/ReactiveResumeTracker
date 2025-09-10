import { t } from "@lingui/macro";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@reactive-resume/ui";
import { FileText, Palette, Type } from "lucide-react";

import { useCoverLetterBuilderStore } from "@/client/stores/cover-letter-builder";

export const SettingsSection = () => {
  const template = useCoverLetterBuilderStore((state) => state.template);
  const setSelectedTemplate = useCoverLetterBuilderStore(
    (state) => state.template.setSelectedTemplate,
  );
  const setTone = useCoverLetterBuilderStore((state) => state.template.setTone);
  const setCustomInstructions = useCoverLetterBuilderStore(
    (state) => state.template.setCustomInstructions,
  );

  const templates = [
    { value: "professional", label: t`Professional` },
    { value: "modern", label: t`Modern` },
    { value: "creative", label: t`Creative` },
    { value: "minimal", label: t`Minimal` },
  ];

  const tones = [
    { value: "professional", label: t`Professional` },
    { value: "enthusiastic", label: t`Enthusiastic` },
    { value: "confident", label: t`Confident` },
    { value: "friendly", label: t`Friendly` },
    { value: "formal", label: t`Formal` },
  ];

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t`Cover Letter Settings`}</h3>
      </div>

      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Palette className="size-4" />
            {t`Template Style`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="template">{t`Select Template`}</Label>
            <Select value={template.selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder={t`Choose a template`} />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.value} value={template.value}>
                    {template.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tone Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Type className="size-4" />
            {t`Writing Tone`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="tone">{t`Select Tone`}</Label>
            <Select value={template.tone} onValueChange={setTone}>
              <SelectTrigger>
                <SelectValue placeholder={t`Choose a tone`} />
              </SelectTrigger>
              <SelectContent>
                {tones.map((tone) => (
                  <SelectItem key={tone.value} value={tone.value}>
                    {tone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-xs">
              {t`The tone will influence how your cover letter is written and perceived.`}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Custom Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <FileText className="size-4" />
            {t`Custom Instructions`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="instructions">{t`Additional Instructions`}</Label>
            <textarea
              placeholder={t`Add any specific instructions for the AI to follow when generating your cover letter...`}
              value={template.customInstructions}
              className="border-input resize-vertical min-h-[100px] w-full rounded-md border p-2"
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                setCustomInstructions(e.target.value);
              }}
            />
            <p className="text-muted-foreground text-xs">
              {t`Optional: Provide specific guidance for tone, focus areas, or unique requirements.`}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Template Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{t`Template Preview`}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-md border p-3">
            <div className="text-muted-foreground mb-2 text-xs">
              {t`Template`}: {templates.find((t) => t.value === template.selectedTemplate)?.label}
            </div>
            <div className="text-muted-foreground mb-2 text-xs">
              {t`Tone`}: {tones.find((t) => t.value === template.tone)?.label}
            </div>
            <div className="text-muted-foreground text-xs">
              {t`Custom Instructions`}: {template.customInstructions ? t`Yes` : t`None`}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{t`Tips for Better Results`}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-muted-foreground space-y-1 text-xs">
            <li>• {t`Choose a template that matches the company culture`}</li>
            <li>• {t`Select a tone that aligns with the job requirements`}</li>
            <li>• {t`Use custom instructions to highlight specific achievements`}</li>
            <li>• {t`Mention specific company values or projects if known`}</li>
            <li>• {t`Keep custom instructions concise and focused`}</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
