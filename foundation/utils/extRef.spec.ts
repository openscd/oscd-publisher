/* eslint-disable import/no-extraneous-dependencies */
import { expect } from '@open-wc/testing';

import { isRemove, isUpdate, Remove, Update } from '@openscd/open-scd-core';

import {
  laterBindingExtRefs,
  multipleExtRefs,
  withSubscriptionSupervision,
} from './extRef.testfiles.js';
import {
  matchExtRefCtrlBlockAttr,
  matchExtRefFcda,
  unsubscribe,
} from './extRef.js';

function findElement(str: string, selector: string): Element | null {
  return new DOMParser()
    .parseFromString(str, 'application/xml')
    .querySelector(selector);
}

function findElements(str: string, selector: string): Element[] {
  return Array.from(
    new DOMParser()
      .parseFromString(str, 'application/xml')
      .querySelectorAll(selector)
  );
}

describe('Utility functions for FCDA element', () => {
  describe('matchExtRefFcda', () => {
    const extRefStr = `<ExtRef iedName="ied" ldInst="ldInst" prefix="prefix" lnClass="USER" lnInst="lnInst" doName="doName" daName="daName" />`;
    const extRef = findElement(extRefStr, 'ExtRef');

    const fcdaStr = `<FCDA ldInst="ldInst" prefix="prefix" lnClass="USER" lnInst="lnInst" doName="doName" daName="daName" />`;
    const fcda = findElement(fcdaStr, 'FCDA');

    it('return true with equal values', () =>
      expect(matchExtRefFcda(extRef!, fcda!)).to.equal(true));

    it('in insensitive for null with prefix', () => {
      extRef?.setAttribute('prefix', '');
      fcda?.removeAttribute('prefix');
      expect(matchExtRefFcda(extRef!, fcda!)).to.equal(true);

      fcda?.setAttribute('prefix', '');
      extRef?.removeAttribute('prefix');
      expect(matchExtRefFcda(extRef!, fcda!)).to.equal(true);
    });

    it('in insensitive for null with lnInst', () => {
      extRef?.setAttribute('lnInst', '');
      fcda?.removeAttribute('lnInst');
      expect(matchExtRefFcda(extRef!, fcda!)).to.equal(true);

      fcda?.setAttribute('lnInst', '');
      extRef?.removeAttribute('lnInst');
      expect(matchExtRefFcda(extRef!, fcda!)).to.equal(true);
    });

    it('in insensitive for null with daName', () => {
      extRef?.setAttribute('daName', '');
      fcda?.removeAttribute('daName');
      expect(matchExtRefFcda(extRef!, fcda!)).to.equal(true);

      fcda?.setAttribute('daName', '');
      extRef?.removeAttribute('daName');
      expect(matchExtRefFcda(extRef!, fcda!)).to.equal(true);
    });
  });

  describe('matchExtRefFcda', () => {
    const extRefStr = `<ExtRef 
      srcLDInst="ldInst" 
      srcPrefix="prefix" 
      srcLNClass="USER" 
      srcLNInst="1" 
      srcCBName="gse" 
      serviceType="GOOSE" />`;
    const extRef = findElement(extRefStr, 'ExtRef');

    const ldInstStr = `<LDevice inst="ldInst" />`;
    const ln0Str = `<LN0 lnClass="LLN0" inst="1" />`;
    const lnStr = `<LN prefix="prefix" lnClass="USER" inst="1" />`;
    const gseStr = `<GSEControl name="gse" />`;
    const smvStr = `<SampledValueControl name="smv" />`;
    const rpStr = `<ReportControl name="rp" />`;
    const LDevice = findElement(ldInstStr, 'LDevice');
    const ln0 = findElement(ln0Str, 'LN0');
    const ln = findElement(lnStr, 'LN');
    const gse = findElement(gseStr, 'GSEControl');
    const smv = findElement(smvStr, 'SampledValueControl');
    const rp = findElement(rpStr, 'ReportControl');

    it('return false with orphan control block', () =>
      expect(matchExtRefCtrlBlockAttr(extRef!, gse!)).to.equal(false));

    it('return true with equal values', () => {
      LDevice!.appendChild(ln!);
      ln!.appendChild(gse!);

      expect(matchExtRefCtrlBlockAttr(extRef!, gse!)).to.equal(true);
    });

    it('is insensitive to null prefix', () => {
      ln?.removeAttribute('prefix');
      extRef?.setAttribute('srcPrefix', '');

      LDevice!.appendChild(ln!);
      ln!.appendChild(gse!);

      expect(matchExtRefCtrlBlockAttr(extRef!, gse!)).to.equal(true);
    });

    it('is insensitive to empty string prefix', () => {
      extRef?.removeAttribute('prefix');
      ln?.setAttribute('srcPrefix', '');

      LDevice!.appendChild(ln!);
      ln!.appendChild(gse!);

      expect(matchExtRefCtrlBlockAttr(extRef!, gse!)).to.equal(true);
    });

    it('allows LN0 as parent', () => {
      extRef?.removeAttribute('srcPrefix');
      extRef?.setAttribute('srcLNClass', 'LLN0');

      LDevice!.appendChild(ln0!);
      ln0!.appendChild(gse!);

      expect(matchExtRefCtrlBlockAttr(extRef!, gse!)).to.equal(true);
    });

    it('checks cbName and serviceType', () => {
      extRef?.setAttribute('srcCBName', 'rp');
      extRef?.setAttribute('serviceType', 'Report');

      LDevice!.appendChild(ln0!);
      ln0!.appendChild(rp!);

      expect(matchExtRefCtrlBlockAttr(extRef!, rp!)).to.equal(true);
    });

    it('checks cbName and serviceType with SampledValueControl', () => {
      extRef?.setAttribute('srcCBName', 'smv');
      extRef?.setAttribute('serviceType', 'SMV');

      LDevice!.appendChild(ln0!);
      ln0!.appendChild(smv!);

      expect(matchExtRefCtrlBlockAttr(extRef!, smv!)).to.equal(true);
    });
  });

  describe('unsubscribe', () => {
    it('returns empty array for empty array input', () =>
      expect(unsubscribe([])).to.be.empty);

    it('returns a remove action for each non later binding ExtRef', () => {
      const extRefs = findElements(multipleExtRefs, 'ExtRef');
      const actions = unsubscribe(extRefs);

      expect(actions.length).to.equal(4);
      expect(actions[0]).to.satisfies(isRemove);
      expect((actions[0] as Remove).node).to.equal(extRefs[0]);
      expect(actions[1]).to.satisfies(isRemove);
      expect((actions[1] as Remove).node).to.equal(extRefs[1]);
      expect(actions[2]).to.satisfies(isRemove);
      expect((actions[2] as Remove).node).to.equal(extRefs[2]);
    });

    it('returns an additional remove action for leave parent Input', () => {
      const extRefs = findElements(multipleExtRefs, 'ExtRef');
      const actions = unsubscribe(extRefs);

      expect(actions[3]).to.satisfies(isRemove);
      expect((actions[3] as Remove).node).to.equal(extRefs[0].parentElement);
    });

    it('returns update action for later binding type ExtRef', () => {
      const extRefs = findElements(laterBindingExtRefs, 'ExtRef');
      const actions = unsubscribe(extRefs);

      expect(actions.length).to.equal(3);
      expect(actions[0]).to.satisfies(isRemove);
      expect((actions[0] as Remove).node).to.equal(extRefs[0]);
      expect(actions[1]).to.satisfies(isUpdate);
      expect((actions[1] as Update).element).to.equal(extRefs[1]);
      expect(actions[2]).to.satisfies(isRemove);
      expect((actions[2] as Remove).node).to.equal(extRefs[2]);
    });

    it('returns makes sure to remove subscription supervision as well', () => {
      const extRefs = findElements(
        withSubscriptionSupervision,
        'ExtRef[srcCBName="someGse"], ExtRef[srcCBName="someGse2"]'
      );
      const actions = unsubscribe(extRefs);
      const doi = extRefs[0].ownerDocument.querySelector(
        'LN[lnClass="LGOS"][inst="1"] > DOI'
      );
      const ln = extRefs[0].ownerDocument.querySelector(
        'LN[lnClass="LGOS"][inst="2"]'
      );

      expect(actions.length).to.equal(5);
      expect(actions[0]).to.satisfies(isRemove);
      expect((actions[0] as Remove).node).to.equal(extRefs[0]);
      expect(actions[1]).to.satisfies(isRemove);
      expect((actions[1] as Remove).node).to.equal(extRefs[1]);
      expect(actions[2]).to.satisfies(isUpdate);
      expect((actions[2] as Update).element).to.equal(extRefs[2]);
      expect(actions[3]).to.satisfies(isRemove);
      expect((actions[3] as Remove).node).to.equal(doi);
      expect(actions[4]).to.satisfies(isRemove);
      expect((actions[4] as Remove).node).to.equal(ln);
    });
  });
});
