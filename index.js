export { enumFactory as default, extendBigInt, };

function enumFactory({keys = [], name = `anonymous`} = {}) {
  checkInput(keys, name);
  let mapped = keys.reduce(createMappedValues, {});
  const internals = {
    get keys() { return Object.keys(mapped); },
    get values() { return Object.values(mapped); },
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
      key = String(key).trim();
      
      switch(true) {
        case !isNaN(parseInt(key)):
          return mapped[internals.keys[key]];
        case /\|/.test(key):
          return multiFlag(mapped, key);
        case key.startsWith(`$`):
          return findValueCI(mapped, key.slice(1))?.flag;
        case /\$in$/i.test(key):
          return subset => valueIn({enumArray: mapped, key: key.slice(0, key.indexOf(`$`)), subset});
        case key in internals:
          return internals[key];
        default: return findValueCI(mapped, key);
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
    
    const newKeys = Object.keys(valueMap);
    
    if (newKeys.includes(label)) {
      console.warn(`[${name}].append/prepend/insert "${label}" exists already`);
      return valueMap;
    }
    
    newKeys.splice(at, 0, label);
    
    return newKeys.reduce(createMappedValues, {});
}

function createMappedValues(acc, label, i) {
  return { ...acc, [label]: EnumValue(label, i) };
}

function renameValue(valueMap, enumName, oldLabel, newLabel) {
  if ( !isStringWithLength(oldLabel) || !isStringWithLength(newLabel)) {
    console.warn(`[${name}].rename: label to rename and new label must be (non empty) strings`);
    return valueMap;
  }
  
  return Object.keys(valueMap)
    .map(k => k === oldLabel ? newLabel : k)
    .reduce(createMappedValues, {});
}

function removeValue(valueMap, name, label = ``) {
  return Object.keys(valueMap)
    .filter(l => l !== label)
    .reduce(createMappedValues, {});
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
  if (keys?.constructor !== Array) {
    throw new TypeError(`enumFactory [${name}]: please provide keys (an Array of strings)`);
  }
  if (keys.length && keys.find(k => !isStringWithLength(k))) {
    throw new TypeError(`The keys for enumFactory [${name}] must all be a non empty string`);
  }
  
  return keys;
}

function InSubset(value, subset) {
  return !!(value & subset);
}

function valueIn({enumArray, flag, key, subset} = {}) {
  const flag4Key = enumArray ? findValueCI(enumArray, key)?.flag : flag;
  
  return flag4Key?.constructor !== BigInt ? false : flag4Key === subset || InSubset(flag4Key, subset);
}

function escRE(key) {
  return RegExp(`^${key.trim().replace(/[.*+?^${}()|[/\\]/g, a => `\\${a}`)}$`, 'iu');
}

function findValueCI(enumArray, key) {
  return enumArray[Object.keys(enumArray).find((k) => escRE(key).test(k))];
}

function serialize(enumArray, name) {
  const header = `Enum values for Enum [${name}]`;
  const separator = Array(header.length + 1).join(`-`);
  
  return [...[header,separator],
    ...Object.values(enumArray).map(v => {
      return `${v} => index: ${+v}, flag: ${v.flag} (0x${v.flag.toString(2)})`;
    })].join(`\n`);
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

function EnumValue(value, index) {
  const flag = 1n << BigInt(index);
  
  return Object.freeze({
    toString() { return value; },
    valueOf()  { return index; },
    flag,
    in(subset) { return valueIn({flag, subset}); }
  });
}