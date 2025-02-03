/* eslint-disable import/no-extraneous-dependencies */
import { fixture, html } from '@open-wc/testing';

import { sendKeys, sendMouse, setViewport } from '@web/test-runner-commands';

import { visualDiff } from '@web/test-runner-visual-regression';

import {
  reportControlDoc,
  otherReportControlDoc,
} from './reportControl.testfiles.js';

import '../../oscd-publisher.js'; // for loading of components only
import './report-control-editor.js';
import type { ReportControlEditor } from './report-control-editor.js';

const factor = window.process && process.env.CI ? 4 : 2;
function timeout(ms: number) {
  return new Promise(res => {
    setTimeout(res, ms * factor);
  });
}
mocha.timeout(2000 * factor);

describe('ReportControl editor component', () => {
  describe('with missing SCL document', () => {
    let editor: ReportControlEditor;
    beforeEach(async () => {
      editor = await fixture(
        html`<report-control-editor></report-control-editor>`
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
        `reportcontrol/report-control-editor/#1 Missing SCL document`
      );
    });
  });

  describe('with SCL document loaded', () => {
    let editor: ReportControlEditor;
    beforeEach(async () => {
      const doc = new DOMParser().parseFromString(
        reportControlDoc,
        'application/xml'
      );

      editor = await fixture(
        html`<report-control-editor .doc="${doc}"></report-control-editor>`
      );
      document.body.prepend(editor);
    });

    afterEach(async () => {
      editor.remove();
    });

    describe('with unselected ReportControl', () => {
      it('looks like the latest snapshot', async () => {
        await setViewport({ width: 1900, height: 1200 });

        await editor.updateComplete;
        await timeout(200);
        await visualDiff(
          editor,
          `reportcontrol/report-control-editor/#2 Unselected ReportControl 1900x1200`
        );
      });

      it('filtered looks like the latest snapshot', async () => {
        await setViewport({ width: 1900, height: 1200 });
        await sendMouse({ type: 'click', position: [200, 50] });
        await sendKeys({ type: 'rp2' });

        await editor.updateComplete;
        await timeout(200);
        await visualDiff(
          editor,
          `reportcontrol/report-control-editor/#3 With filtered ReportControls`
        );
      });

      it('on mobile looks like the latest snapshot', async () => {
        await setViewport({ width: 599, height: 1100 });

        await editor.updateComplete;
        await timeout(200);
        await visualDiff(
          editor,
          `reportcontrol/report-control-editor/#4 Unselected ReportControl 599x1100`
        );
      });
    });

    describe('with selected ReportControl', () => {
      beforeEach(async () => {
        await setViewport({ width: 1200, height: 800 });
        await sendMouse({ type: 'click', position: [150, 240] });
        await timeout(200);
      });

      it('on 1900x120 looks like the latest snapshot', async () => {
        await setViewport({ width: 1900, height: 1200 });

        await editor.updateComplete;
        await timeout(200);
        await visualDiff(
          editor,
          `reportcontrol/report-control-editor/#5 Selected ReportControl 1900x1200`
        );
      });

      it('1200x800 looks like the latest snapshot', async () => {
        await setViewport({ width: 1200, height: 2000 });

        await editor.updateComplete;
        await timeout(200);
        await visualDiff(
          editor,
          `reportcontrol/report-control-editor/#6 Selected ReportControl 1200x2000`
        );
      });

      it('on 800x600 screen looks like the latest snapshot', async () => {
        await setViewport({ width: 800, height: 2000 });

        await editor.updateComplete;
        await timeout(200);
        await visualDiff(
          editor,
          `reportcontrol/report-control-editor/#6 Selected ReportControl 800x2000`
        );
      });

      it('on a mobile screen looks like the latest snapshot', async () => {
        await setViewport({ width: 599, height: 2400 });

        await editor.updateComplete;
        await timeout(200);
        await visualDiff(
          editor,
          `reportcontrol/report-control-editor/#6 Selected ReportControl 599x2000`
        );
      });

      it('with active opened selection list looks like the latest snapshot', async () => {
        await setViewport({ width: 599, height: 1100 });

        editor.selectReportControlButton.click();

        await editor.updateComplete;
        await timeout(200);
        await visualDiff(
          editor,
          `reportcontrol/report-control-editor/#7 Actively triggered Selection List 599x1100`
        );
      });

      it('dynamically loaded new doc looks like the latest snapshot', async () => {
        await setViewport({ width: 599, height: 1100 });

        editor.selectReportControlButton.click();
        editor.doc = new DOMParser().parseFromString(
          otherReportControlDoc,
          'application/xml'
        );

        await editor.updateComplete;
        await timeout(200);
        await visualDiff(
          editor,
          `reportcontrol/report-control-editor/#8 New Doc with selected ReportControl 599x1100`
        );
      });
    });

    describe('with unreferenced DataSet', () => {
      beforeEach(async () => {
        await setViewport({ width: 1200, height: 800 });
        await sendMouse({ type: 'click', position: [150, 340] });
        await timeout(200);
      });

      it('on 1900x120 looks like the latest snapshot', async () => {
        await setViewport({ width: 1900, height: 1200 });

        await editor.updateComplete;
        await timeout(200);
        await visualDiff(
          editor,
          `reportcontrol/report-control-editor/#9 Selected ReportControl with unreferenced DataSet`
        );
      });

      it('data set selection dialog looks like', async () => {
        await setViewport({ width: 1900, height: 1200 });

        await editor.changeDataSet.click();

        await editor.updateComplete;
        await timeout(200);
        await visualDiff(
          editor,
          `reportcontrol/report-control-editor/#10 Change DataSet inline the selected ReportControl`
        );
      });
    });
  });
});
