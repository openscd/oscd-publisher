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

import { smvControlDoc } from './smvControl.testfiles.js';

import './sampled-value-control-editor.js';
import type { SampledValueControlEditor } from './sampled-value-control-editor.js';

function timeout(ms: number) {
  return new Promise(res => {
    setTimeout(res, ms);
  });
}

describe('SampledValueControl editor component', () => {
  let editor: SampledValueControlEditor;
  let editEvent: SinonSpy;

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

    editEvent = spy();
    window.addEventListener('oscd-edit-v2', editEvent);
  });

  it('allows to remove and existing SampledValueControl element', async () => {
    await sendMouse({ type: 'click', position: [760, 200] });

    expect(editEvent).to.have.been.calledOnce;
    expect(editEvent.args[0][0].detail.edit[0]).to.satisfy(isRemove);
    expect(editEvent.args[0][0].detail.edit[0].node.tagName).to.equal(
      'SampledValueControl'
    );
  });

  it('allows to insert new DataSet and link with existing SampledValueControl', async () => {
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
    await sendMouse({ type: 'click', position: [400, 200] });

    editor.changeDataSet.click();
    await timeout(200);
    await sendMouse({ type: 'click', position: [400, 420] });

    expect(editEvent).to.have.been.calledOnce;
    expect(editEvent.args[0][0].detail.edit).to.satisfy(isUpdate);
    expect(editEvent.args[0][0].detail.edit.element.tagName).to.equal(
      'SampledValueControl'
    );
    expect(editEvent.args[0][0].detail.edit.attributes.datSet).to.equal(
      'datSet2'
    );
  });
});
