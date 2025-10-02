[**ReactiveResumeTracker API Documentation v4.4.6**](../../../README.md)

***

[ReactiveResumeTracker API Documentation](../../../README.md) / [schema/src](../README.md) / FilterKeys

# Type Alias: FilterKeys\<T, Condition\>

> **FilterKeys**\<`T`, `Condition`\> = `{ [Key in keyof T]: T[Key] extends Condition ? Key : never }`\[keyof `T`\]

Defined in: [libs/schema/src/shared/types.ts:1](https://github.com/Derazien/ReactiveResumeTracker/blob/automation/libs/schema/src/shared/types.ts#L1)

## Type Parameters

### T

`T`

### Condition

`Condition`
