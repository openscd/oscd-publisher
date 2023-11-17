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

import { gseControlDoc } from './gseControl.testfiles.js';

import './gse-control-editor.js';
import type { GseControlEditor } from './gse-control-editor.js';

function timeout(ms: number) {
  return new Promise(res => {
    setTimeout(res, ms);
  });
}

describe('GSEControl editor component', () => {
  let editor: GseControlEditor;
  let editEvent: SinonSpy;

  beforeEach(async () => {
    const doc = new DOMParser().parseFromString(
      gseControlDoc,
      'application/xml'
    );

    editor = await fixture(
      html`<gse-control-editor .doc="${doc}"></gse-control-editor>`
    );

    editEvent = spy();
    window.addEventListener('oscd-edit', editEvent);
  });

  it('allows to insert new GSEControl element', () => {
    (
      editor.selectionList.querySelectorAll(
        'mwc-list-item[slot="primaryAction"]'
      )[0] as HTMLElement
    ).click();

    expect(editEvent).to.have.been.calledOnce;
    expect(editEvent.args[0][0].detail[0]).to.satisfy(isInsert);
    expect(editEvent.args[0][0].detail[0].parent.tagName).to.equal('LN0');
    expect(editEvent.args[0][0].detail[0].node.tagName).to.equal('GSEControl');
  });

  it('allows to remove and existing GSEControl element', () => {
    (
      editor.selectionList.querySelectorAll(
        'mwc-list-item[slot="primaryAction"]'
      )[2] as HTMLElement
    ).click();

    expect(editEvent).to.have.been.calledOnce;
    expect(editEvent.args[0][0].detail[0]).to.satisfy(isRemove);
    expect(editEvent.args[0][0].detail[0].node.tagName).to.equal('GSEControl');
  });

  it('allows to insert new DataSet and link with existing GSEControl', async () => {
    await editor.selectionList.items[1].click();
    editor.newDataSet.click();

    expect(editEvent).to.have.been.calledOnce;
    expect(editEvent.args[0][0].detail[0]).to.satisfy(isInsert);
    expect(editEvent.args[0][0].detail[0].parent.tagName).to.equal('LN0');
    expect(editEvent.args[0][0].detail[0].node.tagName).to.equal('DataSet');
  });

  it('allows to change an existing DataSet', async () => {
    await setViewport({ width: 1900, height: 1200 });

    await editor.selectionList.items[1].click();

    editor.changeDataSet.click();

    const listItem = Array.from(
      editor.selectDataSetDialog.querySelectorAll(':scope mwc-list-item')
    )[1] as HTMLElement;
    await timeout(200);

    listItem.click();

    expect(editEvent).to.have.been.calledOnce;
    expect(editEvent.args[0][0].detail).to.satisfy(isUpdate);
    expect(editEvent.args[0][0].detail.element.tagName).to.equal('GSEControl');
    expect(editEvent.args[0][0].detail.attributes.datSet).to.equal('datSet2');
  });
});
