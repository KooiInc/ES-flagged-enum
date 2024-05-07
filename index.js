const [In, bin8] = extendBigInt();

export { enumFactory as default, In, bin8 };

function enumFactory({keys, name = `anonymous`} = {}) {
  keys = checkInput(keys, name);
  
  const mapped = Object.freeze(
    keys.reduce( (acc, v, i) => ({...acc, [v]: EnumValue(v, i)}),{})
  );
  
  const internal = Object.freeze({
    get keys() { return Object.keys(mapped); },
    get values() { return Object.values(mapped); },
    toString() { return serialize(mapped, name); },
    valueOf() { return serialize(mapped, name); },
  });
  
  return new Proxy({}, {
    get(_, key) {
      key = String(key).trim();
      
      switch(true) {
        case !isNaN(parseInt(key)):
          return mapped[internal.keys[key]];
        case /\|/.test(key):
          return multiFlag(mapped, key);
        case key.startsWith(`$`):
          return findValueCI(mapped, key.slice(1))?.flag;
        case /\$in$/i.test(key):
          return subset => valueIn({enumArray: mapped, key: key.slice(0, key.indexOf(`$`)), subset});
        case key in internal:
          return internal[key];
        default: return findValueCI(mapped, key);
      }
    },
    set() {
      throw new TypeError(`Enum [${name}] is readonly`);
    }
  });
}

function multiFlag(enumArray, key) {
  let combinedFlags = key.split(`|`).reduce((acc, k) =>
    acc |= findValueCI(enumArray, k)?.flag || 0n, 0n);
  
  return {in: subset => combinedFlags[In](subset)};
}

function checkInput(keys, name) {
  if (!(keys?.constructor === Array) && keys.length > 0) {
    throw new TypeError(`enumFactory [${name}]: please provide keys (an Array of strings)`);
  }
  
  if (keys.find(k => !(k.constructor === String && k.length > 0))) {
    throw new TypeError(`The keys for enumFactory [${name}] must all be string`);
  }
  
  return keys;
}

function valueIn({enumArray, flag, key, subset} = {}) {
  const flag4Key = enumArray ? findValueCI(enumArray, key)?.flag : flag;
  
  return flag4Key?.constructor !== BigInt ? false : flag4Key === subset || !!(flag4Key & subset);
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
  const toBinary = Symbol(`bin`)
  Object.defineProperties(BigInt.prototype, {
    [inSymbol]: {
      get() { return that => !!(this & that); }
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
  const flag = BigInt(1) << BigInt(index);
  
  return Object.freeze({
    toString() { return value; },
    valueOf()  { return index; },
    flag,
    in(subset) { return valueIn({flag, subset}); }
  });
}