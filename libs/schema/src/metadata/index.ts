import { z } from "zod";

export const defaultLayout = [
  [
    ["summary", "experience", "education", "volunteer", "references"],
    ["profiles", "skills", "projects", "certifications", "languages", "interests", "awards", "publications"],
  ],
];

// Schema
export const metadataSchema = z.object({
  template: z.string().default("novoresume"),
  layout: z.array(z.array(z.array(z.string()))).default(defaultLayout), // pages -> columns -> sections
  css: z.object({
    value: z.string().default("* {\n\toutline: 1px solid #000;\n\toutline-offset: 4px;\n}"),
    visible: z.boolean().default(false),
  }),
  page: z.object({
    margin: z.number().default(18),
    format: z.enum(["a4", "letter"]).default("a4"),
    options: z.object({
      breakLine: z.boolean().default(true),
      pageNumbers: z.boolean().default(true),
    }),
  }),
  theme: z.object({
    background: z.string().default("#ffffff"),
    text: z.string().default("#000000"),
    primary: z.string().default("#313c4e"),
    secondary: z.string().default("#449399"),
  }),
  typography: z.object({
    font: z.object({
      family: z.string().default("Ubuntu"),
      subset: z.string().default("latin"),
      variants: z.array(z.string()).default(["regular"]),
      size: z.number().default(13),
    }),
    lineHeight: z.number().default(1.5),
    hideIcons: z.boolean().default(false),
    underlineLinks: z.boolean().default(true),
  }),
  notes: z.string().default(""),
  columnSplit: z.number().min(30).max(70).default(50),
});

// Type
export type Metadata = z.infer<typeof metadataSchema>;

// Defaults
export const defaultMetadata: Metadata = {
  template: "novoresume",
  layout: defaultLayout,
  css: {
    value: "* {\n\toutline: 1px solid #000;\n\toutline-offset: 4px;\n}",
    visible: false,
  },
  page: {
    margin: 18,
    format: "a4",
    options: {
      breakLine: true,
      pageNumbers: true,
    },
  },
  theme: {
    background: "#ffffff",
    text: "#000000",
    primary: "#313c4e",
    secondary: "#449399",
  },
  typography: {
    font: {
      family: "Ubuntu",
      subset: "latin",
      variants: ["regular", "italic", "600"],
      size: 13,
    },
    lineHeight: 1.5,
    hideIcons: false,
    underlineLinks: true,
  },
  notes: "",
  columnSplit: 50,
};
