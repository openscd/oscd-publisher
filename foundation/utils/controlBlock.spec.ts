/* eslint-disable import/no-extraneous-dependencies */
import { expect } from '@open-wc/testing';

import {
  connectedData,
  orphanDataSet,
  orphanFCDA,
  unconnectedData,
} from './controlBlock.testfiles.js';
import { controlBlocks, updatedConfRev } from './controlBlocks.js';

function findElement(str: string, selector: string): Element {
  return new DOMParser()
    .parseFromString(str, 'application/xml')
    .querySelector(selector)!;
}

describe('Control block related util functions', () => {
  describe('controlBlocks', () => {
    it('returns empty array for orphans FCDA', () =>
      expect(controlBlocks(findElement(orphanFCDA, 'FCDA'))).to.deep.equal([]));

    it('returns empty array for orphans DataSet', () =>
      expect(
        controlBlocks(findElement(orphanDataSet, 'DataSet'))
      ).to.deep.equal([]));

    it('returns empty for unconnected DataSet', () =>
      expect(
        controlBlocks(findElement(unconnectedData, 'DataSet'))
      ).to.deep.equal([]));

    it('returns empty for unconnected FCDA', () =>
      expect(controlBlocks(findElement(unconnectedData, 'FCDA'))).to.deep.equal(
        []
      ));

    it('returns empty for connected DataSet', () =>
      expect(
        controlBlocks(findElement(connectedData, 'DataSet')).length
      ).to.equal(3));

    it('returns empty for connected FCDA', () =>
      expect(controlBlocks(findElement(connectedData, 'FCDA')).length).to.equal(
        3
      ));
  });

  describe('updatedConfRev', () => {
    const rptControl = new DOMParser()
      .parseFromString(`<ReportControl confRev="1"/> `, 'application/xml')
      .querySelector('ReportControl')!;

    const gseControl = new DOMParser()
      .parseFromString(`<GSEControl /> `, 'application/xml')
      .querySelector('GSEControl')!;

    it('increments existing confRev', () =>
      expect(updatedConfRev(rptControl)).equals('10001'));

    it('increments missing confRev', () =>
      expect(updatedConfRev(gseControl)).equals('10000'));
  });
});
