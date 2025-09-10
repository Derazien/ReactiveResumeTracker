import { useEffect } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Outlet } from "react-router";

import { helmetContext } from "../constants/helmet";
import { useArtboardStore } from "../store/artboard";

export const Providers = () => {
  const resume = useArtboardStore((state) => state.resume);
  const setResume = useArtboardStore((state) => state.setResume);
  const setCoverLetter = useArtboardStore((state) => state.setCoverLetter);
  const setCoverLetterMetadata = useArtboardStore((state) => state.setCoverLetterMetadata);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data.type === "SET_RESUME") setResume(event.data.payload);
      if (event.data.type === "SET_COVER_LETTER") setCoverLetter(event.data.payload);
      if (event.data.type === "SET_COVER_LETTER_METADATA") setCoverLetterMetadata(event.data.payload);
    };

    window.addEventListener("message", handleMessage, false);

    return () => {
      window.removeEventListener("message", handleMessage, false);
    };
  }, [setResume, setCoverLetter, setCoverLetterMetadata]);

  useEffect(() => {
    const resumeData = window.localStorage.getItem("resume");
    const coverLetterData = window.localStorage.getItem("coverLetter");

    if (resumeData) setResume(JSON.parse(resumeData));
    if (coverLetterData) setCoverLetter(JSON.parse(coverLetterData));
  }, [setCoverLetter]);

  // Only require resume for resume-related pages, not cover letter pages
  const currentPath = window.location.pathname;
  const isCoverLetterArtboard = currentPath.includes('/cover-letter/');
  
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!resume && !isCoverLetterArtboard) return null;

  return (
    <HelmetProvider context={helmetContext}>
      <Outlet />
    </HelmetProvider>
  );
};
