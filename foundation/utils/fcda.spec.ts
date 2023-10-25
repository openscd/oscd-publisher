/* eslint-disable import/no-extraneous-dependencies */
import { expect } from '@open-wc/testing';
import { isRemove, isUpdate, Update } from '@openscd/open-scd-core';

import { isSubscribed, removeFCDA } from './fcda.js';
import {
  multipleConnectionsEd1,
  multipleConnectionsEd2,
  orphanDataSet,
  singleConnection,
  singleConnectionEd2,
} from './fcda.testfiles.js';

function findElement(str: string, selector: string): Element | null {
  return new DOMParser()
    .parseFromString(str, 'application/xml')
    .querySelector(selector);
}

describe('Utility functions for FCDA element', () => {
  describe('isSubscribed', () => {
    it('returns false for orphan FCDA', () =>
      expect(isSubscribed(findElement(orphanDataSet, 'FCDA')!)).to.be.false);

    it('returns true for a connected FCDA', () =>
      expect(
        isSubscribed(
          findElement(singleConnection, 'DataSet[name="someDataSet1"] FCDA')!
        )
      ).to.be.true);

    it('returns false for a un connected FCDA', () =>
      expect(
        isSubscribed(
          findElement(singleConnection, 'DataSet[name="someDataSet2"] FCDA')!
        )
      ).to.be.false);

    it('returns true for a connected FCDA', () =>
      expect(isSubscribed(findElement(multipleConnectionsEd1, 'FCDA')!)).to.be
        .true);

    it('is control block sensitive for Ed2 files', () =>
      expect(
        isSubscribed(
          findElement(
            multipleConnectionsEd2,
            'DataSet[name="someDataSet1"] FCDA'
          )!
        )
      ).to.be.false);

    it('checks serviceType in Ed2 files', () =>
      expect(
        isSubscribed(
          findElement(
            multipleConnectionsEd2,
            'DataSet[name="someDataSet3"] FCDA'
          )!
        )
      ).to.be.false);

    it('finds functional constraint data object', () =>
      expect(
        isSubscribed(
          findElement(
            multipleConnectionsEd2,
            'DataSet[name="someDataSet4"] FCDA'
          )!
        )
      ).to.be.true);

    it('returns true for connected FCDA in Ed2 files', () =>
      expect(
        isSubscribed(
          findElement(
            multipleConnectionsEd2,
            'DataSet[name="someDataSet2"] FCDA'
          )!
        )
      ).to.be.true);

    it('returns true for single connected FCDA in Ed2 files', () =>
      expect(
        isSubscribed(
          findElement(singleConnectionEd2, 'DataSet[name="someName"] FCDA')!
        )
      ).to.be.true);
  });

  describe('removeFcda', () => {
    it('only removes FCDA if no subscription is found', () => {
      const fCDA = findElement(
        singleConnection,
        'DataSet[name="someDataSet2"] FCDA'
      );
      expect(removeFCDA(fCDA!)[0]).to.deep.equal({
        node: fCDA,
      });
    });

    it('removes Ed1 subscription if any found', () => {
      const fCDA = findElement(singleConnection, 'FCDA');
      expect(removeFCDA(fCDA!).length).to.equal(3);
      expect(removeFCDA(fCDA!)[1]).to.satisfies(isRemove);
      expect(removeFCDA(fCDA!)[2]).to.satisfies(isRemove);
    });

    it('removes multiple Ed1 subscriptions if any found', () => {
      const fCDA = findElement(multipleConnectionsEd1, 'FCDA');
      expect(removeFCDA(fCDA!).length).to.equal(4);
      expect(removeFCDA(fCDA!)[1]).to.satisfies(isUpdate);
      expect(removeFCDA(fCDA!)[2]).to.satisfies(isRemove);
      expect(removeFCDA(fCDA!)[3]).to.satisfies(isRemove);
    });

    it('removes Ed2 subscriptions if any found', () => {
      const fCDA = findElement(
        multipleConnectionsEd2,
        'DataSet[name="someDataSet2"] FCDA'
      );
      expect(removeFCDA(fCDA!).length).to.equal(2);
      expect(removeFCDA(fCDA!)[1]).to.satisfies(isUpdate);
      expect((removeFCDA(fCDA!)[1] as Update).attributes).to.deep.equal({
        iedName: null,
        ldInst: null,
        prefix: null,
        lnClass: null,
        lnInst: null,
        doName: null,
        daName: null,
        srcLDInst: null,
        srcPrefix: null,
        srcLNClass: null,
        srcLNInst: null,
        srcCBName: null,
        serviceType: null,
      });
    });
  });
});
