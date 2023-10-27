/* eslint-disable import/no-extraneous-dependencies */
import { expect } from '@open-wc/testing';

import {
  connectedData,
  ed2Subscription,
  orphanControlBlock,
  orphanDataSet,
  orphanFCDA,
  singleIedWithCtrlBlocks,
  unconnectedData,
} from './controlBlock.testfiles.js';
import {
  controlBlock,
  controlBlockObjectReference,
  controlBlocks,
  updatedConfRev,
} from './controlBlocks.js';

function findElement(str: string, selector: string): Element {
  return new DOMParser()
    .parseFromString(str, 'application/xml')
    .querySelector(selector)!;
}

describe('Control block related util functions', () => {
  describe('controlBlockReference', () => {
    it('return null for orphan control block', () =>
      expect(
        controlBlockObjectReference(
          findElement(orphanControlBlock, 'GSEControl')
        )
      ).to.be.null);

    it('return correct object reference for GSEControl element', () =>
      expect(
        controlBlockObjectReference(
          findElement(singleIedWithCtrlBlocks, 'GSEControl')
        )
      ).to.equal('someIEDsomeLDevice/LLN0.gseControl'));

    it('return correct object reference for ReportControl element', () =>
      expect(
        controlBlockObjectReference(
          findElement(singleIedWithCtrlBlocks, 'ReportControl')
        )
      ).to.equal('someIEDsomeLDevice/II_PTOC1.rpControl'));

    it('return correct object reference for SampledValueControl element', () =>
      expect(
        controlBlockObjectReference(
          findElement(singleIedWithCtrlBlocks, 'SampledValueControl')
        )
      ).to.equal('someIEDsomeLDevice/LLN0.smvControl'));
  });

  describe('controlBlock', () => {
    it('returns null for polling or Ed1 subscription types', () => {
      const extRef = findElement(ed2Subscription, 'ExtRef[serviceType="Poll"]');
      expect(controlBlock(extRef)).to.equal(null);
    });

    it('returns control block connected to subscribed data', () => {
      const extRef = findElement(
        ed2Subscription,
        'ExtRef[srcCBName="someGse"]'
      );
      const cb = extRef.ownerDocument.querySelector(
        'GSEControl[name="someGse"]'
      );

      expect(controlBlock(extRef)).to.equal(cb);
    });

    it('returns control block connected to subscribed data', () => {
      const extRef = findElement(ed2Subscription, 'ExtRef[srcCBName="someRp"]');
      const cb = extRef.ownerDocument.querySelector(
        'ReportControl[name="someRp"]'
      );

      expect(controlBlock(extRef)).to.equal(cb);
    });

    it('returns control block connected to subscribed data', () => {
      const extRef = findElement(
        ed2Subscription,
        'ExtRef[srcCBName="someSmv"]'
      );
      const cb = extRef.ownerDocument.querySelector(
        'SampledValueControl[name="someSmv"]'
      );

      expect(controlBlock(extRef)).to.equal(cb);
    });
  });

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
