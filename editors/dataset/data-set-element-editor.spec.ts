/* eslint-disable no-unused-expressions */
/* eslint-disable import/no-extraneous-dependencies */
import { expect, fixture, html } from '@open-wc/testing';
import { sendMouse, setViewport } from '@web/test-runner-commands';

import { SinonSpy, spy } from 'sinon';

import {
  isInsert,
  isRemove,
} from '@openenergytools/scl-lib/dist/foundation/utils.js';

import { MdDialog } from '@scopedelement/material-web/dialog/MdDialog.js';

import { dataSetDoc } from './data-set-editor.testfiles.js';

import './data-set-element-editor.js';
import type { DataSetElementEditor } from './data-set-element-editor.js';

window.customElements.define('md-dialog', MdDialog);

const doc = new DOMParser().parseFromString(dataSetDoc, 'application/xml');
const dataSet = doc.querySelector('LDevice[inst="ldInst1"] DataSet')!;

function timeout(ms: number) {
  return new Promise(res => {
    setTimeout(res, ms);
  });
}

describe('DataSet element editor', () => {
  let editor: DataSetElementEditor;

  let editEvent: SinonSpy;

  beforeEach(async () => {
    editor = await fixture(
      html`<data-set-element-editor
        .element="${dataSet}"
      ></data-set-element-editor>`
    );

    editEvent = spy();
    window.addEventListener('oscd-edit-v2', editEvent);
  });

  it('allows to change DataSets name attribute', async () => {
    editor.inputs[0].value = 'SomeDataSetName';

    await editor.saveButton.click();

    expect(editEvent).to.have.be.calledOnce;

    expect(editEvent.args[0][0].detail.edit[0].attributes.name).to.equal(
      'SomeDataSetName'
    );
  });

  it('allows to change DataSets desc attribute', async () => {
    editor.inputs[1].nullSwitch?.click();
    editor.inputs[1].value = 'SomeNewDesc';

    await editor.saveButton.click();

    expect(editEvent).to.have.be.calledOnce;
    expect(editEvent.args[0][0].detail.edit[0].attributes.desc).to.equal(
      'SomeNewDesc'
    );
  });

  it('allows to remove DataSets child data', async () => {
    await sendMouse({ type: 'click', position: [700, 550] });

    expect(editEvent).to.have.be.calledOnce;
    expect(editEvent.args[0][0].detail.edit.length).to.equal(1);
    expect(editEvent.args[0][0].detail.edit[0].node.tagName).to.equal('FCDA');
  });

  it('allows to move FCDA child one step up', async () => {
    await setViewport({ width: 800, height: 1200 });
    await sendMouse({ type: 'click', position: [740, 600] }); // open menu
    await timeout(200); // await menu to be opened
    await sendMouse({ type: 'click', position: [740, 700] }); // click on move up

    const toBeMovedFCDA = dataSet.querySelectorAll(':scope > FCDA')[1];
    const reference = toBeMovedFCDA.previousElementSibling;

    expect(editEvent).to.have.be.calledOnce;
    expect(editEvent.args[0][0].detail.edit.length).to.equal(2);
    expect(editEvent.args[0][0].detail.edit[0]).to.satisfy(isRemove);
    expect(editEvent.args[0][0].detail.edit[0].node).to.equal(toBeMovedFCDA);
    expect(editEvent.args[0][0].detail.edit[1]).to.satisfy(isInsert);
    expect(editEvent.args[0][0].detail.edit[1].parent).to.equal(dataSet);
    expect(editEvent.args[0][0].detail.edit[1].node).to.equal(toBeMovedFCDA);
    expect(editEvent.args[0][0].detail.edit[1].reference).to.equal(reference);
  });

  it('allows to move FCDA child one step down', async () => {
    await setViewport({ width: 800, height: 1200 });
    await sendMouse({ type: 'click', position: [740, 600] }); // open menu
    await timeout(200); // await menu to be opened
    await sendMouse({ type: 'click', position: [740, 760] }); // click on move down

    const toBeMovedFCDA = dataSet.querySelectorAll(':scope > FCDA')[1];
    const reference = toBeMovedFCDA.nextElementSibling?.nextElementSibling;

    expect(editEvent).to.have.be.calledOnce;
    expect(editEvent.args[0][0].detail.edit.length).to.equal(2);
    expect(editEvent.args[0][0].detail.edit[0]).to.satisfy(isRemove);
    expect(editEvent.args[0][0].detail.edit[0].node).to.equal(toBeMovedFCDA);
    expect(editEvent.args[0][0].detail.edit[1]).to.satisfy(isInsert);
    expect(editEvent.args[0][0].detail.edit[1].parent).to.equal(dataSet);
    expect(editEvent.args[0][0].detail.edit[1].node).to.equal(toBeMovedFCDA);
    expect(editEvent.args[0][0].detail.edit[1].reference).to.equal(reference);
  });

  it('allows adds new data attribute to DataSet', () => {
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
      [
        'LDevice: IED>>ldInst1',
        'LN: IED>>ldInst1>prefix MMXU 1',
        'DO: #MMXU>PhV',
        'SDO: #WYE>phRes',
        'SDO: #CustomWYE>phsA',
        'DA: #CMV>cVal',
        'BDA: #Vector>mag',
        'BDA: #AnalogueValue>f',
      ],
    ];

    editor.daPickerSaveButton.click();

    expect(editEvent).to.have.be.calledOnce;
    expect(editEvent.args[0][0].detail.edit.length).to.equal(2);

    const insert1 = editEvent.args[0][0].detail.edit[0];
    expect(insert1).to.satisfy(isInsert);
    expect(insert1.node.getAttribute('ldInst')).to.equal('ldInst1');
    expect(insert1.node.getAttribute('prefix')).to.equal('prefix');
    expect(insert1.node.getAttribute('lnClass')).to.equal('MMXU');
    expect(insert1.node.getAttribute('lnInst')).to.equal('1');
    expect(insert1.node.getAttribute('doName')).to.equal('PhV.phsA');
    expect(insert1.node.getAttribute('daName')).to.equal('cVal.mag.f');
    expect(insert1.node.getAttribute('fc')).to.equal('MX');

    const insert2 = editEvent.args[0][0].detail.edit[1];
    expect(insert2).to.satisfy(isInsert);
    expect(insert2.node.getAttribute('ldInst')).to.equal('ldInst1');
    expect(insert2.node.getAttribute('prefix')).to.equal('prefix');
    expect(insert2.node.getAttribute('lnClass')).to.equal('MMXU');
    expect(insert2.node.getAttribute('lnInst')).to.equal('1');
    expect(insert2.node.getAttribute('doName')).to.equal('PhV.phRes.phsA');
    expect(insert2.node.getAttribute('daName')).to.equal('cVal.mag.f');
    expect(insert2.node.getAttribute('fc')).to.equal('MX');
  });

  it('allows adds new data object to DataSet', () => {
    editor.doPicker.paths = [
      [
        'LDevice: IED>>ldInst1',
        'LN: IED>>ldInst1>prefix MMXU 1',
        'DO: #MMXU>PhV',
        'SDO: #WYE>phsA',
        'FC: MX',
      ],
      [
        'LDevice: IED>>ldInst1',
        'LN: IED>>ldInst1>prefix MMXU 1',
        'DO: #MMXU>PhV',
        'SDO: #WYE>phRes',
        'SDO: #CustomWYE>phsA',
        'FC: MX',
      ],
    ];

    editor.doPickerSaveButton.click();

    expect(editEvent).to.have.be.calledOnce;
    expect(editEvent.args[0][0].detail.edit.length).to.equal(2);

    const insert1 = editEvent.args[0][0].detail.edit[0];
    expect(insert1).to.satisfy(isInsert);
    expect(insert1.node.getAttribute('ldInst')).to.equal('ldInst1');
    expect(insert1.node.getAttribute('prefix')).to.equal('prefix');
    expect(insert1.node.getAttribute('lnClass')).to.equal('MMXU');
    expect(insert1.node.getAttribute('lnInst')).to.equal('1');
    expect(insert1.node.getAttribute('doName')).to.equal('PhV.phsA');
    expect(insert1.node.getAttribute('daName')).to.be.null;
    expect(insert1.node.getAttribute('fc')).to.equal('MX');

    const insert2 = editEvent.args[0][0].detail.edit[1];
    expect(insert2).to.satisfy(isInsert);
    expect(insert2.node.getAttribute('ldInst')).to.equal('ldInst1');
    expect(insert2.node.getAttribute('prefix')).to.equal('prefix');
    expect(insert2.node.getAttribute('lnClass')).to.equal('MMXU');
    expect(insert2.node.getAttribute('lnInst')).to.equal('1');
    expect(insert2.node.getAttribute('doName')).to.equal('PhV.phRes.phsA');
    expect(insert2.node.getAttribute('daName')).to.be.null;
    expect(insert2.node.getAttribute('fc')).to.equal('MX');
  });
});
