/* eslint-disable import/no-extraneous-dependencies */
import { expect } from '@open-wc/testing';

import { Remove, Update } from '@openscd/open-scd-core';

import { removeDataSet, updateDateSetName } from './dataSet.js';
import {
  orphanDataSet,
  validDataSet,
  withSubscriptionSupervision,
} from './dataSet.testfiles.js';

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
        expect(update.attributes).to.deep.equal({ datSet: 'someNewName' });
      }
    });
  });

  describe('removeDataSet', () => {
    const dataSet = findElement(withSubscriptionSupervision, 'DataSet');
    const actions = removeDataSet(dataSet);
    const fCDAs = Array.from(dataSet.querySelectorAll(':scope > FCDA'));
    const extRefs = Array.from(
      dataSet.ownerDocument.querySelectorAll(
        'ExtRef[srcCBName="someGse"], ExtRef[srcCBName="someGse2"], ExtRef[srcCBName="someGse3"]'
      )
    );
    const doi = extRefs[0].ownerDocument.querySelector(
      'LN[lnClass="LGOS"][inst="1"] > DOI'
    );
    const ln = extRefs[0].ownerDocument.querySelector(
      'LN[lnClass="LGOS"][inst="2"]'
    );

    it('removes DataSet also removes/updates dependant data', () =>
      expect(actions.length).to.equal(14));

    it('including the DataSet itself', () =>
      expect((actions[0] as Remove).node).to.equal(dataSet));

    it('including control Block updates', () => {
      expect((actions[1] as Update).attributes).to.deep.equal({ datSet: null });
      expect((actions[2] as Update).attributes).to.deep.equal({ datSet: null });
      expect((actions[3] as Update).attributes).to.deep.equal({ datSet: null });
    });

    it('including external references', () => {
      expect((actions[1] as Update).attributes).to.deep.equal({ datSet: null });
      expect((actions[2] as Update).attributes).to.deep.equal({ datSet: null });
      expect((actions[3] as Update).attributes).to.deep.equal({ datSet: null });
    });

    it('including the data itself', () => {
      expect((actions[4] as Remove).node).to.equal(fCDAs[0]);
      expect((actions[5] as Remove).node).to.equal(fCDAs[1]);
      expect((actions[6] as Remove).node).to.equal(fCDAs[2]);
      expect((actions[7] as Remove).node).to.equal(fCDAs[3]);
    });

    it('including the external references itself', () => {
      expect((actions[8] as Remove).node).to.equal(extRefs[0]);
      expect((actions[9] as Remove).node).to.equal(extRefs[1]);
      expect((actions[10] as Update).element).to.equal(extRefs[2]);
      expect((actions[11] as Remove).node).to.equal(extRefs[3]);
    });

    it('including the subscriber supervision', () => {
      expect((actions[12] as Remove).node).to.equal(doi);
      expect((actions[13] as Remove).node).to.equal(ln);
    });
  });
});
