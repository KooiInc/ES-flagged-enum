import {default as createEnum, extendBigInt } from "../index.js";
import { $, logFactory } from  "./sbhelpers.bundled.js";
const { log: print } = logFactory();
const cleanup = str => str.replace(/\n {2}/gm, `\n`);
const appText = texts();
window.factory = createEnum;
const [In, bin8] = extendBigInt();

const isSB = /stackblitz/i.test(location.href);
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
  
  if (isSB) {
    print(`!!<p><a target="_top" href="https://stackblitz.com/@KooiInc">Other Stackblitz projects</a>
    | <a target="_blank" href="https://github.com/KooiInc/ES-flagged-enum">@Github</a></p>`);
  }
  
  if (/github/i.test(location.href)) {
    print(`!!<p><a target="_top" href="https://github.com/KooiInc/ES-flagged-enum">Back to repository</a> |
      <a target="_blank" href="https://stackblitz.com/edit/js-gxqsej?file=index.js">Example code @Stackblitz</a></p>`);
  }
  
  print(
    `!!British weekday names example
      <div class="instrct">This module enables the creation of a flagged enumeration (<code>Enum</code>)
      from an array of strings. A created enum is immutable.
      You can prepend/append/remove/rename keys to it, but should always (re)assign to have the
      desired enum available.
      <br>Best way to learn about it is by example.
      In the following an example for an <code>Enum</code> of weekdays is worked
      out, with code examples and more explanation in comment within the code blocks.</div>`,
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
  checkboxesDemo(dows, appText.cbCode);
  createCodeBlocks();
  wrap2Container();
  
}

function texts() {
  const initialize = cleanup(`
  // import local enum factory function
  import { default as createEnum, extendBigInt } from "./EnumFactory.js";
  const [In, bin8] = extendBigInt();
  //     ^ see 'Extracting flags to constants'
  
  /**
    syntax
    -------
    let myEnum = createEnum({keys: Array&lt;string&gt;, name: string});
                                   ^ at least 1
    myEnum.append(label: string); &lt;= add a value at enum end
    myEnum.prepend(label: string); &lt;= add a value at enum start
    myEnum.insert(label: string, position: Number); &lt;= insert a value at enum[position]
    myEnum.remove(label: string);  &lt;= remove [label] from enum
    myEnum.rename(label: string, newLabel: string);  &lt;= rename [label] to [newLabel]
  */
  
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
  const syntax = cleanup(`
  
  `);
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
  
  return {initialize, sumUp, wdFromDate, extractFlags, strValFlag, extractValues,};
}

function wrap2Container() {
  $(`<div class="container">`)
    .append($(`#log2screen`));
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
    `.container {
      position: absolute;
      padding-bottom: 2rem;
      inset: 0;
    }`,
    `#log2screen .head div.regular {
      font-weight: normal;
    }`,
    `#log2screen {
      max-width: 50vw;
      margin: 0 auto;
      @media (max-width: 1024px) {
        max-width: 90vw;
      }
      @media (min-width: 1024px) and (max-width: 1200px) {
        max-width: 80vw;
      }
      @media (min-width: 1200px) and (max-width: 1600px) {
        max-width: 60vw;
      }
      @media (min-width: 1600px) {
        max-width: 40vw;
      }
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
    `#log2screen div.instrct {
      color: #555;
      font-weight: normal;
    }`,
    `#log2screen code.language-javascript {
      background-color: revert;
      color: revert;
    }`,
  );
  
  $(`head`).append(`<link rel="icon" href="./githubicon.png" type="image/png">`);
  runDemo();
}

function createCheckboxesHTML() {
  return $.virtual(`<div id="weekdays">`).append(
    "<input type='hidden' id='blockValue'>",
    `<div>
      <input type="checkbox" id="allcb" data-subset="all" class="gcb"/>
      <label for="allcb" data-gcb="All"></label></div>`,
    `<div>
      <input type="checkbox" id="midweekcb" data-subset="midweek" class="gcb"/>
      <label for="midweekcb" data-gcb="Work week"></label></div>`,
    `<div>
      <input type="checkbox" id="weekendcb" data-subset="weekend" class="gcb"/>
      <label for="weekendcb" data-gcb="Weekend"></label></div>`,
    "<hr>",
    ...dows.values.map( value =>
      `<div>
          <input type="checkbox" data-wd-item="${value}" value="${
        value.flag}" id="cb${value}"/>
          <label for="cb${value}">${value}</label>
        </div>` ),
    "<hr>",
    `<div>Bit value: <span id="bitValue">${0n[bin8]} (0x0)</span></div>`,
    "<div>Selected day(s): <span id='fromBits'>None</span></div>" );
}

function styleCheckboxes() {
  $.editCssRule(`
    #weekdays {
      label {
        cursor: pointer;
        &[data-gcb] {
          &:after {
            color: green;
            font-weight: bold;
            content: attr(data-gcb);
          }
        }
      }
      input {
        vertical-align: middle;
      }
    }`);
}

function appendCbContainer(containerElem) {
  let cbCode = checkboxesDemo.toString().replace(/</g, "&lt;");
  const removeSpacesRE = RegExp(`\n {${isSB ? 4 : 2}}`, `g`);
  cbCode = cbCode.slice(cbCode.indexOf(`{`) + 1, -1).trim().replace(removeSpacesRE, `\n`);
  print(`!!Create and handle a block of weekday checkboxes`,
    containerElem.HTML.get(true),
    `!!Relevant code for the above
        </h3><code class="block">${cbCode}</code>`,
    `!!<p><!--space-->&nbsp;</p>`);
  styleCheckboxes();
  const root = $(`#weekdays`);
  return [$("#blockValue", root), $("#bitValue", root),
    $("#fromBits", root), $("[data-wd-item]", root)];
}

