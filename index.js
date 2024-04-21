const [ENUM, ENUM$] = [EnumFactory(), EnumFactory(true)];
export { ENUM as default, ENUM$ };

function EnumFactory(readOnly = false) {
  const enumTrap = retrieveEnumTrap(readOnly);
  
  return function({ name = 'Anonymous instance', values = [] } = {}) {
    let i = 0;
    const Enum = {
      None: BigInt(0),
      [Symbol.for(`name`)]: `ENUM${readOnly ? `$` : ``} ${name}`,
      [Symbol.for(`proxied`)]: `Enum`,
    };
    
    for (const value of values) {
      const name = maybeName(value, Enum);
      i = name ? addFlag(name, Enum, i) : i;
    }
    
    return new Proxy(readOnly ? Object.freeze(Enum) : Enum, enumTrap);
  };
}

function addFlag(name, Enum, i) {
  const value = 1n << BigInt(i);
  Enum[name] = value;
  Enum[`${name}$is`] = (subset) => valueIn(value, subset);
  
  return i + 1;
}

function retrieveEnumTrap(readOnly) {
  const traps = {
    add: (target, readOnly) => add(target, readOnly),
    keyfor: (target) => key4Value(target),
    has: () => valueIn,
    is: () => valueIn,
    remove: (target, readOnly) => remove(target, readOnly),
    keys: (target) => Object.keys(target).filter((k) => !/\$/.test(k)),
  };
  
  return trapMe(traps, readOnly)
}

function trapMe(traps, readOnly) {
  const notKeysRE = RegExp(`symbol|prototype|(^${
    Object.keys(traps).join(`|`)}|constructor|tostring|valueof)$`, `i`);
  
  return {
    get(target, key) {
      if (typeof key === `symbol`) {
        return /\(name\)$/i.test(String(key)) ? target[Symbol.for(`name`)] : target[key];
      }
      
      let key_lc = String(key).trim().toLowerCase();
      let method = key_lc.split(/[._]/)?.[1]?.toUpperCase();
      const value = retrieveEnumValue(target, key_lc, key, notKeysRE);
      
      return method in traps
        ? traps[method](value)
        : key_lc in traps
          ? traps[key_lc](target, readOnly)
          : value;
    },
  };
}

function add(target, readOnly) {
  return key => {
    key = String(key).trim();
    const enumName = `${target[Symbol.for(`name`)]}`;
    return readOnly
      ? warn(
        `${enumName} is readonly. [add("${key}")] not available.`,
        () => {} )
      : getKeyValue(target)(key)
        ? warn(`${enumName} add: "${key}" exists, not added`)
        : isInvalid(key)
          ? warn(`${enumName} add: "${key}" invalid key value`)
          : addFlag(key, target, Object.values(target).length);
  };
}

function remove(target, readOnly) {
  return key => {
    const enumName = `${target[Symbol.for(`name`)]}`;
    
    if (readOnly) {
      return warn(
        `${enumName} is readonly. [remove("${key}")] not available.`,
        () => {}
      );
    }
    
    const realKey = getKeyValue(target)(String(key));
    
    if (!realKey) {
      return warn(`${enumName} remove: key "${key}" does not exist`);
    }
    
    delete target[realKey];
    reFlag(target);
  };
}

function reFlag(target) {
  const keys = Object.keys(target);
  
  for (let i = 0; i < keys; i += 1) {
    const [key] = keys[i];
    
    if (/\$/.test(key)) {
      delete target[key];
      continue;
    }
    
    if (key !== `None`) {
      delete target[key];
      addFlag(key, target, i);
    }
  }
}

function escRE(key) {
  return RegExp(`^${key.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
}

function valueIn(value, subset) {
  return value === subset ? true : !!(value & subset);
}

function findTargetCI(target, key) {
  return target[Object.keys(target).find((k) => escRE(key).test(k))];
}

function isInvalid(value) {
  return !/^[a-z]/i.test(value) && /[^a-z0-9_$]/gi.test(value);
}

function warn(warning, returnValue) {
  console.warn(warning);
  return returnValue;
}

function getKeyValue(target) {
  return (forKey) =>
    Object.keys(target).find( (key) => key.toLowerCase() === forKey.toLowerCase() );
}

function getTargetFor(target, key) {
  return target[key] ?? findTargetCI(target, key);
}

function retrieveEnumValue(target, key, originalKey, notKeysRE) {
  key = String(key).trim();
  const warnNoKey = (invalid, rv) =>
    warn( `${enumName}[${originalKey}] ${
      invalid ? `is invalid and thus ` : ``}does not exist`, rv ?? target.None );
  const invalid = isInvalid(key);
  const enumName = target[Symbol.for('name')];
  const hasKey = getKeyValue(target)(key) || false;
  
  return !hasKey && /\$is$/i.test(key)
    ? warnNoKey(invalid, (subset) => valueIn(target.None, subset))
    : !notKeysRE.test(key) && !hasKey
      ? warnNoKey(invalid)
      : hasKey
        ? getTargetFor(target, key)
        : target.None;
}

function key4Value(target) {
  return (value) => {
    const enumName = `${target[Symbol.for(`name`)]}`;
    if (typeof value !== 'bigint') {
      return warn(
        `${enumName}.keyFor input should be a BigInt (e.g. [yourEnum][yourkey], now ${value}`,
        () => undefined
      );
    }
    
    const found = Object.entries(target).find(([_, val]) => val === value);
    return (found && found[0]) || undefined;
  };
}

function maybeName(value, target) {
  value = String(value);
  
  return isInvalid(value)
    ? warn(
      `${target[Symbol.for(`name`)]} on create: "${value}" not valid, omitted`,
      false
    )
    : value.trim();
}

function pipe(...functions) {
  return initial => functions.reduce((param, func) => func(param), initial);
}