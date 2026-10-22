export default styleIt;

function styleIt($) {
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
    `#log2screen pre.language-javascript {
      border-radius: 8px;
      box-shadow: 2px 2px 6px #000;
    }`,
    `#log2screen .language-javascript {
      background-color: #474949;
      padding: 0.5em;
    }`,
  );
}
