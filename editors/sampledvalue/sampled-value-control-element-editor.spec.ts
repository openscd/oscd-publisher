/* eslint-disable no-unused-expressions */
/* eslint-disable import/no-extraneous-dependencies */
import { expect, fixture, html } from '@open-wc/testing';

import { SinonSpy, spy } from 'sinon';

import { isUpdate } from '@openenergytools/scl-lib/dist/foundation/utils.js';

import { smvControlDoc } from './smvControl.testfiles.js';

import './sampled-value-control-element-editor.js';
import type { SampledValueControlElementEditor } from './sampled-value-control-element-editor.js';

describe('SampledValueControl element editor component', () => {
  let editor: SampledValueControlElementEditor;
  let editEvent: SinonSpy;
  let smvControl: Element;
  beforeEach(async () => {
    smvControl = new DOMParser()
      .parseFromString(smvControlDoc, 'application/xml')
      .querySelector('SampledValueControl[name="smv2"]')!;

    editor = await fixture(
      html`<sampled-value-control-element-editor
        .element="${smvControl}"
      ></sampled-value-control-element-editor>`
    );

    editEvent = spy();
    window.addEventListener('oscd-edit', editEvent);
  });

  it('allows to change the SampledValueControl elements attributes', async () => {
    editor.sampledValueControlInputs![0].maybeValue = 'SomeNewName';
    editor.sampledValueControlInputs![1].nullSwitch?.click();
    editor.sampledValueControlInputs![2].maybeValue = 'someOtherSmvID';
    editor.sampledValueControlInputs![3].maybeValue = 'SmpPerSec';
    editor.sampledValueControlInputs![4].maybeValue = '4000';
    editor.sampledValueControlInputs![5].maybeValue = '2';
    editor.sampledValueControlInputs![6].nullSwitch?.click();
    editor.sampledValueControlInputs![6].maybeValue = 'None';

    await editor.updateComplete;
    editor.smvControlSave.click();

    expect(editEvent).to.be.calledOnce;
    expect(editEvent.args[0][0].detail.length).to.equal(2);

    const update = editEvent.args[0][0].detail[0];
    expect(update.element).to.equal(smvControl);
    expect(update.attributes).to.deep.equal({
      name: 'SomeNewName',
      desc: null,
      confRev: '10043',
      smvID: 'someOtherSmvID',
      smpMod: 'SmpPerSec',
      smpRate: '4000',
      nofASDU: '2',
      securityEnabled: 'None',
    });
  });

  it('allows to change the SMV element child element', async () => {
    editor.sMVInputs![0].maybeValue = '01-0C-CD-04-00-13';
    editor.sMVInputs![1].maybeValue = '1234';
    editor.sMVInputs![2].nullSwitch?.click();
    editor.sMVInputs![3].nullSwitch?.click();

    await editor.updateComplete;
    editor.smvSave.click();

    expect(editEvent).to.be.calledOnce;
    expect(editEvent.args[0][0].detail.length).to.equal(2);
  });

  it('allows to change the SmvOpts element child element', async () => {
    editor.smvOptsInputs![0].nullSwitch?.click();
    editor.smvOptsInputs![1].maybeValue = 'false';
    editor.smvOptsInputs![2].nullSwitch?.click();
    editor.smvOptsInputs![3].nullSwitch?.click();
    editor.smvOptsInputs![4].maybeValue = 'false';
    editor.smvOptsInputs![5].maybeValue = 'false';
    editor.smvOptsInputs![6].maybeValue = 'false';

    await editor.updateComplete;
    editor.smvOptsSave.click();

    expect(editEvent).to.be.calledOnce;
    expect(editEvent.args[0][0].detail).to.satisfy(isUpdate);
    expect(editEvent.args[0][0].detail.element.tagName).to.equal('SmvOpts');
    expect(editEvent.args[0][0].detail.attributes).to.deep.equal({
      refreshTime: null,
      sampleSynchronized: 'false',
      sampleRate: null,
      dataSet: null,
      security: 'false',
      timestamp: 'false',
      synchSourceId: 'false',
    });
  });
});
