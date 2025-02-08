/* eslint-disable import/no-extraneous-dependencies */
import { fixture, html } from '@open-wc/testing';

import { sendKeys, sendMouse, setViewport } from '@web/test-runner-commands';

import { visualDiff } from '@web/test-runner-visual-regression';

import {
  otherSmvControlDoc,
  smvControlDoc,
  smvControlDocWithDescs,
} from './smvControl.testfiles.js';

import { SampledValueControlEditor } from './sampled-value-control-editor.js';

window.customElements.define(
  'sampled-value-control-editor',
  SampledValueControlEditor
);

const factor = window.process && process.env.CI ? 4 : 2;
function timeout(ms: number) {
  return new Promise(res => {
    setTimeout(res, ms * factor);
  });
}
mocha.timeout(2000 * factor);

describe('SampledValueControl editor component', () => {
  describe('with missing SCL document', () => {
    let editor: SampledValueControlEditor;
    beforeEach(async () => {
      editor = await fixture(
        html`<sampled-value-control-editor></sampled-value-control-editor>`
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
        `smvcontrol/sampled-value-control-editor/#1 Missing SCL document`
      );
    });
  });

  describe('with SCL document loaded', () => {
    let editor: SampledValueControlEditor;
    beforeEach(async () => {
      const doc = new DOMParser().parseFromString(
        smvControlDoc,
        'application/xml'
      );

      editor = await fixture(
        html`<sampled-value-control-editor
          .doc="${doc}"
        ></sampled-value-control-editor>`
      );
      document.body.prepend(editor);
    });

    afterEach(async () => {
      editor.remove();
    });

    describe('with unselected SampledValueControl', () => {
      it('looks like the latest snapshot', async () => {
        await setViewport({ width: 1900, height: 1200 });

        await editor.updateComplete;
        await timeout(200);
        await visualDiff(
          editor,
          `smvcontrol/sampled-value-control-editor/#2 Unselected SampledValueControl 1900x1200`
        );
      });

      it('filtered looks like the latest snapshot', async () => {
        await setViewport({ width: 1900, height: 1200 });
        await sendMouse({ type: 'click', position: [200, 50] });
        await sendKeys({ type: 'smv2' });

        await editor.updateComplete;
        await timeout(200);
        await visualDiff(
          editor,
          `smvcontrol/sampled-value-control-editor/#3 With filtered SampledValueControls`
        );
      });

      it('on mobile looks like the latest snapshot', async () => {
        await setViewport({ width: 599, height: 1100 });

        await editor.updateComplete;
        await timeout(200);
        await visualDiff(
          editor,
          `smvcontrol/sampled-value-control-editor/#4 Unselected SampledValueControl 599x1100`
        );
      });
    });

    describe('with selected SampledValueControl', () => {
      beforeEach(async () => {
        await setViewport({ width: 1200, height: 800 });
        await sendMouse({ type: 'click', position: [150, 240] });
        await timeout(200);
      });

      it('on 1900x120 looks like the latest snapshot', async () => {
        await setViewport({ width: 1900, height: 1200 });

        await timeout(200);
        await visualDiff(
          editor,
          `smvcontrol/sampled-value-control-editor/#5 Selected SampledValueControl 1900x1200`
        );
      });

      it('1200x800 looks like the latest snapshot', async () => {
        await setViewport({ width: 1200, height: 2000 });

        await timeout(200);
        await visualDiff(
          editor,
          `smvcontrol/sampled-value-control-editor/#6 Selected SampledValueControl 1200x2000`
        );
      });

      it('on 800x600 screen looks like the latest snapshot', async () => {
        await setViewport({ width: 800, height: 2000 });

        await timeout(200);
        await visualDiff(
          editor,
          `smvcontrol/sampled-value-control-editor/#6 Selected SampledValueControl 800x2000`
        );
      });

      it('on a mobile screen looks like the latest snapshot', async () => {
        await setViewport({ width: 599, height: 2400 });

        await timeout(200);
        await visualDiff(
          editor,
          `smvcontrol/sampled-value-control-editor/#6 Selected SampledValueControl 599x2000`
        );
      });

      it('with active opened selection list looks like the latest snapshot', async () => {
        await setViewport({ width: 599, height: 1100 });

        editor.selectSampledValueControlButton.click();

        await editor.updateComplete;
        await timeout(200);
        await visualDiff(
          editor,
          `smvcontrol/sampled-value-control-editor/#7 Actively triggered Selection List 599x1100`
        );
      });

      it('dynamically loaded new doc looks like the latest snapshot', async () => {
        await setViewport({ width: 599, height: 1100 });

        editor.selectSampledValueControlButton.click();
        editor.doc = new DOMParser().parseFromString(
          otherSmvControlDoc,
          'application/xml'
        );

        await editor.updateComplete;
        await timeout(200);
        await visualDiff(
          editor,
          `smvcontrol/sampled-value-control-editor/#8 New Doc with selected SampledValueControl 599x1100`
        );
      });

      describe('with unreferenced DataSet', () => {
        beforeEach(async () => {
          await setViewport({ width: 1200, height: 800 });
          await sendMouse({ type: 'click', position: [150, 340] });
          await timeout(200);
        });

        it('on 1900x120 looks like the latest snapshot', async () => {
          await setViewport({ width: 1900, height: 1200 });

          await timeout(200);
          await visualDiff(
            editor,
            `smvcontrol/sampled-value-control-editor/#9 Selected SampledValueControl with unreferenced DataSet`
          );
        });

        it('data set selection dialog looks like', async () => {
          await setViewport({ width: 1900, height: 1200 });

          await editor.changeDataSet.click();

          await timeout(200);
          await visualDiff(
            editor,
            `smvcontrol/sampled-value-control-editor/#10 Create new DataSet inline the selected GSEControl`
          );
        });
      });
    });
  });

  describe('with SCL document containing DataSet descriptions', () => {
    let editor: SampledValueControlEditor;
    beforeEach(async () => {
      const doc = new DOMParser().parseFromString(
        smvControlDocWithDescs,
        'application/xml'
      );
      // eslint-disable-next-line prefer-const
      editor = await fixture(
        html`<sampled-value-control-editor
          .doc="${doc}"
        ></sampled-value-control-editor>`
      );

      document.body.prepend(editor);
    });

    afterEach(async () => {
      editor.remove();
    });

    it('looks like the latest snapshot', async () => {
      await setViewport({ width: 1900, height: 1400 });
      editor.selectSampledValueControlButton.click();
      await editor.updateComplete;
      await timeout(200);

      await sendMouse({ type: 'click', position: [150, 185] });
      await editor.updateComplete;

      const containerBottom =
        editor.dataSetElementEditor.getBoundingClientRect().bottom;
      window.scrollBy({
        top: containerBottom - window.innerHeight + 200,
      });

      await timeout(200);
      await visualDiff(
        editor,
        `smvcontrol/sampled-value-control-editor/#11 Document shows descriptions in SampledValueControl DataSet 1900x1400`
      );
    });
  });
});
