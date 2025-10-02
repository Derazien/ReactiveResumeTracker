[**ReactiveResumeTracker API Documentation v4.4.6**](../../../README.md)

***

[ReactiveResumeTracker API Documentation](../../../README.md) / [parser/src](../README.md) / ReactiveResumeParser

# Class: ReactiveResumeParser

Defined in: [libs/parser/src/reactive-resume/index.ts:8](https://github.com/Derazien/ReactiveResumeTracker/blob/automation/libs/parser/src/reactive-resume/index.ts#L8)

## Implements

- `Parser`\<`Json`, `ResumeData`\>

## Constructors

### Constructor

> **new ReactiveResumeParser**(): `ReactiveResumeParser`

Defined in: [libs/parser/src/reactive-resume/index.ts:11](https://github.com/Derazien/ReactiveResumeTracker/blob/automation/libs/parser/src/reactive-resume/index.ts#L11)

#### Returns

`ReactiveResumeParser`

## Properties

### schema

> **schema**: `ZodType`

Defined in: [libs/parser/src/reactive-resume/index.ts:9](https://github.com/Derazien/ReactiveResumeTracker/blob/automation/libs/parser/src/reactive-resume/index.ts#L9)

#### Implementation of

`Parser.schema`

## Methods

### convert()

> **convert**(`data`): `ResumeData`

Defined in: [libs/parser/src/reactive-resume/index.ts:43](https://github.com/Derazien/ReactiveResumeTracker/blob/automation/libs/parser/src/reactive-resume/index.ts#L43)

#### Parameters

##### data

`ResumeData`

#### Returns

`ResumeData`

#### Implementation of

`Parser.convert`

***

### readFile()

> **readFile**(`file`): `Promise`\<`Json`\>

Defined in: [libs/parser/src/reactive-resume/index.ts:15](https://github.com/Derazien/ReactiveResumeTracker/blob/automation/libs/parser/src/reactive-resume/index.ts#L15)

#### Parameters

##### file

`File`

#### Returns

`Promise`\<`Json`\>

#### Implementation of

`Parser.readFile`

***

### validate()

> **validate**(`data`): `ResumeData`

Defined in: [libs/parser/src/reactive-resume/index.ts:39](https://github.com/Derazien/ReactiveResumeTracker/blob/automation/libs/parser/src/reactive-resume/index.ts#L39)

#### Parameters

##### data

`Json`

#### Returns

`ResumeData`

#### Implementation of

`Parser.validate`
