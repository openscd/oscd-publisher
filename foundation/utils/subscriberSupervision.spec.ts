/* eslint-disable import/no-extraneous-dependencies */
import { expect } from '@open-wc/testing';
import { removeSubscriptionSupervision } from './subscriberSupervision.js';

import {
  ed1Subscription,
  ed2MissingCb,
  ed2Subscription,
  ed2SubscriptionBrokenDataTypes,
} from './subscriberSupervision.testfiles.js';

function findElement(str: string, selector: string): Element | null {
  return new DOMParser()
    .parseFromString(str, 'application/xml')
    .querySelector(selector);
}

function findAllElement(str: string, selector: string): Element[] {
  return Array.from(
    new DOMParser()
      .parseFromString(str, 'application/xml')
      .querySelectorAll(selector)
  );
}

describe('Utility functions for subscription supervision', () => {
  describe('removeSubscriptionSupervision', () => {
    it('returns empty array for Ed1 files', () =>
      expect(
        removeSubscriptionSupervision([findElement(ed1Subscription, 'ExtRef')!])
      ).to.deep.equal([]));

    it('return empty array for empty array input', () =>
      expect(removeSubscriptionSupervision([])).to.deep.equal([]));

    it('returns empty array if control block is not completely unsubscribed', () =>
      expect(
        removeSubscriptionSupervision([findElement(ed2Subscription, 'ExtRef')!])
      ).to.deep.equal([]));

    it('returns empty array if control blocks are not completely unsubscribed', () => {
      const extRefs = findAllElement(
        ed2Subscription,
        'ExtRef[srcCBName="someGse2"], ExtRef[srcCBName="someGse"]'
      );
      extRefs.shift();

      const supervisionNode = extRefs[0].ownerDocument.querySelector(
        'LN[lnClass="LGOS"][inst="2"]'
      );

      expect(removeSubscriptionSupervision(extRefs)).to.deep.equal([
        { node: supervisionNode },
      ]);
    });

    it('returns empty array if there is no subscription supervision', () =>
      expect(
        removeSubscriptionSupervision(
          findAllElement(ed2Subscription, 'ExtRef[srcCBName="someGse3"]')
        )
      ).to.deep.equal([]));

    it('returns empty array if not subscribed to control block', () =>
      expect(
        removeSubscriptionSupervision(findAllElement(ed2MissingCb, 'ExtRef'))
      ).to.deep.equal([]));

    it('returns empty array if subscription supervision editing is not allowed', () =>
      expect(
        removeSubscriptionSupervision(
          findAllElement(ed2Subscription, 'Inputs[desc="SMV"] > ExtRef')
        )
      ).to.deep.equal([]));

    it('returns empty array if supervision edition status cannot be checked', () => {
      const extRefs = findAllElement(
        ed2SubscriptionBrokenDataTypes,
        'ExtRef[srcCBName="someSmv"], ExtRef[srcCBName="someGse2"]'
      );

      expect(removeSubscriptionSupervision(extRefs)).to.deep.equal([]);
    });

    it('returns Remove object for single subscribed data', () => {
      const extRefs = findAllElement(
        ed2Subscription,
        'ExtRef[srcCBName="someGse2"]'
      );

      const supervisionNode = extRefs[0].ownerDocument.querySelector(
        'LN[lnClass="LGOS"][inst="2"]'
      );

      expect(removeSubscriptionSupervision(extRefs)).to.deep.equal([
        {
          node: supervisionNode,
        },
      ]);
    });

    it('makes sure to only remove LGOS with existing OpenSCD.create private tag', () => {
      const extRefs = findAllElement(
        ed2Subscription,
        'ExtRef[srcCBName="someGse"]'
      );

      const supervisionNode = extRefs[0].ownerDocument.querySelector(
        'LN[lnClass="LGOS"][inst="1"] > DOI'
      );

      expect(removeSubscriptionSupervision(extRefs)).to.deep.equal([
        {
          node: supervisionNode,
        },
      ]);
    });
  });
});
