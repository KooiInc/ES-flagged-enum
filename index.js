export { enumFactory as default, extendBigInt, };

function enumFactory({keys = [], name = `Anonymous Enum`} = {}) {
  keys = checkInput(keys, name);
  let mapped = keys.reduce(createMappedValues, []);
  
  const internals = {
    get keys() { return mapped.map(v => v.label); },
    get values() { return mapped.map(v => v.value); },
    get name() { return name; },
    append: function(label) { mapped = addValue2Enum(mapped, name, label, Object.keys(mapped).length); },
    prepend: function(label) { mapped = addValue2Enum(mapped, name, label); },
    insert: function(label, at) { mapped = addValue2Enum(mapped, name, label, at); },
    remove: function(label) { mapped = removeValue(mapped, name, label); },
    rename: function(oldLabel, newLabel) { mapped = renameValue(mapped, name, oldLabel, newLabel); },
    toString() { return serialize(mapped, name); },
    valueOf() { return serialize(mapped, name); },
  };
  
  return new Proxy({}, {
    get(_, key) {
      if (typeof key === `symbol`) { return; }
      
      key = String(key).trim();
      
      switch(true) {
        case !isNaN(parseInt(key)):
          return mapped[key].value;
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

function addValue2Enum(valueMap, name, label, at = 0) {
  if ( !isStringWithLength(label)) {
      console.warn(`[${name}].append/prepend/insert: expected non empty string, received "${label ?? ``}"`);
      return valueMap;
    }
    
    label = label.trim();
    
    const newKeys = valueMap.map(v => v.label);
    
    if (newKeys.includes(label)) {
      console.warn(`[${name}].append/prepend/insert "${label}" exists already`);
      return valueMap;
    }
    
    valueMap.splice(at, 0, {label, value: EnumValue(label, at)});
    return reIndex(valueMap);
}

function createMappedValues(acc, label, i) {
  return [...acc, { label, value: EnumValue(label, i) } ];
}

function reIndex(valueMap) {
  return valueMap.map(((entry, i) => ({label: entry.label, value: EnumValue(entry.label, i)})));
}

function renameValue(valueMap, enumName, oldLabel, newLabel) {
  if ( !isStringWithLength(oldLabel) || !isStringWithLength(newLabel)) {
    console.warn(`[${name}].rename: label to rename and new label must be (non empty) strings`);
    return valueMap;
  }
  
  return reIndex( valueMap
    .map( (entry, i) => entry.label === oldLabel
      ? {label: newLabel, value: EnumValue(newLabel, +entry.value)}
      : entry ));
}

function removeValue(valueMap, name, label = ``) {
  return reIndex(valueMap.filter(entry => entry.label !== label));
}

function isStringWithLength(maybeString) {
  return maybeString?.constructor === String && maybeString.trim().length;
}

function multiFlag(enumArray, key) {
  const combinedFlags = key.split(`|`).reduce((acc, k) =>
    acc |= findValueCI(enumArray, k)?.flag || 0n, 0n);
  
  return { in: subset => InSubset(combinedFlags, subset) };
}

function checkInput(keys, name) {
  if (keys?.constructor === String) {
    return !/^none$/i.test(k.trim()) ? [keys] : [];
  }
  
  if (keys?.constructor !== Array) {
    console.warn(`enumFactory [${name}]: keys should be single String or Array. Inititalized with empty Array`);
    return [];
  }
  
  if (keys.length && keys.find(k => !isStringWithLength(k))) {
    console.warn(`enumFactory [${name}]: some key values are not String or empty strings. They will not be used`);
    return keys.filter(k => isStringWithLength(k));
  }
  
  keys = keys.filter(k => !/^none$/i.test(k.trim()));
  
  return keys;
}

function InSubset(value, subset) {
  return !!(value & subset);
}

function valueIn({enumValues, flag, key, subset} = {}) {
  const flag4Key = enumValues ? findValueCI(enumValues, key)?.flag : flag;
  
  return flag4Key?.constructor !== BigInt ? false : flag4Key === subset || InSubset(flag4Key, subset);
}

function escRE(key) {
  return RegExp(`^${key.trim().replace(/[.*+?^${}()|[/\\]/g, a => `\\${a}`)}$`, 'iu');
}

function findValueCI(enumValues, key) {
  return enumValues.find(v => v.label.toLowerCase() === key.toLowerCase())?.value;
}

function serialize(enumValues, name) {
  const header = `Enum values for Enum [${name}]`;
  const separator = Array(header.length + 1).join(`-`);
  const aggregated = enumValues.map(entry => {
    return `${entry.value} => index: ${+entry.value}, flag: ${entry.value.flag}n (0x${entry.value.flag?.toString(2)})`;
  }).join('\n');
  
  return [header, separator, aggregated].join(`\n`);
}

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

function toBinary8(unsignedInt) {
  const int2Str = unsignedInt.toString(2);
  
  return int2Str.padStart(int2Str.length + (8 - int2Str.length % 8) % 8, "0");
}

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