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

import { updateGseControl } from './gsecontrol.js';
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
});
