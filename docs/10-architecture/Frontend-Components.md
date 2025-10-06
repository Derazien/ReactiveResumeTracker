# Frontend Components Map

**Last Updated**: 2025-01-27  
**Purpose**: Comprehensive catalog of all frontend components, their localization status, and hardcoded strings  
**Related**: [Modules.md](./Modules.md) — Module organization and dependencies

---

## 🎯 Overview

This document provides a complete map of all frontend components across both `apps/client` and `apps/artboard`, with focus on localization compliance and hardcoded strings that need to be wrapped with the `t` macro.

**Localization Status Legend:**
- ✅ **Fully Localized** - All user-facing strings use `t` macro
- ⚠️ **Partially Localized** - Some strings still hardcoded
- ❌ **Not Localized** - Contains hardcoded strings
- 🔍 **Needs Review** - Requires manual inspection

---

## 📱 Client App (`apps/client`)

### 🏠 Home & Landing Pages

#### `pages/home/`
- `components/footer.tsx` - ❌ Contains hardcoded alt texts ("Powered by DigitalOcean", "GitHub Sponsors", "Open Collective", "PayPal", "Crowdin")
- `sections/hero/index.tsx` - ❌ Contains hardcoded alt text ("Reactive Resume - Screenshot - Builder Screen")
- `sections/features/index.tsx` - ❌ Contains hardcoded alt texts ("React", "Vite", "TailwindCSS", "NestJS", "Google Chrome", "PostgreSQL")
- `sections/support/index.tsx` - ❌ Contains hardcoded alt texts ("GitHub Sponsors", "Open Collective", "PayPal", "Crowdin")

### 🔐 Authentication Pages

#### `pages/auth/`
- `layout.tsx` - ❌ Contains hardcoded alt text ("Open books on a table")
- `login/page.tsx` - ❌ Contains hardcoded placeholder ("john.doe@example.com")
- `register/page.tsx` - ❌ Contains hardcoded message ("John Doe")
- `verify-otp/page.tsx` - ❌ Contains hardcoded placeholder ("123456")
- `forgot-password/page.tsx` - ❌ Contains hardcoded placeholder ("john.doe@example.com")
- `backup-otp/page.tsx` - ❌ Contains hardcoded placeholder ("a1b2c3d4e5")
- `two-factor-authentication/` - ⚠️ Partially localized (some hardcoded strings remain)

### 🏗️ Resume Builder (`pages/builder/`)

#### Main Builder
- `page.tsx` - ✅ Fully localized
- `_components/toolbar.tsx` - ✅ Fully localized
- `_components/content-selection-dialog.tsx` - ✅ Fully localized
- `_components/content-relationship-indicator.tsx` - ✅ Fully localized

#### Left Sidebar Sections
- `sidebars/left/sections/basics.tsx` - ✅ Fully localized
- `sidebars/left/sections/summary.tsx` - ✅ Fully localized
- `sidebars/left/sections/shared/section-base.tsx` - ❌ Contains hardcoded string ("Content Library Items Used")
- `sidebars/left/sections/shared/section-list-item.tsx` - ✅ Fully localized
- `sidebars/left/sections/shared/section-options.tsx` - ✅ Fully localized
- `sidebars/left/sections/shared/section-dialog.tsx` - ✅ Fully localized
- `sidebars/left/sections/custom/section.tsx` - ✅ Fully localized
- `sidebars/left/index.tsx` - ✅ Fully localized

#### Left Sidebar Dialogs
- `sidebars/left/dialogs/experience.tsx` - ✅ Fully localized
- `sidebars/left/dialogs/education.tsx` - ✅ Fully localized
- `sidebars/left/dialogs/skills.tsx` - ✅ Fully localized
- `sidebars/left/dialogs/projects.tsx` - ✅ Fully localized
- `sidebars/left/dialogs/certifications.tsx` - ✅ Fully localized
- `sidebars/left/dialogs/awards.tsx` - ✅ Fully localized
- `sidebars/left/dialogs/publications.tsx` - ✅ Fully localized
- `sidebars/left/dialogs/interests.tsx` - ✅ Fully localized
- `sidebars/left/dialogs/languages.tsx` - ✅ Fully localized
- `sidebars/left/dialogs/volunteer.tsx` - ✅ Fully localized
- `sidebars/left/dialogs/references.tsx` - ✅ Fully localized
- `sidebars/left/dialogs/profiles.tsx` - ✅ Fully localized
- `sidebars/left/dialogs/custom-section.tsx` - ✅ Fully localized

