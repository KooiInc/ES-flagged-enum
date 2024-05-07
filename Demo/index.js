import {default as createEnum, In, bin8 } from "../index.js";
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
    print(`!!<p><a target="_top" href="https://stackblitz.com/@KooiInc">Other Stackblitz projects</a>
    | <a target="_blank" href="https://github.com/KooiInc/ES-flagged-enum">@Github</a></p>`);
  }
  
  print(
    `!!British weekday names example`,
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
  import { default as createEnum, In, bin8 } from "./EnumFactory.js";
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
    The values in [dows] contain so called flags.
    Because flags form a specific (geometric) sequence
    (a[n] = 1 * 2^(n-1)) they can be combined with the
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
  
  /*
    Now let's talk about this 'In' thing imported earlier.
    Flags are actually BigInts. 'In' is an ES Symbol, and it's
    used to extend the BigInt prototype*. With it you can compare
    a subset of flags to another subset of flags. So it the case
    of the flag constants here you can for example use
    (fri|mon)[In](weekend)
    
    The imported 'bin8' is also a symbolic extension for BigInt.
    It converts a BigInt to a string of bits (byte sized). It's used
    in the weekday checkboxes example.
    ---
    * 'Isn't that a bad thing?', you may ask. Well, maybe not:
    https://tinyurl.com/extPrototypeLink
  */`);
  const cbCode = cleanup(`
  // create a container (using JQL ($)) and click handler for checkboxes
  // JQL see https://github.com/KooiInc/JQL
  let container = $(\`&lt;div id="weekdays">&lt;input type="hidden" id="bitval">&lt;/div>\`)
    .append(
      \`&lt;div>
         &lt;input type="checkbox" id="all" class="gcb"/>
         &lt;label for="all" data-gcb="All">&lt;/label>
       &lt;/div>\`,
      \`&lt;div>
         &lt;input type="checkbox" id="midweek" class="gcb"/>
         &lt;label for="midweek" data-gcb="Work week">&lt;/label>
       &lt;/div>\`,
      \`&lt;div>
         &lt;input type="checkbox" id="weekend" class="gcb"/>
         &lt;label for="weekend" data-gcb="Weekend">&lt;/label>
       &lt;/div>\`,
      \`&lt;hr>\`);
  dows.keys.forEach(key => {
    let flag = dows[key].flag;
    container.append($(\`&lt;div>
      &lt;input type="checkbox" class="wd" value="\${flag}" id="cb\${flag}"/>
      &lt;label for="cb\${flag}">\${key}&lt;/label>&lt;/div>\`));
  });
  container.append(
    \`&lt;hr>\`,
    \`&lt;div>Bit value: &lt;span id="bitvalue">\${0n[bin8]} (0x0)&lt;/span>&lt;/div>\`,
    \`&lt;div>Selected day(s): &lt;span id="fromBits">None&lt;/span>&lt;/div>\`);

  let [bitvalInput, bitvalue, fromBits] = [
    \$("#bitval"), \$("#bitvalue"), $("#fromBits") ];

  $.delegate("click", "input[type='checkbox']", handle);

  // checkboxes click handler
  function handle(evt) {
    if (evt.target.classList.contains("gcb")) {
      const what = evt.target.id;
      const isChecked = evt.target.checked;
      const dowCBs = $("input[type='checkbox']:not(.gcb)");
      $("input[type='checkbox']").each(cb =>
        cb.checked = cb === evt.target ? evt.target.checked : false);
      
      switch(what) {
        case "midweek": dowCBs.each( (cb,i) =>
          !/sunday|saturday/i.test(String(dows[i])) && (cb.checked = isChecked) );
          break;
        case "weekend": dowCBs.each( (cb,i) =>
          /sunday|saturday/i.test(String(dows[i])) && (cb.checked = isChecked) );
          break;
        default: dowCBs.each(cb => cb.checked = isChecked);
      }
    }
    
    let val = $.nodes(".wd:checked").reduce( (a, v) =>
      a + BigInt(v.value), 0n )[bin8];
    
    let selectedDays = valuesFromBits(val, dows).join(\`, \`);
    bitvalInput.val(val);
    bitvalue.text(\`\${val} (0x\${parseInt(val, 2).toString(2)})\`);
    fromBits.text(\`\${selectedDays.length && selectedDays || \`None\`}\`);
  }
  
  // style labels
  $.editCssRules(
    \`label[data-gcb]:after {
      color: green;
      font-weight: bold;
      content: attr(data-gcb);
    }\`,
    \`label { cursor: pointer; }\`
  );

  // get enum labels from bit string
  function valuesFromBits(bitValue, Enum) {
    return [...bitValue]
      .reverse()
      .reduce( (a, v, i) => !!(+v) ? [...a, String(Enum[i])] : a, []);
  }`);
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
  
  return {initialize, sumUp, wdFromDate, extractFlags, strValFlag, extractValues, cbCode};
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
    `#log2screen div.instrct {color: #555}`,
    `#log2screen code.language-javascript {
      background-color: revert;
      color: revert;
    }`,
    `input[type='checkbox'] {
      vertical-align: bottom;
    }`,
    `label[data-gcb]:after {
      color: green;
      font-weight: bold;
      content: attr(data-gcb);
    }`,
    `label {cursor: pointer}`,
  );
  
  $(`head`).append(`<link rel="icon" href="./githubicon.png" type="image/png">`);
  runDemo();
}

