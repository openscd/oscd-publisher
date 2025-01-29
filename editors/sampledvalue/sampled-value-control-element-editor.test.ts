/* eslint-disable import/no-extraneous-dependencies */
import { fixture, html } from '@open-wc/testing';

import { setViewport } from '@web/test-runner-commands';

import { visualDiff } from '@web/test-runner-visual-regression';

import { SclCheckbox } from '@openenergytools/scl-checkbox';

import { smvControlDoc } from './smvControl.testfiles.js';

import './sampled-value-control-element-editor.js';
import type { SampledValueControlElementEditor } from './sampled-value-control-element-editor.js';

const factor = window.process && process.env.CI ? 4 : 2;
function timeout(ms: number) {
  return new Promise(res => {
    setTimeout(res, ms * factor);
  });
}
mocha.timeout(4000 * factor);

describe('SampledValueControl element editor component', () => {
  describe('with missing SampledValueControl element', () => {
    let editor: SampledValueControlElementEditor;
    beforeEach(async () => {
      editor = await fixture(
        html`<sampled-value-control-element-editor></sampled-value-control-element-editor>`
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
        `smvcontrol/sampled-value-control-element-editor/#1 Missing SampledValueControl`
      );
    });
  });

  describe('with loaded SampledValueControl and missing SMV', () => {
    let editor: SampledValueControlElementEditor;
    beforeEach(async () => {
      const smvControl = new DOMParser()
        .parseFromString(smvControlDoc, 'application/xml')
        .querySelector('SampledValueControl[name="smv1"]')!;

      editor = await fixture(
        html`<sampled-value-control-element-editor
          .element="${smvControl}"
        ></sampled-value-control-element-editor>`
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
        `smvcontrol/sampled-value-control-element-editor/#2 SampledValueControl without SMV`
      );
    });
  });

  describe('with loaded SampledValueControl and existing SMV', () => {
    let editor: SampledValueControlElementEditor;
    beforeEach(async () => {
      const smvControl = new DOMParser()
        .parseFromString(smvControlDoc, 'application/xml')
        .querySelector('SampledValueControl[name="smv2"]')!;

      editor = await fixture(
        html`<sampled-value-control-element-editor
          .element="${smvControl}"
        ></sampled-value-control-element-editor>`
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
        `smvcontrol/sampled-value-control-element-editor/#3 SampledValueControl with SMV`
      );
    });

    it('on Mobile looks like the latest snapshot', async () => {
      await setViewport({ width: 599, height: 1100 });

      await editor.updateComplete;
      await timeout(200);
      await visualDiff(
        editor,
        `smvcontrol/sampled-value-control-element-editor/#4 SampledValueControl with SMV 599x1100`
      );
    });
  });

  describe('indicated changes in SampledValueControl compared to UI', () => {
    let editor: SampledValueControlElementEditor;
    beforeEach(async () => {
      const smvControl = new DOMParser()
        .parseFromString(smvControlDoc, 'application/xml')
        .querySelector('SampledValueControl[name="smv3"]')!;

      editor = await fixture(
        html`<sampled-value-control-element-editor
          .element="${smvControl}"
        ></sampled-value-control-element-editor>`
      );
      document.body.prepend(editor);
    });

    afterEach(async () => {
      editor.remove();
    });

    it('looks like the latest snapshot', async () => {
      await setViewport({ width: 800, height: 600 });

      await timeout(400);

      (editor.sampledValueControlInputs![4] as SclCheckbox).nullSwitch?.click();

      await editor.updateComplete;
      await timeout(400);
      await visualDiff(
        editor,
        `smvcontrol/sampled-value-control-element-editor/#5 Changed SampledValueControl Attribute`
      );
    });
  });

  describe('indicated changes in SMV compared to UI', () => {
    let editor: SampledValueControlElementEditor;
    beforeEach(async () => {
      const smvControl = new DOMParser()
        .parseFromString(smvControlDoc, 'application/xml')
        .querySelector('SampledValueControl[name="smv2"]')!;

      editor = await fixture(
        html`<sampled-value-control-element-editor
          .element="${smvControl}"
        ></sampled-value-control-element-editor>`
      );
      document.body.prepend(editor);
    });

    afterEach(async () => {
      editor.remove();
    });

    it('looks like the latest snapshot', async () => {
      await setViewport({ width: 800, height: 600 });

      await timeout(400);

      editor.sMVInputs![3].nullSwitch?.click();

      await editor.updateComplete;
      await timeout(400);
      await visualDiff(
        editor,
        `smvcontrol/sampled-value-control-element-editor/#6 Changed SMV Attribute`
      );
    });
  });

  describe('indicated changes in SmvOpts compared to UI', () => {
    let editor: SampledValueControlElementEditor;
    beforeEach(async () => {
      const smvControl = new DOMParser()
        .parseFromString(smvControlDoc, 'application/xml')
        .querySelector('SampledValueControl[name="smv2"]')!;

      editor = await fixture(
        html`<sampled-value-control-element-editor
          .element="${smvControl}"
        ></sampled-value-control-element-editor>`
      );
      document.body.prepend(editor);
    });

    afterEach(async () => {
      editor.remove();
    });

    it('looks like the latest snapshot', async () => {
      await setViewport({ width: 800, height: 600 });

      await timeout(400);

      editor.smvOptsInputs![3].nullSwitch?.click();

      await editor.updateComplete;
      await timeout(400);
      await visualDiff(
        editor,
        `smvcontrol/sampled-value-control-element-editor/#7 Changed SmvOpts Attribute`
      );
    });
  });
});
