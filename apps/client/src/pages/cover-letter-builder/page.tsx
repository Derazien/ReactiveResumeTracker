import { useCallback, useEffect } from "react";
import type { LoaderFunction } from "react-router";
import { redirect } from "react-router";

import { useCoverLetterSync } from "@/client/hooks/use-cover-letter-sync";
import { queryClient } from "@/client/libs/query-client";
import { type CoverLetterDto, findCoverLetterById } from "@/client/services/cover-letter";
import { useCoverLetterStore } from "@/client/stores/cover-letter";
import { useCoverLetterBuilderStore } from "@/client/stores/cover-letter-builder";

export const CoverLetterBuilderPage = () => {
  const frameRef = useCoverLetterBuilderStore((state) => state.frame.ref);
  const setFrameRef = useCoverLetterBuilderStore((state) => state.frame.setRef);

  const coverLetter = useCoverLetterSync(); // Use the sync hook to ensure proper re-renders
  const coverLetterData = useCoverLetterStore((state) => state.coverLetter);

  const syncCoverLetterToArtboard = useCallback(() => {
    setImmediate(() => {
      if (!frameRef?.contentWindow) return;
      console.log("Syncing cover letter to artboard:", coverLetter.data);
      const message = { type: "SET_COVER_LETTER", payload: coverLetter.data };
      frameRef.contentWindow.postMessage(message, "*");
    });
  }, [frameRef?.contentWindow, coverLetter.data]);

  // Send cover letter data to iframe on initial load
  useEffect(() => {
    if (!frameRef) return;

    frameRef.addEventListener("load", syncCoverLetterToArtboard);

    return () => {
      frameRef.removeEventListener("load", syncCoverLetterToArtboard);
    };
  }, [frameRef]);

  // Persistently check if iframe has loaded using setInterval
  useEffect(() => {
    const interval = setInterval(() => {
      if (frameRef?.contentWindow?.document.readyState === "complete") {
        syncCoverLetterToArtboard();
        clearInterval(interval);
      }
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [frameRef]);

  // Send cover letter data to iframe on change of cover letter data
  useEffect(syncCoverLetterToArtboard, [coverLetter.data]);

  // Listen for style changes from the style section and forward to artboard
  useEffect(() => {
    const handleStyleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      const { type, payload } = event.data;

      // Forward style metadata changes to artboard iframe
      if (type === "SET_COVER_LETTER_METADATA" && frameRef?.contentWindow) {
        frameRef.contentWindow.postMessage({ type: "SET_COVER_LETTER_METADATA", payload }, "*");
      }
    };

    window.addEventListener("message", handleStyleMessage);

    return () => {
      window.removeEventListener("message", handleStyleMessage);
    };
  }, [frameRef?.contentWindow]);

  return (
    <iframe
      ref={setFrameRef}
      title={`cover-letter-${coverLetterData?.id}`}
      src="/artboard/cover-letter/builder"
      className="size-full"
      onLoad={() => console.log("Cover letter iframe loaded")}
      onError={(e) => console.error("Cover letter iframe error:", e)}
    />
  );
};

export const coverLetterBuilderLoader: LoaderFunction<CoverLetterDto> = async ({ params }) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const id = params.id!;

    const coverLetter = await queryClient.fetchQuery({
      queryKey: ["cover-letters", { id }],
      queryFn: () => findCoverLetterById({ id }),
    });

    useCoverLetterStore.setState({ coverLetter });

    return coverLetter;
  } catch {
    return redirect("/dashboard/job-applications");
  }
};
