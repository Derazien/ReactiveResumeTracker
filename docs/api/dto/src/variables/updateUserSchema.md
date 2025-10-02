[**ReactiveResumeTracker API Documentation v4.4.6**](../../../README.md)

***

[ReactiveResumeTracker API Documentation](../../../README.md) / [dto/src](../README.md) / updateUserSchema

# Variable: updateUserSchema

> `const` **updateUserSchema**: `ZodObject`\<`Pick`\<\{ `createdAt`: `ZodOptional`\<`any`\>; `email`: `ZodOptional`\<`ZodEffects`\<`ZodString`, `string`, `string`\>\>; `emailVerified`: `ZodOptional`\<`ZodDefault`\<`ZodBoolean`\>\>; `id`: `ZodOptional`\<`any`\>; `locale`: `ZodOptional`\<`ZodDefault`\<`ZodString`\>\>; `name`: `ZodOptional`\<`ZodString`\>; `picture`: `ZodOptional`\<`ZodUnion`\<\[`ZodUnion`\<\[`ZodLiteral`\<`""`\>, `ZodNull`\]\>, `ZodString`\]\>\>; `provider`: `ZodOptional`\<`ZodDefault`\<`ZodEnum`\<\[`"email"`, `"github"`, `"google"`, `"openid"`\]\>\>\>; `twoFactorEnabled`: `ZodOptional`\<`ZodDefault`\<`ZodBoolean`\>\>; `updatedAt`: `ZodOptional`\<`any`\>; `username`: `ZodOptional`\<`ZodEffects`\<`ZodString`, `string`, `string`\>\>; `userType`: `ZodOptional`\<`ZodDefault`\<`ZodEnum`\<\[`"GENERAL_CONSUMER"`, `"DEVELOPER"`\]\>\>\>; \}, `"name"` \| `"email"` \| `"picture"` \| `"username"` \| `"locale"`\>, `"strip"`, `ZodTypeAny`, \{ `email?`: `string`; `locale?`: `string`; `name?`: `string`; `picture?`: `string`; `username?`: `string`; \}, \{ `email?`: `string`; `locale?`: `string`; `name?`: `string`; `picture?`: `string`; `username?`: `string`; \}\>

Defined in: [libs/dto/src/user/update-user.ts:5](https://github.com/Derazien/ReactiveResumeTracker/blob/automation/libs/dto/src/user/update-user.ts#L5)