function checkboxesDemo(dows) {
  // The html is created/appended and handled using JQL ($)
  // see https://github.com/KooiInc/JQL
  const [blockValue, bitValue, fromBits, dowCheckBoxes] =
    appendCbContainer(createCheckboxesHTML());
  $.delegate("click", "input[type='checkbox']", handle);
  
  // checkboxes click handler
  function handle(evt) {
    if (evt.target.dataset.subset) { return selectSubset(evt); }
    return setSelectedValues();
  }
  
  // handle subset click
  function selectSubset(evt) {
    $("[data-subset]").each(cb =>
      cb.checked = cb === evt.target ? evt.target.checked : false);
    
    if (!evt.target.checked) {
      dowCheckBoxes.each(cb => cb.checked = false);
      return setSelectedValues();
    }
    
    switch(evt.target.dataset.subset) {
      case "midweek": dowCheckBoxes.each( cb => {
        return cb.checked = !/sunday|saturday/i.test(cb.dataset.wdItem);
      });
        break;
      case "weekend":
        dowCheckBoxes.each( cb => {
          return cb.checked = /sunday|saturday/i.test(cb.dataset.wdItem);
        });
        break;
      default: dowCheckBoxes.each(cb => cb.checked = true);
    }
    
    return setSelectedValues();
  }
  
  // report values after click
  function setSelectedValues() {
    const val = $.nodes("[data-wd-item]:checked")
      .reduce( (a, v) => a + BigInt(v.value), 0n )[bin8];
    const selectedDays = valuesFromBits(val, dows).join(", ");
    blockValue.val(val);
    bitValue.text(`${val} (0x${parseInt(val, 2).toString(2)})`);
    fromBits.text(`${selectedDays.length && selectedDays || `None`}`);
  }
  
  // retrieve weekdays (names) from bit value
  function valuesFromBits(bitValue, Enum) {
    return [...bitValue].reverse().reduce( (a, v, i) => {
      return !!(+v) ? [...a, String(Enum[i])] : a;
    }, []);
  }
}