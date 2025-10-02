[**ReactiveResumeTracker API Documentation v4.4.6**](../../../README.md)

***

[ReactiveResumeTracker API Documentation](../../../README.md) / [utils/src](../README.md) / FilterKeys

# Type Alias: FilterKeys\<T, Condition\>

> **FilterKeys**\<`T`, `Condition`\> = `{ [Key in keyof T]: T[Key] extends Condition ? Key : never }`\[keyof `T`\]

Defined in: [libs/utils/src/namespaces/types.ts:7](https://github.com/Derazien/ReactiveResumeTracker/blob/automation/libs/utils/src/namespaces/types.ts#L7)

## Type Parameters

### T

`T`

### Condition

`Condition`
