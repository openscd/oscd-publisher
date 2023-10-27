/* eslint-disable import/no-extraneous-dependencies */
import { expect } from '@open-wc/testing';

import { addDataSet, updateDateSetName } from './dataSet.js';
import { orphanDataSet, validDataSet } from './dataSet.testfiles.js';

function findElement(str: string, selector: string): Element {
  return new DOMParser()
    .parseFromString(str, 'application/xml')
    .querySelector(selector)!;
}

describe('DataSet related util functions', () => {
  describe('independent of the attr input', () =>
    it('returns empty array for orphans DataSet', () =>
      expect(
        updateDateSetName(findElement(orphanDataSet, 'DataSet'), {
          name: 'somNewName',
        })
      ).to.deep.equal([])));

  describe('for DataSet desc field change only', () => {
    it('returns only Update action for DataSet', () =>
      expect(
        updateDateSetName(findElement(validDataSet, 'DataSet'), {
          desc: 'someDesc',
        }).length
      ).to.equal(1));

    it('return first update the DataSet desc attribute', () => {
      const update = updateDateSetName(findElement(validDataSet, 'DataSet'), {
        desc: 'someDesc',
      })[0];
      expect(update.element.tagName).to.equal('DataSet');
      expect(update.attributes).to.deep.equal({ desc: 'someDesc' });
    });
  });

  describe('for both name and desc attribute changes', () => {
    it('returns update actions for DataSet name and all referenced control block', () =>
      expect(
        updateDateSetName(findElement(validDataSet, 'DataSet'), {
          name: 'somNewName',
          desc: 'someDesc',
        }).length
      ).to.equal(4));

    it('return first update the DataSet name attribute', () => {
      const update = updateDateSetName(findElement(validDataSet, 'DataSet'), {
        name: 'someNewName',
        desc: 'someDesc',
      })[0];
      expect(update.element.tagName).to.equal('DataSet');
      expect(update.attributes).to.deep.equal({
        name: 'someNewName',
        desc: 'someDesc',
      });
    });

    it('return other update a control block datSet attribute', () => {
      const updates = updateDateSetName(findElement(validDataSet, 'DataSet'), {
        name: 'someNewName',
      });
      updates.shift();

      for (const update of updates) {
        expect(update.element.tagName).to.be.oneOf([
          'ReportControl',
          'GSEControl',
          'SampledValueControl',
        ]);
        expect(update.attributes).to.deep.equal({
          datSet: 'someNewName',
          confRev: '10000',
        });
      }
    });
  });

  describe('addDataSet', () => {
    const simplescl = `
    <IED>
      <AccessPoint name="AP1">
        <LDevice inst="first">
          <LN0 lnClass="LLN0" inst="1">
            <DataSet name="newDataSet_001"/>
          </LN0>
          <LN lnClass="MMXU" inst="1">
            <DataSet name="newDataSet_001"/>
            <DataSet name="newDataSet_003"/>
            <DataSet name="newDataSet_004"/>
          </LN>
        <LN lnClass="MMXU" inst="2" />
        </LDevice>
      </AccessPoint>
    </IED>`;

    const invalidIed = `
    <AccessPoint name="AP1">
      <LDevice inst="first">
        <LN0 lnClass="LLN0" inst="1">
          <DataSet name="newDataSet_001"/>
        </LN0>
        <LN lnClass="MMXU" inst="1">
          <DataSet name="newDataSet_001"/>
          <DataSet name="newDataSet_002"/>
          <DataSet name="newDataSet_004"/>
        </LN>
      </LDevice>
      <LDevice inst="second">
      </LDevice>
    </AccessPoint>`;

    const ied = new DOMParser()
      .parseFromString(simplescl, 'application/xml')
      .querySelector('IED')!;

    const ln = new DOMParser()
      .parseFromString(simplescl, 'application/xml')
      .querySelector('LN')!;

    const ln1 = new DOMParser()
      .parseFromString(simplescl, 'application/xml')
      .querySelector('LN[inst="2"]')!;

    const ln0 = new DOMParser()
      .parseFromString(simplescl, 'application/xml')
      .querySelector('LN0')!;

    const invalidParent = new DOMParser()
      .parseFromString(invalidIed, 'application/xml')
      .querySelector('LDevice[inst="second"]')!;

    it('add new DataSet to first LN0', () => {
      const insert = addDataSet(ied);
      // eslint-disable-next-line no-unused-expressions
      expect(insert).to.exist;
      expect(insert?.node).to.have.attribute('name', 'newDataSet_002');
    });

    it('add new DataSet to LN0', () => {
      const insert = addDataSet(ln0);
      // eslint-disable-next-line no-unused-expressions
      expect(insert).to.exist;
      expect(insert?.node).to.have.attribute('name', 'newDataSet_002');
    });

    it('add new DataSet to first LN', () => {
      const insert = addDataSet(ln);
      // eslint-disable-next-line no-unused-expressions
      expect(insert).to.exist;
      expect(insert?.node).to.have.attribute('name', 'newDataSet_002');
    });

    it('add new DataSet to first empty LN', () => {
      const insert = addDataSet(ln1);
      // eslint-disable-next-line no-unused-expressions
      expect(insert).to.exist;
      expect(insert?.node).to.have.attribute('name', 'newDataSet_001');
    });

    it('returns null with invalid parent', () => {
      const insert = addDataSet(invalidParent);
      // eslint-disable-next-line no-unused-expressions
      expect(insert).to.not.exist;
    });

    it('allows to set DataSet attributes directly', () => {
      const insert = addDataSet(ln, {
        name: 'newDataSet_001',
        desc: 'someDesc',
      });
      // eslint-disable-next-line no-unused-expressions
      expect(insert).to.exist;
      expect(insert?.node).to.have.attribute('name', 'newDataSet_001');
      expect(insert?.node).to.have.attribute('desc', 'someDesc');
    });
  });
});
