import {default as createEnum, In } from "../index.js";
import { $, logFactory } from './sbhelpers.js';
const { log: print } = logFactory();
const cleanup = str => str.replace(/\n {2}/gm, `\n`);
const appText = texts();
window.factory = createEnum;

initializeAndRunDemo();

function runDemo() {
  let dows = createEnum({keys: localeDowNames(`en-GB`), name: `British weekday names`});

  // experiment in the console
  window.dows = dows;

  // note: order must follow the Enum order
  const {sun, mon, tue, wed, thu, fri, sat} = `sun,mon,tue,wed,thu,fri,sat`.split(`,`)
    .reduce( (acc, val, i) => ({...acc, [val]: dows[i].flag}), {});
  
  // note: order not mandatory
  const {monday, saturday, wednesday, thursday, tuesday, friday, sunday} = dows;
  const weekend = sun|sat;
  
  if (/stackblitz/i.test(location.href)) {
    print(`!!<p><a target="_top" href="https://stackblitz.com/@KooiInc">Other Stackblitz projects</a></p>`);
  }
  
  print(`!!British weekday names example`,
    `!!<code class="block">${appText.initialize}</code>`);

  print(`<code>\`\${dows}\` <span class="comment">// invokes toString</span></code> =><pre>${dows}</pre>`);

  print(`!!Extracting flags to constants`,
    `!!<code class="block">${appText.extractFlags}</code>`);

  print(`!!Extracting enum values to constants`,
    `!!<code class="block">${appText.extractValues}</code>`);

  print(`!!String, value,  flag`,
    `${appText.strValFlag}
    <code class="block">${appText.sumUp}</code></div>
    => ${dows.thurSDay} (index: ${+dows.ThursDay}, flag: ${dows.$thursday})`);

  print(`<div class="instrct">Every Enum value knows a <code>.flag</code>
    property to retrieve its flag value<div>
    <code>dows.wednesday.flag</code> => ${dows.wednesday.flag}`);

  print(`
    <div class="instrct">Every Enum value contains a <code>.in</code> method to compare the value
      <br>at hand to a (subset of) flag values(s)<div>
    <code>dows.sunday.in(dows.$SATURDAY|dows.$SUNDAY|dows.friday.flag)</code> => ${
      dows.sunday.in(dows.$SATURDAY|dows.$SUNDAY|dows.friday.flag)}
    <br><code>sunday.in(wed|fri)</code> => ${sunday.in(wed|fri)}
    <br><code>sunday.in(sunday.flag)</code> => ${sunday.in(sunday.flag)}
    <br><code>dows.$sunday === sunday.flag</code> => ${dows.$sunday === sunday.flag}
    <br><code>Boolean(dows.$sunday & (tue|fri))</code> => ${Boolean(dows.$sunday & (tue|fri))}`);

  print(`<div class="instrct">To compare a value to a (subset of) flag value(s)
    appending "$in" to a key can also be used<div>
    <code>dows.sunday$in(fri)</code> => ${dows.sunday$in(fri)}
    <br><code>dows.sunday$in(sun|wed|fri)</code> => ${dows.sunday$in(wed|fri|sun)}
    <br><code>dows.sunday$in(sun)</code> => ${dows.sunday$in(sun)}`);
  
  let today = dows[new Date().getDay()];
  let isWeekend = today.in(sun|sat);
  print(`<div class="instrct">
     An Enum value can be retrieved by its index value.
     <br>So in case of the <code>dows</code> Enum it can be used to retrieve the weekday name
      from a Date.</div>
    <div><code class="block">${appText.wdFromDate}</code></div>
    <code>today</code> => ${today}
    <br><code>isWeekend</code> => ${isWeekend}`);

  print(
    `!!More roads to Rome for flag(s) comparison`,
    `<code>saturday.in(weekend)</code> => ${saturday.in(weekend)}`,
    `<code>saturday.in(sun|sat)</code> => ${saturday.in(sun|sat)}`,
    `<code>dows.saturday$in(sat|sun)</code> => ${dows.saturday$in(sun|sat)}`,
    `<code>dows.saturday$in(dows.$Saturday|dows.$Sunday)</code> => ${dows.saturday$in(dows.$SATURDAY|dows.$SUNDAY)}`,
    `<code>saturday.in(dows.$SATURDAY|dows.$sunday)</code> => ${saturday.in(dows.$SATURDAY|dows.$SUNDAY)}`,
    `<code>saturday.in(saturday.flag)</code> => ${saturday.in(saturday.flag)}`,
    `<code>saturday.in(dows[6].flag|friday.flag)</code> => ${saturday.in(dows[6].flag|friday.flag)}`,
    `<code>saturday.in(dows.tuesday.flag|dows[6].flag)</code> => ${saturday.in(dows.tuesday.flag|dows[6].flag)}`,
    `<code>saturday.in(dows["$" + String(dows[6])])</code> => ${saturday.in(dows["$" + String(dows[6])])}`,
    `<code>(sat|fri|wed)[In](sat|sun)</code> => ${(sat|fri|wed)[In](sat|sun)}`,
    `<code>(saturday.flag|friday.flag)[In](sat|sun)</code> => ${(saturday.flag|friday.flag)[In](sat|sun)}`,
    `<code>dows["saturday|thursday|wednesday"].in(sat|sun)</code> => ${
      dows["saturday|thursday|wednesday"].in(sat|sun)}`,
    `<code>dows["saturday|invalid|what_the_heck"].in(sat|sun)</code> => ${
      dows["saturday|invalid|what_the_heck"].in(sat|sun)}`,
    `<code>dows["NADA|invalid|what_the_heck"].in(sat|sun)</code> => ${
      dows["NADA|invalid|what_the_heck"].in(sat|sun)}`,
  );

  createCodeBlocks();
}

