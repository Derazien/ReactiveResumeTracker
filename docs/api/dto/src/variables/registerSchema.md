[**ReactiveResumeTracker API Documentation v4.4.6**](../../../README.md)

***

[ReactiveResumeTracker API Documentation](../../../README.md) / [dto/src](../README.md) / registerSchema

# Variable: registerSchema

> `const` **registerSchema**: `ZodObject`\<`Pick`\<\{ `createdAt`: `any`; `email`: `ZodEffects`\<`ZodString`, `string`, `string`\>; `emailVerified`: `ZodDefault`\<`ZodBoolean`\>; `id`: `any`; `locale`: `ZodDefault`\<`ZodString`\>; `name`: `ZodString`; `picture`: `ZodUnion`\<\[`ZodUnion`\<\[`ZodLiteral`\<`""`\>, `ZodNull`\]\>, `ZodString`\]\>; `provider`: `ZodDefault`\<`ZodEnum`\<\[`"email"`, `"github"`, `"google"`, `"openid"`\]\>\>; `twoFactorEnabled`: `ZodDefault`\<`ZodBoolean`\>; `updatedAt`: `any`; `username`: `ZodEffects`\<`ZodString`, `string`, `string`\>; `userType`: `ZodDefault`\<`ZodEnum`\<\[`"GENERAL_CONSUMER"`, `"DEVELOPER"`\]\>\>; \}, `"name"` \| `"email"` \| `"username"` \| `"locale"`\> & `object`, `"strip"`, `ZodTypeAny`, \{ `email?`: `string`; `locale?`: `string`; `name?`: `string`; `password?`: `string`; `username?`: `string`; \}, \{ `email?`: `string`; `locale?`: `string`; `name?`: `string`; `password?`: `string`; `username?`: `string`; \}\>

Defined in: [libs/dto/src/auth/register.ts:6](https://github.com/Derazien/ReactiveResumeTracker/blob/automation/libs/dto/src/auth/register.ts#L6)
