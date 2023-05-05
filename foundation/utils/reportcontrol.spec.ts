/* eslint-disable import/no-extraneous-dependencies */
import { expect } from '@open-wc/testing';

import {
  Insert,
  Update,
  isInsert,
  isRemove,
  isUpdate,
} from '@openscd/open-scd-core';

import {
  existingRptControl,
  missingRptControl,
  subscribedReport,
} from './reportcontrol.testfiles';
import {
  updateMaxClients,
  updateOptFields,
  updateReportControl,
  updateTrgOps,
} from './reportcontrol.js';

function findElement(str: string, selector: string): Element | null {
  return new DOMParser()
    .parseFromString(str, 'application/xml')
    .querySelector(selector);
}

describe('ReportControl related functions', () => {
  describe('update max attribute on RptEnable', () => {
    it('add missing RptEnabled', () => {
      const reportControl = findElement(missingRptControl, 'ReportControl')!;
      const action = updateMaxClients(reportControl, '4');
      expect(action).to.satisfies(isInsert);
      // eslint-disable-next-line no-unused-expressions
      expect((action as Insert).reference).to.be.null;
      expect(((action as Insert).node as Element).getAttribute('max')).to.equal(
        '4'
      );
    });

    it('do not change missing RptEnabled', () => {
      const reportControl = findElement(missingRptControl, 'ReportControl')!;
      const action = updateMaxClients(reportControl, null);
      // eslint-disable-next-line no-unused-expressions
      expect(action).to.be.null;
    });

    it('removes existing RptEnabled', () => {
      const reportControl = findElement(existingRptControl, 'ReportControl')!;
      const action = updateMaxClients(reportControl, null);
      // eslint-disable-next-line no-unused-expressions
      expect(action).to.satisfies(isRemove);
    });

    it('updated existing RptEnabled', () => {
      const reportControl = findElement(existingRptControl, 'ReportControl')!;
      const action = updateMaxClients(reportControl, '34');
      // eslint-disable-next-line no-unused-expressions
      expect(action).to.satisfies(isUpdate);
      expect((action as Update).attributes).to.deep.equal({ max: '34' });
    });
  });

  describe('update trigger options element', () => {
    const trgOps = findElement(missingRptControl, 'TrgOps')!;
    it('updates attributes', () => {
      const attrs = {
        dchg: 'false',
        qchg: 'false',
        priod: 'false',
        gi: 'true',
      };
      const action = updateTrgOps(trgOps, attrs);
      expect(action).to.satisfies(isUpdate);
      expect((action as Update).attributes).to.deep.equal(attrs);
    });
  });

  describe('update optional fields element', () => {
    const optFields = findElement(missingRptControl, 'OptFields')!;
    it('updates attributes', () => {
      const attrs = {
        seqNum: 'true',
        timeStamp: 'false',
        reasonCode: 'true',
        dataRef: 'false',
        configRef: 'true',
        bufOvfl: 'false',
      };
      const action = updateOptFields(optFields, attrs);
      expect(action).to.satisfies(isUpdate);
      expect((action as Update).attributes).to.deep.equal(attrs);
    });
  });

  describe('update ReportControl element', () => {
    const attrs = {
      desc: 'someDesc',
      buffered: 'true',
      rptID: 'someRptID',
      indexed: 'true',
      bufTime: '100',
      intPd: '40',
    };

    describe('when no name attribute is changed', () => {
      it('updates only the ReportControl', () => {
        const reportControl = findElement(subscribedReport, 'ReportControl')!;
        const actions = updateReportControl(reportControl, attrs);

        expect(actions.length).to.equal(1);
        expect(actions[0]).to.satisfy(isUpdate);
        expect((actions[0] as Update).element).to.equal(reportControl);
        expect((actions[0] as Update).attributes).to.deep.equal({
          ...attrs,
          confRev: '20001',
        });
      });
    });

    describe('when name attribute is changed', () => {
      it('also updates subscribed ExtRefs', () => {
        const reportControl = findElement(subscribedReport, 'ReportControl')!;
        const actions = updateReportControl(reportControl, {
          name: 'someNewName',
          ...attrs,
        });

        expect(actions.length).to.equal(3);
        expect(actions[0]).to.satisfy(isUpdate);
        expect((actions[0] as Update).element).to.equal(reportControl);
        expect((actions[0] as Update).attributes).to.deep.equal({
          name: 'someNewName',
          ...attrs,
          confRev: '20001',
        });

        expect(actions[1]).to.satisfy(isUpdate);
        expect((actions[1] as Update).element.tagName).to.equal('ExtRef');
        expect((actions[1] as Update).attributes).to.deep.equal({
          srcCBName: 'someNewName',
        });

        expect(actions[2]).to.satisfy(isUpdate);
        expect((actions[2] as Update).element.tagName).to.equal('ExtRef');
        expect((actions[2] as Update).attributes).to.deep.equal({
          srcCBName: 'someNewName',
        });
      });
    });
  });
});
