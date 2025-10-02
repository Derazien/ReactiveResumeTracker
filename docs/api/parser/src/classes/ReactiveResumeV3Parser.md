[**ReactiveResumeTracker API Documentation v4.4.6**](../../../README.md)

***

[ReactiveResumeTracker API Documentation](../../../README.md) / [parser/src](../README.md) / ReactiveResumeV3Parser

# Class: ReactiveResumeV3Parser

Defined in: [libs/parser/src/reactive-resume-v3/index.ts:28](https://github.com/Derazien/ReactiveResumeTracker/blob/automation/libs/parser/src/reactive-resume-v3/index.ts#L28)

## Implements

- `Parser`\<`Json`, [`ReactiveResumeV3`](../type-aliases/ReactiveResumeV3.md)\>

## Constructors

### Constructor

> **new ReactiveResumeV3Parser**(): `ReactiveResumeV3Parser`

Defined in: [libs/parser/src/reactive-resume-v3/index.ts:31](https://github.com/Derazien/ReactiveResumeTracker/blob/automation/libs/parser/src/reactive-resume-v3/index.ts#L31)

#### Returns

`ReactiveResumeV3Parser`

## Properties

### schema

> **schema**: `ZodType`

Defined in: [libs/parser/src/reactive-resume-v3/index.ts:29](https://github.com/Derazien/ReactiveResumeTracker/blob/automation/libs/parser/src/reactive-resume-v3/index.ts#L29)

#### Implementation of

`Parser.schema`

## Methods

### convert()

> **convert**(`data`): `any`

Defined in: [libs/parser/src/reactive-resume-v3/index.ts:63](https://github.com/Derazien/ReactiveResumeTracker/blob/automation/libs/parser/src/reactive-resume-v3/index.ts#L63)

#### Parameters

##### data

###### basics?

\{ `birthdate?`: `string`; `email?`: `string`; `headline?`: `string`; `location?`: \{ `address?`: `string`; `city?`: `string`; `country?`: `string`; `postalCode?`: `string`; `region?`: `string`; \}; `name?`: `string`; `phone?`: `string`; `photo?`: \{ `filters?`: \{ `border?`: `boolean`; `grayscale?`: `boolean`; `shape?`: `string`; `size?`: `number`; \}; `url?`: `string`; `visible?`: `boolean`; \}; `profiles?`: `object`[]; `summary?`: `string` \| \{ `body?`: `string`; `heading?`: `string`; `visible?`: `boolean`; \}; `website?`: `string`; \} = `basicsSchema`

###### basics.birthdate?

`string` = `...`

###### basics.email?

`string` = `...`

###### basics.headline?

`string` = `...`

###### basics.location?

\{ `address?`: `string`; `city?`: `string`; `country?`: `string`; `postalCode?`: `string`; `region?`: `string`; \} = `...`

###### basics.location.address?

`string` = `...`

###### basics.location.city?

`string` = `...`

###### basics.location.country?

`string` = `...`

###### basics.location.postalCode?

`string` = `...`

###### basics.location.region?

`string` = `...`

###### basics.name?

`string` = `...`

###### basics.phone?

`string` = `...`

###### basics.photo?

\{ `filters?`: \{ `border?`: `boolean`; `grayscale?`: `boolean`; `shape?`: `string`; `size?`: `number`; \}; `url?`: `string`; `visible?`: `boolean`; \} = `...`

###### basics.photo.filters?

\{ `border?`: `boolean`; `grayscale?`: `boolean`; `shape?`: `string`; `size?`: `number`; \} = `...`

###### basics.photo.filters.border?

`boolean` = `...`

###### basics.photo.filters.grayscale?

`boolean` = `...`

###### basics.photo.filters.shape?

`string` = `...`

###### basics.photo.filters.size?

`number` = `...`

###### basics.photo.url?

`string` = `...`

###### basics.photo.visible?

`boolean` = `...`

###### basics.profiles?

`object`[] = `...`

###### basics.summary?

`string` \| \{ `body?`: `string`; `heading?`: `string`; `visible?`: `boolean`; \} = `...`

###### basics.website?

`string` = `...`

###### metadata?

\{ `css?`: \{ `value?`: `string`; `visible?`: `boolean`; \}; `date?`: \{ `format?`: `string`; \}; `layout?`: `string`[][][]; `locale?`: `string`; `template?`: `string`; `theme?`: \{ `background?`: `string`; `primary?`: `string`; `text?`: `string`; \}; `typography?`: \{ `family?`: \{ `body?`: `string`; `heading?`: `string`; \}; `size?`: \{ `body?`: `number`; `heading?`: `number`; \}; \}; \} = `metadataSchema`

###### metadata.css?

\{ `value?`: `string`; `visible?`: `boolean`; \} = `...`

###### metadata.css.value?

`string` = `...`

###### metadata.css.visible?

`boolean` = `...`

###### metadata.date?

\{ `format?`: `string`; \} = `...`

###### metadata.date.format?

`string` = `...`

###### metadata.layout?

`string`[][][] = `...`

###### metadata.locale?

`string` = `...`

###### metadata.template?

`string` = `...`

###### metadata.theme?

\{ `background?`: `string`; `primary?`: `string`; `text?`: `string`; \} = `...`

###### metadata.theme.background?

`string` = `...`

###### metadata.theme.primary?

`string` = `...`

###### metadata.theme.text?

`string` = `...`

###### metadata.typography?

\{ `family?`: \{ `body?`: `string`; `heading?`: `string`; \}; `size?`: \{ `body?`: `number`; `heading?`: `number`; \}; \} = `...`

###### metadata.typography.family?

\{ `body?`: `string`; `heading?`: `string`; \} = `...`

###### metadata.typography.family.body?

`string` = `...`

###### metadata.typography.family.heading?

`string` = `...`

###### metadata.typography.size?

\{ `body?`: `number`; `heading?`: `number`; \} = `...`

###### metadata.typography.size.body?

`number` = `...`

###### metadata.typography.size.heading?

`number` = `...`

###### public?

`boolean` = `...`

###### sections?

\{ `awards?`: \{ `columns?`: `number`; `id?`: `string`; `items?`: `object`[]; `name?`: `string`; `type?`: `"custom"` \| `"work"` \| `"basic"`; `visible?`: `boolean`; \}; `certifications?`: \{ `columns?`: `number`; `id?`: `string`; `items?`: `object`[]; `name?`: `string`; `type?`: `"custom"` \| `"work"` \| `"basic"`; `visible?`: `boolean`; \}; `education?`: \{ `columns?`: `number`; `id?`: `string`; `items?`: `object`[]; `name?`: `string`; `type?`: `"custom"` \| `"work"` \| `"basic"`; `visible?`: `boolean`; \}; `interests?`: \{ `columns?`: `number`; `id?`: `string`; `items?`: `object`[]; `name?`: `string`; `type?`: `"custom"` \| `"work"` \| `"basic"`; `visible?`: `boolean`; \}; `languages?`: \{ `columns?`: `number`; `id?`: `string`; `items?`: `object`[]; `name?`: `string`; `type?`: `"custom"` \| `"work"` \| `"basic"`; `visible?`: `boolean`; \}; `projects?`: \{ `columns?`: `number`; `id?`: `string`; `items?`: `object`[]; `name?`: `string`; `type?`: `"custom"` \| `"work"` \| `"basic"`; `visible?`: `boolean`; \}; `publications?`: \{ `columns?`: `number`; `id?`: `string`; `items?`: `object`[]; `name?`: `string`; `type?`: `"custom"` \| `"work"` \| `"basic"`; `visible?`: `boolean`; \}; `references?`: \{ `columns?`: `number`; `id?`: `string`; `items?`: `object`[]; `name?`: `string`; `type?`: `"custom"` \| `"work"` \| `"basic"`; `visible?`: `boolean`; \}; `skills?`: \{ `columns?`: `number`; `id?`: `string`; `items?`: `object`[]; `name?`: `string`; `type?`: `"custom"` \| `"work"` \| `"basic"`; `visible?`: `boolean`; \}; `volunteer?`: \{ `columns?`: `number`; `id?`: `string`; `items?`: `object`[]; `name?`: `string`; `type?`: `"custom"` \| `"work"` \| `"basic"`; `visible?`: `boolean`; \}; `work?`: \{ `columns?`: `number`; `id?`: `string`; `items?`: `object`[]; `name?`: `string`; `type?`: `"custom"` \| `"work"` \| `"basic"`; `visible?`: `boolean`; \}; \} = `...`

###### sections.awards?

\{ `columns?`: `number`; `id?`: `string`; `items?`: `object`[]; `name?`: `string`; `type?`: `"custom"` \| `"work"` \| `"basic"`; `visible?`: `boolean`; \} = `...`

###### sections.awards.columns?

`number` = `...`

###### sections.awards.id?

`string` = `...`

###### sections.awards.items?

`object`[] = `...`

###### sections.awards.name?

`string` = `...`

###### sections.awards.type?

`"custom"` \| `"work"` \| `"basic"` = `...`

###### sections.awards.visible?

`boolean` = `...`

###### sections.certifications?

\{ `columns?`: `number`; `id?`: `string`; `items?`: `object`[]; `name?`: `string`; `type?`: `"custom"` \| `"work"` \| `"basic"`; `visible?`: `boolean`; \} = `...`

###### sections.certifications.columns?

`number` = `...`

###### sections.certifications.id?

`string` = `...`

###### sections.certifications.items?

`object`[] = `...`

###### sections.certifications.name?

`string` = `...`

###### sections.certifications.type?

`"custom"` \| `"work"` \| `"basic"` = `...`

###### sections.certifications.visible?

`boolean` = `...`

###### sections.education?

\{ `columns?`: `number`; `id?`: `string`; `items?`: `object`[]; `name?`: `string`; `type?`: `"custom"` \| `"work"` \| `"basic"`; `visible?`: `boolean`; \} = `...`

###### sections.education.columns?

`number` = `...`

###### sections.education.id?

`string` = `...`

###### sections.education.items?

`object`[] = `...`

###### sections.education.name?

`string` = `...`

###### sections.education.type?

`"custom"` \| `"work"` \| `"basic"` = `...`

###### sections.education.visible?

`boolean` = `...`

###### sections.interests?

\{ `columns?`: `number`; `id?`: `string`; `items?`: `object`[]; `name?`: `string`; `type?`: `"custom"` \| `"work"` \| `"basic"`; `visible?`: `boolean`; \} = `...`

###### sections.interests.columns?

`number` = `...`

###### sections.interests.id?

`string` = `...`

###### sections.interests.items?

`object`[] = `...`

###### sections.interests.name?

`string` = `...`

###### sections.interests.type?

`"custom"` \| `"work"` \| `"basic"` = `...`

###### sections.interests.visible?

`boolean` = `...`

###### sections.languages?

\{ `columns?`: `number`; `id?`: `string`; `items?`: `object`[]; `name?`: `string`; `type?`: `"custom"` \| `"work"` \| `"basic"`; `visible?`: `boolean`; \} = `...`

###### sections.languages.columns?

`number` = `...`

###### sections.languages.id?

`string` = `...`

###### sections.languages.items?

`object`[] = `...`

###### sections.languages.name?

`string` = `...`

###### sections.languages.type?

`"custom"` \| `"work"` \| `"basic"` = `...`

###### sections.languages.visible?

`boolean` = `...`

###### sections.projects?

\{ `columns?`: `number`; `id?`: `string`; `items?`: `object`[]; `name?`: `string`; `type?`: `"custom"` \| `"work"` \| `"basic"`; `visible?`: `boolean`; \} = `...`

###### sections.projects.columns?

`number` = `...`

###### sections.projects.id?

`string` = `...`

###### sections.projects.items?

`object`[] = `...`

###### sections.projects.name?

`string` = `...`

###### sections.projects.type?

`"custom"` \| `"work"` \| `"basic"` = `...`

###### sections.projects.visible?

`boolean` = `...`

###### sections.publications?

\{ `columns?`: `number`; `id?`: `string`; `items?`: `object`[]; `name?`: `string`; `type?`: `"custom"` \| `"work"` \| `"basic"`; `visible?`: `boolean`; \} = `...`

###### sections.publications.columns?

`number` = `...`

###### sections.publications.id?

`string` = `...`

###### sections.publications.items?

`object`[] = `...`

###### sections.publications.name?

`string` = `...`

###### sections.publications.type?

`"custom"` \| `"work"` \| `"basic"` = `...`

###### sections.publications.visible?

`boolean` = `...`

###### sections.references?

\{ `columns?`: `number`; `id?`: `string`; `items?`: `object`[]; `name?`: `string`; `type?`: `"custom"` \| `"work"` \| `"basic"`; `visible?`: `boolean`; \} = `...`

###### sections.references.columns?

`number` = `...`

###### sections.references.id?

`string` = `...`

###### sections.references.items?

`object`[] = `...`

###### sections.references.name?

`string` = `...`

###### sections.references.type?

`"custom"` \| `"work"` \| `"basic"` = `...`

###### sections.references.visible?

`boolean` = `...`

###### sections.skills?

\{ `columns?`: `number`; `id?`: `string`; `items?`: `object`[]; `name?`: `string`; `type?`: `"custom"` \| `"work"` \| `"basic"`; `visible?`: `boolean`; \} = `...`

###### sections.skills.columns?

`number` = `...`

###### sections.skills.id?

`string` = `...`

###### sections.skills.items?

`object`[] = `...`

###### sections.skills.name?

`string` = `...`

###### sections.skills.type?

`"custom"` \| `"work"` \| `"basic"` = `...`

###### sections.skills.visible?

`boolean` = `...`

###### sections.volunteer?

\{ `columns?`: `number`; `id?`: `string`; `items?`: `object`[]; `name?`: `string`; `type?`: `"custom"` \| `"work"` \| `"basic"`; `visible?`: `boolean`; \} = `...`

###### sections.volunteer.columns?

`number` = `...`

###### sections.volunteer.id?

`string` = `...`

###### sections.volunteer.items?

`object`[] = `...`

###### sections.volunteer.name?

`string` = `...`

###### sections.volunteer.type?

`"custom"` \| `"work"` \| `"basic"` = `...`

###### sections.volunteer.visible?

`boolean` = `...`

###### sections.work?

\{ `columns?`: `number`; `id?`: `string`; `items?`: `object`[]; `name?`: `string`; `type?`: `"custom"` \| `"work"` \| `"basic"`; `visible?`: `boolean`; \} = `...`

###### sections.work.columns?

`number` = `...`

###### sections.work.id?

`string` = `...`

###### sections.work.items?

`object`[] = `...`

###### sections.work.name?

`string` = `...`

###### sections.work.type?

`"custom"` \| `"work"` \| `"basic"` = `...`

###### sections.work.visible?

`boolean` = `...`

#### Returns

`any`

#### Implementation of

`Parser.convert`

***

### readFile()

> **readFile**(`file`): `Promise`\<`Json`\>

Defined in: [libs/parser/src/reactive-resume-v3/index.ts:35](https://github.com/Derazien/ReactiveResumeTracker/blob/automation/libs/parser/src/reactive-resume-v3/index.ts#L35)

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

Defined in: [libs/parser/src/reactive-resume-v3/index.ts:59](https://github.com/Derazien/ReactiveResumeTracker/blob/automation/libs/parser/src/reactive-resume-v3/index.ts#L59)

#### Parameters

##### data

`Json`

#### Returns

`object`

##### basics?

> `optional` **basics**: `object` = `basicsSchema`

###### basics.birthdate?

> `optional` **birthdate**: `string`

###### basics.email?

> `optional` **email**: `string`

###### basics.headline?

> `optional` **headline**: `string`

###### basics.location?

> `optional` **location**: `object`

###### basics.location.address?

> `optional` **address**: `string`

###### basics.location.city?

> `optional` **city**: `string`

###### basics.location.country?

> `optional` **country**: `string`

###### basics.location.postalCode?

> `optional` **postalCode**: `string`

###### basics.location.region?

> `optional` **region**: `string`

###### basics.name?

> `optional` **name**: `string`

###### basics.phone?

> `optional` **phone**: `string`

###### basics.photo?

> `optional` **photo**: `object`

###### basics.photo.filters?

> `optional` **filters**: `object`

###### basics.photo.filters.border?

> `optional` **border**: `boolean`

###### basics.photo.filters.grayscale?

> `optional` **grayscale**: `boolean`

###### basics.photo.filters.shape?

> `optional` **shape**: `string`

###### basics.photo.filters.size?

> `optional` **size**: `number`

###### basics.photo.url?

> `optional` **url**: `string`

###### basics.photo.visible?

> `optional` **visible**: `boolean`

###### basics.profiles?

> `optional` **profiles**: `object`[]

###### basics.summary?

> `optional` **summary**: `string` \| \{ `body?`: `string`; `heading?`: `string`; `visible?`: `boolean`; \}

###### basics.website?

> `optional` **website**: `string`

##### metadata?

> `optional` **metadata**: `object` = `metadataSchema`

###### metadata.css?

> `optional` **css**: `object`

###### metadata.css.value?

> `optional` **value**: `string`

###### metadata.css.visible?

> `optional` **visible**: `boolean`

###### metadata.date?

> `optional` **date**: `object`

###### metadata.date.format?

> `optional` **format**: `string`

###### metadata.layout?

> `optional` **layout**: `string`[][][]

###### metadata.locale?

> `optional` **locale**: `string`

###### metadata.template?

> `optional` **template**: `string`

###### metadata.theme?

> `optional` **theme**: `object`

###### metadata.theme.background?

> `optional` **background**: `string`

###### metadata.theme.primary?

> `optional` **primary**: `string`

###### metadata.theme.text?

> `optional` **text**: `string`

###### metadata.typography?

> `optional` **typography**: `object`

###### metadata.typography.family?

> `optional` **family**: `object`

###### metadata.typography.family.body?

> `optional` **body**: `string`

###### metadata.typography.family.heading?

> `optional` **heading**: `string`

###### metadata.typography.size?

> `optional` **size**: `object`

###### metadata.typography.size.body?

> `optional` **body**: `number`

###### metadata.typography.size.heading?

> `optional` **heading**: `number`

##### public?

> `optional` **public**: `boolean`

##### sections?

> `optional` **sections**: `object`

###### sections.awards?

> `optional` **awards**: `object`

###### sections.awards.columns?

> `optional` **columns**: `number`

###### sections.awards.id?

> `optional` **id**: `string`

###### sections.awards.items?

> `optional` **items**: `object`[]

###### sections.awards.name?

> `optional` **name**: `string`

###### sections.awards.type?

> `optional` **type**: `"custom"` \| `"work"` \| `"basic"`

###### sections.awards.visible?

> `optional` **visible**: `boolean`

###### sections.certifications?

> `optional` **certifications**: `object`

###### sections.certifications.columns?

> `optional` **columns**: `number`

###### sections.certifications.id?

> `optional` **id**: `string`

###### sections.certifications.items?

> `optional` **items**: `object`[]

###### sections.certifications.name?

> `optional` **name**: `string`

###### sections.certifications.type?

> `optional` **type**: `"custom"` \| `"work"` \| `"basic"`

###### sections.certifications.visible?

> `optional` **visible**: `boolean`

###### sections.education?

> `optional` **education**: `object`

###### sections.education.columns?

> `optional` **columns**: `number`

###### sections.education.id?

> `optional` **id**: `string`

###### sections.education.items?

> `optional` **items**: `object`[]

###### sections.education.name?

> `optional` **name**: `string`

###### sections.education.type?

> `optional` **type**: `"custom"` \| `"work"` \| `"basic"`

###### sections.education.visible?

> `optional` **visible**: `boolean`

###### sections.interests?

> `optional` **interests**: `object`

###### sections.interests.columns?

> `optional` **columns**: `number`

###### sections.interests.id?

> `optional` **id**: `string`

###### sections.interests.items?

> `optional` **items**: `object`[]

###### sections.interests.name?

> `optional` **name**: `string`

###### sections.interests.type?

> `optional` **type**: `"custom"` \| `"work"` \| `"basic"`

###### sections.interests.visible?

> `optional` **visible**: `boolean`

###### sections.languages?

> `optional` **languages**: `object`

###### sections.languages.columns?

> `optional` **columns**: `number`

###### sections.languages.id?

> `optional` **id**: `string`

###### sections.languages.items?

> `optional` **items**: `object`[]

###### sections.languages.name?

> `optional` **name**: `string`

###### sections.languages.type?

> `optional` **type**: `"custom"` \| `"work"` \| `"basic"`

###### sections.languages.visible?

> `optional` **visible**: `boolean`

###### sections.projects?

> `optional` **projects**: `object`

###### sections.projects.columns?

> `optional` **columns**: `number`

###### sections.projects.id?

> `optional` **id**: `string`

###### sections.projects.items?

> `optional` **items**: `object`[]

###### sections.projects.name?

> `optional` **name**: `string`

###### sections.projects.type?

> `optional` **type**: `"custom"` \| `"work"` \| `"basic"`

###### sections.projects.visible?

> `optional` **visible**: `boolean`

###### sections.publications?

> `optional` **publications**: `object`

###### sections.publications.columns?

> `optional` **columns**: `number`

###### sections.publications.id?

> `optional` **id**: `string`

###### sections.publications.items?

> `optional` **items**: `object`[]

###### sections.publications.name?

> `optional` **name**: `string`

###### sections.publications.type?

> `optional` **type**: `"custom"` \| `"work"` \| `"basic"`

###### sections.publications.visible?

> `optional` **visible**: `boolean`

###### sections.references?

> `optional` **references**: `object`

###### sections.references.columns?

> `optional` **columns**: `number`

###### sections.references.id?

> `optional` **id**: `string`

###### sections.references.items?

> `optional` **items**: `object`[]

###### sections.references.name?

> `optional` **name**: `string`

###### sections.references.type?

> `optional` **type**: `"custom"` \| `"work"` \| `"basic"`

###### sections.references.visible?

> `optional` **visible**: `boolean`

###### sections.skills?

> `optional` **skills**: `object`

###### sections.skills.columns?

> `optional` **columns**: `number`

###### sections.skills.id?

> `optional` **id**: `string`

###### sections.skills.items?

> `optional` **items**: `object`[]

###### sections.skills.name?

> `optional` **name**: `string`

###### sections.skills.type?

> `optional` **type**: `"custom"` \| `"work"` \| `"basic"`

###### sections.skills.visible?

> `optional` **visible**: `boolean`

###### sections.volunteer?

> `optional` **volunteer**: `object`

###### sections.volunteer.columns?

> `optional` **columns**: `number`

###### sections.volunteer.id?

> `optional` **id**: `string`

###### sections.volunteer.items?

> `optional` **items**: `object`[]

###### sections.volunteer.name?

> `optional` **name**: `string`

###### sections.volunteer.type?

> `optional` **type**: `"custom"` \| `"work"` \| `"basic"`

###### sections.volunteer.visible?

> `optional` **visible**: `boolean`

###### sections.work?

> `optional` **work**: `object`

###### sections.work.columns?

> `optional` **columns**: `number`

###### sections.work.id?

> `optional` **id**: `string`

###### sections.work.items?

> `optional` **items**: `object`[]

###### sections.work.name?

> `optional` **name**: `string`

###### sections.work.type?

> `optional` **type**: `"custom"` \| `"work"` \| `"basic"`

###### sections.work.visible?

> `optional` **visible**: `boolean`

#### Implementation of

`Parser.validate`
