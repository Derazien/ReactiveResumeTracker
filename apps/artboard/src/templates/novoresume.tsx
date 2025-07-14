import type {
  Award,
  Certification,
  CustomSection,
  CustomSectionGroup,
  Language,
  Project,
  Publication,
  Reference,
  SectionKey,
  SectionWithItem,
  Skill,
  URL,
} from "@reactive-resume/schema";
import { Education, Experience, Volunteer } from "@reactive-resume/schema";
import { cn, isEmptyString, isUrl, sanitize, hexToRgb } from "@reactive-resume/utils";
import get from "lodash.get";
import React from "react";

import { BrandIcon } from "../components/brand-icon";
import { Picture } from "../components/picture";
import { useArtboardStore } from "../store/artboard";
import type { TemplateProps } from "../types/template";


const Header = () => {
  const resume = useArtboardStore((s) => s.resume);
  const { basics } = resume;
  const summary = resume.sections.summary;
  const profiles = resume.sections.profiles;
  // Swap primary and secondary color assignments
  const primaryColor = useArtboardStore((state) => state.resume.metadata.theme.primary);
  const secondaryColor = useArtboardStore((state) => state.resume.metadata.theme.secondary);
  const backgroundColor = useArtboardStore((state) => state.resume.metadata.theme.background);
  const textColor = useArtboardStore((state) => state.resume.metadata.theme.text);
  
  // Helper function to create muted text color
  const getMutedTextColor = (opacity: number = 0.6) => hexToRgb(textColor, opacity);

  /* ---------- PHOTO PRESENCE (same predicate the Picture cmp uses) ------------ */
  const pic = basics.picture;
  const photoPresent = pic && isUrl(pic.url) && !pic.effects.hidden;
  const gridCols = photoPresent ? "auto 1fr auto" : "1fr auto";

  /* ---------- Helpers to handle object-vs-string URLs ------------------------- */
  const extractHref = (u: unknown) =>
    typeof u === "string" ? u : (typeof u === "object" && u !== null ? (u as any).href : undefined);

  const extractLabel = (u: unknown) =>
    typeof u === "string"
      ? u
      : typeof u === "object" && u !== null
      ? (u as any).label ?? (u as any).href
      : undefined;

  const websiteHref  = extractHref(basics.url);
  const websiteLabel = extractLabel(basics.url);

  return (
    <div className="relative rounded-lg margin-header" style={{ backgroundColor: hexToRgb(primaryColor, 0.08) }}>

      
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundColor }}>
        <div className="size-full bg-[radial-gradient(circle_at_1px_1px,_rgb(0_0_0)_1px,_transparent_0)] bg-[length:20px_20px]" />
      </div>

      <div className="relative grid gap-6" style={{ gridTemplateColumns: gridCols }}>
       

        {/* LEFT block */}
        <div className="space-y-2">
          {/* Name and headline container with accent block */}
          <div className="relative">
            {/* Accent block aligned to name and headline only */}
            <div 
              className="absolute left-0 pointer-events-none" 
              style={{ 
                backgroundColor: primaryColor,
                width: '1rem',
                top: 0,
                bottom: 0,
                transform: 'translateX(calc(-1 * var(--margin) * 2))'
              }} 
            />
            <h1 className="text-h1" style={{ color: primaryColor }}>{basics.name}</h1>
            {basics.headline && <h2 className="text-title" style={{ color: secondaryColor }}>{basics.headline}</h2>}
          </div>
          {summary.visible && summary.content?.trim() && (
            <div
              dangerouslySetInnerHTML={{ __html: summary.content }}
              className="text-body"
              style={{ color: textColor }}
            />
          )}
        </div>

        {/* MIDDLE – photo (same behaviour as Leafish) */}
        {photoPresent && (<Picture className="place-self-center rounded-full object-cover" />)}
        
        {/* RIGHT block */}
        <div className="space-y-2 text-sm justify-self-end self-center text-right" style={{ color: textColor }}>
          {basics.location && (
            <div className="flex items-center gap-2 justify-end">
              <span>{basics.location}</span>
              <i className="ph ph-map-pin" style={{ color: primaryColor }} />
            </div>
          )}

          {basics.phone && (
            <div className="flex items-center gap-2 justify-end">
              <a href={`tel:${basics.phone}`} style={{ color: textColor, textDecoration: 'underline' }}>
                {basics.phone}
              </a>
              <i className="ph ph-phone" style={{ color: primaryColor }} />
            </div>
          )}

          {basics.email && (
            <div className="flex items-center gap-2 justify-end">
              <a href={`mailto:${basics.email}`} style={{ color: textColor, textDecoration: 'underline' }}>
                {basics.email}
              </a>
              <i className="ph ph-at" style={{ color: primaryColor }} />
            </div>
          )}

          {/* personal website (string **or** {label,href}) */}
          {websiteHref && (
            <div className="flex items-center gap-2 justify-end">
              <a href={websiteHref} style={{ color: textColor, textDecoration: 'underline' }} target="_blank" rel="noreferrer">
                {websiteLabel}
              </a>
              <i className="ph ph-globe" style={{ color: primaryColor }} />
            </div>
          )}

          {/* custom fields untouched */}
          {basics.customFields?.map((f) => (
            <div key={f.id} className="flex items-center gap-2 justify-end">
              {isUrl(f.value) ? (
                <a href={f.value} style={{ color: textColor, textDecoration: 'underline' }} target="_blank" rel="noreferrer">
                  {f.value}
                </a>
              ) : (
                <span>{[f.name, f.value].filter(Boolean).join(": ")}</span>
              )}
              <i className={`ph ph-${f.icon || "info"}`} style={{ color: primaryColor }} />
            </div>
          ))}

          {/* social profiles (url may be object) */}
          {profiles.items
            .filter((p) => p.visible)
            .map((item) => {
              const href = extractHref(item.url);
              if (!href) return null;
              return (
                <div key={item.id} className="flex items-center gap-2 justify-end">
                  {isUrl(item.url.href) ? (
                    <Link url={item.url} label={item.username} icon={<BrandIcon slug={item.icon} />} />
                  ) : (
                    <p style={{ color: getMutedTextColor(0.7) }}>{item.username}</p>
                  )}
                  {!item.icon && <p className="text-sm" style={{ color: getMutedTextColor(0.6) }}>{item.network}</p>}
                </div>
              );
            })}
        </div>
      </div>
      <div style={{ width: '100%', height: '0.2px', background: primaryColor, marginTop: '1rem', position: 'absolute', left: 0, bottom: 0 }} />
    </div>
  );
};

