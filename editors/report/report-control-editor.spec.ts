/* eslint-disable no-unused-expressions */
/* eslint-disable import/no-extraneous-dependencies */
import { expect, fixture, html } from '@open-wc/testing';

import { setViewport } from '@web/test-runner-commands';

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
    window.addEventListener('oscd-edit', editEvent);
  });

  it('allows to insert new ReportControl element', () => {
    (
      editor.selectionList.querySelectorAll(
        'mwc-list-item[slot="primaryAction"]'
      )[0] as HTMLElement
    ).click();

    expect(editEvent).to.have.been.calledOnce;

    expect(editEvent.args[0][0].detail).to.satisfy(isInsert);
    expect(editEvent.args[0][0].detail.parent.tagName).to.equal('LN0');
    expect(editEvent.args[0][0].detail.node.tagName).to.equal('ReportControl');
  });

  it('allows to remove and existing ReportControl element', () => {
    (
      editor.selectionList.querySelectorAll(
        'mwc-list-item[slot="primaryAction"]'
      )[2] as HTMLElement
    ).click();

    expect(editEvent).to.have.been.calledOnce;
    expect(editEvent.args[0][0].detail[0]).to.satisfy(isRemove);
    expect(editEvent.args[0][0].detail[0].node.tagName).to.equal(
      'ReportControl'
    );
  });

  it('allows to insert new DataSet and link with existing ReportControl', async () => {
    await editor.selectionList.items[1].click();
    editor.newDataSet.click();

    expect(editEvent).to.have.been.calledOnce;
    expect(editEvent.args[0][0].detail[0]).to.satisfy(isInsert);
    expect(editEvent.args[0][0].detail[0].parent.tagName).to.equal('LN0');
    expect(editEvent.args[0][0].detail[0].node.tagName).to.equal('DataSet');
  });

  it('allows to change an existing DataSet', async () => {
    await setViewport({ width: 1900, height: 1200 });

    await editor.selectionList.items[2].click();

    editor.changeDataSet.click();

    const listItem = Array.from(
      editor.selectDataSetDialog.querySelectorAll(':scope mwc-list-item')
    )[1] as HTMLElement;
    await timeout(200);

    listItem.click();

    expect(editEvent).to.have.been.calledOnce;
    expect(editEvent.args[0][0].detail).to.satisfy(isUpdate);
    expect(editEvent.args[0][0].detail.element.tagName).to.equal(
      'ReportControl'
    );
    expect(editEvent.args[0][0].detail.attributes.datSet).to.equal('datSet2');
  });
});
