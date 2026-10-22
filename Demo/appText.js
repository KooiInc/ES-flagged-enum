export default texts;

function texts(cleanup) {
  const init = cleanup(`
  // import local enum factory function
  import { default as createEnum, extendBigInt } from "[module path]";
  const [In, bin8] = extendBigInt();
  //     ^ see 'Extracting flags to constants'
  
  /**
    syntax
    -------
    let myEnum = createEnum({
      [keys: String|Array&lt;string&gt;],
      [name: String] <= default "Anonymous Enum"
    });
    // myEnum methods
    .append(label: string); &lt;= add a value at enum end
    .prepend(label: string); &lt;= add a value at enum start
    .insert(label: string, position: Number); &lt;= create a value with [label] at enum[position]
    .move(label: string, position: Number);  &lt;= move value[label] to enum[position]
    // =>  Note for insert/move: [position] is NOT zero indexed, so the ordinal number
    .remove(label: string);  &lt;= remove [label] from enum
    .rename(label: string, newLabel: string);  &lt;= rename [label] to [newLabel]
  */`)
  const initializeDOWS = cleanup(`
  // create an enum for british weekday names (used in the examples)
  const dows = createEnum( {
    keys: localeDowNames("en-GB"),
    name: "British weekday names"} );
    
  // function to create Array of weekday names
  function localeDowNames(locale) {
    return [...Array(7)].map((_, i) =>
      Intl.DateTimeFormat(locale, { weekday: 'long' })
        .format(new Date(2006, 0, i + 1)));
  }`);
  const sumUp = cleanup(`
  \`\${dows.thurSDay} (index: \${+dows.Thursday}, flag: \${dows.$thursday}\`
  //  ^ stringify              ^ index                  ^ flag`);
  const wdFromDate = cleanup(`
  let today = dows[new Date().getDay()];
  let isWeekend = today.in(sun|sat);`);
  const extractFlags = cleanup(`
  /**
    The values in [dows] contain so called flags.
    Because flags form a specific (geometric) progression
    (flag[i] = 2**i) flag values can be combined with the
    bitwise | operator. When an  enum comprises many values
    they quickly will be large values, therefore flag values
    are BigInts.
    A flag for an Enum value can be retrieved by either starting the
    a key with the $-sign ([yourEnum][$key]), or [yourEnum][key].flag
    In this example these [dows] flags are extracted to constants.
    Note that following the existing order of the Enum values is
    obligatory here.
  */
  const {sun, mon, tue, wed, thu, fri, sat} = "sun,mon,tue,wed,thu,fri,sat"
    .split(",")
    .reduce( (acc, val, i) => ({...acc, [val]: dows[i].flag}), {} );

  // create a 'weekend' constant from flags for this example
  const weekend = sat|sun;
  
  /**
    Now let's talk about this 'In' thing assigned earlier.
    Flags are actually BigInts. 'In' is an ES Symbol, and it's
    used to extend the BigInt prototype*. With it you can compare
    a subset of flags to another subset of flags. So it the case
    of the flag constants here you can for example use
    (fri|mon)[In](weekend)
    
    The imported 'bin8' is also a symbolic extension for BigInt.
    It converts a BigInt to a string of bits (byte sized). It's used
    in the weekday checkboxes example.
    ---
    * 'Isn't that a bad thing?', you may ask. Well, we prefer not to
       use 'good' or 'bad' in programming. There are just more or less
       effective/efficient patterns. Extending a native prototype using
       Symbol may be fine, it's a choice: see
       https://tinyurl.com/extPrototypeLink
  */`);
  const extractValues = cleanup(`
  /*
    For this example the [dows] Enum values are extracted to consts
    Note: order and casing are irrelevant here
  */
  const {monday, saturday, wednesday, thursday, tuesday, friday, sunday} = dows;`);
  const strValFlag = `<div class="instrct">Stringifying a value within the <code>dows</code>
    Enum delivers the weekday name.
    <br>Converting a value to Number (e.g. <code>+dows.sunday</code>) delivers its index value.
    <br>The values of an Enum can be retrieved with <i>case insensitive</i> keys
    <br>(so <code>dows.sunday</code> equals <code>dows.Sunday</code>).
    <br>A flag value can be retrieved by starting a key with a $-sign.</div>
    <div class="instrct"><b class="red">To sum up</b>:`
  
  return {init, initializeDOWS, sumUp, wdFromDate, extractFlags, strValFlag, extractValues,};
}
