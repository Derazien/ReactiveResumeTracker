import { useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Outlet, useLocation } from "react-router";
import webfontloader from "webfontloader";

import { useArtboardStore } from "../store/artboard";

export const ArtboardPage = () => {
  const location = useLocation();
  const isCoverLetterRoute = location.pathname.includes('/cover-letter/');
  
  const resume = useArtboardStore((state) => state.resume);
  const coverLetter = useArtboardStore((state) => state.coverLetter);
  const coverLetterMetadata = useArtboardStore((state) => state.coverLetterMetadata);
  
  // Use appropriate data based on route
  const name = isCoverLetterRoute 
    ? (coverLetter?.senderName || "Cover Letter")
    : (resume?.basics?.name || "Resume");
  const metadata = isCoverLetterRoute ? coverLetterMetadata : resume?.metadata;

  const fontString = useMemo(() => {
    if (!metadata?.typography?.font) return "Inter:400,500,600,700:latin";
    
    const family = metadata.typography.font.family;
    const variants = metadata.typography.font.variants.join(",");
    const subset = metadata.typography.font.subset;

    return `${family}:${variants}:${subset}`;
  }, [metadata?.typography?.font]);

  useEffect(() => {
    webfontloader.load({
      google: { families: [fontString] },
      active: () => {
        const width = window.document.body.offsetWidth;
        const height = window.document.body.offsetHeight;
        const message = { type: "PAGE_LOADED", payload: { width, height } };
        window.postMessage(message, "*");
      },
    });
  }, [fontString]);

  // Font Size & Line Height
  useEffect(() => {
    if (!metadata) return;
    
    document.documentElement.style.setProperty("font-size", `${metadata.typography?.font?.size || 14}px`);
    document.documentElement.style.setProperty("line-height", `${metadata.typography?.lineHeight || 1.5}`);

    document.documentElement.style.setProperty("--margin", `${metadata.page?.margin || 18}px`);
    document.documentElement.style.setProperty("--font-size", `${metadata.typography?.font?.size || 14}px`);
    document.documentElement.style.setProperty(
      "--line-height",
      `${metadata.typography?.lineHeight || 1.5}`,
    );

    document.documentElement.style.setProperty("--color-foreground", metadata.theme?.text || "#000000");
    document.documentElement.style.setProperty("--color-primary", metadata.theme?.primary || "#0891b2");
    document.documentElement.style.setProperty("--color-secondary", metadata.theme?.secondary || "#64748b");
    document.documentElement.style.setProperty("--color-background", metadata.theme?.background || "#ffffff");
  }, [metadata]);

  // Typography Options
  useEffect(() => {
    if (!metadata?.typography) return;
    
    // eslint-disable-next-line unicorn/prefer-spread
    const elements = Array.from(document.querySelectorAll(`[data-page]`));

    for (const el of elements) {
      el.classList.toggle("hide-icons", metadata.typography.hideIcons || false);
      el.classList.toggle("underline-links", metadata.typography.underlineLinks || false);
    }
  }, [metadata?.typography]);

  return (
    <>
      <Helmet>
        <title>{name} | Reactive Resume</title>
        {metadata?.css?.visible && (
          <style id="custom-css" lang="css">
            {metadata.css.value}
          </style>
        )}
      </Helmet>

      <Outlet />
    </>
  );
};
