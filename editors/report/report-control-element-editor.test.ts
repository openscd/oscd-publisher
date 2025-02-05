/* eslint-disable import/no-extraneous-dependencies */
import { fixture, html } from '@open-wc/testing';

import { setViewport } from '@web/test-runner-commands';

import { visualDiff } from '@web/test-runner-visual-regression';
import { SclCheckbox } from '@openenergytools/scl-checkbox';

import { reportControlDoc } from './reportControl.testfiles.js';

import { ReportControlElementEditor } from './report-control-element-editor.js';

window.customElements.define(
  'report-control-element-editor',
  ReportControlElementEditor
);

const factor = window.process && process.env.CI ? 4 : 2;
function timeout(ms: number) {
  return new Promise(res => {
    setTimeout(res, ms * factor);
  });
}
mocha.timeout(4000 * factor);

describe('ReportControl element editor component', () => {
  describe('with missing ReportControl element', () => {
    let editor: ReportControlElementEditor;
    beforeEach(async () => {
      editor = await fixture(
        html`<report-control-element-editor></report-control-element-editor>`
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
        `reportcontrol/report-control-element-editor/#1 Missing ReportControl`
      );
    });
  });

  describe('with loaded ReportControl', () => {
    let editor: ReportControlElementEditor;
    beforeEach(async () => {
      const reportControl = new DOMParser()
        .parseFromString(reportControlDoc, 'application/xml')
        .querySelector('ReportControl[name="rp1"]')!;

      editor = await fixture(
        html`<report-control-element-editor
          .element="${reportControl}"
        ></report-control-element-editor>`
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
        `reportcontrol/report-control-element-editor/#2 ReportControl without child element`
      );
    });
  });

  describe('with loaded ReportControl and existing OptFields, TrgOps', () => {
    let editor: ReportControlElementEditor;
    beforeEach(async () => {
      const reportControl = new DOMParser()
        .parseFromString(reportControlDoc, 'application/xml')
        .querySelector('ReportControl[name="rp2"]')!;

      editor = await fixture(
        html`<report-control-element-editor
          .element="${reportControl}"
        ></report-control-element-editor>`
      );
      document.body.prepend(editor);
    });

    afterEach(async () => {
      editor.remove();
    });

    it('on 1900x1200 looks like the latest snapshot', async () => {
      await setViewport({ width: 1900, height: 1200 });

      await editor.updateComplete;
      await timeout(200);
      await visualDiff(
        editor,
        `reportcontrol/report-control-element-editor/#3 ReportControl with children on 1900x1200`
      );
    });

    it('on 800x1100 looks like the latest snapshot', async () => {
      await setViewport({ width: 599, height: 1100 });

      await editor.updateComplete;
      await timeout(200);
      await visualDiff(
        editor,
        `reportcontrol/report-control-element-editor/#4 ReportControl with children on 800x1100`
      );
    });
  });

  describe('indicated changes in ReportControl compared to UI', () => {
    let editor: ReportControlElementEditor;
    beforeEach(async () => {
      const reportControl = new DOMParser()
        .parseFromString(reportControlDoc, 'application/xml')
        .querySelector('ReportControl[name="rp2"]')!;

      editor = await fixture(
        html`<report-control-element-editor
          .element="${reportControl}"
        ></report-control-element-editor>`
      );
      document.body.prepend(editor);
    });

    afterEach(async () => {
      editor.remove();
    });

    it('looks like the latest snapshot', async () => {
      await setViewport({ width: 800, height: 600 });

      await timeout(400);

      (editor.reportControlInputs![5] as SclCheckbox).nullSwitch?.click();

      await editor.updateComplete;
      await timeout(400);
      await visualDiff(
        editor,
        `reportcontrol/report-control-element-editor/#5 Changed ReportControl Attribute`
      );
    });
  });

  describe('indicated changes in OptFields compared to UI', () => {
    let editor: ReportControlElementEditor;
    beforeEach(async () => {
      const reportControl = new DOMParser()
        .parseFromString(reportControlDoc, 'application/xml')
        .querySelector('ReportControl[name="rp2"]')!;

      editor = await fixture(
        html`<report-control-element-editor
          .element="${reportControl}"
        ></report-control-element-editor>`
      );
      document.body.prepend(editor);
    });

    afterEach(async () => {
      editor.remove();
    });

    it('looks like the latest snapshot', async () => {
      await setViewport({ width: 800, height: 600 });

      await timeout(400);

      editor.optFieldsInputs![3].nullSwitch?.click();

      await editor.updateComplete;
      await timeout(400);
      await visualDiff(
        editor,
        `reportcontrol/report-control-element-editor/#6 Changed OptFields Attribute`
      );
    });
  });

  describe('indicated changes in TrgOps compared to UI', () => {
    let editor: ReportControlElementEditor;
    beforeEach(async () => {
      const reportControl = new DOMParser()
        .parseFromString(reportControlDoc, 'application/xml')
        .querySelector('ReportControl[name="rp2"]')!;

      editor = await fixture(
        html`<report-control-element-editor
          .element="${reportControl}"
        ></report-control-element-editor>`
      );
      document.body.prepend(editor);
    });

    afterEach(async () => {
      editor.remove();
    });

    it('looks like the latest snapshot', async () => {
      await setViewport({ width: 1200, height: 600 });

      await timeout(400);

      editor.trgOpsInputs![3].nullSwitch?.click();

      await editor.updateComplete;
      await timeout(400);
      await visualDiff(
        editor,
        `reportcontrol/report-control-element-editor/#7 Changed TrgOps Attribute`
      );
    });
  });
});
