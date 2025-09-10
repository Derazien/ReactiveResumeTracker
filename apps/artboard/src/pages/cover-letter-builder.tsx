import { useEffect, useRef, useState } from "react";
import type { ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

import { useArtboardStore } from "../store/artboard";
import { CoverLetterTemplate } from "../templates/cover-letter";

export const CoverLetterBuilderPage = () => {
  const [wheelPanning, setWheelPanning] = useState(true);
  const transformRef = useRef<ReactZoomPanPinchRef>(null);
  const setCoverLetterMetadata = useArtboardStore((state) => state.setCoverLetterMetadata);
  const coverLetterMetadata = useArtboardStore((state) => state.coverLetterMetadata);
  
  // Helper to get current metadata
  const getCurrentMetadata = () => useArtboardStore.getState().coverLetterMetadata;

  // Initialize CSS custom properties like resume artboard
  useEffect(() => {
    if (!coverLetterMetadata) return;
    
    // Apply CSS custom properties for cover letter template (using resume defaults)
    document.documentElement.style.setProperty("--margin", `${coverLetterMetadata.page?.margin || 18}px`);
    document.documentElement.style.setProperty("--font-size", `${coverLetterMetadata.typography?.font?.size || 13}px`);
    document.documentElement.style.setProperty("--line-height", `${coverLetterMetadata.typography?.lineHeight || 1.5}`);
    document.documentElement.style.setProperty("--color-primary", coverLetterMetadata.theme?.primary || "#313c4e");
    document.documentElement.style.setProperty("--color-secondary", coverLetterMetadata.theme?.secondary || "#449399");
    document.documentElement.style.setProperty("--color-background", coverLetterMetadata.theme?.background || "#ffffff");
    document.documentElement.style.setProperty("--color-text", coverLetterMetadata.theme?.text || "#000000");
  }, [coverLetterMetadata]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      const { type, payload } = event.data;

      switch (type) {
        case "SET_COVER_LETTER_METADATA":
          setCoverLetterMetadata(payload);
          // Apply CSS custom properties immediately like resume artboard
          if (payload.page?.margin !== undefined) {
            document.documentElement.style.setProperty("--margin", `${payload.page.margin}px`);
          }
          if (payload.typography?.font?.size !== undefined) {
            document.documentElement.style.setProperty("--font-size", `${payload.typography.font.size}px`);
          }
          if (payload.typography?.lineHeight !== undefined) {
            document.documentElement.style.setProperty("--line-height", `${payload.typography.lineHeight}`);
          }
          if (payload.theme) {
            document.documentElement.style.setProperty("--color-primary", payload.theme.primary || "#313c4e");
            document.documentElement.style.setProperty("--color-secondary", payload.theme.secondary || "#449399");
            document.documentElement.style.setProperty("--color-background", payload.theme.background || "#ffffff");
            document.documentElement.style.setProperty("--color-text", payload.theme.text || "#000000");
          }
          break;
        // Legacy support for old message types
        case "COVER_LETTER_PAGE_FORMAT_CHANGED": {
          const currentMetadata = getCurrentMetadata();
          setCoverLetterMetadata({
            ...currentMetadata,
            page: { ...currentMetadata.page, format: payload.format }
          });
          break;
        }
        case "COVER_LETTER_PAGE_MARGIN_CHANGED": {
          const currentMetadata = getCurrentMetadata();
          setCoverLetterMetadata({
            ...currentMetadata,
            page: { ...currentMetadata.page, margin: payload.margin }
          });
          document.documentElement.style.setProperty("--margin", `${payload.margin}px`);
          break;
        }
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <TransformWrapper
      ref={transformRef}
      centerOnInit
      maxScale={2}
      minScale={0.4}
      initialScale={0.8}
      limitToBounds={false}
      wheel={{ wheelDisabled: wheelPanning }}
      panning={{ wheelPanning }}
    >
      <TransformComponent
        wrapperClass="!w-screen !h-screen"
        contentClass="grid items-start justify-center space-x-12 pointer-events-none"
      >
        <div className="pointer-events-auto">
          <CoverLetterTemplate />
        </div>
      </TransformComponent>
    </TransformWrapper>
  );
};