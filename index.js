export { enumFactory as default, extendBigInt, };

function enumFactory({keys = [], name = `Anonymous Enum`} = {}) {
  return createEnumProxy( ...createMappedAndInternals( checkInput(keys, name), name ) );
}

/**
 * Creates the flagged Enum using an Array of values
 * and an 'internal' Object containing the actual methods
 * to edit the Enum.
 * returns an Object proxied with a get trap doing the
 * actual work
 */
function createEnumProxy(mapped, internals) {
  return new Proxy({}, {
    get(_, key) {
      if (typeof key === `symbol`) { return; }
      
      key = String(key).trim();
      
      switch(true) {
        case !isNaN(parseInt(key)):
          return mapped[key]?.value;
        case /\|/.test(key):
          return multiFlag(mapped, key);
        case key.startsWith(`$`):
          return findValueCI(mapped, key.slice(1))?.flag ?? 0n;
        case /\$in$/i.test(key):
          return subset => valueIn({enumValues: mapped, key: key.slice(0, key.indexOf(`$`)), subset});
        case key in internals:
          return internals[key];
        default: return findValueCI(mapped, key) ?? EnumValue()
      }
    },
    set() {
      throw new TypeError(`Enum [${name}] values can not be set directly`);
    }
  });
}

/**
 * For the flagged Enum with [name] maps the given
 * [keys] (if any) to an array of values
 * and uses these values in an Object for 'internal use'
 * within the final Proxy
 * returns an Array containing an Array of mapped
 * values ([mapped]) and the Object for internal use ([internals])
 */
function createMappedAndInternals(keys, name) {
  let mapped = keys.reduce(createMappedValues, []);
  
  const internals = Object.freeze({
    get keys() { return mapped.map(v => v.label); },
    get values() { return mapped.map(v => v.value); },
    get name() { return name; },
    append: function(label) { addValue2Enum(mapped, name, label, Object.keys(mapped).length); },
    prepend: function(label) { addValue2Enum(mapped, name, label); },
    insert: function(label, at) { addValue2Enum(mapped, name, label, at); },
    remove: function(label) { removeValue(mapped, label); },
    rename: function(oldLabel, newLabel) { renameValue(mapped, name, oldLabel, newLabel); },
    toString() { return serialize(mapped, name); },
    valueOf() { return serialize(mapped, name); },
  });
  
  return [ mapped, internals ];
}

/**
 * Adds a value with [label] for flagged Enum with [name],
 * using the mapped values [valueMap], optionally at
 * position [at] within the [valueMap].
 * returns a re-indexed array of Enum values
 */
function addValue2Enum(valueMap, enumName, label, at = 0) {
  if ( !isStringWithLength(label)) {
      console.warn(`[${enumName}].append/prepend/insert: expected non empty string, received "${label ?? ``}"`);
      return valueMap;
    }
    
    label = label.trim();
    
    const newKeys = valueMap.map(v => v.label);
    
    if (newKeys.includes(label)) {
      console.warn(`[${enumName}].append/prepend/insert "${label}" exists already`);
      return valueMap;
    }
    
    valueMap.splice(at, 0, {label, value: EnumValue(label, at)});
    return reIndex(valueMap);
}

/**
 * Callback for the creation of an Array of values
 * from an Array of key values (strings)
 * returns the input Array [acc], with a new
 * {label, value} Object
 */
function createMappedValues(acc, label, i) {
  return [...acc, { label, value: EnumValue(label, i) } ];
}

/**
 * After edit/remove actions, re-index all values
 * within [valueMap]
 * returns the re-indexed array of Enum values
 */
function reIndex(valueMap) {
  return valueMap.map(((entry, i) => ({label: entry.label, value: EnumValue(entry.label, i)})));
}

/**
 * Rename [oldLabel] (a key within the flagged Enum with name [enumName])
 * to [newLabel]. When either [oldName] or [newName] are not strings or
 * strings with length 0, a warning is logged in the console and
 * the original flagged Enum is returned.
 * returns the edited flagged Enum
 */
function renameValue(valueMap, enumName, oldLabel, newLabel) {
  if ( !isStringWithLength(oldLabel) || !isStringWithLength(newLabel)) {
    console.warn(`[${enumName}].rename: label to rename and new label must be (non empty) strings`);
    return valueMap;
  }
  
  return valueMap
    .map( (entry, i) => entry.label === oldLabel
      ? {label: newLabel, value: EnumValue(newLabel, +entry.value)}
      : entry );
}

/**
 * Removes a label (key) from the array of flagged Enum values [valueMap].
 * returns the new [valueMap]
 */
function removeValue(valueMap, label = ``) {
  return reIndex(valueMap.filter(entry => entry.label !== label));
}

/**
 * check if [maybeString] is indeed a string and a string with length
 * returns true/false
 */
function isStringWithLength(maybeString) {
  return maybeString?.constructor === String && maybeString.trim().length;
}

