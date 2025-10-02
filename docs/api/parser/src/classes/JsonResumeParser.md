[**ReactiveResumeTracker API Documentation v4.4.6**](../../../README.md)

***

[ReactiveResumeTracker API Documentation](../../../README.md) / [parser/src](../README.md) / JsonResumeParser

# Class: JsonResumeParser

Defined in: [libs/parser/src/json-resume/index.ts:25](https://github.com/Derazien/ReactiveResumeTracker/blob/automation/libs/parser/src/json-resume/index.ts#L25)

## Implements

- `Parser`\<`Json`, [`JsonResume`](../type-aliases/JsonResume.md)\>

## Constructors

### Constructor

> **new JsonResumeParser**(): `JsonResumeParser`

Defined in: [libs/parser/src/json-resume/index.ts:28](https://github.com/Derazien/ReactiveResumeTracker/blob/automation/libs/parser/src/json-resume/index.ts#L28)

#### Returns

`JsonResumeParser`

## Properties

### schema

> **schema**: `ZodType`

Defined in: [libs/parser/src/json-resume/index.ts:26](https://github.com/Derazien/ReactiveResumeTracker/blob/automation/libs/parser/src/json-resume/index.ts#L26)

#### Implementation of

`Parser.schema`

## Methods

### convert()

> **convert**(`data`): `any`

Defined in: [libs/parser/src/json-resume/index.ts:60](https://github.com/Derazien/ReactiveResumeTracker/blob/automation/libs/parser/src/json-resume/index.ts#L60)

#### Parameters

##### data

###### awards?

`object`[] = `...`

###### basics?

\{ `email?`: `string`; `image?`: `string`; `label?`: `string`; `location?`: \{ `address?`: `string`; `city?`: `string`; `countryCode?`: `string`; `postalCode?`: `string`; `region?`: `string`; \}; `name?`: `string`; `phone?`: `string`; `profiles?`: `object`[]; `summary?`: `string`; `url?`: `string`; \} = `...`

###### basics.email?

`string` = `...`

###### basics.image?

`string` = `...`

###### basics.label?

`string` = `...`

###### basics.location?

\{ `address?`: `string`; `city?`: `string`; `countryCode?`: `string`; `postalCode?`: `string`; `region?`: `string`; \} = `...`

###### basics.location.address?

`string` = `...`

###### basics.location.city?

`string` = `...`

###### basics.location.countryCode?

`string` = `...`

###### basics.location.postalCode?

`string` = `...`

###### basics.location.region?

`string` = `...`

###### basics.name?

`string` = `...`

###### basics.phone?

`string` = `...`

###### basics.profiles?

`object`[] = `...`

###### basics.summary?

`string` = `...`

###### basics.url?

`string` = `urlSchema`

###### certificates?

`object`[] = `...`

###### education?

`object`[] = `...`

###### interests?

`object`[] = `...`

###### languages?

`object`[] = `...`

###### publications?

`object`[] = `...`

###### references?

`object`[] = `...`

###### skills?

`object`[] = `...`

###### volunteer?

`object`[] = `...`

###### work?

`object`[] = `...`

#### Returns

`any`

#### Implementation of

`Parser.convert`

***

### readFile()

> **readFile**(`file`): `Promise`\<`Json`\>

Defined in: [libs/parser/src/json-resume/index.ts:32](https://github.com/Derazien/ReactiveResumeTracker/blob/automation/libs/parser/src/json-resume/index.ts#L32)

#### Parameters

##### file

`File`

#### Returns

`Promise`\<`Json`\>

#### Implementation of

`Parser.readFile`

***

### validate()

> **validate**(`data`): `object`

Defined in: [libs/parser/src/json-resume/index.ts:56](https://github.com/Derazien/ReactiveResumeTracker/blob/automation/libs/parser/src/json-resume/index.ts#L56)

#### Parameters

##### data

`Json`

#### Returns

`object`

##### awards?

> `optional` **awards**: `object`[]

##### basics?

> `optional` **basics**: `object`

###### basics.email?

> `optional` **email**: `string`

###### basics.image?

> `optional` **image**: `string`

###### basics.label?

> `optional` **label**: `string`

###### basics.location?

> `optional` **location**: `object`

###### basics.location.address?

> `optional` **address**: `string`

###### basics.location.city?

> `optional` **city**: `string`

###### basics.location.countryCode?

> `optional` **countryCode**: `string`

###### basics.location.postalCode?

> `optional` **postalCode**: `string`

###### basics.location.region?

> `optional` **region**: `string`

###### basics.name?

> `optional` **name**: `string`

###### basics.phone?

> `optional` **phone**: `string`

###### basics.profiles?

> `optional` **profiles**: `object`[]

###### basics.summary?

> `optional` **summary**: `string`

###### basics.url?

> `optional` **url**: `string` = `urlSchema`

##### certificates?

> `optional` **certificates**: `object`[]

##### education?

> `optional` **education**: `object`[]

##### interests?

> `optional` **interests**: `object`[]

##### languages?

> `optional` **languages**: `object`[]

##### publications?

> `optional` **publications**: `object`[]

##### references?

> `optional` **references**: `object`[]

##### skills?

> `optional` **skills**: `object`[]

##### volunteer?

> `optional` **volunteer**: `object`[]

##### work?

> `optional` **work**: `object`[]

#### Implementation of

`Parser.validate`