type RatingProps = { level: number; size?: string };

const Rating = ({ level, size = '1em' }: RatingProps) => {
  const color = useArtboardStore((state) => state.resume.metadata.theme.secondary);
  return (
    <div className="flex items-center gap-x-1" style={{ minWidth: 0 }}>
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          style={{
            border: `1.5px solid ${color}`,
            backgroundColor: level > index ? color : undefined,
            borderRadius: '50%',
            width: size,
            height: size,
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
};

type LinkProps = {
  url: URL;
  icon?: React.ReactNode;
  iconOnRight?: boolean;
  label?: string;
  className?: string;
};

const Link = ({ url, icon, iconOnRight, label, className }: LinkProps) => {
  const primaryColor = useArtboardStore((state) => state.resume.metadata.theme.primary);
  const textColor = useArtboardStore((state) => state.resume.metadata.theme.text);
  if (!isUrl(url.href)) return null;

  return (
    <div className="flex items-center gap-x-2">
      {!iconOnRight && (icon ?? <i className="ph ph-bold ph-link" style={{ color: primaryColor }} />)}
      <a
        href={url.href}
        target="_blank"
        rel="noreferrer noopener nofollow"
        className={cn(className)}
        style={{ color: textColor, textDecoration: 'underline' }}
      >
        {label ?? (url.label || url.href)}
      </a>
      {iconOnRight && (icon ?? <i className="ph ph-bold ph-link" style={{ color: primaryColor }} />)}
    </div>
  );
};

type LinkedEntityProps = {
  name: string;
  url: URL;
  separateLinks: boolean;
  className?: string;
  style?: React.CSSProperties;
};

const LinkedEntity = ({ name, url, separateLinks, className, style }: LinkedEntityProps) => {
  const primaryColor = useArtboardStore((state) => state.resume.metadata.theme.primary);
  const textColor = useArtboardStore((state) => state.resume.metadata.theme.text);
  return !separateLinks && isUrl(url.href) ? (
    <Link
      url={url}
      label={name}
      icon={<i className="ph ph-bold ph-globe" style={{ color: primaryColor }} />}
      iconOnRight={true}
      className={className}
    />
  ) : (
    <div className={className} style={style ?? { color: textColor }}>
      {name}
    </div>
  );
};

type SectionProps<T> = {
  section: SectionWithItem<T> | CustomSectionGroup;
  children?: (item: T) => React.ReactNode;
  className?: string;
  urlKey?: keyof T;
  levelKey?: keyof T;
  summaryKey?: keyof T;
  keywordsKey?: keyof T;
};

const Section = <T,>({
  section,
  children,
  className,
  urlKey,
  levelKey,
  summaryKey,
  keywordsKey,
}: SectionProps<T>) => {
  const primaryColor = useArtboardStore((state) => state.resume.metadata.theme.primary);
  const secondaryColor = useArtboardStore((state) => state.resume.metadata.theme.secondary);
  const textColor = useArtboardStore((state) => state.resume.metadata.theme.text);
  const backgroundColor = useArtboardStore((state) => state.resume.metadata.theme.background);
  if (!section.visible || section.items.length === 0) return null;

  return (
    <section id={section.id} className="grid">
      <h4
        className="mb-2 text-section font-bold"
        style={{ color: primaryColor, textTransform: 'uppercase' }}
      >
        {section.name}
      </h4>
      <div
        className="grid gap-x-4 gap-y-2"
        style={{ gridTemplateColumns: `repeat(${section.columns}, 1fr)` }}
      >
        {section.items
          .filter((item) => item.visible)
          .map((item) => {
            const url = (urlKey && get(item, urlKey)) as URL | undefined;
            const level = (levelKey && get(item, levelKey, 0)) as number | undefined;
            const summary = (summaryKey && get(item, summaryKey, "")) as string | undefined;
            const keywords = (keywordsKey && get(item, keywordsKey, [])) as string[] | undefined;

            return (
              <div key={item.id} className={cn("space-y-1", className)} style={{ color: textColor }}>
                <div style={{ flex: 1 }}>
                  {children?.(item as T)}
                  {url !== undefined && section.separateLinks && <Link url={url} />}
                {summary !== undefined && !isEmptyString(summary) && (
                  <div
                    dangerouslySetInnerHTML={{ __html: sanitize(summary) }}
                      className="wysiwyg text-body leading-relaxed custom-bullets"
                    style={{ color: textColor }}
                  />
                )}
                {keywords !== undefined && keywords.length > 0 && (item as any).showKeywords !== false && (
                    <div className="flex flex-wrap gap-1 mt-1">
                    {keywords.map((keyword, index) => (
                      <span
                        key={index}
                          className="text-chip"
                        style={{
                          backgroundColor: hexToRgb(primaryColor, 0.5),
                          color: backgroundColor,
                          borderRadius: 9999,
                          padding: '2px 8px',
                        }}
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
                </div>
              </div>
            );
          })}
      </div>
    </section>
  );
};


const Experience = () => {
  const section = useArtboardStore((state) => state.resume.sections.experience);
  const secondaryColor = useArtboardStore((state) => state.resume.metadata.theme.secondary);
  const textColor = useArtboardStore((state) => state.resume.metadata.theme.text);
  const getMutedTextColor = (opacity = 0.6) => hexToRgb(textColor, opacity);

  return (
    <Section<Experience> section={section} summaryKey="summary">
      {(item) => (
        <div className="relative flex items-start">
          {/* Block accent - positioned outside left margin, centered and aligned to content height */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: 'calc(-1 * var(--margin) * 2 + 0.25rem)', // Center the 8px block in 1rem space
              top: 0,
              bottom: 0,
              width: 8,
              backgroundColor: secondaryColor,
              borderRadius: 4,
            }}
          />
          <div className="flex-1">
            <div className="text-title font-bold">{item.position}</div>
              <LinkedEntity
                name={item.company}
                url={item.url}
                separateLinks={section.separateLinks}
              style={{ color: getMutedTextColor(0.6) }}
              className="text-title font-medium"
              />
            <div className="flex items-start justify-between">
              <div className="text-left">
                <div className="text-meta italic" style={{ color: secondaryColor }}>{item.date}</div>
              </div>
              <div className="text-right">
                {item.location && (
                  <div className="text-meta italic" style={{ color: secondaryColor }}>
                    {item.location}
                  </div>
                )}
            </div>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
};

const Education = () => {
  const section = useArtboardStore((state) => state.resume.sections.education);
  const secondaryColor = useArtboardStore((state) => state.resume.metadata.theme.secondary);
  const textColor = useArtboardStore((state) => state.resume.metadata.theme.text);
  const getMutedTextColor = (opacity = 0.6) => hexToRgb(textColor, opacity);

  return (
    <Section<Education> section={section} urlKey="url" summaryKey="summary">
      {(item) => (
        <div className="relative">
          {/* Left border - positioned outside left margin, centered */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: 'calc(-1 * var(--margin) * 2 + 0.375rem)', // Center the 4px border in 1rem space
              top: 0,
              bottom: 0,
              width: 4,
              backgroundColor: secondaryColor,
            }}
          />
          <div className="mb-2">
            <div className="text-title font-bold">{item.area}</div>
            <div className="flex items-center gap-1">
              <LinkedEntity
                name={item.institution}
                url={item.url}
                separateLinks={section.separateLinks}
                className="text-sm"
                style={{ color: getMutedTextColor(0.6) }}
              />
              {item.studyType && (
                <>
                  <span className="text-sm" style={{ color: getMutedTextColor(0.6) }}>-</span>
                  <span className="text-sm" style={{ color: getMutedTextColor(0.6) }}>{item.studyType}</span>
                </>
              )}
            </div>
            <div className="flex items-start justify-between">
              <div className="text-left">
                <div className="text-meta italic" style={{ color: secondaryColor }}>{item.date}</div>
              </div>
              <div className="text-right">
                {item.score && (
                  <div className="text-meta italic" style={{ color: secondaryColor }}>
                    {item.score}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
};

const Awards = () => {
  const section = useArtboardStore((state) => state.resume.sections.awards);
  const secondaryColor = useArtboardStore((state) => state.resume.metadata.theme.secondary);
  const textColor = useArtboardStore((state) => state.resume.metadata.theme.text);
  const getMutedTextColor = (opacity = 0.6) => hexToRgb(textColor, opacity);

  return (
    <Section<Award> section={section} urlKey="url" summaryKey="summary">
      {(item) => (
        <div className="flex items-start justify-between group-[.sidebar]:flex-col group-[.sidebar]:items-start">
          <div className="text-left">
            <div className="font-bold" style={{ color: textColor }}>{item.title}</div>
            <LinkedEntity
              name={item.awarder}
              url={item.url}
              separateLinks={section.separateLinks}
              className=""
            />
          </div>

          <div className="shrink-0 text-right group-[.sidebar]:text-left">
            <div className="text-meta italic" style={{ color: secondaryColor }}>{item.date}</div>
          </div>
        </div>
      )}
    </Section>
  );
};

const Certifications = () => {
  const section = useArtboardStore((state) => state.resume.sections.certifications);
  const secondaryColor = useArtboardStore((state) => state.resume.metadata.theme.secondary);
  const textColor = useArtboardStore((state) => state.resume.metadata.theme.text);
  const getMutedTextColor = (opacity = 0.6) => hexToRgb(textColor, opacity);

  return (
    <Section<Certification> section={section} urlKey="url" summaryKey="summary">
      {(item) => (
        <div className="flex items-start justify-between group-[.sidebar]:flex-col group-[.sidebar]:items-start">
          <div className="text-left">
            <div className="font-bold" style={{ color: textColor }}>{item.name}</div>
            <LinkedEntity
              name={item.issuer}
              url={item.url}
              separateLinks={section.separateLinks}
              className=""
            />
          </div>

          <div className="shrink-0 text-right group-[.sidebar]:text-left">
            <div className="text-meta italic" style={{ color: secondaryColor }}>{item.date}</div>
          </div>
        </div>
      )}
    </Section>
  );
};

const Skills = () => {
  const section = useArtboardStore((state) => state.resume.sections.skills);
  const textColor = useArtboardStore((state) => state.resume.metadata.theme.text);
  const primaryColor = useArtboardStore((state) => state.resume.metadata.theme.primary);
  const getMutedTextColor = (opacity = 0.6) => hexToRgb(textColor, opacity);

  return (
    <Section<Skill> section={section} levelKey="level" keywordsKey="keywords">
      {(item) => (
        <div>
          <div className="flex items-center justify-between">
            <div className="font-bold text-body" style={{ color: textColor }}>{item.name}</div>
            {item.level && item.level > 0 && <Rating level={item.level} />}
          </div>
          {item.description && item.showDescription !== false && <div>{item.description}</div>}
        </div>
      )}
    </Section>
  );
};

const Interests = () => {
  const section = useArtboardStore((state) => state.resume.sections.interests);
  const secondaryColor = useArtboardStore((state) => state.resume.metadata.theme.secondary);
  const primaryColor = useArtboardStore((state) => state.resume.metadata.theme.primary);
  const backgroundColor = useArtboardStore((state) => state.resume.metadata.theme.background);

  if (!section.visible || section.items.length === 0) return null;

  return (
    <section id={section.id} className="grid">
      <h4
        className="mb-2 text-section font-bold"
        style={{ color: primaryColor, textTransform: 'uppercase' }}
      >
        {section.name}
      </h4>
      <div className="flex flex-wrap gap-1">
        {section.items
          .filter((item) => item.visible)
          .map((item) => (
            <span
              key={item.id}
              className="text-body"
              style={{
                backgroundColor: hexToRgb(secondaryColor, 0.18),
                color: secondaryColor,
                border: `0.5px solid ${secondaryColor}`,
                borderRadius: 10,
                padding: '2px 8px',
              }}
            >
              {item.name}
            </span>
          ))}
      </div>
    </section>
  );
};

const Publications = () => {
  const section = useArtboardStore((state) => state.resume.sections.publications);
  const secondaryColor = useArtboardStore((state) => state.resume.metadata.theme.secondary);
  const textColor = useArtboardStore((state) => state.resume.metadata.theme.text);
  const getMutedTextColor = (opacity = 0.6) => hexToRgb(textColor, opacity);

  return (
    <Section<Publication> section={section} urlKey="url" summaryKey="summary">
      {(item) => (
        <div className="flex items-start justify-between group-[.sidebar]:flex-col group-[.sidebar]:items-start">
          <div className="text-left">
            <LinkedEntity
              name={item.name}
              url={item.url}
              separateLinks={section.separateLinks}
              className="font-bold"
            />
            <div style={{ color: getMutedTextColor(0.6) }}>{item.publisher}</div>
          </div>

          <div className="shrink-0 text-right group-[.sidebar]:text-left">
            <div className="text-meta italic" style={{ color: secondaryColor }}>{item.date}</div>
          </div>
        </div>
      )}
    </Section>
  );
};

const Volunteer = () => {
  const section = useArtboardStore((state) => state.resume.sections.volunteer);
  const secondaryColor = useArtboardStore((state) => state.resume.metadata.theme.secondary);
  const textColor = useArtboardStore((state) => state.resume.metadata.theme.text);
  const getMutedTextColor = (opacity = 0.6) => hexToRgb(textColor, opacity);

  return (
    <Section<Volunteer> section={section} urlKey="url" summaryKey="summary">
      {(item) => (
        <div className="flex items-start justify-between group-[.sidebar]:flex-col group-[.sidebar]:items-start">
          <div className="text-left">
            <LinkedEntity
              name={item.organization}
              url={item.url}
              separateLinks={section.separateLinks}
              className="font-bold"
            />
            <div style={{ color: getMutedTextColor(0.6) }}>{item.position}</div>
          </div>

          <div className="shrink-0 text-right group-[.sidebar]:text-left">
            <div className="text-meta italic" style={{ color: secondaryColor }}>{item.date}</div>
            <div className="text-meta italic" style={{ color: getMutedTextColor(0.6) }}>{item.location}</div>
          </div>
        </div>
      )}
    </Section>
  );
};

const Languages = () => {
  const section = useArtboardStore((state) => state.resume.sections.languages);
  const textColor = useArtboardStore((state) => state.resume.metadata.theme.text);
  const getMutedTextColor = (opacity = 0.6) => hexToRgb(textColor, opacity);

  return (
    <Section<Language> section={section} levelKey="level">
      {(item) => (
        <div>
          <div className="flex items-center justify-between">
            <div className="font-bold text-body" style={{ color: textColor }}>{item.name}</div>
            {item.level && item.level > 0 && <Rating level={item.level} />}
          </div>
          {item.description && item.showDescription !== false && <div>{item.description}</div>}
        </div>
      )}
    </Section>
  );
};

const Projects = () => {
  const section = useArtboardStore((state) => state.resume.sections.projects);
  const secondaryColor = useArtboardStore((state) => state.resume.metadata.theme.secondary);
  const textColor = useArtboardStore((state) => state.resume.metadata.theme.text);
  const getMutedTextColor = (opacity = 0.6) => hexToRgb(textColor, opacity);

  return (
    <Section<Project> section={section} urlKey="url" summaryKey="summary" keywordsKey="keywords">
      {(item) => (
        <div className="flex items-start justify-between group-[.sidebar]:flex-col group-[.sidebar]:items-start">
          <div className="text-left">
            <LinkedEntity
              name={item.name}
              url={item.url}
              separateLinks={section.separateLinks}
              className="font-bold"
            />
            <div className="text-sm" style={{ color: getMutedTextColor(0.6) }}>{item.description}</div>
          </div>

          <div className="shrink-0 text-right group-[.sidebar]:text-left">
            <div className="text-meta italic" style={{ color: secondaryColor }}>{item.date}</div>
          </div>
        </div>
      )}
    </Section>
  );
};

const References = () => {
  const section = useArtboardStore((state) => state.resume.sections.references);
  const textColor = useArtboardStore((state) => state.resume.metadata.theme.text);
  const getMutedTextColor = (opacity = 0.6) => hexToRgb(textColor, opacity);

  return (
    <Section<Reference> section={section} urlKey="url" summaryKey="summary">
      {(item) => (
        <div>
          <LinkedEntity
            name={item.name}
            url={item.url}
            separateLinks={section.separateLinks}
            className="font-bold"
          />
          <div className="text-sm" style={{ color: getMutedTextColor(0.6) }}>{item.description}</div>
        </div>
      )}
    </Section>
  );
};

const Custom = ({ id }: { id: string }) => {
  const section = useArtboardStore((state) => state.resume.sections.custom[id]);
  const secondaryColor = useArtboardStore((state) => state.resume.metadata.theme.secondary);
  const textColor = useArtboardStore((state) => state.resume.metadata.theme.text);
  const getMutedTextColor = (opacity = 0.6) => hexToRgb(textColor, opacity);

  return (
    <Section<CustomSection>
      section={section}
      urlKey="url"
      summaryKey="summary"
      keywordsKey="keywords"
    >
      {(item) => (
        <div className="flex items-start justify-between group-[.sidebar]:flex-col group-[.sidebar]:items-start">
          <div className="text-left">
            <LinkedEntity
              name={item.name}
              url={item.url}
              separateLinks={section.separateLinks}
              className="font-bold"
            />
            <div className="text-sm" style={{ color: getMutedTextColor(0.6) }}>{item.description}</div>
          </div>

          <div className="shrink-0 text-right group-[.sidebar]:text-left">   
            <div className="text-meta italic" style={{ color: secondaryColor }}>{item.date}</div>
          </div>
        </div>
      )}
    </Section>
  );
};

const mapSectionToComponent = (section: SectionKey) => {
  let component = null;
  
  switch (section) {
    case "experience": {
      component = <Experience />;
      break;
    }
    case "education": {
      component = <Education />;
      break;
    }
    case "awards": {
      component = <Awards />;
      break;
    }
    case "certifications": {
      component = <Certifications />;
      break;
    }
    case "skills": {
      component = <Skills />;
      break;
    }
    case "interests": {
      component = <Interests />;
      break;
    }
    case "publications": {
      component = <Publications />;
      break;
    }
    case "volunteer": {
      component = <Volunteer />;
      break;
    }
    case "languages": {
      component = <Languages />;
      break;
    }
    case "projects": {
      component = <Projects />;
      break;
    }
    case "references": {
      component = <References />;
      break;
    }
    default: {
      if (section.startsWith("custom.")) {
        component = <Custom id={section.split(".")[1]} />;
      }
    }
  }

  // Only render the wrapper if the component exists and is visible
  if (!component) return null;

  return (
    <div className="margin-section space-y-4">
      {component}
    </div>
  );
};

export const NovoResume = ({ columns, isFirstPage = false }: TemplateProps) => {
  const backgroundColor = useArtboardStore((state) => state.resume.metadata.theme.background);
  const secondaryColor = useArtboardStore((state) => state.resume.metadata.theme.secondary);
  const primaryColor = useArtboardStore((state) => state.resume.metadata.theme.primary);
  const columnSplit = useArtboardStore((state) => state.resume.metadata.columnSplit ?? 50);

  const [leftColumn, rightColumn] = columns;

  // Convert percentage to columns (30-70% range mapped to 20-column grid)
  const leftColumns = Math.round(columnSplit / 5);   // 30% = 6, 50% = 10, 70% = 14
  const rightColumns = 20 - leftColumns;             // Remaining columns

  return (
    <div style={{ backgroundColor }}>
      <Header />
      <div className="grid min-h-[inherit] grid-cols-20 gap-x-4">
        <div 
          className="sidebar group flex flex-col"
          style={{ gridColumn: `span ${leftColumns}` }}
      >
          {leftColumn.map((section) => (
            <div key={section}>
              {mapSectionToComponent(section)}
            </div>
          ))}
        </div>

        <div 
          className="main group"
          style={{ gridColumn: `span ${rightColumns}` }}
        >
          {rightColumn.map((section) => (
            <div key={section}>
              {mapSectionToComponent(section)}
            </div>
            ))}
          </div>
      </div>
      {/* Custom bullet color style and margin utilities */}
      <style>{`
        .custom-bullets ul {
          padding-left: 1.2em;
        }
        .custom-bullets ul li::marker {
          color: ${secondaryColor};
          font-weight: bold;
        }
        .margin-section {
          padding-left: calc(var(--margin) * 2);
          padding-right: calc(var(--margin) * 2);
          padding-top: var(--margin);
          margin-bottom: 0;
        }
        .margin-section + .margin-section {
          padding-top: 0;
        }
        .sidebar .margin-section {
          padding-right: var(--margin);
        }
        .main .margin-section {
          padding-left: var(--margin);
        }
        /* Adjust unbound decorative elements for sidebar positioning */
        .sidebar [style*="left: calc(-1 * var(--margin) * 2 + 0.25rem)"] {
          left: calc(-1 * var(--margin) + 0.25rem) !important;
        }
        .sidebar [style*="left: calc(-1 * var(--margin) * 2 + 0.375rem)"] {
          left: calc(-1 * var(--margin) + 0.375rem) !important;
        }
        .sidebar [style*="transform: translateX(calc(-1 * var(--margin) * 2))"] {
          transform: translateX(calc(-1 * var(--margin))) !important;
        }
        .margin-header {
          padding-left: calc(var(--margin) * 2);
          padding-right: calc(var(--margin) * 2);
          padding-top: var(--margin);
          padding-bottom: var(--margin);
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
};
