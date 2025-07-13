import type {
  Award,
  Certification,
  CustomSection,
  CustomSectionGroup,
  Interest,
  Language,
  Profile,
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
import { Fragment } from "react";

import { BrandIcon } from "../components/brand-icon";
import { Picture } from "../components/picture";
import { useArtboardStore } from "../store/artboard";
import type { TemplateProps } from "../types/template";


const Header = () => {
  const resume = useArtboardStore((s) => s.resume);
  const { basics } = resume;
  const summary = resume.sections.summary;
  const profiles = resume.sections.profiles;
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
    <div className="relative mb-6 rounded-lg p-6" style={{ backgroundColor: hexToRgb(primaryColor, 0.08) }}>
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundColor }}>
        <div className="size-full bg-[radial-gradient(circle_at_1px_1px,_rgb(0_0_0)_1px,_transparent_0)] bg-[length:20px_20px]" />
      </div>

      <div className="relative grid gap-6" style={{ gridTemplateColumns: gridCols }}>
       

        {/* LEFT block */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold" style={{ color: textColor }}>{basics.name}</h1>
          {basics.headline && <h2 className="text-lg font-medium" style={{ color: primaryColor }}>{basics.headline}</h2>}
          {summary.visible && summary.content?.trim() && (
            <div
              dangerouslySetInnerHTML={{ __html: summary.content }}
              className="text-sm leading-relaxed"
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
    </div>
  );
};

type RatingProps = { level: number };

const Rating = ({ level }: RatingProps) => {
  const primaryColor = useArtboardStore((state) => state.resume.metadata.theme.primary);
  return (
    <div className="flex items-center gap-x-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          style={{
            border: `1.5px solid ${primaryColor}`,
            backgroundColor: level > index ? primaryColor : undefined,
            borderRadius: '50%',
            width: 18,
            height: 18,
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
};

const LinkedEntity = ({ name, url, separateLinks, className }: LinkedEntityProps) => {
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
    <div className={className} style={{ color: textColor }}>{name}</div>
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
  const textColor = useArtboardStore((state) => state.resume.metadata.theme.text);
  if (!section.visible || section.items.length === 0) return null;

  return (
    <section id={section.id} className="mb-6">
      <h4
        className="mb-4 inline-block pb-1 text-lg font-bold"
        style={{ borderBottom: `2px solid ${primaryColor}`, color: primaryColor }}
      >
        {section.name}
      </h4>

      <div
        className="grid gap-x-6 gap-y-4"
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
              <div key={item.id} className={cn("space-y-2", className)} style={{ color: textColor }}>
                <div>
                  {children?.(item as T)}
                  {url !== undefined && section.separateLinks && <Link url={url} />}
                </div>

                {summary !== undefined && !isEmptyString(summary) && (
                  <div
                    dangerouslySetInnerHTML={{ __html: sanitize(summary) }}
                    className="wysiwyg text-sm leading-relaxed"
                    style={{ color: textColor }}
                  />
                )}

                {level !== undefined && level > 0 && <Rating level={level} />}

                {keywords !== undefined && keywords.length > 0 && (item as any).showKeywords !== false && (
                  <div className="flex flex-wrap gap-1">
                    {keywords.map((keyword, index) => (
                      <span
                        key={index}
                        style={{
                          backgroundColor: hexToRgb(primaryColor, 0.12),
                          color: primaryColor,
                          borderRadius: 9999,
                          padding: '2px 8px',
                          fontSize: 12,
                        }}
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
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
  const getMutedTextColor = (opacity: number = 0.6) => hexToRgb(textColor, opacity);

  return (
    <Section<Experience> section={section} urlKey="url" summaryKey="summary">
      {(item) => (
        <div className="border-l-4 pl-4" style={{ borderColor: secondaryColor }}>
          <div className="mb-2 flex items-start justify-between">
            <div className="text-left">
              <LinkedEntity
                name={item.company}
                url={item.url}
                separateLinks={section.separateLinks}
                className="text-base font-bold"
              />
              <div className="font-medium" style={{ color: getMutedTextColor(0.6) }}>{item.position}</div>
            </div>

            <div className="shrink-0 text-right">
              <div className="font-semibold" style={{ color: secondaryColor }}>{item.date}</div>
              <div className="text-sm" style={{ color: getMutedTextColor(0.6) }}>{item.location}</div>
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
  const getMutedTextColor = (opacity: number = 0.6) => hexToRgb(textColor, opacity);

  return (
    <Section<Education> section={section} urlKey="url" summaryKey="summary">
      {(item) => (
        <div className="border-l-4 pl-4" style={{ borderColor: secondaryColor }}>
          <div className="mb-2 flex items-start justify-between">
            <div className="text-left">
              <LinkedEntity
                name={item.institution}
                url={item.url}
                separateLinks={section.separateLinks}
                className="text-base font-bold"
              />
              <div className="font-medium" style={{ color: getMutedTextColor(0.6) }}>{item.area}</div>
              {item.score && <div className="text-sm" style={{ color: getMutedTextColor(0.6) }}>{item.score}</div>}
            </div>

            <div className="shrink-0 text-right">
              <div className="font-semibold" style={{ color: secondaryColor }}>{item.date}</div>
              <div className="text-sm" style={{ color: getMutedTextColor(0.6) }}>{item.studyType}</div>
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
  const getMutedTextColor = (opacity: number = 0.6) => hexToRgb(textColor, opacity);

  return (
    <Section<Award> section={section} urlKey="url" summaryKey="summary">
      {(item) => (
        <div className="flex items-start justify-between">
          <div className="text-left">
            <div className="font-bold" style={{ color: textColor }}>{item.title}</div>
            <LinkedEntity
              name={item.awarder}
              url={item.url}
              separateLinks={section.separateLinks}
              className=""
            />
          </div>

          <div className="shrink-0 text-right">
            <div className="font-semibold" style={{ color: secondaryColor }}>{item.date}</div>
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
  const getMutedTextColor = (opacity: number = 0.6) => hexToRgb(textColor, opacity);

  return (
    <Section<Certification> section={section} urlKey="url" summaryKey="summary">
      {(item) => (
        <div className="flex items-start justify-between">
          <div className="text-left">
            <div className="font-bold" style={{ color: textColor }}>{item.name}</div>
            <LinkedEntity
              name={item.issuer}
              url={item.url}
              separateLinks={section.separateLinks}
              className=""
            />
          </div>

          <div className="shrink-0 text-right">
            <div className="font-semibold" style={{ color: secondaryColor }}>{item.date}</div>
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
  const getMutedTextColor = (opacity: number = 0.6) => hexToRgb(textColor, opacity);

  return (
    <Section<Skill> section={section} levelKey="level" keywordsKey="keywords">
      {(item) => (
        <div>
          <div className="font-bold" style={{ color: textColor }}>{item.name}</div>
          {item.description && item.showDescription !== false && (
            <div className="text-sm" style={{ color: getMutedTextColor(0.6) }}>{item.description}</div>
          )}
        </div>
      )}
    </Section>
  );
};

const Interests = () => {
  const section = useArtboardStore((state) => state.resume.sections.interests);
  const textColor = useArtboardStore((state) => state.resume.metadata.theme.text);

  return (
    <Section<Interest> section={section} keywordsKey="keywords" className="space-y-1">
      {(item) => <div className="font-bold" style={{ color: textColor }}>{item.name}</div>}
    </Section>
  );
};

const Publications = () => {
  const section = useArtboardStore((state) => state.resume.sections.publications);
  const secondaryColor = useArtboardStore((state) => state.resume.metadata.theme.secondary);
  const textColor = useArtboardStore((state) => state.resume.metadata.theme.text);
  const getMutedTextColor = (opacity: number = 0.6) => hexToRgb(textColor, opacity);

  return (
    <Section<Publication> section={section} urlKey="url" summaryKey="summary">
      {(item) => (
        <div className="flex items-start justify-between">
          <div className="text-left">
            <LinkedEntity
              name={item.name}
              url={item.url}
              separateLinks={section.separateLinks}
              className="font-bold"
            />
            <div style={{ color: getMutedTextColor(0.6) }}>{item.publisher}</div>
          </div>

          <div className="shrink-0 text-right">
            <div className="font-semibold" style={{ color: secondaryColor }}>{item.date}</div>
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
  const getMutedTextColor = (opacity: number = 0.6) => hexToRgb(textColor, opacity);

  return (
    <Section<Volunteer> section={section} urlKey="url" summaryKey="summary">
      {(item) => (
        <div className="flex items-start justify-between">
          <div className="text-left">
            <LinkedEntity
              name={item.organization}
              url={item.url}
              separateLinks={section.separateLinks}
              className="font-bold"
            />
            <div style={{ color: getMutedTextColor(0.6) }}>{item.position}</div>
          </div>

          <div className="shrink-0 text-right">
            <div className="font-semibold" style={{ color: secondaryColor }}>{item.date}</div>
            <div className="text-sm" style={{ color: getMutedTextColor(0.6) }}>{item.location}</div>
          </div>
        </div>
      )}
    </Section>
  );
};

const Languages = () => {
  const section = useArtboardStore((state) => state.resume.sections.languages);
  const textColor = useArtboardStore((state) => state.resume.metadata.theme.text);
  const getMutedTextColor = (opacity: number = 0.6) => hexToRgb(textColor, opacity);

  return (
    <Section<Language> section={section} levelKey="level">
      {(item) => (
        <div className="space-y-1">
          <div className="font-bold" style={{ color: textColor }}>{item.name}</div>
          {item.description && <div className="text-sm" style={{ color: getMutedTextColor(0.6) }}>{item.description}</div>}
        </div>
      )}
    </Section>
  );
};

const Projects = () => {
  const section = useArtboardStore((state) => state.resume.sections.projects);
  const secondaryColor = useArtboardStore((state) => state.resume.metadata.theme.secondary);
  const textColor = useArtboardStore((state) => state.resume.metadata.theme.text);
  const getMutedTextColor = (opacity: number = 0.6) => hexToRgb(textColor, opacity);

  return (
    <Section<Project> section={section} urlKey="url" summaryKey="summary" keywordsKey="keywords">
      {(item) => (
        <div className="flex items-start justify-between">
          <div className="text-left">
            <LinkedEntity
              name={item.name}
              url={item.url}
              separateLinks={section.separateLinks}
              className="font-bold"
            />
            <div className="text-sm" style={{ color: getMutedTextColor(0.6) }}>{item.description}</div>
          </div>

          <div className="shrink-0 text-right">
            <div className="font-semibold" style={{ color: secondaryColor }}>{item.date}</div>
          </div>
        </div>
      )}
    </Section>
  );
};

const References = () => {
  const section = useArtboardStore((state) => state.resume.sections.references);
  const textColor = useArtboardStore((state) => state.resume.metadata.theme.text);
  const getMutedTextColor = (opacity: number = 0.6) => hexToRgb(textColor, opacity);

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
  const getMutedTextColor = (opacity: number = 0.6) => hexToRgb(textColor, opacity);

  return (
    <Section<CustomSection>
      section={section}
      urlKey="url"
      summaryKey="summary"
      keywordsKey="keywords"
    >
      {(item) => (
        <div className="flex items-start justify-between">
          <div className="text-left">
            <LinkedEntity
              name={item.name}
              url={item.url}
              separateLinks={section.separateLinks}
              className="font-bold"
            />
            <div className="text-sm" style={{ color: getMutedTextColor(0.6) }}>{item.description}</div>
          </div>

          <div className="shrink-0 text-right">
            <div className="font-semibold" style={{ color: secondaryColor }}>{item.date}</div>
          </div>
        </div>
      )}
    </Section>
  );
};

const mapSectionToComponent = (section: SectionKey) => {
  switch (section) {
    case "experience": {
      return <Experience />;
    }
    case "education": {
      return <Education />;
    }
    case "awards": {
      return <Awards />;
    }
    case "certifications": {
      return <Certifications />;
    }
    case "skills": {
      return <Skills />;
    }
    case "interests": {
      return <Interests />;
    }
    case "publications": {
      return <Publications />;
    }
    case "volunteer": {
      return <Volunteer />;
    }
    case "languages": {
      return <Languages />;
    }
    case "projects": {
      return <Projects />;
    }
    case "references": {
      return <References />;
    }
    default: {
      if (section.startsWith("custom.")) {
        return <Custom id={section.split(".")[1]} />;
      }

      return null;
    }
  }
};

export const NovoResume = ({ columns, isFirstPage = false }: TemplateProps) => {
  const backgroundColor = useArtboardStore((state) => state.resume.metadata.theme.background);
  return (
    <div className="p-custom space-y-4" style={{ backgroundColor }}>
      <Header />

      <div
        className="grid gap-x-6 gap-y-4"
        style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}
      >
        {columns.map((column, columnIndex) => (
          <div key={columnIndex} className="space-y-4">
            {column.map((section) => (
              <Fragment key={section}>{mapSectionToComponent(section)}</Fragment>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