function valuesFromBits(bitValue, Enum) {
  return [...bitValue].reverse().reduce( (a, v, i) => !!(+v) ? [...a, String(Enum[i])] : a, []);
}

function checkboxesDemo(dows, code) {
  window.$ = $;
  let container = $.virtual(`<div id="weekdays"><input type="hidden" id="bitval"></div>`)
    .append(
      `<div>
        <input type="checkbox" id="all" class="gcb"/>
        <label for="all" data-gcb="All"></label></div>`,
      `<div>
        <input type="checkbox" id="midweek" class="gcb"/>
        <label for="midweek" data-gcb="Work week"></label></div>`,
      `<div>
        <input type="checkbox" id="weekend" class="gcb"/>
        <label for="weekend" data-gcb="Weekend"></label></div>`,
      `<hr>`);
  dows.keys.forEach(key => {
    let flag = dows[key].flag;
    container.append(`
      <div><input type="checkbox" class="wd" value="${flag}" id="cb${flag}"/>
        <label for="cb${flag}">${key}</label></div>`);
  });
  container.append(
    `<hr>`,
    `<div>Bit value: <span id="bitvalue">${0n[bin8]} (0x0)</span></div>`,
    `<div>Selected day(s): <span id="fromBits">None</span></div>`);
  
  print(`!!Create and handle a block of weekday checkboxes`,
    container.HTML.get(true),
    `!!Code for the above</h3><code class="block">${code}</code>`,
    `!!<p>&nbsp;</p>`);
  
  
  let [bitvalInput, bitvalue, fromBits] = [
    $(`#bitval`), $(`#bitvalue`), $(`#fromBits`), $(`#allNone`),];
  
  $.delegate(`click`, `input[type='checkbox']`, handle);
  
  function handle(evt) {
    if (evt.target.classList.contains(`gcb`)) {
      const what = evt.target.id;
      const isChecked = evt.target.checked;
      $(`input[type='checkbox']`).each(cb =>
        cb.checked = cb === evt.target ? evt.target.checked : false);
      let dowCBs = $(`input[type='checkbox']:not(.gcb)`);
      
      switch(what) {
        case `midweek`: dowCBs.each( (cb,i) => !/sunday|saturday/i.test(String(dows[i])) && (cb.checked = isChecked) ); break;
        case `weekend`: dowCBs.each( (cb,i) => /sunday|saturday/i.test(String(dows[i])) && (cb.checked = isChecked) ); break;
        default: dowCBs.each(cb => cb.checked = isChecked);
      }
    }
    
    let val = $.nodes(`.wd:checked`)
      .reduce( (a, v) => a + BigInt(v.value), 0n )[bin8];
    let selectedDays = valuesFromBits(val, dows).join(`, `);
    bitvalInput.val(val);
    bitvalue.text(`${val} (0x${parseInt(val, 2).toString(2)})`);
    fromBits.text(`${selectedDays.length && selectedDays || `None`}`);
  }
}