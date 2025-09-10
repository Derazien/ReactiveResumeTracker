import { t } from "@lingui/macro";
import {
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  Switch,
} from "@reactive-resume/ui";
import { HexColorPicker } from "react-colorful";
import { useEffect, useMemo, useState } from "react";

import { colors } from "@/client/constants/colors";

export const StyleSection = () => {
  // Use exact default colors from resume builder schema
  const [fontSize, setFontSize] = useState<number>(13);          // Resume default: 13
  const [lineHeight, setLineHeight] = useState<number>(1.5);     // Resume default: 1.5
  const [primary, setPrimary] = useState<string>("#313c4e");     // Resume default: #313c4e
  const [secondary, setSecondary] = useState<string>("#449399"); // Resume default: #449399
  const [background, setBackground] = useState<string>("#ffffff");
  const [text, setText] = useState<string>("#000000");           // Resume default: #000000
  const [underlineLinks, setUnderlineLinks] = useState<boolean>(true);  // Resume default: true
  const [hideIcons, setHideIcons] = useState<boolean>(false);
  // Page settings integrated into style
  const [pageFormat, setPageFormat] = useState<"a4" | "letter">("a4");
  const [pageMargin, setPageMargin] = useState<number>(18);

  const payload = useMemo(() => ({
    typography: {
      font: { family: "Ubuntu", subset: "latin", variants: ["regular"], size: fontSize }, // Use Ubuntu like resume
      lineHeight,
      underlineLinks,
      hideIcons,
    },
    theme: { primary, secondary, background, text },
    page: { format: pageFormat, margin: pageMargin },
  }), [fontSize, lineHeight, underlineLinks, hideIcons, primary, secondary, background, text, pageFormat, pageMargin]);

  const post = (data: any) => {
    // Send to main cover letter builder (which will forward to artboard)
    window.postMessage({ type: "SET_COVER_LETTER_METADATA", payload: data }, "*");
  };

  // Auto-apply changes when values change (like resume builder)
  useEffect(() => {
    post(payload);
  }, [payload, post]);

  return (
    <div className="space-y-6 p-4">
      <section className="grid gap-y-4">
        <h3 className="text-lg font-semibold">{t`Typography`}</h3>

        <div className="space-y-1.5">
          <Label>{t`Font Size`}</Label>
          <div className="flex items-center gap-x-4 py-1">
            <Slider min={8} max={18} step={0.1} value={[fontSize]} onValueChange={(v) => setFontSize(v[0])} />
            <span className="text-base font-bold">{fontSize}</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>{t`Line Height`}</Label>
          <div className="flex items-center gap-x-4 py-1">
            <Slider min={1} max={2} step={0.05} value={[lineHeight]} onValueChange={(v) => setLineHeight(v[0])} />
            <span className="text-base font-bold">{lineHeight}</span>
          </div>
        </div>

        <div className="flex items-center gap-x-4 py-1">
          <Switch checked={hideIcons} onCheckedChange={setHideIcons} />
          <Label>{t`Hide Icons`}</Label>
        </div>
        <div className="flex items-center gap-x-4 py-1">
          <Switch checked={underlineLinks} onCheckedChange={setUnderlineLinks} />
          <Label>{t`Underline Links`}</Label>
        </div>
      </section>

      <section className="grid gap-y-4">
        <h3 className="text-lg font-semibold">{t`Theme`}</h3>

        <div className="mb-2 grid grid-cols-6 flex-wrap justify-items-center gap-y-4">
          {colors.map((c) => (
            <div key={c} className="flex size-6 cursor-pointer items-center justify-center rounded-full ring-primary ring-offset-1 ring-offset-background transition-shadow hover:ring-1" onClick={() => setPrimary(c)}>
              <div className="size-5 rounded-full" style={{ backgroundColor: c }} />
            </div>
          ))}
        </div>

        {[{ key: "primary", value: primary, set: setPrimary }, { key: "secondary", value: secondary, set: setSecondary }, { key: "background", value: background, set: setBackground }, { key: "text", value: text, set: setText }].map(({ key, value, set }) => (
          <div key={key} className="space-y-1.5">
            <Label htmlFor={`theme.${key}`}>{t`${key[0].toUpperCase()}${key.slice(1)} Color`}</Label>
            <div className="relative">
              <Popover>
                <PopoverTrigger asChild>
                  <div className="absolute inset-y-0 left-3 my-2.5 size-4 cursor-pointer rounded-full ring-primary ring-offset-2 ring-offset-background transition-shadow hover:ring-1" style={{ backgroundColor: value }} />
                </PopoverTrigger>
                <PopoverContent className="rounded-lg border-none bg-transparent p-0">
                  <HexColorPicker color={value} onChange={(color) => set(color)} />
                </PopoverContent>
              </Popover>
              <Input id={`theme.${key}`} value={value} className="pl-10" onChange={(e) => set(e.target.value)} />
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-y-4">
        <h3 className="text-lg font-semibold">{t`Page Settings`}</h3>
        
        {/* Page Format */}
        <div className="space-y-1.5">
          <Label>{t`Format`}</Label>
          <Select
            value={pageFormat}
            onValueChange={(value: "a4" | "letter") => {
              setPageFormat(value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={t`Format`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a4">{t`A4`}</SelectItem>
              <SelectItem value="letter">{t`Letter`}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Page Margin */}
        <div className="space-y-1.5">
          <Label>{t`Margin`}</Label>
          <div className="flex items-center gap-x-4 py-1">
            <Slider
              min={0}
              max={48}
              step={2}
              value={[pageMargin]}
              onValueChange={(value) => {
                setPageMargin(value[0]);
              }}
            />
            <span className="text-base font-bold">{pageMargin}</span>
          </div>
        </div>

        {/* Format Info */}
        <div className="rounded-md bg-gray-50 p-3 text-xs text-gray-600">
          <p>
            <strong>{pageFormat.toUpperCase()}</strong> format
          </p>
          <p className="mt-1">
            {pageFormat === "a4" 
              ? "210 × 297 mm (8.27 × 11.7 in)" 
              : "215.9 × 279.4 mm (8.5 × 11 in)"
            }
          </p>
        </div>
      </section>
    </div>
  );
};



