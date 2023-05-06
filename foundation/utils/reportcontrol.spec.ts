/* eslint-disable no-unused-expressions */
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
  completeReport,
  defaultIntgPdReport,
  defaultPeriodReport,
  defaultReport,
  existingRptControl,
  missingRptControl,
  subscribedReport,
} from './reportcontrol.testfiles';
import {
  addReportControl,
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

  describe('add ReportControl element', () => {
    const ied = new DOMParser()
      .parseFromString(subscribedReport, 'application/xml')
      .querySelector('IED')!;

    const ln = new DOMParser()
      .parseFromString(subscribedReport, 'application/xml')
      .querySelector('LN')!;

    const ln0 = new DOMParser()
      .parseFromString(subscribedReport, 'application/xml')
      .querySelector('LN0')!;

    const ln02 = new DOMParser()
      .parseFromString(subscribedReport, 'application/xml')
      .querySelector('IED[name="srcIED"] LN0')!;

    const lDevice = new DOMParser()
      .parseFromString(subscribedReport, 'application/xml')
      .querySelector('IED[name="srcIED"] LDevice')!;

    const invalidParent = new DOMParser()
      .parseFromString(subscribedReport, 'application/xml')
      .querySelector('LDevice[inst="second"]')!;

    it('with parent IED adds ReportControl to first LDevices LLN0 ', () => {
      const insert = addReportControl(ied);

      expect(insert).to.exist;
      expect((insert![0].parent as Element).tagName).to.equal('LN0');
    });

    it('with parent LDevice adds ReportControl to its LN0', () => {
      const insert = addReportControl(lDevice);

      expect(insert).to.exist;
      expect((insert![0].parent as Element).tagName).to.equal('LN0');
    });

    it('with parent LN0 adds ReportControl to this LN0', () => {
      const insert = addReportControl(ln0);

      expect(insert).to.exist;
      expect(insert![0].parent as Element).to.equal(ln0);
    });

    it('with parent LN adds ReportControl to this LN', () => {
      const insert = addReportControl(ln);

      expect(insert).to.exist;
      expect(insert![0].parent as Element).to.equal(ln);
    });

    it('returns null with missing LN0 or LN', () => {
      const insert = addReportControl(invalidParent);

      expect(insert).to.not.exist;
    });

    it('adds required attributes when missing', () => {
      const insert = addReportControl(ln02);
      const expectedReport = findElement(defaultReport, 'ReportControl')!;

      expect(insert).to.exist;
      expect(insert?.length).to.equal(1);
      expect(insert![0].node.isEqualNode(expectedReport)).to.be.true;
    });

    it('adds all handed attributes', () => {
      const insert = addReportControl(ln02, {
        rpt: {
          name: 'someName',
          desc: 'someDesc',
          buffered: 'true',
          rptID: 'someRptID',
          indexed: 'true',
          bufTime: '200',
          intgPd: '40',
        },
        trgOps: {
          dchg: 'true',
          qchg: 'true',
          dupd: 'true',
          period: 'true',
          gi: 'true',
        },
        optFields: {
          seqNum: 'true',
          timeStamp: 'true',
          reasonCode: 'true',
          dataRef: 'true',
          entryID: 'true',
          configRef: 'true',
          bufOvfl: 'true',
        },
        confRev: '45',
        maxClients: '8',
      });
      const expectedReport = findElement(completeReport, 'ReportControl')!;

      expect(insert).to.exist;
      expect(insert?.length).to.equal(1);
      expect(insert![0].node.isEqualNode(expectedReport)).to.be.true;
    });

    it('defaults missing intgPd with TrgOps period active', () => {
      const insert = addReportControl(ln02, {
        rpt: {
          name: 'someName',
          desc: 'someDesc',
          buffered: 'true',
          rptID: 'someRptID',
          indexed: 'true',
          bufTime: '200',
        },
        trgOps: {
          period: 'true',
        },
        optFields: {},
      });
      const expectedReport = findElement(defaultIntgPdReport, 'ReportControl')!;

      expect(insert).to.exist;
      expect(insert?.length).to.equal(1);
      expect(insert![0].node.isEqualNode(expectedReport)).to.be.true;
    });

    it('defaults missing period with existing intgPd ', () => {
      const insert = addReportControl(ln02, {
        rpt: {
          name: 'someName',
          desc: 'someDesc',
          buffered: 'true',
          rptID: 'someRptID',
          indexed: 'true',
          bufTime: '200',
          intgPd: '342',
        },
        trgOps: { period: 'false' },
        optFields: {},
      });
      const expectedReport = findElement(defaultPeriodReport, 'ReportControl')!;

      expect(insert).to.exist;
      expect(insert?.length).to.equal(1);
      expect(insert![0].node.isEqualNode(expectedReport)).to.be.true;
    });
  });
});
