[**ReactiveResumeTracker API Documentation v4.4.6**](../../../README.md)

***

[ReactiveResumeTracker API Documentation](../../../README.md) / [dto/src](../README.md) / CreateAutomatedJobDto

# Class: CreateAutomatedJobDto

Defined in: [libs/dto/src/automation/create-automated-job.dto.ts:32](https://github.com/Derazien/ReactiveResumeTracker/blob/automation/libs/dto/src/automation/create-automated-job.dto.ts#L32)

## Extends

- `object`

## Constructors

### Constructor

> **new CreateAutomatedJobDto**(): `CreateAutomatedJobDto`

Defined in: node\_modules/.pnpm/nestjs-zod@3.0.0\_@nestjs+co\_b0633c7f9c8ff913676a00ab806df328/node\_modules/nestjs-zod/dto.d.ts:4

#### Returns

`CreateAutomatedJobDto`

#### Inherited from

`createZodDto(createAutomatedJobSchema).constructor`

## Properties

### company?

> `optional` **company**: `object` = `createCompanySchema`

Defined in: [libs/dto/src/automation/create-automated-job.dto.ts:26](https://github.com/Derazien/ReactiveResumeTracker/blob/automation/libs/dto/src/automation/create-automated-job.dto.ts#L26)

#### culture?

> `optional` **culture**: `string`

#### description?

> `optional` **description**: `string`

#### facebookUrl?

> `optional` **facebookUrl**: `string`

#### githubUrl?

> `optional` **githubUrl**: `string`

#### industry?

> `optional` **industry**: `string`

#### instagramUrl?

> `optional` **instagramUrl**: `string`

#### linkedinUrl?

> `optional` **linkedinUrl**: `string`

#### location?

> `optional` **location**: `string`

#### logo?

> `optional` **logo**: `string`

#### mission?

> `optional` **mission**: `string`

#### name?

> `optional` **name**: `string`

#### size?

> `optional` **size**: `string`

#### twitterUrl?

> `optional` **twitterUrl**: `string`

#### values?

> `optional` **values**: `string`

#### website?

> `optional` **website**: `string`

#### youtubeUrl?

> `optional` **youtubeUrl**: `string`

#### Inherited from

`createZodDto(createAutomatedJobSchema).company`

***

### contacts?

> `optional` **contacts**: `object`[]

Defined in: [libs/dto/src/automation/create-automated-job.dto.ts:29](https://github.com/Derazien/ReactiveResumeTracker/blob/automation/libs/dto/src/automation/create-automated-job.dto.ts#L29)

#### bio?

> `optional` **bio**: `string`

#### email?

> `optional` **email**: `string`

#### githubUrl?

> `optional` **githubUrl**: `string`

#### linkedinUrl?

> `optional` **linkedinUrl**: `string`

#### name?

> `optional` **name**: `string`

#### phone?

> `optional` **phone**: `string`

#### title?

> `optional` **title**: `string`

#### twitterUrl?

> `optional` **twitterUrl**: `string`

#### website?

> `optional` **website**: `string`

#### Inherited from

`createZodDto(createAutomatedJobSchema).contacts`

***

### jobApplication?

> `optional` **jobApplication**: `object` = `automatedJobApplicationSchema`

Defined in: [libs/dto/src/automation/create-automated-job.dto.ts:23](https://github.com/Derazien/ReactiveResumeTracker/blob/automation/libs/dto/src/automation/create-automated-job.dto.ts#L23)

#### appliedDate?

> `optional` **appliedDate**: `string`

#### createdViaAutomation?

> `optional` **createdViaAutomation**: `boolean`

#### description?

> `optional` **description**: `string`

#### extractedTags?

> `optional` **extractedTags**: `string`[]

#### industry?

> `optional` **industry**: `string`

#### location?

> `optional` **location**: `string`

#### notes?

> `optional` **notes**: `string`

#### requirements?

> `optional` **requirements**: `string`[]

#### salary?

> `optional` **salary**: `string`

#### status?

> `optional` **status**: `"DRAFT"` \| `"APPLIED"` \| `"INTERVIEW_SCHEDULED"` \| `"INTERVIEWED"` \| `"OFFER_RECEIVED"` \| `"REJECTED"` \| `"ACCEPTED"` \| `"WITHDRAWN"`

#### title?

> `optional` **title**: `string`

#### url?

> `optional` **url**: `string`

#### Inherited from

`createZodDto(createAutomatedJobSchema).jobApplication`

***

### userId?

> `optional` **userId**: `string`

Defined in: [libs/dto/src/automation/create-automated-job.dto.ts:20](https://github.com/Derazien/ReactiveResumeTracker/blob/automation/libs/dto/src/automation/create-automated-job.dto.ts#L20)

#### Inherited from

`createZodDto(createAutomatedJobSchema).userId`
