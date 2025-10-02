[**ReactiveResumeTracker API Documentation v4.4.6**](../../../README.md)

***

[ReactiveResumeTracker API Documentation](../../../README.md) / [dto/src](../README.md) / AuthResponseDto

# Class: AuthResponseDto

Defined in: [libs/dto/src/auth/response.ts:11](https://github.com/Derazien/ReactiveResumeTracker/blob/automation/libs/dto/src/auth/response.ts#L11)

## Extends

- `object`

## Constructors

### Constructor

> **new AuthResponseDto**(): `AuthResponseDto`

Defined in: node\_modules/.pnpm/nestjs-zod@3.0.0\_@nestjs+co\_b0633c7f9c8ff913676a00ab806df328/node\_modules/nestjs-zod/dto.d.ts:4

#### Returns

`AuthResponseDto`

#### Inherited from

`createZodDto(authResponseSchema).constructor`

## Properties

### status?

> `optional` **status**: `"authenticated"` \| `"2fa_required"`

Defined in: [libs/dto/src/auth/response.ts:7](https://github.com/Derazien/ReactiveResumeTracker/blob/automation/libs/dto/src/auth/response.ts#L7)

#### Inherited from

`createZodDto(authResponseSchema).status`

***

### user?

> `optional` **user**: `object` = `userSchema`

Defined in: [libs/dto/src/auth/response.ts:8](https://github.com/Derazien/ReactiveResumeTracker/blob/automation/libs/dto/src/auth/response.ts#L8)

#### Index Signature

\[`key`: `string`\]: `any`

#### createdAt?

> `optional` **createdAt**: `unknown` = `dateSchema`

#### email?

> `optional` **email**: `unknown`

#### emailVerified?

> `optional` **emailVerified**: `unknown`

#### id?

> `optional` **id**: `unknown` = `idSchema`

#### locale?

> `optional` **locale**: `unknown`

#### name?

> `optional` **name**: `unknown`

#### picture?

> `optional` **picture**: `unknown`

#### provider?

> `optional` **provider**: `unknown`

#### twoFactorEnabled?

> `optional` **twoFactorEnabled**: `unknown`

#### updatedAt?

> `optional` **updatedAt**: `unknown` = `dateSchema`

#### username?

> `optional` **username**: `unknown` = `usernameSchema`

#### userType?

> `optional` **userType**: `unknown`

#### Inherited from

`createZodDto(authResponseSchema).user`
