import { createBrowserRouter, createRoutesFromChildren, Route } from "react-router";

import { ArtboardPage } from "../pages/artboard";
import { BuilderLayout } from "../pages/builder";
import { CoverLetterBuilderPage } from "../pages/cover-letter-builder";
import { PreviewLayout } from "../pages/preview";
import { Providers } from "../providers";

export const routes = createRoutesFromChildren(
  <Route element={<Providers />}>
    <Route path="artboard" element={<ArtboardPage />}>
      <Route path="builder" element={<BuilderLayout />} />
      <Route path="preview" element={<PreviewLayout />} />
      {/* Cover letter routes under the same /artboard namespace so client dev proxy serves them */}
      <Route path="cover-letter">
        <Route path="builder" element={<CoverLetterBuilderPage />} />
        <Route path="preview" element={<CoverLetterBuilderPage />} />
      </Route>
    </Route>
  </Route>,
);

export const router = createBrowserRouter(routes);
