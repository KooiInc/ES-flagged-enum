/**
 * Work In Progress
 * ----------------------------------------------------------------------
 * The module delivers two ways to create an Enum:
 * ENUM(...values)  => writable (can add or remove values), default
 * ENUM$(...values) => readonly
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
 */
const ENUM = EnumFactory();
const ENUM$ = EnumFactory(true);

export { ENUM as default, ENUM$ };

function EnumFactory(readOnly = false) {
  const enumTrap = retrieveEnumTrap(readOnly);

  return function ENUM({ name = 'Anonymous instance', values = [] } = {}) {
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

function retrieveEnumTrap(readOnly, name) {
  const traps = {
    add: (target, readOnly) => add(target, readOnly),
    keyfor: (target) => key4Value(target),
    has: () => valueIn,
    is: () => valueIn,
    remove: (target, readOnly) => remove(target, readOnly),
    keys: (target) => Object.keys(target).filter((k) => !/\$/.test(k)),
  };

  const notKeysRE = RegExp(
    `symbol|prototype|(^${Object.keys(traps).join(`|`)}|constructor|tostring|valueof)$`, `i`);

  const enumTrap = {
    get(target, key) {
      if (typeof key === `symbol` && !/name/i.test(String(key))) {
        return target[key];
      }

      if (String(key) === Symbol.for(`name`)) {
        return target[Symbol.for(`name`)];
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

  return enumTrap;
}

function add(target, readOnly) {
  return (value) => {
    value = String(value).trim();
    const enumName = `${target[Symbol.for(`name`)]}`;

    if (readOnly) {
      return warn(
        `${enumName} is readonly. [add("${value}")] not available.`,
        () => {}
      );
    }

    if (getKeyValue(target)(value)) {
      return warn(`${enumName} add: "${value}" exists, not added`);
    }

    if (isInvalid(value)) {
      return warn(`${enumName} add: "${value}" invalid key value`);
    }

    return addFlag(value, target, Object.values(target).length);
  };
}

function remove(target, readOnly) {
  return (key) => {
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
  const entries = Object.entries(target);

  for (let i = 0; i < entries; i += 1) {
    const [key] = entries[i][0];

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
    Object.keys(target).find(
      (key) => key.toLowerCase() === forKey.toLowerCase()
    );
}

function getTargetFor(target, key) {
  return target[key] ?? findTargetCI(target, key);
}

function retrieveEnumValue(target, key, originalKey, notKeysRE) {
  key = String(key).trim();
  const warnNoKey = (invalid, rv) =>
    warn(
      `${enumName}[${originalKey}${
        invalid ? ` (invalid!)` : ``
      }] does not exist`,
      rv ?? target.None
    );
  const invalid = isInvalid(key);
  const enumName = target[Symbol.for('name')];
  const hasKey = getKeyValue(target)(key) || false;

  if (!hasKey && /\$is$/i.test(key)) {
    return warnNoKey(invalid, (subset) => valueIn(target.None, subset));
  }

  if (!notKeysRE.test(key) && !hasKey) {
    return warnNoKey(invalid);
  }

  return hasKey ? getTargetFor(target, key) : target.None;
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
        `${
          target[Symbol.for(`name`)]
        } on create: "${value}" not valid, omitted`,
        false
      )
    : value.trim();
}
