/* eslint-disable import/no-extraneous-dependencies */
import { fixture, html } from '@open-wc/testing';

import { sendMouse, setViewport } from '@web/test-runner-commands';

import { visualDiff } from '@web/test-runner-visual-regression';

import { dataSetDoc } from './data-set-editor.testfiles.js';

import { DataSetElementEditor } from './data-set-element-editor.js';

window.customElements.define('data-set-element-editor', DataSetElementEditor);

const factor = window.process && process.env.CI ? 4 : 2;
function timeout(ms: number) {
  return new Promise(res => {
    setTimeout(res, ms * factor);
  });
}
mocha.timeout(2000 * factor);

describe('DataSet element editor component', () => {
  describe('with missing DataSet element', () => {
    let editor: DataSetElementEditor;
    beforeEach(async () => {
      editor = await fixture(
        html`<data-set-element-editor></data-set-element-editor>`
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
        `dataset/data-set-element-editor/#1 Missing DataSet`
      );
    });
  });

  describe('with DataSet reaching maxAttributes limits', () => {
    let editor: DataSetElementEditor;
    beforeEach(async () => {
      const dataSet = new DOMParser()
        .parseFromString(dataSetDoc, 'application/xml')
        .querySelector('LDevice[inst="ldInst1"] DataSet')!;

      editor = await fixture(
        html`<data-set-element-editor
          .element="${dataSet}"
        ></data-set-element-editor>`
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
        `dataset/data-set-element-editor/#2 Full DataSet`
      );
    });
  });

  describe('with DataSet reaching 90% maxAttributes limits', () => {
    let editor: DataSetElementEditor;
    beforeEach(async () => {
      const dataSet = new DOMParser()
        .parseFromString(dataSetDoc, 'application/xml')
        .querySelector('LDevice[inst="ldInst2"] DataSet')!;

      editor = await fixture(
        html`<data-set-element-editor
          .element="${dataSet}"
        ></data-set-element-editor>`
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
        `dataset/data-set-element-editor/#3 Reaching 90% FCDA limit`
      );
    });
  });

  describe('with DataSet reaching 80% maxAttributes limits', () => {
    let editor: DataSetElementEditor;
    beforeEach(async () => {
      const dataSet = new DOMParser()
        .parseFromString(dataSetDoc, 'application/xml')
        .querySelector('LDevice[inst="ldInst3"] DataSet')!;

      editor = await fixture(
        html`<data-set-element-editor
          .element="${dataSet}"
        ></data-set-element-editor>`
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
        `dataset/data-set-element-editor/#4 Reaching 80% FCDA limit`
      );
    });
  });

  describe('with DataSet reaching 60% maxAttributes limits', () => {
    let editor: DataSetElementEditor;
    beforeEach(async () => {
      const dataSet = new DOMParser()
        .parseFromString(dataSetDoc, 'application/xml')
        .querySelector('LDevice[inst="ldInst4"] DataSet')!;

      editor = await fixture(
        html`<data-set-element-editor
          .element="${dataSet}"
        ></data-set-element-editor>`
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
        `dataset/data-set-element-editor/#5 Reaching 60% FCDA limit`
      );
    });
  });

  describe('with DataSet reaching 40% maxAttributes limits', () => {
    let editor: DataSetElementEditor;
    beforeEach(async () => {
      const dataSet = new DOMParser()
        .parseFromString(dataSetDoc, 'application/xml')
        .querySelector('LDevice[inst="ldInst5"] DataSet')!;

      editor = await fixture(
        html`<data-set-element-editor
          .element="${dataSet}"
        ></data-set-element-editor>`
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
        `dataset/data-set-element-editor/#6 Reaching 40% FCDA limit`
      );
    });
  });

  describe('with DataSet reaching 20% maxAttributes limits', () => {
    let editor: DataSetElementEditor;
    beforeEach(async () => {
      const dataSet = new DOMParser()
        .parseFromString(dataSetDoc, 'application/xml')
        .querySelector('LDevice[inst="ldInst6"] DataSet')!;

      editor = await fixture(
        html`<data-set-element-editor
          .element="${dataSet}"
        ></data-set-element-editor>`
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
        `dataset/data-set-element-editor/#7 Reaching 20% FCDA limit`
      );
    });
  });

  describe('with DataSet reaching 10% maxAttributes limits', () => {
    let editor: DataSetElementEditor;
    beforeEach(async () => {
      const dataSet = new DOMParser()
        .parseFromString(dataSetDoc, 'application/xml')
        .querySelector('LDevice[inst="ldInst7"] DataSet')!;

      editor = await fixture(
        html`<data-set-element-editor
          .element="${dataSet}"
        ></data-set-element-editor>`
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
        `dataset/data-set-element-editor/#8 Reaching 10% FCDA limit`
      );
    });
  });

  describe('with empty DataSet', () => {
    let editor: DataSetElementEditor;
    beforeEach(async () => {
      const dataSet = new DOMParser()
        .parseFromString(dataSetDoc, 'application/xml')
        .querySelector('LDevice[inst="ldInst8"] DataSet')!;

      editor = await fixture(
        html`<data-set-element-editor
          .element="${dataSet}"
        ></data-set-element-editor>`
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
        `dataset/data-set-element-editor/#9 empty DataSet`
      );
    });
  });

  describe('Allows to add DataAttributes through TreeGrid', () => {
    let editor: DataSetElementEditor;
    beforeEach(async () => {
      await setViewport({ width: 1900, height: 1200 });

      const dataSet = new DOMParser()
        .parseFromString(dataSetDoc, 'application/xml')
        .querySelector('LDevice[inst="ldInst2"] DataSet')!;

      editor = await fixture(
        html`<data-set-element-editor
          .element="${dataSet}"
        ></data-set-element-editor>`
      );
      document.body.prepend(editor);
    });

    afterEach(async () => {
      editor.remove();
    });

    it('looks like the latest snapshot', async () => {
      editor.daPicker.paths = [
        [
          'LDevice: IED>>ldInst1',
          'LN: IED>>ldInst1>prefix MMXU 1',
          'DO: #MMXU>PhV',
          'SDO: #WYE>phsA',
          'DA: #CMV>cVal',
          'BDA: #Vector>mag',
          'BDA: #AnalogueValue>f',
        ],
      ];
      editor.daPickerButton.click();
      await editor.updateComplete;
      await timeout(200);
      await visualDiff(
        editor,
        `dataset/data-set-element-editor/#10 DataAttribute picker`
      );
    });
  });

  describe('Allows to add DataObjects through TreeGrid', () => {
    let editor: DataSetElementEditor;
    beforeEach(async () => {
      await setViewport({ width: 1900, height: 1200 });

      const dataSet = new DOMParser()
        .parseFromString(dataSetDoc, 'application/xml')
        .querySelector('LDevice[inst="ldInst2"] DataSet')!;

      editor = await fixture(
        html`<data-set-element-editor
          .element="${dataSet}"
        ></data-set-element-editor>`
      );
      document.body.prepend(editor);
    });

    afterEach(async () => {
      editor.remove();
    });

    it('looks like the latest snapshot', async () => {
      editor.doPicker.paths = [
        [
          'LDevice: IED>>ldInst1',
          'LN: IED>>ldInst1>prefix MMXU 1',
          'DO: #MMXU>PhV',
          'SDO: #WYE>phsA',
          'FC: MX',
        ],
      ];
      editor.doPickerButton.click();
      await editor.updateComplete;
      await timeout(200);
      await visualDiff(
        editor,
        `dataset/data-set-element-editor/#11 DataObject picker`
      );
    });
  });

  describe('Allows to re-order FCDA child elements', () => {
    let editor: DataSetElementEditor;
    beforeEach(async () => {
      await setViewport({ width: 800, height: 900 });

      const dataSet = new DOMParser()
        .parseFromString(dataSetDoc, 'application/xml')
        .querySelector('LDevice[inst="ldInst1"] DataSet')!;

      editor = await fixture(
        html`<data-set-element-editor
          .element="${dataSet}"
        ></data-set-element-editor>`
      );
      document.body.prepend(editor);
    });

    afterEach(async () => {
      editor.remove();
    });

    it('looks like the latest snapshot', async () => {
      await sendMouse({ type: 'click', position: [740, 800] });

      await editor.updateComplete;
      await timeout(200);
      await visualDiff(
        editor,
        `dataset/data-set-element-editor/#13 Re-order FCDA`
      );
    });
  });

  describe('Indicated difference between UI/SCL', () => {
    let editor: DataSetElementEditor;
    beforeEach(async () => {
      await setViewport({ width: 800, height: 600 });

      const dataSet = new DOMParser()
        .parseFromString(dataSetDoc, 'application/xml')
        .querySelector('LDevice[inst="ldInst1"] DataSet')!;

      editor = await fixture(
        html`<data-set-element-editor
          .element="${dataSet}"
        ></data-set-element-editor>`
      );
      document.body.prepend(editor);
    });

    afterEach(async () => {
      editor.remove();
    });

    it('looks like the latest snapshot', async () => {
      editor.inputs![0].value = 'someNewDataSetName';
      editor.inputs![1].nullSwitch?.click();

      await editor.requestUpdate();
      await timeout(500);
      await visualDiff(
        editor,
        `dataset/data-set-element-editor/#15 Enabled Save button with UI to SCL difference`
      );
    });
  });
});
