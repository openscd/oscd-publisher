/* eslint-disable import/no-extraneous-dependencies */
import { expect } from '@open-wc/testing';

import { Remove } from '@openscd/open-scd-core';

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
  removeControlBlock,
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

  describe('removeControlBlok', () => {
    const ctrlBlock4 = findElement(
      ed2Subscription,
      'GSEControl[name="someGse4"]'
    )!;
    const ctrlBlock3 = findElement(
      ed2Subscription,
      'GSEControl[name="someGse3"]'
    )!;
    const ctrlBlock2 = findElement(
      ed2Subscription,
      'GSEControl[name="someGse2"]'
    )!;
    const ctrlBlock1 = findElement(
      ed2Subscription,
      'SampledValueControl[name="someSmv"]'
    )!;
    const orphanCtrlBlock = findElement(orphanControlBlock, 'GSEControl')!;

    it('return empty array on orphan inputs', () => {
      const actions = removeControlBlock(orphanCtrlBlock);
      expect((actions[0] as Remove).node).equals(orphanCtrlBlock);
    });

    it('it only remove the control block without referenced DataSet', () => {
      const actions = removeControlBlock(ctrlBlock4);
      expect(actions.length).equals(1);
      expect((actions[0] as Remove).node).equal(ctrlBlock4);
    });

    it('it only remove the control with multi used DataSet', () => {
      const actions = removeControlBlock(ctrlBlock3);
      expect(actions.length).equals(1);
      expect((actions[0] as Remove).node).equal(ctrlBlock3);
    });

    it('it removes subscribed data in case of multi use DataSet', () => {
      const actions = removeControlBlock(ctrlBlock2);
      const extRef = ctrlBlock2.ownerDocument.querySelector(
        'ExtRef[srcCBName="someGse2"]'
      );
      expect(actions.length).equals(3);
      expect((actions[1] as Remove).node).equal(extRef);
    });

    it('it removes subscribed data form single use DataSet', () => {
      const actions = removeControlBlock(ctrlBlock1);
      const dataSet = ctrlBlock1.ownerDocument.querySelector(
        'DataSet[name="smvDataSet"]'
      );
      expect(actions.length).equals(8);
      expect((actions[1] as Remove).node).equal(dataSet);
      expect(((actions[3] as Remove).node as Element).tagName).equal('FCDA');
      expect(((actions[4] as Remove).node as Element).tagName).equal('FCDA');
      expect(((actions[5] as Remove).node as Element).tagName).equal('ExtRef');
      expect(((actions[6] as Remove).node as Element).tagName).equal('ExtRef');
      expect(((actions[7] as Remove).node as Element).tagName).equal('Inputs');
    });
  });
});