function texts() {
  const initialize = cleanup(`
  // import local enum factory function
  import {default as createEnum, In} from "./EnumFactory.js";
  //                             ^ see 'Extracting flags to variables'

  // function to create Array of weekday names
  function localeDowNames(locale) {
    return [...Array(7)].map((_, i) =>
      Intl.DateTimeFormat(locale, { weekday: 'long' })
        .format(new Date(2006, 0, i + 1)));
  }

  // create an enum for british weekday names
  const dows = createEnum( {
    keys: localeDowNames("en-GB"),
    name: "British weekday names"} );`);
  const sumUp = cleanup(`
  \`\${dows.thurSDay} (index: \${+dows.Thursday}, flag: \${dows.$thursday}\`
  //  ^ stringify              ^ index                  ^ flag`);
  const wdFromDate = cleanup(`
  let today = dows[new Date().getDay()];
  let isWeekend = today.in(sun|sat);`);
  const extractFlags = cleanup(`
  /*
    the values in [dows] contain flags.
    Flags are values that can be combined with the bitwise | operator.
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
  
  /*
    Now let's talk about this 'In' thing imported earlier.
    Flags are actually BigInts. 'In' is an ES Symbol, and it's
    used to extend the BigInt prototype*. With it you can compare
    a subset of flags to another subset of flags. So it the case
    of the flag constants here you can for example use
    (fri|mon)[In](weekend)
    ---
    * 'Isn't that a bad thing?', you may ask. Well, maybe not:
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

  return {initialize, sumUp, wdFromDate, extractFlags, strValFlag, extractValues};
}

function createCodeBlocks() {
  document.querySelectorAll(`code.block`)
  .forEach(block => {
    block = $(block);
    block.removeClass(`block`);
    block.addClass(`language-javascript`, `line-numbers`);
    block.closest(`div`)
    .append($(`<pre class="line-numbers language-javascript"></pre>`)
      .append(block));
  });

  Prism.highlightAll();
}

function extendBigInt(bitOrSymbol, inSymbol) {
  Object.defineProperties(BigInt.prototype, {
    [bitOrSymbol]: {
      get() { return that => this | that; }
    },
    [inSymbol]: {
      get() { return that => !!(this & that); }
    }
  });
}

function localeDowNames(locale) {
  return [...Array(7)].map((_, i) =>
    Intl.DateTimeFormat(locale, { weekday: 'long' })
      .format(new Date(2006, 0, i + 1)));
}

function initializeAndRunDemo() {
  $.editCssRules(
    `body {
      font: normal 14px/20px verdana, arial;
      margin: 2rem;
    }`,
    
    `.arrow:before {
      content: '⇨';
      display: inline-block;
      vertical-align: top;
      font-size: 1.2rem;
      color: red;
    }`,
    `b.red {color: red; }`,
    `#log2screen code {
      padding: 0 2px;
    }`,
   `span.comment { color: grey; }`,
   `#log2screen div.instrct {color: #555}`,
   `#log2screen code.language-javascript {
      background-color: revert;
      color: revert;
    }`
  );

  runDemo();
}