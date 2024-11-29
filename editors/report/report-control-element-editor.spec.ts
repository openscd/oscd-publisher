/* eslint-disable no-unused-expressions */
/* eslint-disable import/no-extraneous-dependencies */
import { expect, fixture, html } from '@open-wc/testing';

import { SinonSpy, spy } from 'sinon';

import {
  isInsert,
  isRemove,
  isUpdate,
} from '@openenergytools/scl-lib/dist/foundation/utils.js';

import { reportControlDoc } from './reportControl.testfiles.js';

import './report-control-element-editor.js';
import type { ReportControlElementEditor } from './report-control-element-editor.js';

describe('ReportControl element editor component', () => {
  let editor: ReportControlElementEditor;
  let editEvent: SinonSpy;
  let reportControl: Element;
  beforeEach(async () => {
    reportControl = new DOMParser()
      .parseFromString(reportControlDoc, 'application/xml')
      .querySelector('ReportControl[name="rp2"]')!;

    editor = await fixture(
      html`<report-control-element-editor
        .element="${reportControl}"
      ></report-control-element-editor>`
    );

    editEvent = spy();
    window.addEventListener('oscd-edit', editEvent);
  });

  it('allows to change the ReportControl elements attributes', async () => {
    editor.reportControlInputs![0].value = 'SomeNewName';
    editor.reportControlInputs![1].nullSwitch?.click();
    await editor.updateComplete;

    editor.reportControlInputs![2].value = '40001';
    editor.reportControlInputs![3].value = 'false';
    editor.reportControlInputs![4].value = 'someOtherID';
    editor.reportControlInputs![5].value = 'false';
    editor.reportControlInputs![5].nullSwitch?.click();
    await editor.updateComplete;

    editor.reportControlInputs![7].value = '43';

    editor.rptEnabledInput.nullSwitch?.click();
    await editor.updateComplete;

    editor.reportControlSave.click();

    expect(editEvent).to.be.calledOnce;

    const edits = editEvent.args[0][0].detail;
    expect(edits.length).to.equal(2);

    expect(edits[0]).to.satisfy(isUpdate);

    const update = edits[0];
    expect(update.element).to.equal(reportControl);
    expect(update.attributes).to.deep.equal({
      name: 'SomeNewName',
      desc: null,
      confRev: '40001',
      rptID: 'someOtherID',
      buffered: 'false',
      indexed: 'false',
      bufTime: null,
      intgPd: '43',
    });

    expect(edits[1]).to.satisfy(isRemove);
    expect(edits[1].node.tagName).to.equal('RptEnabled');
  });

  it('allows to change the OptFields element child element', async () => {
    editor.optFieldsInputs![0].value = 'false';
    editor.optFieldsInputs![1].value = 'false';
    editor.optFieldsInputs![2].nullSwitch?.click();
    await editor.updateComplete;

    editor.optFieldsInputs![3].nullSwitch?.click();
    await editor.updateComplete;

    editor.optFieldsInputs![4].value = 'false';
    editor.optFieldsInputs![5].value = 'false';
    editor.optFieldsInputs![6].nullSwitch?.click();
    await editor.updateComplete;

    editor.optFieldsSave.click();

    expect(editEvent).to.be.calledOnce;
    expect(editEvent.args[0][0].detail).to.satisfy(isUpdate);

    const update = editEvent.args[0][0].detail;
    expect(update.element.tagName).to.equal('OptFields');
    expect(update.attributes).to.deep.equal({
      seqNum: 'false',
      timeStamp: 'false',
      reasonCode: null,
      entryID: 'false',
      dataSet: null,
      dataRef: 'false',
      configRef: null,
    });
  });

  it('allows to change the TrgOps element child element', async () => {
    editor.trgOpsInputs![0].value = 'false';
    editor.trgOpsInputs![1].nullSwitch?.click();
    await editor.updateComplete;

    editor.trgOpsInputs![2].value = 'false';
    editor.trgOpsInputs![3].value = 'false';
    editor.trgOpsInputs![4].nullSwitch?.click();
    await editor.updateComplete;

    await editor.updateComplete;
    editor.trgOpsSave.click();

    expect(editEvent).to.be.calledOnce;
    expect(editEvent.args[0][0].detail).to.satisfy(isUpdate);

    const update = editEvent.args[0][0].detail;
    expect(update.element.tagName).to.equal('TrgOps');
    expect(update.attributes).to.deep.equal({
      dchg: 'false',
      qchg: null,
      dupd: 'false',
      period: 'false',
      gi: null,
    });
  });

  it('allows to create the TrgOps child element', async () => {
    reportControl = new DOMParser()
      .parseFromString(reportControlDoc, 'application/xml')
      .querySelector('ReportControl[name="rp3"]')!;

    editor = await fixture(
      html`<report-control-element-editor
        .element="${reportControl}"
      ></report-control-element-editor>`
    );

    editor.trgOpsInputs![1].nullSwitch?.click();
    editor.trgOpsInputs![1].value = 'true';
    await editor.updateComplete;

    editor.trgOpsInputs![2].nullSwitch?.click();
    editor.trgOpsInputs![2].value = 'true';
    await editor.updateComplete;

    await editor.updateComplete;
    editor.trgOpsSave.click();

    expect(editEvent).to.be.calledOnce;
    expect(editEvent.args[0][0].detail).to.satisfy(isInsert);

    const insert = editEvent.args[0][0].detail;
    expect(insert.parent.tagName).to.equal('ReportControl');
    expect(insert.node.tagName).to.equal('TrgOps');
    expect(insert.node.hasAttribute('qchg')).to.equal(true);
    expect(insert.node.hasAttribute('dupd')).to.equal(true);
  });

  it('allows to create the OptFields child element', async () => {
    reportControl = new DOMParser()
      .parseFromString(reportControlDoc, 'application/xml')
      .querySelector('ReportControl[name="rp3"]')!;

    editor = await fixture(
      html`<report-control-element-editor
        .element="${reportControl}"
      ></report-control-element-editor>`
    );

    editor.optFieldsInputs![1].nullSwitch?.click();
    editor.optFieldsInputs![1].value = 'true';
    await editor.updateComplete;

    editor.optFieldsInputs![2].nullSwitch?.click();
    editor.optFieldsInputs![2].value = 'true';
    await editor.updateComplete;

    await editor.updateComplete;
    editor.optFieldsSave.click();

    expect(editEvent).to.be.calledOnce;
    expect(editEvent.args[0][0].detail).to.satisfy(isInsert);

    const insert = editEvent.args[0][0].detail;
    expect(insert.parent.tagName).to.equal('ReportControl');
    expect(insert.node.tagName).to.equal('OptFields');
    expect(insert.node.hasAttribute('timeStamp')).to.equal(true);
    expect(insert.node.hasAttribute('dataSet')).to.equal(true);
  });
});
