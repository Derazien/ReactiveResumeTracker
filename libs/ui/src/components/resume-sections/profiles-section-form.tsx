import type { Profile } from "@reactive-resume/schema";
import { URLInput } from "../url-input";
import { Input, Avatar } from "@reactive-resume/ui";
import { forwardRef, useEffect } from "react";
import { useDebounceValue } from "usehooks-ts";

// Simple icon preview component for the shared library
type IconPreviewProps = {
  slug: string;
};

const IconPreview = forwardRef<HTMLImageElement, IconPreviewProps>(({ slug }, ref) => {
  const [debouncedSlug, setValue] = useDebounceValue(slug, 600);

  useEffect(() => {
    setValue(slug);
  }, [slug]);

  if (!slug) return null;

  if (debouncedSlug === "linkedin") {
    return (
      <img
        ref={ref}
        alt="LinkedIn"
        className="size-5"
        src={`${window.location.origin}/support-logos/linkedin.svg`}
      />
    );
  }

  return (
    <img
      ref={ref}
      alt={debouncedSlug}
      className="size-5"
      src={`https://cdn.simpleicons.org/${debouncedSlug}`}
    />
  );
});

IconPreview.displayName = "IconPreview";

export interface ProfilesSectionFormProps {
  values: Profile;
  errors?: Record<string, string>;
  onChange: (field: keyof Profile, value: Profile[keyof Profile]) => void;
  className?: string;
}

export const ProfilesSectionForm = ({
  values,
  errors = {},
  onChange,
  className = "",
}: ProfilesSectionFormProps) => {
  return (
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${className}`}>
      <div>
        <label className="block text-sm font-medium mb-1">Network</label>
        <Input
          value={values.network}
          onChange={(e) => onChange("network", e.target.value)}
          hasError={!!errors.network}
          placeholder="GitHub"
        />
        {errors.network && <div className="text-xs text-red-500 mt-1">{errors.network}</div>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Username</label>
        <Input
          value={values.username}
          onChange={(e) => onChange("username", e.target.value)}
          hasError={!!errors.username}
          placeholder="john.doe"
        />
        {errors.username && <div className="text-xs text-red-500 mt-1">{errors.username}</div>}
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium mb-1">Website</label>
        <URLInput
          value={values.url ?? { label: "", href: "" }}
          onChange={(value) => onChange("url", value)}
          placeholder="https://github.com/johndoe"
        />
        {errors.url && <div className="text-xs text-red-500 mt-1">{errors.url}</div>}
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium mb-1">Icon</label>
        <div className="flex items-center gap-x-2">
          <Avatar className="size-8 bg-white p-1.5">
            <IconPreview slug={values.icon} />
          </Avatar>
          <Input
            value={values.icon}
            onChange={(e) => onChange("icon", e.target.value)}
            hasError={!!errors.icon}
            placeholder="github"
          />
        </div>
        {errors.icon && <div className="text-xs text-red-500 mt-1">{errors.icon}</div>}
        <div className="ml-10 text-xs text-muted-foreground mt-1">
          Powered by{" "}
          <a
            href="https://simpleicons.org/"
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="font-medium"
          >
            Simple Icons
          </a>
        </div>
      </div>
    </div>
  );
}; 