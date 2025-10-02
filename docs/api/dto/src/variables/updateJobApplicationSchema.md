[**ReactiveResumeTracker API Documentation v4.4.6**](../../../README.md)

***

[ReactiveResumeTracker API Documentation](../../../README.md) / [dto/src](../README.md) / updateJobApplicationSchema

# Variable: updateJobApplicationSchema

> `const` **updateJobApplicationSchema**: `ZodObject`\<\{ `appliedDate`: `ZodOptional`\<`ZodString`\>; `companyId`: `ZodOptional`\<`ZodString`\>; `companyName`: `ZodOptional`\<`ZodString`\>; `description`: `ZodOptional`\<`ZodString`\>; `extractedTags`: `ZodOptional`\<`ZodArray`\<`ZodString`, `"many"`\>\>; `notes`: `ZodOptional`\<`ZodString`\>; `requirements`: `ZodOptional`\<`ZodArray`\<`ZodString`, `"many"`\>\>; `status`: `ZodOptional`\<`ZodEnum`\<\[`"DRAFT"`, `"APPLIED"`, `"INTERVIEW_SCHEDULED"`, `"INTERVIEWED"`, `"OFFER_RECEIVED"`, `"REJECTED"`, `"ACCEPTED"`, `"WITHDRAWN"`\]\>\>; `title`: `ZodOptional`\<`ZodString`\>; `url`: `ZodOptional`\<`ZodString`\>; \}, `"strip"`, `ZodTypeAny`, \{ `appliedDate?`: `string`; `companyId?`: `string`; `companyName?`: `string`; `description?`: `string`; `extractedTags?`: `string`[]; `notes?`: `string`; `requirements?`: `string`[]; `status?`: `"DRAFT"` \| `"APPLIED"` \| `"INTERVIEW_SCHEDULED"` \| `"INTERVIEWED"` \| `"OFFER_RECEIVED"` \| `"REJECTED"` \| `"ACCEPTED"` \| `"WITHDRAWN"`; `title?`: `string`; `url?`: `string`; \}, \{ `appliedDate?`: `string`; `companyId?`: `string`; `companyName?`: `string`; `description?`: `string`; `extractedTags?`: `string`[]; `notes?`: `string`; `requirements?`: `string`[]; `status?`: `"DRAFT"` \| `"APPLIED"` \| `"INTERVIEW_SCHEDULED"` \| `"INTERVIEWED"` \| `"OFFER_RECEIVED"` \| `"REJECTED"` \| `"ACCEPTED"` \| `"WITHDRAWN"`; `title?`: `string`; `url?`: `string`; \}\>

Defined in: [libs/dto/src/job-application/update.ts:4](https://github.com/Derazien/ReactiveResumeTracker/blob/automation/libs/dto/src/job-application/update.ts#L4)
