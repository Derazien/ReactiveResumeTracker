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
import { cn, isEmptyString, isUrl, sanitize } from "@reactive-resume/utils";
import get from "lodash.get";
import { Fragment } from "react";

import { BrandIcon } from "../components/brand-icon";
import { Picture } from "../components/picture";
import { useArtboardStore } from "../store/artboard";
import type { TemplateProps } from "../types/template";

const Header = () => {
  const basics = useArtboardStore((state) => state.resume.basics);

  return (
    <div className="relative mb-6 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 p-6">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="size-full bg-[radial-gradient(circle_at_1px_1px,_rgb(0_0_0)_1px,_transparent_0)] bg-[length:20px_20px]"></div>
      </div>

      <div className="relative flex items-center space-x-6">
        <Picture className="rounded-full border-4 border-white shadow-lg" />

        <div className="space-y-2">
          <div className="text-3xl font-bold text-slate-800">{basics.name}</div>
          <div className="text-lg font-medium text-slate-600">{basics.headline}</div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            {basics.location && (
              <div className="flex items-center gap-x-2">
                <i className="ph ph-bold ph-map-pin text-blue-600" />
                <span className="text-slate-700">{basics.location}</span>
              </div>
            )}
            {basics.phone && (
              <div className="flex items-center gap-x-2">
                <i className="ph ph-bold ph-phone text-blue-600" />
                <a
                  href={`tel:${basics.phone}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-700 hover:text-blue-600"
                >
                  {basics.phone}
                </a>
              </div>
            )}
            {basics.email && (
              <div className="flex items-center gap-x-2">
                <i className="ph ph-bold ph-at text-blue-600" />
                <a
                  href={`mailto:${basics.email}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-700 hover:text-blue-600"
                >
                  {basics.email}
                </a>
              </div>
            )}
            <Link url={basics.url} />
            {basics.customFields.map((item) => (
              <div key={item.id} className="flex items-center gap-x-2">
                <i className={cn(`ph ph-bold ph-${item.icon}`, "text-blue-600")} />
                {isUrl(item.value) ? (
                  <a
                    href={item.value}
                    target="_blank"
                    rel="noreferrer noopener nofollow"
                    className="text-slate-700 hover:text-blue-600"
                  >
                    {item.name || item.value}
                  </a>
                ) : (
                  <span className="text-slate-700">
                    {[item.name, item.value].filter(Boolean).join(": ")}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Summary = () => {
  const section = useArtboardStore((state) => state.resume.sections.summary);

  if (!section.visible || isEmptyString(section.content)) return null;

  return (
    <section id={section.id} className="mb-6">
      <h4 className="mb-3 inline-block border-b-2 border-blue-600 pb-1 text-lg font-bold text-slate-800">
        {section.name}
      </h4>

      <div
        dangerouslySetInnerHTML={{ __html: sanitize(section.content) }}
        style={{ columns: section.columns }}
        className="wysiwyg leading-relaxed text-slate-700"
      />
    </section>
  );
};

type RatingProps = { level: number };

const Rating = ({ level }: RatingProps) => (
  <div className="flex items-center gap-x-1">
    {Array.from({ length: 5 }).map((_, index) => (
      <div
        key={index}
        className={cn(
          "size-2.5 rounded-full border border-blue-600",
          level > index ? "bg-blue-600" : "bg-slate-200",
        )}
      />
    ))}
  </div>
);

type LinkProps = {
  url: URL;
  icon?: React.ReactNode;
  iconOnRight?: boolean;
  label?: string;
  className?: string;
};

const Link = ({ url, icon, iconOnRight, label, className }: LinkProps) => {
  if (!isUrl(url.href)) return null;

  return (
    <div className="flex items-center gap-x-2">
      {!iconOnRight && (icon ?? <i className="ph ph-bold ph-link text-blue-600" />)}
      <a
        href={url.href}
        target="_blank"
        rel="noreferrer noopener nofollow"
        className={cn("text-slate-700 hover:text-blue-600", className)}
      >
        {label ?? (url.label || url.href)}
      </a>
      {iconOnRight && (icon ?? <i className="ph ph-bold ph-link text-blue-600" />)}
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
  return !separateLinks && isUrl(url.href) ? (
    <Link
      url={url}
      label={name}
      icon={<i className="ph ph-bold ph-globe text-blue-600" />}
      iconOnRight={true}
      className={className}
    />
  ) : (
    <div className={className}>{name}</div>
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
  if (!section.visible || section.items.length === 0) return null;

  return (
    <section id={section.id} className="mb-6">
      <h4 className="mb-4 inline-block border-b-2 border-blue-600 pb-1 text-lg font-bold text-slate-800">
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
              <div key={item.id} className={cn("space-y-2", className)}>
                <div>
                  {children?.(item as T)}
                  {url !== undefined && section.separateLinks && <Link url={url} />}
                </div>

                {summary !== undefined && !isEmptyString(summary) && (
                  <div
                    dangerouslySetInnerHTML={{ __html: sanitize(summary) }}
                    className="wysiwyg text-sm leading-relaxed text-slate-700"
                  />
                )}

                {level !== undefined && level > 0 && <Rating level={level} />}

                {keywords !== undefined && keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"
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

const Profiles = () => {
  const section = useArtboardStore((state) => state.resume.sections.profiles);

  return (
    <Section<Profile> section={section}>
      {(item) => (
        <div>
          {isUrl(item.url.href) ? (
            <Link url={item.url} label={item.username} icon={<BrandIcon slug={item.icon} />} />
          ) : (
            <p className="text-slate-700">{item.username}</p>
          )}
          {!item.icon && <p className="text-sm text-slate-600">{item.network}</p>}
        </div>
      )}
    </Section>
  );
};

const Experience = () => {
  const section = useArtboardStore((state) => state.resume.sections.experience);

  return (
    <Section<Experience> section={section} urlKey="url" summaryKey="summary">
      {(item) => (
        <div className="border-l-4 border-blue-600 pl-4">
          <div className="mb-2 flex items-start justify-between">
            <div className="text-left">
              <LinkedEntity
                name={item.company}
                url={item.url}
                separateLinks={section.separateLinks}
                className="text-base font-bold text-slate-800"
              />
              <div className="font-medium text-slate-600">{item.position}</div>
            </div>

            <div className="shrink-0 text-right">
              <div className="font-semibold text-blue-600">{item.date}</div>
              <div className="text-sm text-slate-600">{item.location}</div>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
};

const Education = () => {
  const section = useArtboardStore((state) => state.resume.sections.education);

  return (
    <Section<Education> section={section} urlKey="url" summaryKey="summary">
      {(item) => (
        <div className="border-l-4 border-blue-600 pl-4">
          <div className="mb-2 flex items-start justify-between">
            <div className="text-left">
              <LinkedEntity
                name={item.institution}
                url={item.url}
                separateLinks={section.separateLinks}
                className="text-base font-bold text-slate-800"
              />
              <div className="font-medium text-slate-600">{item.area}</div>
              {item.score && <div className="text-sm text-slate-600">{item.score}</div>}
            </div>

            <div className="shrink-0 text-right">
              <div className="font-semibold text-blue-600">{item.date}</div>
              <div className="text-sm text-slate-600">{item.studyType}</div>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
};

const Awards = () => {
  const section = useArtboardStore((state) => state.resume.sections.awards);

  return (
    <Section<Award> section={section} urlKey="url" summaryKey="summary">
      {(item) => (
        <div className="flex items-start justify-between">
          <div className="text-left">
            <div className="font-bold text-slate-800">{item.title}</div>
            <LinkedEntity
              name={item.awarder}
              url={item.url}
              separateLinks={section.separateLinks}
              className="text-slate-600"
            />
          </div>

          <div className="shrink-0 text-right">
            <div className="font-semibold text-blue-600">{item.date}</div>
          </div>
        </div>
      )}
    </Section>
  );
};

const Certifications = () => {
  const section = useArtboardStore((state) => state.resume.sections.certifications);

  return (
    <Section<Certification> section={section} urlKey="url" summaryKey="summary">
      {(item) => (
        <div className="flex items-start justify-between">
          <div className="text-left">
            <div className="font-bold text-slate-800">{item.name}</div>
            <LinkedEntity
              name={item.issuer}
              url={item.url}
              separateLinks={section.separateLinks}
              className="text-slate-600"
            />
          </div>

          <div className="shrink-0 text-right">
            <div className="font-semibold text-blue-600">{item.date}</div>
          </div>
        </div>
      )}
    </Section>
  );
};

const Skills = () => {
  const section = useArtboardStore((state) => state.resume.sections.skills);

  return (
    <Section<Skill> section={section} levelKey="level" keywordsKey="keywords">
      {(item) => (
        <div>
          <div className="font-bold text-slate-800">{item.name}</div>
          {item.description && <div className="text-sm text-slate-600">{item.description}</div>}
        </div>
      )}
    </Section>
  );
};

const Interests = () => {
  const section = useArtboardStore((state) => state.resume.sections.interests);

  return (
    <Section<Interest> section={section} keywordsKey="keywords" className="space-y-1">
      {(item) => <div className="font-bold text-slate-800">{item.name}</div>}
    </Section>
  );
};

const Publications = () => {
  const section = useArtboardStore((state) => state.resume.sections.publications);

  return (
    <Section<Publication> section={section} urlKey="url" summaryKey="summary">
      {(item) => (
        <div className="flex items-start justify-between">
          <div className="text-left">
            <LinkedEntity
              name={item.name}
              url={item.url}
              separateLinks={section.separateLinks}
              className="font-bold text-slate-800"
            />
            <div className="text-slate-600">{item.publisher}</div>
          </div>

          <div className="shrink-0 text-right">
            <div className="font-semibold text-blue-600">{item.date}</div>
          </div>
        </div>
      )}
    </Section>
  );
};

const Volunteer = () => {
  const section = useArtboardStore((state) => state.resume.sections.volunteer);

  return (
    <Section<Volunteer> section={section} urlKey="url" summaryKey="summary">
      {(item) => (
        <div className="flex items-start justify-between">
          <div className="text-left">
            <LinkedEntity
              name={item.organization}
              url={item.url}
              separateLinks={section.separateLinks}
              className="font-bold text-slate-800"
            />
            <div className="text-slate-600">{item.position}</div>
          </div>

          <div className="shrink-0 text-right">
            <div className="font-semibold text-blue-600">{item.date}</div>
            <div className="text-sm text-slate-600">{item.location}</div>
          </div>
        </div>
      )}
    </Section>
  );
};

const Languages = () => {
  const section = useArtboardStore((state) => state.resume.sections.languages);

  return (
    <Section<Language> section={section} levelKey="level">
      {(item) => (
        <div className="space-y-1">
          <div className="font-bold text-slate-800">{item.name}</div>
          {item.description && <div className="text-sm text-slate-600">{item.description}</div>}
        </div>
      )}
    </Section>
  );
};

const Projects = () => {
  const section = useArtboardStore((state) => state.resume.sections.projects);

  return (
    <Section<Project> section={section} urlKey="url" summaryKey="summary" keywordsKey="keywords">
      {(item) => (
        <div className="flex items-start justify-between">
          <div className="text-left">
            <LinkedEntity
              name={item.name}
              url={item.url}
              separateLinks={section.separateLinks}
              className="font-bold text-slate-800"
            />
            <div className="text-sm text-slate-600">{item.description}</div>
          </div>

          <div className="shrink-0 text-right">
            <div className="font-semibold text-blue-600">{item.date}</div>
          </div>
        </div>
      )}
    </Section>
  );
};

const References = () => {
  const section = useArtboardStore((state) => state.resume.sections.references);

  return (
    <Section<Reference> section={section} urlKey="url" summaryKey="summary">
      {(item) => (
        <div>
          <LinkedEntity
            name={item.name}
            url={item.url}
            separateLinks={section.separateLinks}
            className="font-bold text-slate-800"
          />
          <div className="text-sm text-slate-600">{item.description}</div>
        </div>
      )}
    </Section>
  );
};

const Custom = ({ id }: { id: string }) => {
  const section = useArtboardStore((state) => state.resume.sections.custom[id]);

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
              className="font-bold text-slate-800"
            />
            <div className="text-sm text-slate-600">{item.description}</div>
          </div>

          <div className="shrink-0 text-right">
            <div className="font-semibold text-blue-600">{item.date}</div>
          </div>
        </div>
      )}
    </Section>
  );
};

const mapSectionToComponent = (section: SectionKey) => {
  switch (section) {
    case "profiles": {
      return <Profiles />;
    }
    case "summary": {
      return <Summary />;
    }
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
  return (
    <div className="p-custom space-y-4 bg-white">
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
