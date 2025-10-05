# Localization Rules for Frontend Development

## Overview
This document establishes rules for proper internationalization (i18n) in the Reactive Resume Tracker frontend application using Lingui.

## Core Rule: NO HARDCODED TEXT IN FRONTEND COMPONENTS

### ✅ DO: Use Lingui Translation Macro
```tsx
import { t } from "@lingui/macro";

// All user-facing text MUST use the t macro
<h1>{t`Welcome to Job Applications`}</h1>
<button>{t`Submit Application`}</button>
<Input placeholder={t`Enter your email address`} />
<SelectValue placeholder={t`Select an option`} />
```

### ❌ DON'T: Hardcode Text Strings
```tsx
// NEVER hardcode user-facing text
<h1>Welcome to Job Applications</h1>  // ❌ WRONG
<button>Submit Application</button>   // ❌ WRONG
<Input placeholder="Enter your email" />  // ❌ WRONG
<SelectValue placeholder="Select option" />  // ❌ WRONG
```

## What Must Be Localized

### 1. All User-Facing Text
- Button labels
- Form labels and placeholders
- Error messages
- Success messages
- Page titles and headings
- Navigation items
- Tooltips and help text
- Status labels
- Loading messages

### 2. Dynamic Content with Text
- Count displays: `{count} {count === 1 ? t`item` : t`items`}`
- Date formatting: Use localized date libraries
- Number formatting: Use localized number formatting

### 3. Placeholder Text
```tsx
// ✅ CORRECT
<Input placeholder={t`Enter job title`} />
<Textarea placeholder={t`Describe your experience...`} />

// ❌ WRONG
<Input placeholder="Enter job title" />
<Textarea placeholder="Describe your experience..." />
```

## Implementation Guidelines

### 1. Import Statement
Every component that displays text must import the Lingui macro:
```tsx
import { t } from "@lingui/macro";
```

### 2. Translation Extraction
After adding new translatable strings:
```bash
pnpm run messages:extract
pnpm exec lingui compile
```

### 3. Testing Translations
- Test with different locales to ensure proper display
- Verify that fallback to English works correctly
- Check that text doesn't overflow in different languages

## Exceptions

### 1. Technical Identifiers
```tsx
// Technical values that don't change across locales
<option value="en-US">en-US</option>
<option value="fr-FR">fr-FR</option>
```

### 2. URLs and Paths
```tsx
// URLs and file paths remain unchanged
<Link to="/dashboard/settings">...</Link>
```

### 3. Code Comments
```tsx
// Comments can be in English for developers
// This function handles user authentication
```

### 4. Console Logs
```tsx
// Development logs can be in English
console.log("User clicked submit button");
```

## Code Review Checklist

When reviewing frontend code, ensure:

- [ ] All user-facing text uses `t` macro
- [ ] No hardcoded strings in JSX
- [ ] Placeholder text is localized
- [ ] Error messages are localized
- [ ] Import statement includes `t` from `@lingui/macro`
- [ ] Dynamic content handles pluralization correctly

## Common Patterns

### Pluralization
```tsx
// ✅ CORRECT
<span>{count} {count === 1 ? t`resume` : t`resumes`}</span>

// Or using ICU message format for complex pluralization
<span>{i18n._(msg`{count, plural, one {# resume} other {# resumes}}`, { count })}</span>
```

### Conditional Text
```tsx
// ✅ CORRECT
<span>{isActive ? t`Active` : t`Inactive`}</span>
```

### Dynamic Placeholders
```tsx
// ✅ CORRECT
<Input placeholder={t`Search by ${searchType}...`} />
```

## Enforcement

### ESLint Rule
The project uses `eslint-plugin-lingui` to enforce localization rules:
- `@lingui/no-unlocalized-strings` - Prevents hardcoded strings
- `@lingui/no-unused-strings` - Removes unused translations

### Pre-commit Hooks
Translation extraction is run automatically to ensure all strings are captured.

## Adding New Languages

1. Add locale to `lingui.config.ts`
2. Run `pnpm run messages:extract`
3. Translate the generated `.po` files
4. Test the new locale thoroughly

## Resources

- [Lingui Documentation](https://lingui.dev/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- [React i18n Best Practices](https://react.i18next.com/)
