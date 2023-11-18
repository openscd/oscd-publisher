/* eslint-disable no-unused-expressions */
/* eslint-disable import/no-extraneous-dependencies */
import { expect, fixture, html } from '@open-wc/testing';

import { SinonSpy, spy } from 'sinon';

import {
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
    editor.reportControlInputs![0].maybeValue = 'SomeNewName';
    editor.reportControlInputs![1].nullSwitch?.click();
    editor.reportControlInputs![2].maybeValue = 'false';
    editor.reportControlInputs![3].maybeValue = 'someOtherID';
    editor.reportControlInputs![4].maybeValue = 'false';
    editor.reportControlInputs![5].nullSwitch?.click();
    editor.reportControlInputs![6].maybeValue = '43';

    editor.rptEnabledInput.nullSwitch?.click();

    await editor.requestUpdate();
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
      confRev: '10053',
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
    editor.optFieldsInputs![0].maybeValue = 'false';
    editor.optFieldsInputs![1].maybeValue = 'false';
    editor.optFieldsInputs![2].nullSwitch?.click();
    editor.optFieldsInputs![3].nullSwitch?.click();
    editor.optFieldsInputs![4].maybeValue = 'false';
    editor.optFieldsInputs![5].maybeValue = 'false';
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
    editor.trgOpsInputs![0].maybeValue = 'false';
    editor.trgOpsInputs![1].nullSwitch?.click();
    editor.trgOpsInputs![2].maybeValue = 'false';
    editor.trgOpsInputs![3].maybeValue = 'false';
    editor.trgOpsInputs![4].nullSwitch?.click();

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
});
