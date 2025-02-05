/* eslint-disable import/no-extraneous-dependencies */
import { fixture, html } from '@open-wc/testing';

import { setViewport } from '@web/test-runner-commands';

import { visualDiff } from '@web/test-runner-visual-regression';

import { SclCheckbox } from '@openenergytools/scl-checkbox';

import { gseControlDoc } from './gseControl.testfiles.js';

import { GseControlElementEditor } from './gse-control-element-editor.js';

window.customElements.define(
  'gse-control-element-editor',
  GseControlElementEditor
);

const factor = window.process && process.env.CI ? 4 : 2;
function timeout(ms: number) {
  return new Promise(res => {
    setTimeout(res, ms * factor);
  });
}
mocha.timeout(4000 * factor);

describe('GSEControl element editor component', () => {
  describe('with missing GSEControl element', () => {
    let editor: GseControlElementEditor;
    beforeEach(async () => {
      editor = await fixture(
        html`<gse-control-element-editor></gse-control-element-editor>`
      );
      document.body.prepend(editor);
    });

    afterEach(async () => {
      editor.remove();
    });

    it('looks like the latest snapshot', async () => {
      await editor.updateComplete;
      await timeout(200);
      await visualDiff(
        editor,
        `gsecontrol/gse-control-element-editor/#1 Missing DataSet`
      );
    });
  });

  describe('with loaded GSEControl and missing GSE', () => {
    let editor: GseControlElementEditor;
    beforeEach(async () => {
      const gseControl = new DOMParser()
        .parseFromString(gseControlDoc, 'application/xml')
        .querySelector('GSEControl[name="gse1"]')!;

      editor = await fixture(
        html`<gse-control-element-editor
          .element="${gseControl}"
        ></gse-control-element-editor>`
      );
      document.body.prepend(editor);
    });

    afterEach(async () => {
      editor.remove();
    });

    it('looks like the latest snapshot', async () => {
      await editor.updateComplete;
      await timeout(200);
      await visualDiff(
        editor,
        `gsecontrol/gse-control-element-editor/#2 GSEControl without GSE`
      );
    });
  });

  describe('with loaded GSEControl and existing GSE', () => {
    let editor: GseControlElementEditor;
    beforeEach(async () => {
      const gseControl = new DOMParser()
        .parseFromString(gseControlDoc, 'application/xml')
        .querySelector('GSEControl[name="gse2"]')!;

      editor = await fixture(
        html`<gse-control-element-editor
          .element="${gseControl}"
        ></gse-control-element-editor>`
      );
      document.body.prepend(editor);
    });

    afterEach(async () => {
      editor.remove();
    });

    it('looks like the latest snapshot', async () => {
      await editor.updateComplete;
      await timeout(200);
      await visualDiff(
        editor,
        `gsecontrol/gse-control-element-editor/#3 GSEControl with GSE`
      );
    });

    it('on Mobile looks like the latest snapshot', async () => {
      await setViewport({ width: 400, height: 1100 });

      await editor.updateComplete;
      await timeout(200);
      await visualDiff(
        editor,
        `gsecontrol/gse-control-element-editor/#4 GSEControl with GSE on Mobile`
      );
    });
  });

  describe('indicated changes in GSEControl compared to UI', () => {
    let editor: GseControlElementEditor;
    beforeEach(async () => {
      const gseControl = new DOMParser()
        .parseFromString(gseControlDoc, 'application/xml')
        .querySelector('GSEControl[name="gse3"]')!;

      editor = await fixture(
        html`<gse-control-element-editor
          .element="${gseControl}"
        ></gse-control-element-editor>`
      );
      document.body.prepend(editor);
    });

    afterEach(async () => {
      editor.remove();
    });

    it('looks like the latest snapshot', async () => {
      await setViewport({ width: 800, height: 600 });

      await timeout(400);

      (editor.gSEControlInputs![5] as SclCheckbox).nullSwitch?.click();

      await editor.updateComplete;
      await timeout(400);
      await visualDiff(
        editor,
        `gsecontrol/gse-control-element-editor/#5 Changed GSEControl Attribute`
      );
    });
  });

  describe('indicated changes in GSE compared to UI', () => {
    let editor: GseControlElementEditor;
    beforeEach(async () => {
      const gseControl = new DOMParser()
        .parseFromString(gseControlDoc, 'application/xml')
        .querySelector('GSEControl[name="gse2"]')!;

      editor = await fixture(
        html`<gse-control-element-editor
          .element="${gseControl}"
        ></gse-control-element-editor>`
      );
      document.body.prepend(editor);
    });

    afterEach(async () => {
      editor.remove();
    });

    it('looks like the latest snapshot', async () => {
      await setViewport({ width: 800, height: 600 });

      await timeout(400);

      editor.gSEInputs![3].nullSwitch?.click();

      await editor.updateComplete;
      await timeout(400);
      await visualDiff(
        editor,
        `gsecontrol/gse-control-element-editor/#6 Changed GSE Attribute`
      );
    });
  });
});
