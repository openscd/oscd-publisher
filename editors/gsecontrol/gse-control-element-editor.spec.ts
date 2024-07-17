/* eslint-disable no-unused-expressions */
/* eslint-disable import/no-extraneous-dependencies */
import { expect, fixture, html } from '@open-wc/testing';

import { SinonSpy, spy } from 'sinon';

import { gseControlDoc } from './gseControl.testfiles.js';

import './gse-control-element-editor.js';
import type { GseControlElementEditor } from './gse-control-element-editor.js';

describe('GSEControl element editor component', () => {
  let editor: GseControlElementEditor;
  let editEvent: SinonSpy;
  let gseControl: Element;
  beforeEach(async () => {
    gseControl = new DOMParser()
      .parseFromString(gseControlDoc, 'application/xml')
      .querySelector('GSEControl[name="gse2"]')!;

    editor = await fixture(
      html`<gse-control-element-editor
        .element="${gseControl}"
      ></gse-control-element-editor>`
    );

    editEvent = spy();
    window.addEventListener('oscd-edit', editEvent);
  });

  it('allows to change the GSEControl elements attributes', async () => {
    editor.gSEControlInputs![0].value = 'SomeNewName';
    editor.gSEControlInputs![1].value = 'SomeNewDesc';
    editor.gSEControlInputs![2].value = 'GSSE';

    editor.gSEControlInputs![3].nullSwitch?.click();
    await editor.updateComplete;

    editor.gSEControlInputs![3].value = '10001';

    editor.gSEControlInputs![4].value = 'someNewAppID';
    editor.gSEControlInputs![5].nullSwitch?.click();
    await editor.updateComplete;

    editor.gSEControlInputs![6].nullSwitch?.click();
    await editor.updateComplete;

    editor.gSEControlInputs![6].value = 'None';

    await editor.updateComplete;
    editor.gseControlSave.click();

    expect(editEvent).to.be.calledOnce;
    expect(editEvent.args[0][0].detail.length).to.equal(2);

    const update = editEvent.args[0][0].detail[0];
    expect(update.element).to.equal(gseControl);

    expect(update.attributes).to.deep.equal({
      name: 'SomeNewName',
      desc: 'SomeNewDesc',
      confRev: '10001',
      appID: 'someNewAppID',
      type: 'GSSE',
      fixedOffs: 'false',
      securityEnabled: 'None',
    });
  });

  it('allows to change the GSE element child element', async () => {
    editor.gSEInputs![0].value = '01-0C-CD-01-00-13';
    editor.gSEInputs![1].value = '1234';
    editor.gSEInputs![2].nullSwitch?.click();
    editor.gSEInputs![3].nullSwitch?.click();
    editor.gSEInputs![4].value = '76';
    editor.gSEInputs![5].value = '465';

    await editor.updateComplete;
    editor.gseSave.click();

    expect(editEvent).to.be.calledOnce;
    // insert new address
    // remove old address
    // insert new MinTime
    // remove old MinTime
    // insert new MaxTime
    // remove old MaxTime
    expect(editEvent.args[0][0].detail.length).to.equal(6);
  });
});
