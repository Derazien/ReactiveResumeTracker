[**ReactiveResumeTracker API Documentation v4.4.6**](../../../README.md)

***

[ReactiveResumeTracker API Documentation](../../../README.md) / [parser/src](../README.md) / LinkedInParser

# Class: LinkedInParser

Defined in: [libs/parser/src/linkedin/index.ts:29](https://github.com/Derazien/ReactiveResumeTracker/blob/automation/libs/parser/src/linkedin/index.ts#L29)

## Implements

- `Parser`\<`JSZip`, [`LinkedIn`](../type-aliases/LinkedIn.md)\>

## Constructors

### Constructor

> **new LinkedInParser**(): `LinkedInParser`

Defined in: [libs/parser/src/linkedin/index.ts:32](https://github.com/Derazien/ReactiveResumeTracker/blob/automation/libs/parser/src/linkedin/index.ts#L32)

#### Returns

`LinkedInParser`

## Properties

### schema

> **schema**: `ZodType`

Defined in: [libs/parser/src/linkedin/index.ts:30](https://github.com/Derazien/ReactiveResumeTracker/blob/automation/libs/parser/src/linkedin/index.ts#L30)

#### Implementation of

`Parser.schema`

## Methods

### convert()

> **convert**(`data`): `any`

Defined in: [libs/parser/src/linkedin/index.ts:61](https://github.com/Derazien/ReactiveResumeTracker/blob/automation/libs/parser/src/linkedin/index.ts#L61)

#### Parameters

##### data

###### Certifications?

`object`[] = `...`

###### Education?

`object`[] = `...`

###### Email Addresses?

`object`[] = `...`

###### Languages?

`object`[] = `...`

###### Positions?

`object`[] = `...`

###### Profile?

`object`[] = `...`

###### Projects?

`object`[] = `...`

###### Skills?

`object`[] = `...`

#### Returns

`any`

#### Implementation of

`Parser.convert`

***

### readFile()

> **readFile**(`file`): `Promise`\<`JSZip`\>

Defined in: [libs/parser/src/linkedin/index.ts:36](https://github.com/Derazien/ReactiveResumeTracker/blob/automation/libs/parser/src/linkedin/index.ts#L36)

#### Parameters

##### file

`File`

#### Returns

`Promise`\<`JSZip`\>

#### Implementation of

`Parser.readFile`

***

### validate()

> **validate**(`data`): `Promise`\<\{ `Certifications?`: `object`[]; `Education?`: `object`[]; `Email Addresses?`: `object`[]; `Languages?`: `object`[]; `Positions?`: `object`[]; `Profile?`: `object`[]; `Projects?`: `object`[]; `Skills?`: `object`[]; \}\>

Defined in: [libs/parser/src/linkedin/index.ts:46](https://github.com/Derazien/ReactiveResumeTracker/blob/automation/libs/parser/src/linkedin/index.ts#L46)

#### Parameters

##### data

`JSZip`

#### Returns

`Promise`\<\{ `Certifications?`: `object`[]; `Education?`: `object`[]; `Email Addresses?`: `object`[]; `Languages?`: `object`[]; `Positions?`: `object`[]; `Profile?`: `object`[]; `Projects?`: `object`[]; `Skills?`: `object`[]; \}\>

#### Implementation of

`Parser.validate`