/**
 * Handle the case where multiple keys are requested from
 * the flagged Enum Proxy (using "[string1]|[string2]|..." as
 * key).
 * returns an object containing a method to compare
 * the result value ([combinedFlags], a bigInt) to a subset.
 */
function multiFlag(enumArray, key) {
  const combinedFlags = key.split(`|`).reduce((acc, k) =>
    acc |= findValueCI(enumArray, k)?.flag || 0n, 0n);
  
  return { in: subset => InSubset(combinedFlags, subset) };
}

/**
 * In some cases the key 'NONE' is added automatically
 * to the flagged Enum at hand. For display, this value
 * is not shown.
 * returns an Array keys of [keys] except a key with value
 * 'none' (case insensitive)
 */
function removeNone(keys) {
  return keys.filter(k => !/^none$/i.test(k.trim()));
}

/**
 * Check the input for the flagged Enum 'constructor'
 * When [keys] is a single string, it will be converted to
 * Array<string>(1). When it's not a string and also is not an
 * Array, it will be converted to an empty Array. When
 * it is an Array, that Array will be cleaned up to be
 * an Array with strings (with length).
 * returns Array<string>(n keys which are string with length > 0)
 */
function checkInput(keys, name) {
  if (keys?.constructor === String) {
    keys = [keys];
  }
  
  if (keys?.constructor !== Array) {
    console.warn(`create enumFactory [${name}]: invalid keys value. Inititalized with empty Array`);
    keys = [];
  }
  
  if (keys.length && keys.find(k => !isStringWithLength(k))) {
    console.warn(`create enumFactory [${name}]: non string/empty string key values are removed`);
    keys = keys.filter(k => isStringWithLength(k));
  }
  
  return removeNone(keys);
}

/**
 * Check if [value] is part of [subset].
 * Both [value] and [subset] are BigInt.
 * returns true/false
 */
function InSubset(value, subset) {
  return !!(value & subset);
}

/**
 * Either find the flag value for a (case insensitive) key in [enumValues]
 * (when given) or use the given [flag] to determine if that
 * is part of [subset].
 * returns true/false
 */
function valueIn({enumValues, flag, key, subset} = {}) {
  const flag4Key = enumValues
    ? findValueCI(enumValues, key)?.flag
    : flag;
  subset = subset?.flag ? subset.flag : subset;
  const inValidInput = flag4Key?.constructor !== BigInt || subset?.constructor !== BigInt;
  
  return inValidInput ? false : flag4Key === subset || InSubset(flag4Key, subset);
}

/**
 * Find the value in [enumValues] for the (case insensive) [key].
 * return a value from [enumValues] or undefined
 */
function findValueCI(enumValues, key) {
  return enumValues.find(v => v.label.toLowerCase() === key.toLowerCase())?.value;
}

/**
 * Create a string representation for all values within
 * the current flagged Enum.
 * returns string
 */
function serialize(enumValues, name) {
  const header = `Enum values for Enum [${name}]`;
  const separator = Array(header.length + 1).join(`-`);
  const aggregated = enumValues.map(entry => {
    return `${entry.value} => index: ${+entry.value}, flag: ${entry.value.flag}n (0x${entry.value.flag?.toString(2)})`;
  }).join('\n');
  
  return [header, separator, aggregated].join(`\n`);
}

/**
 * Create symbolic extensions for BigInt.prototype
 * returns an Array of the created Symbols
 */
function extendBigInt() {
  const inSymbol = Symbol(`in`);
  const toBinary = Symbol(`bin`);
  const isIn = (that, me) => !!(me & that);
  Object.defineProperties(BigInt.prototype, {
    [inSymbol]: {
      get() { return that => InSubset(this, that); }
    },
    [toBinary]: {
      get() { return toBinary8(this); }
    }
  });
  
  return [inSymbol, toBinary];
}

/**
 * convert [unsignedInt] (a Number or BigInt) to
 * a binary number string (with minimum length 8 and length % 8 = 0).
 * returns string of 0s and 1s
 */
function toBinary8(unsignedInt) {
  const int2Str = unsignedInt.toString(2);
  
  return int2Str.padStart(int2Str.length + (8 - int2Str.length % 8) % 8, "0");
}

/**
 * Create a value from [entry] (a string)
 * for the flagged Enum.
 * returns a (frozen) Object, containing the
 * flag value (a BigInt (index**2)) and a method
 * to compare the flag value to (a subset of)
 * other values and custom toString (returns
 * key) and valueOf (returns index) functions.
 */
function EnumValue(entry, index) {
  const isNone = !entry || /^none$/i.test(entry);
  const flag = isNone ? 0n : 1n << BigInt(index);
  
  return Object.freeze({
    flag,
    in(subset) { return valueIn({flag, subset}); },
    toString() { return entry; },
    valueOf() { return isNone ? -1 : index; }
  });
}
