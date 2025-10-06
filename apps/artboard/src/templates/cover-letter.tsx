import { t } from "@lingui/macro";
import { memo } from "react";
import { hexToRgb, isUrl } from "@reactive-resume/utils";

import { useArtboardStore } from "../store/artboard";

export const CoverLetterTemplate = memo(() => {
  const coverLetter = useArtboardStore((state) => state.coverLetter);
  const meta = useArtboardStore((state) => state.coverLetterMetadata);
  
  // Page format (default A4 if not specified)
  const pageFormat = meta.page?.format ?? "a4";
  const pageMargin = meta.page?.margin ?? 18;

  if (!coverLetter) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Cover Letter</h2>
          <p className="text-gray-500">Loading cover letter...</p>
          <div className="mt-4 mx-auto size-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
        </div>
      </div>
    );
  }

  // Page size styles (using CSS custom properties like resume)
  const pageStyles = {
    width: pageFormat === "a4" ? "210mm" : "8.5in",
    minHeight: pageFormat === "a4" ? "297mm" : "11in", 
    backgroundColor: meta.theme.background,
    fontFamily: meta.typography.font.family,
    // Use CSS custom properties for margin like resume
    padding: "var(--margin, 18px)",
  };

  return (
    <div
      className="mx-auto shadow-lg"
      style={pageStyles}
    >
      <div className="w-full">
        {/* Enhanced Header - NovoResume Style */}
        <div
          className="relative rounded-lg mb-8"
          style={{ backgroundColor: hexToRgb(meta.theme.primary, 0.08) }}
        >
          {/* Background Pattern */}
          <div className="pointer-events-none absolute inset-0 opacity-5" style={{ backgroundColor: meta.theme.background }}>
            <div className="size-full bg-[radial-gradient(circle_at_1px_1px,_rgb(0_0_0)_1px,_transparent_0)] bg-[length:20px_20px]" />
          </div>

          <div className="relative p-6">
            {/* Header layout - no photo for cover letters */}
            {(() => {
              const basics = coverLetter.basics;

              return (
                <div className="grid gap-6" style={{ gridTemplateColumns: "1fr auto" }}>
                  {/* LEFT block - Name and headline */}
                  <div className="space-y-2">
                    <div className="relative">
                      {/* Accent block aligned to name and headline */}
                      <div
                        className="pointer-events-none absolute left-0"
                        style={{
                          backgroundColor: meta.theme.primary,
                          width: "1rem",
                          top: 0,
                          bottom: 0,
                          transform: "translateX(-2rem)",
                        }}
                      />
                      <h1 
                        className="text-4xl font-bold mb-2" 
                        style={{ color: meta.theme.primary }}
                      >
                        {basics?.name ?? coverLetter.senderName ?? t`Your Name`}
                      </h1>
                      {basics?.headline && (
                        <h2 
                          className="text-xl font-medium" 
                          style={{ color: meta.theme.secondary }}
                        >
                          {basics.headline}
                        </h2>
                      )}
                    </div>
                  </div>

                  {/* RIGHT block - Contact information from basics */}
                  <div
                    className="space-y-2 self-center justify-self-end text-right text-sm"
                    style={{ color: meta.theme.text }}
                  >
                    {basics?.location && (
                      <div className="flex items-center justify-end gap-2">
                        <span>{basics.location}</span>
                        <i className="ph ph-map-pin" style={{ color: meta.theme.primary }} />
                      </div>
                    )}

                    {basics?.phone && (
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`tel:${basics.phone}`}
                          style={{ color: meta.theme.text, textDecoration: "none" }}
                        >
                          {basics.phone}
                        </a>
                        <i className="ph ph-phone" style={{ color: meta.theme.primary }} />
                      </div>
                    )}

                    {basics?.email && (
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`mailto:${basics.email}`}
                          style={{ color: meta.theme.text, textDecoration: "none" }}
                        >
                          {basics.email}
                        </a>
                        <i className="ph ph-at" style={{ color: meta.theme.primary }} />
                      </div>
                    )}

                    {basics?.url?.href && (
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={basics.url.href}
                          style={{ color: meta.theme.text, textDecoration: "none" }}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {basics.url.label ?? basics.url.href}
                        </a>
                        <i className="ph ph-globe" style={{ color: meta.theme.primary }} />
                      </div>
                    )}

                    {/* Custom fields from basics */}
                    {basics?.customFields?.map((field) => {
                      // Helper function to avoid nested ternaries
                      const renderFieldValue = () => {
                        if (isUrl(field.value)) {
                          return (
                            <a
                              href={field.value}
                              style={{ color: meta.theme.text, textDecoration: "none" }}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {field.name ?? field.value}
                            </a>
                          );
                        }
                        
                        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
                          return (
                            <a
                              href={`mailto:${field.value}`}
                              style={{ color: meta.theme.text, textDecoration: "none" }}
                            >
                              {field.value}
                            </a>
                          );
                        }
                        
                        if (/^\+?[\d\s-]+$/.test(field.value)) {
                          return (
                            <a
                              href={`tel:${field.value.replace(/\s+/g, "")}`}
                              style={{ color: meta.theme.text, textDecoration: "none" }}
                            >
                              {field.value}
                            </a>
                          );
                        }
                        
                        return <span>{field.value}</span>;
                      };

                      return (
                        <div key={field.id} className="flex items-center justify-end gap-2">
                          {renderFieldValue()}
                          <i className={`ph ph-${field.icon ?? "info"}`} style={{ color: meta.theme.primary }} />
                        </div>
                      );
                    })}
                  </div>
            </div>
              );
            })()}
          </div>

          {/* Bottom accent line */}
          <div
            style={{
              width: "100%",
              height: "2px",
              background: meta.theme.primary,
              position: "absolute",
              left: 0,
              bottom: 0,
            }}
          />
        </div>

        {/* Date */}
        <div className="mb-6 text-right">
          <p className="text-sm" style={{ color: meta.theme.text }}>
            {new Date().toLocaleDateString("en-US", { 
              year: "numeric", 
              month: "long", 
              day: "numeric" 
            })}
          </p>
        </div>

        {/* Recipient with "To" label */}
        <div className="mb-6">
          <p className="text-xs font-medium mb-1" style={{ color: meta.theme.text }}>
            To
          </p>
          <div className="space-y-1 text-sm" style={{ color: meta.theme.text }}>
            <p>{coverLetter.companyName ?? t`Company Name`}</p>
          </div>
        </div>

        {/* Subject Line */}
        {coverLetter.applicationSubject && (
          <div className="mb-6">
            <p 
              className="font-semibold text-left"
              style={{ 
                color: meta.theme.text,
                fontSize: `${meta.typography.font.size + 2}px`,
                lineHeight: meta.typography.lineHeight 
              }}
            >
              {coverLetter.applicationSubject}
            </p>
          </div>
        )}

        {/* Greeting */}
        <div className="mb-4">
          <p style={{ color: meta.theme.text, fontSize: `${meta.typography.font.size}px`, lineHeight: meta.typography.lineHeight }}>
            Dear {coverLetter.recipientName ?? t`Hiring Team`},
          </p>
        </div>

        {/* Content */}
        <div className="mb-6">
          <div
            className="whitespace-pre-wrap leading-relaxed"
            style={{ color: meta.theme.text, fontSize: `${meta.typography.font.size}px`, lineHeight: meta.typography.lineHeight }}
          >
            {coverLetter.content ||
              `I am writing to express my strong interest in the [Position Title] role at [Company Name]. With my background in [relevant field] and passion for [relevant interest], I am excited about the opportunity to contribute to your team.

Throughout my career, I have demonstrated [key skill/achievement] and have successfully [relevant accomplishment]. My experience in [relevant experience] has equipped me with the skills necessary to excel in this position.

I am particularly drawn to [Company Name] because of [specific reason - company values, projects, culture, etc.]. I believe my [specific skill/experience] would be valuable in helping the company achieve [specific goal or project].

I am confident that my combination of technical skills, problem-solving abilities, and collaborative approach would make me a valuable addition to your team. I am excited about the opportunity to discuss how my background, skills, and enthusiasm would benefit [Company Name].

Thank you for considering my application. I look forward to the opportunity to discuss how I can contribute to your team.`}
          </div>
        </div>

        {/* Closing */}
        <div className="mb-8" style={{ color: meta.theme.text }}>
          <p className="mb-4">Sincerely,</p>
          <p className="font-semibold">{coverLetter.senderName ?? t`Your Name`}</p>
        </div>

        {/* Footer */}
        {coverLetter.footer && (
          <div className="pt-4 text-xs" style={{ color: meta.theme.text, borderTop: `1px solid ${meta.theme.secondary}` }}>
            {coverLetter.footer}
          </div>
        )}
      </div>
    </div>
  );
});

CoverLetterTemplate.displayName = "CoverLetterTemplate";

