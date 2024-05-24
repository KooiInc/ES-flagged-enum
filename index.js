export { enumFactory as default, extendBigInt, };

function enumFactory({keys, name = `anonymous`} = {}) {
  keys = checkInput(keys, name);
  
  let mapped = Object.freeze(keys.reduce( (acc, v, i) => ({...acc, [v]: EnumValue(v, i)}),{}));
  
  const internals = Object.freeze({
    get keys() { return Object.keys(mapped); },
    get values() { return Object.values(mapped); },
    get name() { return name; },
    append: function(label) { return insertValue(mapped)(label, mapped.length); },
    prepend: function(label) { return insertValue(mapped)(label, 0); },
    insert: function(label, at) { return insertValue(mapped)(label, at); },
    remove: removeValue(mapped),
    rename: renameValue(mapped),
    toString() { return serialize(mapped, name); },
    valueOf() { return serialize(mapped, name); },
  });
  
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

function insertValue(forEnum) {
  return function(label, at = 0) {
    if ( label.constructor !== String || label.length < 1) {
      throw new TypeError(`[${forEnum.name}].append/prepend/insert: provide a valid label (non empty string)`);
    }
    const newKeys = Object.keys(forEnum);
    newKeys.splice(at, 0, label);
    return enumFactory({keys: newKeys, readOnly: false, name: forEnum.name});
  }
}

function renameValue(forEnum ) {
  return function(oldLabel, newLabel) {
    if ( oldLabel.constructor !== String || oldLabel.length < 1
      || newLabel.constructor !== String || newLabel.length < 1) {
      throw new TypeError(`[${forEnum.name}].rename: label to rename and new label must be (non empty) strings`);
    }
    const newKeys = Object.keys(forEnum).map(k => k === oldLabel ? newLabel : k);
    return enumFactory({keys: newKeys, readOnly: false, name: forEnum.name});
  }
}

function removeValue(forEnum ) {
  return function(label) {
    if ( label.constructor !== String || label.length < 1) {
      throw new TypeError(`[${forEnum.name}].remove: provide a valid label (non empty string)`);
    }
    const newKeys = Object.keys(forEnum).filter(l => l !== label);
    return enumFactory({keys: newKeys, readOnly: false, name: forEnum.name});
  }
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
  
  if (keys.find(k => k?.constructor !== String || String(k).trim().length < 1)) {
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