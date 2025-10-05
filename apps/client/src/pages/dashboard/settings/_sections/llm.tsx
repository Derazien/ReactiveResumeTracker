import { zodResolver } from "@hookform/resolvers/zod";
import { t, Trans } from "@lingui/macro";
import { FloppyDisk, TrashSimple, Robot, Lightning } from "@phosphor-icons/react";
import {
  Alert,
  Button,
  Checkbox,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@reactive-resume/ui";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useToast } from "@/client/hooks/use-toast";
import { useDeleteLLMSettings, useLLMSettings, useUpdateLLMSettings } from "@/client/services/user";
import { useState } from "react";

const formSchema = z.object({
  provider: z.enum(["OPENAI", "ANTHROPIC", "OLLAMA"]).default("OPENAI"),
  useSystemDefaultAsBackup: z.boolean().default(false),
  openaiApiKey: z.string().optional(),
  openaiModel: z.string().default("gpt-4-turbo-preview"),
  openaiBaseUrl: z.string().optional(),
  anthropicApiKey: z.string().optional(),
  anthropicModel: z.string().default("claude-3-5-sonnet-20241022"),
  ollamaApiKey: z.string().default("sk-1234567890abcdef"),
  ollamaBaseUrl: z.string().default("http://localhost:11434/v1"),
  ollamaModel: z.string().default("llama3:8b"),
  // Skyvern Automation Settings
  skyvernApiKey: z.string().optional(),
  skyvernBaseUrl: z.string().default("http://localhost:8000"),
  skyvernEnabled: z.boolean().default(false),
  maxTokens: z.number().min(100).max(8000).default(4000),
  temperature: z.number().min(0).max(2).default(0.1),
});

type FormValues = z.infer<typeof formSchema>;

export const LLMSettings = () => {
  const { toast } = useToast();
  const { data: settings, isLoading } = useLLMSettings();
  const { mutateAsync: updateSettings, isPending: isUpdating } = useUpdateLLMSettings();
  const { mutateAsync: deleteSettings, isPending: isDeleting } = useDeleteLLMSettings();
  const [isGeneratingApiKey, setIsGeneratingApiKey] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      provider: "OPENAI",
      useSystemDefaultAsBackup: false,
      openaiApiKey: "",
      openaiModel: "gpt-4-turbo-preview",
      openaiBaseUrl: "",
      anthropicApiKey: "",
      anthropicModel: "claude-3-5-sonnet-20241022",
      ollamaApiKey: "sk-1234567890abcdef",
      ollamaBaseUrl: "http://localhost:11434/v1",
      ollamaModel: "llama3:8b",
      // Skyvern defaults
      skyvernApiKey: "",
      skyvernBaseUrl: "http://localhost:8000",
      skyvernEnabled: false,
      maxTokens: 4000,
      temperature: 0.1,
    },
  });

  const selectedProvider = form.watch("provider");

  // Load settings from backend
  useEffect(() => {
    if (settings) {
      form.reset({
        provider: settings.provider,
        useSystemDefaultAsBackup: settings.useSystemDefaultAsBackup ?? false,
        openaiApiKey: settings.openaiApiKey ?? "",
        openaiModel: settings.openaiModel,
        openaiBaseUrl: settings.openaiBaseUrl ?? "",
        anthropicApiKey: settings.anthropicApiKey ?? "",
        anthropicModel: settings.anthropicModel,
        ollamaApiKey: settings.ollamaApiKey ?? "sk-1234567890abcdef",
        ollamaBaseUrl: settings.ollamaBaseUrl ?? "http://localhost:11434/v1",
        ollamaModel: settings.ollamaModel,
        // Skyvern settings
        skyvernApiKey: settings.skyvernApiKey ?? "",
        skyvernBaseUrl: settings.skyvernBaseUrl ?? "http://localhost:8000",
        skyvernEnabled: settings.skyvernEnabled ?? false,
        maxTokens: settings.maxTokens,
        temperature: settings.temperature,
      });
    }
  }, [settings, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      const updateData = {
        provider: data.provider,
        useSystemDefaultAsBackup: data.useSystemDefaultAsBackup,
        openaiApiKey: data.openaiApiKey ?? null,
        openaiModel: data.openaiModel,
        openaiBaseUrl: data.openaiBaseUrl ?? null,
        anthropicApiKey: data.anthropicApiKey ?? null,
        anthropicModel: data.anthropicModel,
        ollamaApiKey: data.ollamaApiKey ?? null,
        ollamaBaseUrl: data.ollamaBaseUrl ?? null,
        ollamaModel: data.ollamaModel,
        // Skyvern settings
        skyvernApiKey: data.skyvernApiKey ?? null,
        skyvernBaseUrl: data.skyvernBaseUrl ?? null,
        skyvernEnabled: data.skyvernEnabled,
        maxTokens: data.maxTokens,
        temperature: data.temperature,
      };

      await updateSettings(updateData);

      toast({
        variant: "success",
        title: t`LLM settings saved successfully`,
      });
    } catch (error) {
      toast({
        variant: "error",
        title: t`Failed to save LLM settings`,
        description: (error as Error).message,
      });
    }
  };

  const onReset = async () => {
    try {
      await deleteSettings();
      form.reset();

      toast({
        variant: "success",
        title: t`LLM settings reset successfully`,
      });
    } catch (error) {
      toast({
        variant: "error",
        title: t`Failed to reset LLM settings`,
        description: (error as Error).message,
      });
    }
  };

  const generateSkyvernApiKey = async () => {
    setIsGeneratingApiKey(true);
    try {
      const response = await fetch('/api/automation/generate-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();

      if (result.success) {
        // Refresh settings to get the new API key
        window.location.reload();
        
        toast({
          variant: "success",
          title: t`Skyvern API Key Generated`,
          description: t`Your personal Skyvern organization has been created and API key configured.`,
        });
      } else {
        toast({
          variant: "error", 
          title: t`Failed to Generate API Key`,
          description: result.message || t`Unable to create Skyvern organization`,
        });
      }
    } catch (error) {
      toast({
        variant: "error",
        title: t`Generation Failed`,
        description: t`Unable to connect to automation service`,
      });
    } finally {
      setIsGeneratingApiKey(false);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse">Loading LLM settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold leading-relaxed tracking-tight">
          {t`AI/LLM Integration`}
        </h3>
        <p className="leading-relaxed opacity-75">
          {t`Configure your preferred AI provider to enable intelligent job analysis, content matching, and resume generation.`}
        </p>
      </div>

      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          {/* Provider Selection */}
          <FormField
            name="provider"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t`AI Provider`}</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t`Select AI provider`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="OPENAI">OpenAI</SelectItem>
                    <SelectItem value="ANTHROPIC">Anthropic (Claude)</SelectItem>
                    <SelectItem value="OLLAMA">Ollama (Local)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Provider-specific settings */}
          {selectedProvider === "OPENAI" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                name="openaiApiKey"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t`OpenAI API Key`}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder={t`sk-...`} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="openaiModel"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t`Model`}</FormLabel>
                    <FormControl>
                      <Input placeholder={t`gpt-4-turbo-preview`} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {selectedProvider === "ANTHROPIC" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                name="anthropicApiKey"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t`Anthropic API Key`}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder={t`sk-ant-...`} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="anthropicModel"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t`Model`}</FormLabel>
                    <FormControl>
                      <Input placeholder={t`claude-3-5-sonnet-20241022`} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {selectedProvider === "OLLAMA" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                name="ollamaBaseUrl"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t`Ollama Base URL`}</FormLabel>
                    <FormControl>
                      <Input placeholder={t`http://localhost:11434/v1`} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="ollamaModel"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t`Model`}</FormLabel>
                    <FormControl>
                      <Input placeholder={t`llama3:8b`} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Skyvern Automation Settings */}
          <div className="space-y-4 rounded-md border p-4">
            <div className="space-y-2">
              <h4 className="text-lg font-medium">{t`Job Automation (Skyvern)`}</h4>
              <p className="text-muted-foreground text-sm">
                {t`Configure Skyvern to automate job searching on LinkedIn and other platforms.`}
              </p>
            </div>
            
            <FormField
              name="skyvernEnabled"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>{t`Enable Job Automation`}</FormLabel>
                    <p className="text-muted-foreground text-sm">
                      {t`Allow automated job searching and application creation using Skyvern.`}
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                name="skyvernApiKey"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t`Skyvern API Key`}</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder={t`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`} 
                        {...field} 
                      />
                    </FormControl>
                    <div className="flex items-center gap-2 text-xs">
                      <p className="text-muted-foreground">
                        {t`Get your API key from Skyvern UI at http://localhost:8081`}
                      </p>
                      <Button 
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={isGeneratingApiKey}
                        onClick={generateSkyvernApiKey}
                        className="gap-1"
                      >
                        {isGeneratingApiKey ? (
                          <>
                            <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                            {t`Generating...`}
                          </>
                        ) : (
                          <>
                            <Lightning className="h-3 w-3" />
                            {t`Auto-Generate`}
                          </>
                        )}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="skyvernBaseUrl"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t`Skyvern Server URL`}</FormLabel>
                    <FormControl>
                      <Input placeholder={t`http://localhost:8000`} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* System Backup Option */}
          <FormField
            name="useSystemDefaultAsBackup"
            control={form.control}
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>{t`Use System Default as Backup`}</FormLabel>
                  <p className="text-muted-foreground text-sm">
                    {t`Automatically fall back to the system's configured AI provider if your personal API keys fail or are unavailable. System provider is determined by server configuration.`}
                  </p>
                </div>
              </FormItem>
            )}
          />

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button type="submit" disabled={isUpdating}>
              <FloppyDisk className="mr-2" />
              {isUpdating ? t`Saving...` : t`Save`}
            </Button>

            <Button type="button" variant="ghost" disabled={isDeleting} onClick={onReset}>
              <TrashSimple className="mr-2" />
              {isDeleting ? t`Resetting...` : t`Reset`}
            </Button>
          </div>
        </form>
      </Form>

      <Alert>
        <div className="prose prose-neutral max-w-full text-xs leading-relaxed text-primary dark:prose-invert">
          <Trans>
            <span className="font-medium">Security: </span>
            Your API keys are encrypted and stored securely. They are only used for your AI requests
            and are never shared with third parties.
          </Trans>
        </div>
      </Alert>
    </div>
  );
};
