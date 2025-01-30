/* eslint-disable import/no-extraneous-dependencies */
import { visualRegressionPlugin } from '@web/test-runner-visual-regression/plugin';
import { playwrightLauncher } from '@web/test-runner-playwright';

import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const fuzzy = ['win32', 'darwin'].includes(process.platform); // allow for 1% difference on non-linux OSs
const local = !process.env.CI;

console.assert(local, 'Running in CI!');
console.assert(!fuzzy, 'Running on OS with 1% test pixel diff threshold!');

const thresholdPercentage = fuzzy && local ? 1 : 0;

const filteredLogs = [
  'Running in dev mode',
  'Lit is in dev mode',
  'mwc-list-item scheduled an update',
];

const browsers = [
     playwrightLauncher({ product: 'chromium' }),
   ];

function defaultGetImageDiff({ baselineImage, image, options }) {
  let error = '';
  let basePng = PNG.sync.read(baselineImage);
  let png = PNG.sync.read(image);
  let { width, height } = png;

  if (basePng.width !== png.width || basePng.height !== png.height) {
    error =
      `Screenshot is not the same width and height as the baseline. ` +
      `Baseline: { width: ${basePng.width}, height: ${basePng.height} }` +
      `Screenshot: { width: ${png.width}, height: ${png.height} }`;
    width = Math.max(basePng.width, png.width);
    height = Math.max(basePng.height, png.height);
    let oldPng = basePng;
    basePng = new PNG({ width, height });
    oldPng.data.copy(basePng.data, 0, 0, oldPng.data.length);
    oldPng = png;
    png = new PNG({ width, height });
    oldPng.data.copy(png.data, 0, 0, oldPng.data.length);
  }

  const diff = new PNG({ width, height });

  const numDiffPixels = pixelmatch(basePng.data, png.data, diff.data, width, height, options);
  const diffPercentage = (numDiffPixels / (width * height)) * 100;

  return {
    error,
    diffImage: PNG.sync.write(diff),
    diffPercentage,
  };
}

