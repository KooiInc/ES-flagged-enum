# ES-flagged-enum
A flagged enum creation module

```javascript
/**
 * Work In Progress
 * ----------------------------------------------------------------------
 * The module delivers two ways to create an Enum:
 * ENUM({name: string, values: Array<string>})  => writable (can add or remove values), default
 * ENUM$({name: string, values: Array<string>}) => readonly
 *
 * Value retrieval is case insensitive
 *   e.g. myEnum.somevalue, myEnum.SOMEVALUE
 * Keys must conform the rules for ES variables
 *
 * To query a value against multiple values
 * one can use either
 *  myEnum.has(value, myEnum.Something|myEnum.somethingelse),
 *  myEnum.is(value, myEnum.Something|myEnum.somethingelse) or
 *  myEnum[`something` + `$is`](myEnum.Something|myEnum.somethingelse)
 *
 * to retrieve the actual (initial) key for a value use
 *  myEnum.keyFor(myEnum.SOMEVALUE)
 *
 * to retrieve an array of current keys in an enum use
 *   myEnum.keys
 * ----------------------------------------------------------------------
**/
```
