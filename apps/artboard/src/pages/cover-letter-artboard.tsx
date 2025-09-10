import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Outlet } from "react-router";

import { useArtboardStore } from "../store/artboard";

export const CoverLetterArtboardPage = () => {
  const coverLetter = useArtboardStore((state) => state.coverLetter);

  useEffect(() => {
    // Set page title
    if (coverLetter?.companyName) {
      document.title = `Cover Letter - ${coverLetter.companyName}`;
    } else {
      document.title = "Cover Letter";
    }
  }, [coverLetter?.companyName]);

  return (
    <>
      <Helmet>
        <title>
          {coverLetter?.companyName 
            ? `Cover Letter - ${coverLetter.companyName}` 
            : "Cover Letter"
          }
        </title>
      </Helmet>

      <div className="size-full">
        <Outlet />
      </div>
    </>
  );
};