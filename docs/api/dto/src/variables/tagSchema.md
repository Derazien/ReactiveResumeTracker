[**ReactiveResumeTracker API Documentation v4.4.6**](../../../README.md)

***

[ReactiveResumeTracker API Documentation](../../../README.md) / [dto/src](../README.md) / tagSchema

# Variable: tagSchema

> `const` **tagSchema**: `ZodObject`\<\{ `color`: `ZodNullable`\<`ZodString`\>; `createdAt`: `any`; `id`: `any`; `name`: `ZodString`; `user`: `ZodOptional`\<`ZodObject`\<\{ `createdAt`: `any`; `email`: `ZodEffects`\<`ZodString`, `string`, `string`\>; `emailVerified`: `ZodDefault`\<`ZodBoolean`\>; `id`: `any`; `locale`: `ZodDefault`\<`ZodString`\>; `name`: `ZodString`; `picture`: `ZodUnion`\<\[`ZodUnion`\<\[`ZodLiteral`\<`""`\>, `ZodNull`\]\>, `ZodString`\]\>; `provider`: `ZodDefault`\<`ZodEnum`\<\[`"email"`, `"github"`, `"google"`, `"openid"`\]\>\>; `twoFactorEnabled`: `ZodDefault`\<`ZodBoolean`\>; `updatedAt`: `any`; `username`: `ZodEffects`\<`ZodString`, `string`, `string`\>; `userType`: `ZodDefault`\<`ZodEnum`\<\[`"GENERAL_CONSUMER"`, `"DEVELOPER"`\]\>\>; \}, `"strip"`, `ZodTypeAny`, \{\[`key`: `string`\]: `any`; `createdAt?`: `unknown`; `email?`: `unknown`; `emailVerified?`: `unknown`; `id?`: `unknown`; `locale?`: `unknown`; `name?`: `unknown`; `picture?`: `unknown`; `provider?`: `unknown`; `twoFactorEnabled?`: `unknown`; `updatedAt?`: `unknown`; `username?`: `unknown`; `userType?`: `unknown`; \}, \{\[`key`: `string`\]: `any`; `createdAt?`: `unknown`; `email?`: `unknown`; `emailVerified?`: `unknown`; `id?`: `unknown`; `locale?`: `unknown`; `name?`: `unknown`; `picture?`: `unknown`; `provider?`: `unknown`; `twoFactorEnabled?`: `unknown`; `updatedAt?`: `unknown`; `username?`: `unknown`; `userType?`: `unknown`; \}\>\>; `userId`: `any`; \}, `"strip"`, `ZodTypeAny`, \{\[`key`: `string`\]: `any`; `color?`: `unknown`; `createdAt?`: `unknown`; `id?`: `unknown`; `name?`: `unknown`; `user?`: `unknown`; `userId?`: `unknown`; \}, \{\[`key`: `string`\]: `any`; `color?`: `unknown`; `createdAt?`: `unknown`; `id?`: `unknown`; `name?`: `unknown`; `user?`: `unknown`; `userId?`: `unknown`; \}\>

Defined in: [libs/dto/src/tag/tag.ts:8](https://github.com/Derazien/ReactiveResumeTracker/blob/automation/libs/dto/src/tag/tag.ts#L8)