#### Right Sidebar Sections
- `sidebars/right/sections/theme.tsx` - ✅ Fully localized
- `sidebars/right/sections/typography.tsx` - ❌ Contains hardcoded font names ("Arial", "Cambria", "Garamond", "Times New Roman", "Open Sans", "Playfair Display", "Roboto Condensed")
- `sidebars/right/sections/layout.tsx` - ✅ Fully localized
- `sidebars/right/sections/notes.tsx` - ✅ Fully localized
- `sidebars/right/sections/page.tsx` - ✅ Fully localized
- `sidebars/right/index.tsx` - ✅ Fully localized

### 📊 Dashboard Pages

#### Main Dashboard
- `_components/sidebar.tsx` - ✅ Fully localized

#### Job Applications
- `job-applications/page.tsx` - ✅ Fully localized
- `job-applications/[id]/page.tsx` - ✅ Fully localized
- `job-applications/[id]/edit/page.tsx` - ✅ Fully localized
- `job-applications/new/page.tsx` - ✅ Fully localized
- `job-applications/_components/job-application-card.tsx` - ✅ Fully localized
- `job-applications/_components/job-applications-table.tsx` - ✅ Fully localized
- `job-applications/_components/job-applications-filter.tsx` - ✅ Fully localized
- `job-applications/_components/automation-toolbar.tsx` - ✅ Fully localized
- `job-applications/new/_components/job-url-form.tsx` - ✅ Fully localized
- `job-applications/new/_components/manual-job-form.tsx` - ✅ Fully localized
- `job-applications/[id]/_components/content-selection-panel.tsx` - ✅ Fully localized

#### Companies
- `companies/page.tsx` - ✅ Fully localized
- `companies/[id]/page.tsx` - ✅ Fully localized
- `companies/[id]/edit/page.tsx` - ✅ Fully localized

#### Content Library
- `content-library/page.tsx` - ✅ Fully localized
- `content-library/_components/content-edit-dialog.tsx` - ✅ Fully localized
- `content-library/_components/cover-letter-story-dialog.tsx` - ❌ Contains hardcoded dialog titles ("Edit Cover Letter Story", "Create Cover Letter Story")
- `content-library/_components/cv-upload-dialog.tsx` - ✅ Fully localized

#### Cover Letter Stories
- `cover-letter-stories/page.tsx` - ✅ Fully localized
- `cover-letter-stories/_components/cover-letter-story-dialog.tsx` - ❌ Contains hardcoded dialog titles ("Edit Cover Letter Story", "Create Cover Letter Story")
- `cover-letter-stories/_components/story-interview-dialog.tsx` - ✅ Fully localized

#### Voice Stories
- `voice-stories/page.tsx` - ✅ Fully localized
- `voice-stories/_components/voice-story-wizard.tsx` - ✅ Fully localized (including STORY_PROMPTS and ANSWER_PROMPTS)
- `voice-stories/_components/story-blocks-list.tsx` - ✅ Fully localized
- `voice-stories/_components/answer-snippets-list.tsx` - ✅ Fully localized

#### Automation
- `automation/page.tsx` - ✅ Fully localized

#### Settings
- `settings/page.tsx` - ✅ Fully localized
- `settings/_sections/account.tsx` - ❌ Contains hardcoded placeholder ("https://...")
- `settings/_sections/danger.tsx` - ❌ Contains hardcoded placeholder ("delete")
- `settings/_sections/llm.tsx` - ✅ Fully localized
- `settings/_dialogs/two-factor.tsx` - ❌ Contains hardcoded placeholder ("123456")

#### Resumes
- `resumes/_layouts/grid/_components/resume-card.tsx` - ✅ Fully localized

### 💌 Cover Letter Builder (`pages/cover-letter-builder/`)

#### Main Pages
- `page.tsx` - ✅ Fully localized
- `layout.tsx` - ✅ Fully localized
- `_components/header.tsx` - ✅ Fully localized
- `_components/toolbar.tsx` - ✅ Fully localized
- `_components/story-creation-dialog.tsx` - ✅ Fully localized

#### Left Sidebar
- `sidebars/left/index.tsx` - ✅ Fully localized
- `sidebars/left/sections/content.tsx` - ✅ Fully localized
- `sidebars/left/sections/interview.tsx` - ✅ Fully localized
- `sidebars/left/sections/settings.tsx` - ✅ Fully localized

#### Right Sidebar
- `sidebars/right/index.tsx` - ✅ Fully localized
- `sidebars/right/sections/preview.tsx` - ✅ Fully localized
- `sidebars/right/sections/company.tsx` - ✅ Fully localized
- `sidebars/right/sections/contacts.tsx` - ✅ Fully localized
- `sidebars/right/sections/style.tsx` - ✅ Fully localized
- `sidebars/right/sections/export.tsx` - ✅ Fully localized

### 🔧 Shared Components (`components/`)

