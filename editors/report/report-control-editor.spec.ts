/* eslint-disable no-unused-expressions */
/* eslint-disable import/no-extraneous-dependencies */
import { expect, fixture, html } from '@open-wc/testing';

import { sendMouse, setViewport } from '@web/test-runner-commands';

import { SinonSpy, spy } from 'sinon';

import {
  isInsert,
  isRemove,
  isUpdate,
} from '@openenergytools/scl-lib/dist/foundation/utils.js';

import { reportControlDoc } from './reportControl.testfiles.js';

import './report-control-editor.js';
import type { ReportControlEditor } from './report-control-editor.js';

function timeout(ms: number) {
  return new Promise(res => {
    setTimeout(res, ms);
  });
}

describe('ReportControl editor component', () => {
  let editor: ReportControlEditor;
  let editEvent: SinonSpy;

  beforeEach(async () => {
    const doc = new DOMParser().parseFromString(
      reportControlDoc,
      'application/xml'
    );

    editor = await fixture(
      html`<report-control-editor .doc="${doc}"></report-control-editor>`
    );

    editEvent = spy();
    window.addEventListener('oscd-edit-v2', editEvent);
  });

  it('allows to insert new ReportControl element', async () => {
    await sendMouse({ type: 'click', position: [760, 100] });

    expect(editEvent).to.have.been.calledOnce;

    expect(editEvent.args[0][0].detail.edit).to.satisfy(isInsert);
    expect(editEvent.args[0][0].detail.edit.parent.tagName).to.equal('LN0');
    expect(editEvent.args[0][0].detail.edit.node.tagName).to.equal(
      'ReportControl'
    );
  });

  it('allows to remove and existing ReportControl element', async () => {
    await sendMouse({ type: 'click', position: [760, 200] });

    expect(editEvent).to.have.been.calledOnce;
    expect(editEvent.args[0][0].detail.edit[0]).to.satisfy(isRemove);
    expect(editEvent.args[0][0].detail.edit[0].node.tagName).to.equal(
      'ReportControl'
    );
  });

  it('allows to insert new DataSet and link with existing ReportControl', async () => {
    await sendMouse({ type: 'click', position: [400, 200] });
    editor.newDataSet.click();

    expect(editEvent).to.have.been.calledOnce;
    expect(editEvent.args[0][0].detail.edit[0]).to.satisfy(isInsert);
    expect(editEvent.args[0][0].detail.edit[0].parent.tagName).to.equal('LN0');
    expect(editEvent.args[0][0].detail.edit[0].node.tagName).to.equal(
      'DataSet'
    );
  });

  it('allows to change an existing DataSet', async () => {
    await setViewport({ width: 800, height: 800 });
    await sendMouse({ type: 'click', position: [400, 340] });

    editor.changeDataSet.click();
    await timeout(200);
    await sendMouse({ type: 'click', position: [400, 410] });

    expect(editEvent).to.have.been.calledOnce;
    expect(editEvent.args[0][0].detail.edit).to.satisfy(isUpdate);
    expect(editEvent.args[0][0].detail.edit.element.tagName).to.equal(
      'ReportControl'
    );
    expect(editEvent.args[0][0].detail.edit.attributes.datSet).to.equal(
      'datSet2'
    );
  });
});
