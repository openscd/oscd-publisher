/* eslint-disable import/no-extraneous-dependencies */
import { fixture, html } from '@open-wc/testing';

import { sendKeys, sendMouse, setViewport } from '@web/test-runner-commands';

import { visualDiff } from '@web/test-runner-visual-regression';

import { gseControlDoc, otherGseControlDoc } from './gseControl.testfiles.js';

import '../../oscd-publisher.js'; // for loading of components only
import './gse-control-editor.js';
import type { GseControlEditor } from './gse-control-editor.js';

const factor = window.process && process.env.CI ? 4 : 2;
function timeout(ms: number) {
  return new Promise(res => {
    setTimeout(res, ms * factor);
  });
}
mocha.timeout(2000 * factor);

describe('GSEControl editor component', () => {
  describe('with missing SCL document', () => {
    let editor: GseControlEditor;
    beforeEach(async () => {
      editor = await fixture(html`<gse-control-editor></gse-control-editor>`);
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
        `gsecontrol/gse-control-editor/#1 Missing SCL document`
      );
    });
  });

  describe('with SCL document loaded', () => {
    let editor: GseControlEditor;
    beforeEach(async () => {
      const doc = new DOMParser().parseFromString(
        gseControlDoc,
        'application/xml'
      );

      editor = await fixture(
        html`<gse-control-editor .doc="${doc}"></gse-control-editor>`
      );
      document.body.prepend(editor);
    });

    afterEach(async () => {
      editor.remove();
    });

    describe('with unselected GSEControl', () => {
      it('looks like the latest snapshot', async () => {
        await setViewport({ width: 1900, height: 1200 });

        await editor.updateComplete;
        await timeout(200);
        await visualDiff(
          editor,
          `gsecontrol/gse-control-editor/#2 Unselected GSEControl 1900x1200`
        );
      });

      it('filtered looks like the latest snapshot', async () => {
        await setViewport({ width: 1900, height: 1200 });
        await sendMouse({ type: 'click', position: [200, 50] });
        await sendKeys({ type: 'gse2' });

        await editor.updateComplete;
        await timeout(200);
        await visualDiff(
          editor,
          `gsecontrol/gse-control-editor/#3 With filtered GSEcontrols`
        );
      });

      it('on mobile looks like the latest snapshot', async () => {
        await setViewport({ width: 599, height: 1100 });

        await editor.updateComplete;
        await timeout(200);
        await visualDiff(
          editor,
          `gsecontrol/gse-control-editor/#4 Unselected GSEControl 599x1100`
        );
      });
    });

    describe('with selected GSEControl', () => {
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
          `gsecontrol/gse-control-editor/#5 Selected GSEControl 1900x1200`
        );
      });

      it('1200x800 looks like the latest snapshot', async () => {
        await setViewport({ width: 1200, height: 2000 });

        await editor.updateComplete;
        await timeout(200);
        await visualDiff(
          editor,
          `gsecontrol/gse-control-editor/#6 Selected GSEControl 1200x2000`
        );
      });

      it('on 800x600 screen looks like the latest snapshot', async () => {
        await setViewport({ width: 800, height: 2000 });

        await editor.updateComplete;
        await timeout(200);
        await visualDiff(
          editor,
          `gsecontrol/gse-control-editor/#6 Selected GSEControl 800x2000`
        );
      });

      it('on a mobile screen looks like the latest snapshot', async () => {
        await setViewport({ width: 599, height: 2400 });

        await editor.updateComplete;
        await timeout(200);
        await visualDiff(
          editor,
          `gsecontrol/gse-control-editor/#6 Selected GSEControl 599x2000`
        );
      });

      it('with active opened selection list looks like the latest snapshot', async () => {
        await setViewport({ width: 599, height: 1100 });

        editor.selectGSEControlButton.click();

        await editor.updateComplete;
        await timeout(200);
        await visualDiff(
          editor,
          `gsecontrol/gse-control-editor/#7 Actively triggered Selection List 599x1100`
        );
      });

      it('dynamically loaded new doc looks like the latest snapshot', async () => {
        await setViewport({ width: 599, height: 1100 });

        editor.selectGSEControlButton.click();
        editor.doc = new DOMParser().parseFromString(
          otherGseControlDoc,
          'application/xml'
        );

        await editor.updateComplete;
        await timeout(200);
        await visualDiff(
          editor,
          `gsecontrol/gse-control-editor/#8 New Doc with selected GSEControl 599x1100`
        );
      });
    });

    describe('with unreferenced DataSet', () => {
      beforeEach(async () => {
        await setViewport({ width: 1200, height: 800 });
        await sendMouse({ type: 'click', position: [150, 300] });
        await timeout(200);
      });

      it('on 1900x120 looks like the latest snapshot', async () => {
        await setViewport({ width: 1900, height: 1200 });

        await editor.updateComplete;
        await timeout(200);
        await visualDiff(
          editor,
          `gsecontrol/gse-control-editor/#9 Selected GSEControl with unreferenced DataSet`
        );
      });

      it('data set selection dialog looks like', async () => {
        await setViewport({ width: 1900, height: 1200 });

        await editor.changeDataSet.click();

        await editor.updateComplete;
        await timeout(200);
        await visualDiff(
          editor,
          `gsecontrol/gse-control-editor/#10 Create new DataSet inline the selected GSEControl`
        );
      });
    });
  });
});