- `logo.tsx` - ❌ Contains hardcoded alt text ("Reactive Resume")
- `icon.tsx` - ❌ Contains hardcoded alt text ("Reactive Resume")
- `brand-icon.tsx` - ❌ Contains hardcoded alt text ("LinkedIn")
- `copyright.tsx` - ✅ Fully localized
- `ai-actions.tsx` - ✅ Fully localized
- `company-autocomplete.tsx` - ✅ Fully localized
- `chrome-remote-control.tsx` - ✅ Fully localized

### 🛠️ Services (`services/`)

#### Resume Services
- `resume/print.tsx` - ✅ Fully localized
- `resume/update.tsx` - ✅ Fully localized

#### Cover Letter Services
- `cover-letter/print.tsx` - ✅ Fully localized

#### Auth Services
- `auth/two-factor-authentication/verify-otp.tsx` - ✅ Fully localized
- `auth/two-factor-authentication/backup-otp.tsx` - ✅ Fully localized

### 🔌 Providers (`providers/`)

- `index.tsx` - ✅ Fully localized
- `locale.tsx` - ✅ Fully localized
- `theme.tsx` - ✅ Fully localized
- `dialog.tsx` - ✅ Fully localized
- `toaster.tsx` - ✅ Fully localized
- `auth-refresh.tsx` - ✅ Fully localized
- `llm.tsx` - ✅ Fully localized

### 🛣️ Router (`router/`)

- `index.tsx` - ✅ Fully localized
- `guards/auth.tsx` - ✅ Fully localized

### 🌐 Public Pages (`pages/public/`)

- `page.tsx` - ✅ Fully localized
- `error.tsx` - ✅ Fully localized

---

## 🎨 Artboard App (`apps/artboard`)

### 📄 Main Pages
- `pages/artboard.tsx` - ✅ Fully localized
- `pages/cover-letter-artboard.tsx` - ✅ Fully localized
- `pages/cover-letter-builder.tsx` - ✅ Fully localized
- `pages/builder.tsx` - ✅ Fully localized
- `pages/preview.tsx` - ✅ Fully localized

### 🧩 Components
- `components/picture.tsx` - ✅ Fully localized
- `components/brand-icon.tsx` - ✅ Fully localized
- `components/page.tsx` - ✅ Fully localized

### 📋 Templates
- `templates/cover-letter.tsx` - ✅ Fully localized
- `templates/nosepass.tsx` - ✅ Fully localized
- `templates/novoresume.tsx` - ✅ Fully localized
- `templates/onyx.tsx` - ✅ Fully localized
- `templates/ditto.tsx` - ✅ Fully localized
- `templates/leafish.tsx` - ✅ Fully localized
- `templates/chikorita.tsx` - ✅ Fully localized
- `templates/rhyhorn.tsx` - ✅ Fully localized
- `templates/kakuna.tsx` - ✅ Fully localized
- `templates/glalie.tsx` - ✅ Fully localized
- `templates/pikachu.tsx` - ✅ Fully localized
- `templates/gengar.tsx` - ✅ Fully localized
- `templates/bronzor.tsx` - ✅ Fully localized
- `templates/azurill.tsx` - ✅ Fully localized
- `templates/index.tsx` - ✅ Fully localized

### 🔌 Providers
- `providers/index.tsx` - ✅ Fully localized

### 🛣️ Router
- `router/index.tsx` - ✅ Fully localized

---

## 🚨 Priority Action Items

### High Priority (User-Facing Strings)
1. **Home page alt texts** - All hardcoded alt attributes in footer, hero, features, support sections
2. **Authentication placeholders** - Login, register, OTP, password reset forms
3. **Settings placeholders** - Account, danger, two-factor sections
4. **Typography fonts** - Font family names in builder
5. **Dialog titles** - Cover letter story dialogs

### Medium Priority (Technical Strings)
1. **Logo alt texts** - Component alt attributes
2. **Brand icons** - Social media platform names
3. **Section metadata** - Content library item detection strings

### Low Priority (Internal/Technical)
1. **Font names** - Typography system font lists (may be intentional)
2. **URL placeholders** - Technical input placeholders

---

## 📋 Localization Checklist

### For Each Component:
- [ ] Import `t` from `@lingui/macro`
- [ ] Wrap all user-facing strings with `t()` macro
- [ ] Check for hardcoded placeholders, alt texts, titles, labels
- [ ] Verify toast messages, error messages, success messages
- [ ] Test with different locales
- [ ] Update translation files with `pnpm run messages:extract`

### Translation File Updates:
- [ ] Run `pnpm run messages:extract` after changes
- [ ] Run `pnpm exec lingui compile` to compile translations
- [ ] Verify translations appear correctly in UI
- [ ] Test server deployment includes translation compilation

---

## 🔄 Maintenance

This document should be updated whenever:
- New components are added
- Hardcoded strings are discovered
- Localization improvements are made
- New translation keys are added

**Last Audit**: 2025-01-27  
**Next Review**: When new components are added or localization issues are reported