export default /** @type {import("@web/test-runner").TestRunnerConfig} */ ({
  plugins: [
    visualRegressionPlugin({
      update: process.argv.includes('--update-visual-baseline'),
      getImageDiff: (options) => {
        const result =  defaultGetImageDiff(options);
        if (result.diffPercentage < thresholdPercentage)
          result.diffPercentage = 0;
        return result;
      }
    }),
  ],

  files: 'dist/**/*.spec.js',

  groups: [
    {
      name: 'visual',
      files: 'dist/**/*.test.js',
      testRunnerHtml: testFramework => `
        <html>
          <head>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@300&family=Roboto:wght@300;400;500&display=swap">
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
          </head>
          <body>
            <style class="deanimator">
            *, *::before, *::after {
            -moz-transition: none !important;
            transition: none !important;
            -moz-animation: none !important;
            animation: none !important;
            }
            </style>
            <script polyfill="" scoped-custom-element-registry="">
  if (!('createElement' in ShadowRoot.prototype)) {
    (function(){
  /*
  
   Copyright (c) 2020 The Polymer Project Authors. All rights reserved.
   This code may only be used under the BSD style license found at
   http://polymer.github.io/LICENSE.txt
   The complete set of authors may be found at
   http://polymer.github.io/AUTHORS.txt
   The complete set of contributors may be found at
   http://polymer.github.io/CONTRIBUTORS.txt
   Code distributed by Google as part of the polymer project is also
   subject to an additional IP rights grant found at
   http://polymer.github.io/PATENTS.txt
  */
  'use strict';function h(b){var c=0;return function(){return c<b.length?{done:!1,value:b[c++]}:{done:!0}}}function l(b){var c="undefined"!=typeof Symbol&&Symbol.iterator&&b[Symbol.iterator];return c?c.call(b):{next:h(b)}}function m(b){if(!(b instanceof Array)){b=l(b);for(var c,a=[];!(c=b.next()).done;)a.push(c.value);b=a}return b}var n="function"==typeof Object.create?Object.create:function(b){function c(){}c.prototype=b;return new c};
  function p(b){b=["object"==typeof globalThis&&globalThis,b,"object"==typeof window&&window,"object"==typeof self&&self,"object"==typeof global&&global];for(var c=0;c<b.length;++c){var a=b[c];if(a&&a.Math==Math)return a}throw Error("Cannot find global object");}
  var q=p(this),r=function(){function b(){function a(){}new a;Reflect.construct(a,[],function(){});return new a instanceof a}if("undefined"!=typeof Reflect&&Reflect.construct){if(b())return Reflect.construct;var c=Reflect.construct;return function(a,d,e){a=c(a,d);e&&Reflect.setPrototypeOf(a,e.prototype);return a}}return function(a,d,e){void 0===e&&(e=a);e=n(e.prototype||Object.prototype);return Function.prototype.apply.call(a,e,d)||e}}(),t;
  if("function"==typeof Object.setPrototypeOf)t=Object.setPrototypeOf;else{var u;a:{var v={a:!0},w={};try{w.__proto__=v;u=w.a;break a}catch(b){}u=!1}t=u?function(b,c){b.__proto__=c;if(b.__proto__!==c)throw new TypeError(b+" is not extensible");return b}:null}var x=t;
  if(!ShadowRoot.prototype.createElement){var y=window.HTMLElement,A=window.customElements.define,B=window.customElements.get,C=window.customElements,D=new WeakMap,E=new WeakMap,F=new WeakMap,G=new WeakMap;window.CustomElementRegistry=function(){this.l=new Map;this.o=new Map;this.i=new Map;this.h=new Map};window.CustomElementRegistry.prototype.define=function(b,c){b=b.toLowerCase();if(void 0!==this.j(b))throw new DOMException("Failed to execute 'define' on 'CustomElementRegistry': the name \""+b+'" has already been used with this registry');
  if(void 0!==this.o.get(c))throw new DOMException("Failed to execute 'define' on 'CustomElementRegistry': this constructor has already been used with this registry");var a=c.prototype.attributeChangedCallback,d=new Set(c.observedAttributes||[]);H(c,d,a);a={g:c,connectedCallback:c.prototype.connectedCallback,disconnectedCallback:c.prototype.disconnectedCallback,adoptedCallback:c.prototype.adoptedCallback,attributeChangedCallback:a,formAssociated:c.formAssociated,formAssociatedCallback:c.prototype.formAssociatedCallback,
  formDisabledCallback:c.prototype.formDisabledCallback,formResetCallback:c.prototype.formResetCallback,formStateRestoreCallback:c.prototype.formStateRestoreCallback,observedAttributes:d};this.l.set(b,a);this.o.set(c,a);d=B.call(C,b);d||(d=I(b),A.call(C,b,d));this===window.customElements&&(F.set(c,a),a.s=d);if(d=this.h.get(b)){this.h.delete(b);d=l(d);for(var e=d.next();!e.done;e=d.next())e=e.value,E.delete(e),J(e,a,!0)}a=this.i.get(b);void 0!==a&&(a.resolve(c),this.i.delete(b));return c};window.CustomElementRegistry.prototype.upgrade=
  function(){K.push(this);C.upgrade.apply(C,arguments);K.pop()};window.CustomElementRegistry.prototype.get=function(b){var c;return null==(c=this.l.get(b))?void 0:c.g};window.CustomElementRegistry.prototype.j=function(b){return this.l.get(b)};window.CustomElementRegistry.prototype.whenDefined=function(b){var c=this.j(b);if(void 0!==c)return Promise.resolve(c.g);var a=this.i.get(b);void 0===a&&(a={},a.promise=new Promise(function(d){return a.resolve=d}),this.i.set(b,a));return a.promise};window.CustomElementRegistry.prototype.m=
  function(b,c,a){var d=this.h.get(c);d||this.h.set(c,d=new Set);a?d.add(b):d.delete(b)};var L;window.HTMLElement=function(){var b=L;if(b)return L=void 0,b;var c=F.get(this.constructor);if(!c)throw new TypeError("Illegal constructor (custom element class must be registered with global customElements registry to be newable)");b=Reflect.construct(y,[],c.s);Object.setPrototypeOf(b,this.constructor.prototype);D.set(b,c);return b};window.HTMLElement.prototype=y.prototype;var I=function(b){function c(){var a=
  Reflect.construct(y,[],this.constructor);Object.setPrototypeOf(a,HTMLElement.prototype);a:{var d=a.getRootNode();if(!(d===document||d instanceof ShadowRoot)){d=K[K.length-1];if(d instanceof CustomElementRegistry){var e=d;break a}d=d.getRootNode();d===document||d instanceof ShadowRoot||(d=(null==(e=G.get(d))?void 0:e.getRootNode())||document)}e=d.customElements}e=e||window.customElements;(d=e.j(b))?J(a,d):E.set(a,e);return a}q.Object.defineProperty(c,"formAssociated",{configurable:!0,enumerable:!0,
  get:function(){return!0}});c.prototype.connectedCallback=function(){var a=D.get(this);a?a.connectedCallback&&a.connectedCallback.apply(this,arguments):E.get(this).m(this,b,!0)};c.prototype.disconnectedCallback=function(){var a=D.get(this);a?a.disconnectedCallback&&a.disconnectedCallback.apply(this,arguments):E.get(this).m(this,b,!1)};c.prototype.adoptedCallback=function(){var a,d;null==(a=D.get(this))||null==(d=a.adoptedCallback)||d.apply(this,arguments)};c.prototype.formAssociatedCallback=function(){var a=
  D.get(this);if(a&&a.formAssociated){var d;null==a||null==(d=a.formAssociatedCallback)||d.apply(this,arguments)}};c.prototype.formDisabledCallback=function(){var a=D.get(this);if(null==a?0:a.formAssociated){var d;null==a||null==(d=a.formDisabledCallback)||d.apply(this,arguments)}};c.prototype.formResetCallback=function(){var a=D.get(this);if(null==a?0:a.formAssociated){var d;null==a||null==(d=a.formResetCallback)||d.apply(this,arguments)}};c.prototype.formStateRestoreCallback=function(){var a=D.get(this);
  if(null==a?0:a.formAssociated){var d;null==a||null==(d=a.formStateRestoreCallback)||d.apply(this,arguments)}};return c},H=function(b,c,a){if(0!==c.size&&void 0!==a){var d=b.prototype.setAttribute;d&&(b.prototype.setAttribute=function(f,k){f=f.toLowerCase();if(c.has(f)){var z=this.getAttribute(f);d.call(this,f,k);a.call(this,f,z,k)}else d.call(this,f,k)});var e=b.prototype.removeAttribute;e&&(b.prototype.removeAttribute=function(f){f=f.toLowerCase();if(c.has(f)){var k=this.getAttribute(f);e.call(this,
  f);a.call(this,f,k,null)}else e.call(this,f)});var g=b.prototype.toggleAttribute;g&&(b.prototype.toggleAttribute=function(f,k){f=f.toLowerCase();if(c.has(f)){var z=this.getAttribute(f);g.call(this,f,k);k=this.getAttribute(f);a.call(this,f,z,k)}else g.call(this,f,k)})}},M=function(b){var c=Object.getPrototypeOf(b);if(c!==window.HTMLElement)return c===y?Object.setPrototypeOf(b,window.HTMLElement):M(c)},J=function(b,c,a){a=void 0===a?!1:a;Object.setPrototypeOf(b,c.g.prototype);D.set(b,c);L=b;try{new c.g}catch(d){M(c.g),
  new c.g}c.attributeChangedCallback&&c.observedAttributes.forEach(function(d){b.hasAttribute(d)&&c.attributeChangedCallback.call(b,d,null,b.getAttribute(d))});a&&c.connectedCallback&&b.isConnected&&c.connectedCallback.call(b)},N=Element.prototype.attachShadow;Element.prototype.attachShadow=function(b){var c=N.apply(this,arguments);b.customElements&&(c.customElements=b.customElements);return c};var K=[document],O=function(b,c,a){var d=(a?Object.getPrototypeOf(a):b.prototype)[c];b.prototype[c]=function(){K.push(this);
  var e=d.apply(a||this,arguments);void 0!==e&&G.set(e,this);K.pop();return e}};O(ShadowRoot,"createElement",document);O(ShadowRoot,"importNode",document);O(Element,"insertAdjacentHTML");var P=function(b){var c=Object.getOwnPropertyDescriptor(b.prototype,"innerHTML");Object.defineProperty(b.prototype,"innerHTML",Object.assign({},c,{set:function(a){K.push(this);c.set.call(this,a);K.pop()}}))};P(Element);P(ShadowRoot);Object.defineProperty(window,"customElements",{value:new CustomElementRegistry,configurable:!0,
  writable:!0});if(window.ElementInternals&&window.ElementInternals.prototype.setFormValue){var Q=new WeakMap,R=HTMLElement.prototype.attachInternals,methods=["setFormValue","setValidity","checkValidity","reportValidity"];HTMLElement.prototype.attachInternals=function(b){for(var c=[],a=0;a<arguments.length;++a)c[a]=arguments[a];c=R.call.apply(R,[this].concat(m(c)));Q.set(c,this);return c};methods.forEach(function(b){var c=window.ElementInternals.prototype,a=c[b];c[b]=function(d){for(var e=[],g=0;g<
  arguments.length;++g)e[g]=arguments[g];g=Q.get(this);if(!0===D.get(g).formAssociated)return null==a?void 0:a.call.apply(a,[this].concat(m(e)));throw new DOMException("Failed to execute "+a+" on 'ElementInternals': The target element is not a form-associated custom element.");}});var RadioNodeList=function(b){var c=r(Array,[].concat(m(b)),this.constructor);c.h=b;return c},S=RadioNodeList,T=Array;S.prototype=n(T.prototype);S.prototype.constructor=S;if(x)x(S,T);else for(var U in T)if("prototype"!=U)if(Object.defineProperties){var V=
  Object.getOwnPropertyDescriptor(T,U);V&&Object.defineProperty(S,U,V)}else S[U]=T[U];S.u=T.prototype;q.Object.defineProperty(RadioNodeList.prototype,"value",{configurable:!0,enumerable:!0,get:function(){var b;return(null==(b=this.h.find(function(c){return!0===c.checked}))?void 0:b.value)||""}});var HTMLFormControlsCollection=function(b){var c=this,a=new Map;b.forEach(function(d,e){var g=d.getAttribute("name"),f=a.get(g)||[];c[+e]=d;f.push(d);a.set(g,f)});this.length=b.length;a.forEach(function(d,e){d&&
  (c[e]=1===d.length?d[0]:new RadioNodeList(d))})};HTMLFormControlsCollection.prototype.namedItem=function(b){return this[b]};var W=Object.getOwnPropertyDescriptor(HTMLFormElement.prototype,"elements");Object.defineProperty(HTMLFormElement.prototype,"elements",{get:function(){var b=W.get.call(this,[]),c=[];b=l(b);for(var a=b.next();!a.done;a=b.next()){a=a.value;var d=D.get(a);d&&!0!==d.formAssociated||c.push(a)}return new HTMLFormControlsCollection(c)}})}};
  }).call(typeof globalThis === 'object' ? globalThis : window);
  
  
  
  }
  </script>
            <script>window.process = { env: ${JSON.stringify(process.env)} }</script>
            <script type="module" src="${testFramework}"></script>
            <script>
            function descendants(parent) {
              return (Array.from(parent.childNodes)).concat(
                ...Array.from(parent.children).map(child => descendants(child))
              );
            }
            const deanimator = document.querySelector('.deanimator');
            function deanimate(element) {
              if (!element.shadowRoot) return;
              if (element.shadowRoot.querySelector('.deanimator')) return;
              const style = deanimator.cloneNode(true);
              element.shadowRoot.appendChild(style);
              descendants(element.shadowRoot).forEach(deanimate);
            }
            const observer = new MutationObserver((mutationList, observer) => {
              for (const mutation of mutationList) {
                if (mutation.type === 'childList') {
                  descendants(document.body).forEach(deanimate);
                }
              }
            });
            observer.observe(document.body, {childList: true, subtree:true});
            </script>
            <style>
            * {
              margin: 0px;
              padding: 0px;
              --mdc-icon-font: 'Material Symbols Outlined';
            }

            body {
              background: white;
            }
            </style>
          </body>
        </html>`,
    },
    {
      name: 'unit',
      files: 'dist/**/*.spec.js'
    }
  ],

  /** Resolve bare module imports */
  nodeResolve: {
    exportConditions: ['browser', 'development'],
  },

  /** Filter out lit dev mode logs */
  filterBrowserLogs(log) {
    for (const arg of log.args) {
      if (typeof arg === 'string' && filteredLogs.some(l => arg.includes(l))) {
        return false;
      }
    }
    return true;
  },

  /** Compile JS for older browsers. Requires @web/dev-server-esbuild plugin */
  // esbuildTarget: 'auto',

  /** Amount of browsers to run concurrently */
  concurrentBrowsers: 3,

  /** Amount of test files per browser to test concurrently */
  concurrency: 2,

  /** Browsers to run tests on */
  browsers,

  // See documentation for all available options
});
