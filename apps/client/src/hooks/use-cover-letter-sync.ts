import { useCallback, useEffect } from "react";
import { defaultMetadata } from "@reactive-resume/schema";
import { useParams } from "react-router";

import { useCoverLetter, useUpdateCoverLetter } from "@/client/services/cover-letter";
import { useCoverLetterStore } from "@/client/stores/cover-letter";
import { useCoverLetterBuilderStore } from "@/client/stores/cover-letter-builder";

export const useCoverLetterSync = () => {
  const { id } = useParams<{ id: string }>();
  const frameRef = useCoverLetterBuilderStore((state) => state.frame.ref);
  const coverLetter = useCoverLetterStore((state) => state.coverLetter);
  const setCoverLetter = useCoverLetterStore((state) => state.setCoverLetter);
  const updateCoverLetterInStore = useCoverLetterStore((state) => state.updateCoverLetter);
  
  // Load cover letter from database
  const { data, isLoading, error } = useCoverLetter(id || "");
  const { updateCoverLetter } = useUpdateCoverLetter();

  // Helper function - data should already be enhanced from backend
  const enhanceCoverLetterWithMetadata = useCallback((rawCoverLetter: any) => {
    if (!rawCoverLetter) return null;
    
    // Backend already enhances data - just ensure backwards compatibility
    return {
      ...rawCoverLetter,
      // Ensure usedContent is always parsed
      usedContent: JSON.parse(rawCoverLetter.generatedFrom || "[]"),
    };
  }, []);

  // Sync cover letter data from API to store with metadata enhancement
  useEffect(() => {
    if (data && (!coverLetter || coverLetter.id !== data.id)) {
      const enhancedCoverLetter = enhanceCoverLetterWithMetadata(data);
      setCoverLetter(enhancedCoverLetter);
    }
  }, [data, coverLetter, setCoverLetter, enhanceCoverLetterWithMetadata]);

  // Function to sync data to artboard
  const syncToArtboard = useCallback(() => {
    if (!frameRef?.contentWindow || !coverLetter) return;

    frameRef.contentWindow.postMessage({ type: "SET_COVER_LETTER", payload: coverLetter }, "*");
    // Initialize default style metadata for cover letters in the artboard
    frameRef.contentWindow.postMessage(
      { type: "SET_COVER_LETTER_METADATA", payload: { ...defaultMetadata } },
      "*",
    );
  }, [frameRef?.contentWindow, coverLetter]);

  // Sync to artboard whenever cover letter changes
  useEffect(() => {
    if (coverLetter) {
      syncToArtboard();
    }
  }, [coverLetter, syncToArtboard]);

  const updateContent = useCallback(
    async (content: string) => {
      if (!coverLetter) return;

      // Update local store immediately for UI responsiveness
      updateCoverLetterInStore({ content });

      // Update in database
      try {
        await updateCoverLetter({ id: coverLetter.id, data: { content } });
      } catch (error) {
        // Revert local change on error
        updateCoverLetterInStore({ content: coverLetter.content });
      }
    },
    [coverLetter, updateCoverLetterInStore, updateCoverLetter],
  );

  const updateTemplate = useCallback(
    async (templateName: string) => {
      if (!coverLetter) return;

      // Update local store immediately for UI responsiveness
      updateCoverLetterInStore({ templateName });

      // Update in database
      try {
        await updateCoverLetter({ id: coverLetter.id, data: { templateName } });
      } catch (error) {
        // Revert local change on error
        updateCoverLetterInStore({ templateName: coverLetter.templateName });
      }
    },
    [coverLetter, updateCoverLetterInStore, updateCoverLetter],
  );

  const updateTone = useCallback(
    async (tone: string) => {
      if (!coverLetter) return;

      // Update local store immediately for UI responsiveness
      updateCoverLetterInStore({ tone });

      // Update in database
      try {
        await updateCoverLetter({ id: coverLetter.id, data: { tone } });
      } catch (error) {
        // Revert local change on error
        updateCoverLetterInStore({ tone: coverLetter.tone });
      }
    },
    [coverLetter, updateCoverLetterInStore, updateCoverLetter],
  );

  const updateUsedContent = useCallback((usedContent: any[]) => {
    if (!coverLetter) return;
    updateCoverLetterInStore({ usedContent });
  }, [coverLetter, updateCoverLetterInStore]);

  const updateCompanyInfo = useCallback((companyInfo: {
    companyName?: string;
    companyAddress?: string;
    recipientName?: string;
    recipientTitle?: string;
  }) => {
    if (!coverLetter) return;
    updateCoverLetterInStore(companyInfo);
  }, [coverLetter, updateCoverLetterInStore]);

  const updateSenderInfo = useCallback((senderInfo: {
    senderName?: string;
    senderEmail?: string;
    senderPhone?: string;
    senderAddress?: string;
    basics?: any; // Allow basics structure updates
  }) => {
    if (!coverLetter) return;
    updateCoverLetterInStore(senderInfo);
  }, [coverLetter, updateCoverLetterInStore]);

  const updateSelectedStories = useCallback((selectedStoryIds: string[]) => {
    if (!coverLetter) return;
    updateCoverLetterInStore({ selectedStoryIds });
  }, [coverLetter, updateCoverLetterInStore]);

  const updateHeaderData = useCallback((headerData: any) => {
    if (!coverLetter) return;
    updateCoverLetterInStore({ 
      headerData: { ...(coverLetter.headerData || {}), ...headerData } 
    });
  }, [coverLetter, updateCoverLetterInStore]);

  // updateBodyContent removed - using consolidated updateContent method

  return {
    data: coverLetter,
    isLoading,
    error,
    updateContent,
    updateTemplate,
    updateTone,
    updateUsedContent,
    updateCompanyInfo,
    updateSenderInfo,
    updateSelectedStories,
    updateHeaderData,
    syncToArtboard,
  };
};
