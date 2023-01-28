/* eslint-disable import/no-extraneous-dependencies */
import { expect } from '@open-wc/testing';

import {
  Insert,
  isInsert,
  isRemove,
  isUpdate,
  Remove,
  Update,
} from '@openscd/open-scd-core';

import { addGSEControl, updateGseControl } from './gsecontrol.js';
import { withSubscriptionSupervision } from './gsecontrol.testfiles.js';

function findElement(str: string, selector: string): Element | null {
  return new DOMParser()
    .parseFromString(str, 'application/xml')
    .querySelector(selector);
}

function buildAttr(name = false): Record<string, string | null> {
  if (name)
    return {
      name: 'someNewGseName',
      desc: 'someDesc',
      type: 'GSSE',
      appID: 'someNewAppID',
      fixedOffs: 'true',
      securityEnabled: 'someSecEna',
    };

  return {
    desc: 'someDesc',
    type: 'GSSE',
    appID: 'someNewAppID',
    fixedOffs: 'true',
    securityEnabled: 'someSecEna',
  };
}

describe('Utility functions for GSEControl element', () => {
  describe('updateGseControl', () => {
    describe('when no name attribute is changed', () => {
      it('updates only the GSEElement', () => {
        const gseControl = findElement(
          withSubscriptionSupervision,
          'GSEControl[name="someGse"]'
        )!;
        const actions = updateGseControl(gseControl, buildAttr());

        expect(actions.length).to.equal(1);
        expect(actions[0]).to.satisfy(isUpdate);
        expect((actions[0] as Update).element).to.equal(gseControl);
        expect((actions[0] as Update).attributes).to.deep.equal(buildAttr());
      });
    });

    describe('when name attribute is changed', () => {
      it('also updates subscribed ExtRefs', () => {
        const gseControl = findElement(
          withSubscriptionSupervision,
          'GSEControl[name="someGse3"]'
        )!;
        const actions = updateGseControl(gseControl, buildAttr(true));

        expect(actions.length).to.equal(2);
        expect(actions[0]).to.satisfy(isUpdate);
        expect((actions[0] as Update).element).to.equal(gseControl);
        expect((actions[0] as Update).attributes).to.deep.equal(
          buildAttr(true)
        );

        expect(actions[1]).to.satisfy(isUpdate);
        expect((actions[1] as Update).element.tagName).to.equal('ExtRef');
        expect((actions[1] as Update).attributes).to.deep.equal({
          srcCBName: 'someNewGseName',
        });
      });

      it('also updates subscriber supervision Val element', () => {
        const gseControl = findElement(
          withSubscriptionSupervision,
          'GSEControl[name="someGse"]'
        )!;
        const actions = updateGseControl(gseControl, buildAttr(true));

        expect(actions.length).to.equal(5);
        expect(actions[0]).to.satisfy(isUpdate);
        expect((actions[0] as Update).element).to.equal(gseControl);
        expect((actions[0] as Update).attributes).to.deep.equal(
          buildAttr(true)
        );

        expect(actions[1]).to.satisfy(isUpdate);
        expect((actions[1] as Update).element.tagName).to.equal('ExtRef');
        expect((actions[1] as Update).attributes).to.deep.equal({
          srcCBName: 'someNewGseName',
        });
        expect(actions[2]).to.satisfy(isUpdate);
        expect((actions[2] as Update).element.tagName).to.equal('ExtRef');
        expect((actions[2] as Update).attributes).to.deep.equal({
          srcCBName: 'someNewGseName',
        });

        const oldText = gseControl.ownerDocument.querySelector(
          'LN[lnClass="LGOS"][inst="1"] Val'
        )?.firstChild as Node;
        expect(actions[3]).to.satisfy(isRemove);
        expect((actions[3] as Remove).node).to.equal(oldText);

        expect(actions[4]).to.satisfy(isInsert);
        expect((actions[4] as Insert).parent).to.equal(oldText.parentElement);
        expect((actions[4] as Insert).node.textContent).to.equal(
          'srcIEDsomeLDInst/LLN0.someNewGseName'
        );
      });

      it('also updates subscriber supervision Val element', () => {
        const gseControl = findElement(
          withSubscriptionSupervision,
          'GSEControl[name="someGse2"]'
        )!;
        const actions = updateGseControl(gseControl, buildAttr(true));

        expect(actions.length).to.equal(5);
        expect(actions[0]).to.satisfy(isUpdate);
        expect((actions[0] as Update).element).to.equal(gseControl);
        expect((actions[0] as Update).attributes).to.deep.equal(
          buildAttr(true)
        );

        expect(actions[1]).to.satisfy(isUpdate);
        expect((actions[1] as Update).element.tagName).to.equal('ExtRef');
        expect((actions[1] as Update).attributes).to.deep.equal({
          srcCBName: 'someNewGseName',
        });

        const oldText = gseControl.ownerDocument.querySelector(
          'LN[lnClass="LGOS"][inst="2"] Val'
        )?.firstChild as Node;
        expect(actions[2]).to.satisfy(isRemove);
        expect((actions[2] as Remove).node).to.equal(oldText);

        expect(actions[3]).to.satisfy(isInsert);
        expect((actions[3] as Insert).parent).to.equal(oldText.parentElement);
        expect((actions[3] as Insert).node.textContent).to.equal(
          'srcIEDsomeLDInst/LLN0.someNewGseName'
        );

        expect(actions[4]).to.satisfy(isUpdate);
        expect((actions[4] as Update).element.tagName).to.equal('GSE');
        expect((actions[4] as Update).attributes).to.deep.equal({
          cbName: 'someNewGseName',
        });
      });
    });
  });

  describe('addGSEControl', () => {
    const simplescl = `
    <SCL>
      <Communication>
        <ConnectedAP iedName="someOtherIED" apName="AP1">
          <GSE  ldInst="" cbName="">
            <Address>
            </Address>
            <MinTime multiplier="m" unit="s">9</MinTime>
            <MaxTime multiplier="m" unit="s">987</MaxTime>
          </GSE>
        </ConnectedAP>
      </Communication>
    <IED name="someIED">
      <AccessPoint name="AP1">
        <LDevice inst="first">
          <LN0 lnClass="LLN0" inst="1">
            <GSEControl name="newGSEControl_001"/>
            <GSEControl name="newGSEControl_002"/>
            <GSEControl name="newGSEControl_004"/>
          </LN0>
          <LN lnClass="MMXU" inst="1">
            <GSEControl name="newGSEControl_001"/>
          </LN>
        <LN lnClass="MMXU" inst="2" />
        </LDevice>
        <LDevice inst="second"/>
        <LDevice inst="third">
          <LN0 lnClass="LLN0" inst=""/>
        </LDevice>
      </AccessPoint>
    </IED>
    <IED name="someOtherIED">
      <AccessPoint name="AP1">
        <LDevice inst="first">
          <LN0 lnClass="LLN0" inst="">
            <GSEControl name="gseControl"/>
          </LN0>
        </LDevice>
      </AccessPoint>
    </IED>
    </SCL>`;

    const ied = new DOMParser()
      .parseFromString(simplescl, 'application/xml')
      .querySelector('IED')!;

    const ln = new DOMParser()
      .parseFromString(simplescl, 'application/xml')
      .querySelector('LN')!;

    const ln0 = new DOMParser()
      .parseFromString(simplescl, 'application/xml')
      .querySelector('LN0')!;

    const ln02 = new DOMParser()
      .parseFromString(simplescl, 'application/xml')
      .querySelector('LN0[inst=""]')!;

    const lDevice = new DOMParser()
      .parseFromString(simplescl, 'application/xml')
      .querySelector('IED[name="someOtherIED"] LDevice')!;

    const invalidParent = new DOMParser()
      .parseFromString(simplescl, 'application/xml')
      .querySelector('LDevice[inst="second"]')!;

    it('add new GSEControl to first LDevice', () => {
      const insert = addGSEControl(ied);

      // eslint-disable-next-line no-unused-expressions
      expect(insert).to.exist;
      expect(insert![0].node).to.have.attribute('name', 'newGSEControl_003');
      expect(insert![0].node).to.have.attribute('confRev', '1');
      expect(insert![0].node).to.have.attribute('type', 'GOOSE');
      expect(insert![0].node).to.have.attribute(
        'appId',
        'someIED>>first>newGSEControl_003'
      );
    });

    it('add new GSEControl to LN0', () => {
      const insert = addGSEControl(ln02);

      // eslint-disable-next-line no-unused-expressions
      expect(insert).to.exist;
      expect(insert![0].node).to.have.attribute('name', 'newGSEControl_001');
      expect(insert![0].node).to.have.attribute('confRev', '1');
      expect(insert![0].node).to.have.attribute('type', 'GOOSE');
      expect(insert![0].node).to.have.attribute(
        'appId',
        'someIED>>third>newGSEControl_001'
      );
    });

    it('returns null with missing LN0', () => {
      const insert = addGSEControl(invalidParent);
      // eslint-disable-next-line no-unused-expressions
      expect(insert).to.not.exist;
    });

    it('returns null when added to LN', () => {
      const insert = addGSEControl(ln);
      // eslint-disable-next-line no-unused-expressions
      expect(insert).to.not.exist;
    });

    it('returns single insert with default GSEControl values', () => {
      const insert = addGSEControl(ln0);
      // eslint-disable-next-line no-unused-expressions
      expect(insert).to.exist;
      expect(insert?.length).to.equal(1);
      expect(insert![0].node).to.have.attribute('name', 'newGSEControl_003');
      expect(insert![0].node).to.not.have.attribute('desc');
      expect(insert![0].node).to.have.attribute('confRev', '1');
      expect(insert![0].node).to.have.attribute('type', 'GOOSE');
      expect(insert![0].node).to.have.attribute(
        'appId',
        'someIED>>first>newGSEControl_003'
      );
    });

    it('returns single insert with defined GSEControl values', () => {
      const insert = addGSEControl(ln0, {
        name: 'newGSEControl_001',
        desc: 'someDesc',
        confRev: '2',
        type: 'GSSE',
        appId: 'someAppID',
      });
      // eslint-disable-next-line no-unused-expressions
      expect(insert).to.exist;
      expect(insert?.length).to.equal(1);
      expect(insert![0].node).to.have.attribute('name', 'newGSEControl_001');
      expect(insert![0].node).to.have.attribute('desc', 'someDesc');
      expect(insert![0].node).to.have.attribute('confRev', '2');
      expect(insert![0].node).to.have.attribute('type', 'GSSE');
      expect(insert![0].node).to.have.attribute('appId', 'someAppID');
    });

    it('returns multiple inserts including GSE with connected IEDs access point', () => {
      const insert = addGSEControl(lDevice, {
        name: 'newGSEControl_001',
        desc: 'someDesc',
        confRev: '2',
        type: 'GSSE',
        appId: 'someAppID',
      });
      // eslint-disable-next-line no-unused-expressions
      expect(insert).to.exist;
      expect(insert?.length).to.equal(5);
    });

    it('returns single insert with invalid IEDs access point connection', () => {
      lDevice.removeAttribute('inst');

      const insert = addGSEControl(lDevice, {
        name: 'newGSEControl_001',
        desc: 'someDesc',
        confRev: '2',
        type: 'GSSE',
        appId: 'someAppID',
      });
      // eslint-disable-next-line no-unused-expressions
      expect(insert).to.exist;
      expect(insert?.length).to.equal(1);
    });
  });
});
