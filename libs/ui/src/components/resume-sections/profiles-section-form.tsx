import type { Profile } from "@reactive-resume/schema";
import { Avatar, Input } from "@reactive-resume/ui";
import { forwardRef, useEffect } from "react";
import { useDebounceValue } from "usehooks-ts";

import { URLInput } from "../url-input";

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

export type ProfilesSectionFormProps = {
  values: Profile;
  errors?: Record<string, string>;
  onChange: (field: keyof Profile, value: Profile[keyof Profile]) => void;
  className?: string;
};

export const ProfilesSectionForm = ({
  values,
  errors = {},
  onChange,
  className = "",
}: ProfilesSectionFormProps) => {
  return (
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${className}`}>
      <div>
        <label className="mb-1 block text-sm font-medium">Network</label>
        <Input
          value={values.network}
          hasError={!!errors.network}
          placeholder="GitHub"
          onChange={(e) => {
            onChange("network", e.target.value);
          }}
        />
        {errors.network && <div className="mt-1 text-xs text-red-500">{errors.network}</div>}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Username</label>
        <Input
          value={values.username}
          hasError={!!errors.username}
          placeholder="john.doe"
          onChange={(e) => {
            onChange("username", e.target.value);
          }}
        />
        {errors.username && <div className="mt-1 text-xs text-red-500">{errors.username}</div>}
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1 block text-sm font-medium">Website</label>
        <URLInput
          value={values.url ?? { label: "", href: "" }}
          placeholder="https://github.com/johndoe"
          onChange={(value) => {
            onChange("url", value);
          }}
        />
        {errors.url && <div className="mt-1 text-xs text-red-500">{errors.url}</div>}
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1 block text-sm font-medium">Icon</label>
        <div className="flex items-center gap-x-2">
          <Avatar className="size-8 bg-white p-1.5">
            <IconPreview slug={values.icon} />
          </Avatar>
          <Input
            value={values.icon}
            hasError={!!errors.icon}
            placeholder="github"
            onChange={(e) => {
              onChange("icon", e.target.value);
            }}
          />
        </div>
        {errors.icon && <div className="mt-1 text-xs text-red-500">{errors.icon}</div>}
        <div className="text-muted-foreground ml-10 mt-1 text-xs">
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
