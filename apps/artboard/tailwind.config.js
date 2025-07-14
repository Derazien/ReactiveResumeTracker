const { createGlobPatternsForDependencies } = require("@nx/react/tailwind");
const { join } = require("path");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    join(__dirname, "{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}"),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      colors: {
        foreground: "var(--color-foreground)",
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        background: "var(--color-background)",
      },
      gridTemplateColumns: {
        '10': 'repeat(10, minmax(0, 1fr))',
        '20': 'repeat(20, minmax(0, 1fr))',
      },
      lineHeight: {
        tight: "calc(var(--line-height) - 0.5)",
        snug: "calc(var(--line-height) - 0.3)",
        normal: "var(--line-height)",
        relaxed: "calc(var(--line-height) + 0.3)",
        loose: "calc(var(--line-height) + 0.5)",
      },
      spacing: { custom: "var(--margin)" },
      fontSize: {
        body: ["1rem"], // 16 px
        meta: ["0.875rem"], // 14 px
        chip: ["0.75rem"], // 12 px
        title: ["1.375rem"], // 22 px
        section: ["1.75rem", { lineHeight: "2rem" }], // 28 px
        h1: ["2.875rem", { lineHeight: "3rem" }], // 46 px
      },
      typography: () => ({
        foreground: {
          css: {
            "--tw-prose-body": "var(--color-foreground)",
            "--tw-prose-headings": "var(--color-foreground)",
            "--tw-prose-lead": "var(--color-foreground)",
            "--tw-prose-links": "var(--color-foreground)",
            "--tw-prose-bold": "var(--color-foreground)",
            "--tw-prose-counters": "var(--color-foreground)",
            "--tw-prose-bullets": "var(--color-foreground)",
            "--tw-prose-hr": "var(--color-foreground)",
            "--tw-prose-quotes": "var(--color-foreground)",
            "--tw-prose-quote-borders": "var(--color-foreground)",
            "--tw-prose-captions": "var(--color-foreground)",
            "--tw-prose-code": "var(--color-foreground)",
            "--tw-prose-pre-code": "var(--color-foreground)",
            "--tw-prose-pre-bg": "var(--color-background)",
            "--tw-prose-th-borders": "var(--color-foreground)",
            "--tw-prose-td-borders": "var(--color-foreground)",
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
