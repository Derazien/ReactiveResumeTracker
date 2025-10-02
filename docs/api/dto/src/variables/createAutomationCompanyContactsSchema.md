[**ReactiveResumeTracker API Documentation v4.4.6**](../../../README.md)

***

[ReactiveResumeTracker API Documentation](../../../README.md) / [dto/src](../README.md) / createAutomationCompanyContactsSchema

# Variable: createAutomationCompanyContactsSchema

> `const` **createAutomationCompanyContactsSchema**: `ZodObject`\<\{ `companyDescription`: `ZodOptional`\<`ZodString`\>; `companyName`: `ZodString`; `contacts`: `ZodDefault`\<`ZodUnion`\<\[`ZodArray`\<`ZodObject`\<\{ `email`: `ZodOptional`\<`ZodString`\>; `linkedinUrl`: `ZodOptional`\<`ZodString`\>; `name`: `ZodString`; `phone`: `ZodOptional`\<`ZodString`\>; `title`: `ZodOptional`\<`ZodString`\>; \}, `"strip"`, `ZodTypeAny`, \{ `email?`: `string`; `linkedinUrl?`: `string`; `name?`: `string`; `phone?`: `string`; `title?`: `string`; \}, \{ `email?`: `string`; `linkedinUrl?`: `string`; `name?`: `string`; `phone?`: `string`; `title?`: `string`; \}\>, `"many"`\>, `ZodEffects`\<`ZodString`, `any`, `string`\>\]\>\>; `industry`: `ZodOptional`\<`ZodString`\>; `linkedinUrl`: `ZodOptional`\<`ZodString`\>; `location`: `ZodOptional`\<`ZodString`\>; `logoUrl`: `ZodOptional`\<`ZodString`\>; `userId`: `ZodString`; `website`: `ZodOptional`\<`ZodString`\>; \}, `"strip"`, `ZodTypeAny`, \{ `companyDescription?`: `string`; `companyName?`: `string`; `contacts?`: `any`; `industry?`: `string`; `linkedinUrl?`: `string`; `location?`: `string`; `logoUrl?`: `string`; `userId?`: `string`; `website?`: `string`; \}, \{ `companyDescription?`: `string`; `companyName?`: `string`; `contacts?`: `string` \| `object`[]; `industry?`: `string`; `linkedinUrl?`: `string`; `location?`: `string`; `logoUrl?`: `string`; `userId?`: `string`; `website?`: `string`; \}\>

Defined in: [libs/dto/src/automation/job-application.dto.ts:65](https://github.com/Derazien/ReactiveResumeTracker/blob/automation/libs/dto/src/automation/job-application.dto.ts#L65)
