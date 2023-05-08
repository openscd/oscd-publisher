/* eslint-disable import/no-extraneous-dependencies */
import { expect } from '@open-wc/testing';

import { Update, isUpdate } from '@openscd/open-scd-core';

import { updateSmvOpts } from './sampledvaluecontrol.js';

const sampledValueControl = `
<SampledValueControl name="someName">
    <SmvOpts refreshTime="false" sampleSynchronized="false" sampleRate="false" dataSet="false" security="false" timestamp="false" synchSourceId="false" />
</SampledValueControl>`;

function findElement(str: string, selector: string): Element | null {
  return new DOMParser()
    .parseFromString(str, 'application/xml')
    .querySelector(selector);
}

describe('ReportControl related functions', () => {
  describe('update optional fields element', () => {
    const optFields = findElement(sampledValueControl, 'SmvOpts')!;
    it('updates attributes', () => {
      const attrs = {
        refreshTime: 'true',
        sampleSynchronized: 'true',
        sampleRate: 'true',
        dataSet: 'true',
        security: 'true',
        timestamp: 'true',
        synchSourceId: 'true',
      };
      const action = updateSmvOpts(optFields, attrs);
      expect(action).to.satisfies(isUpdate);
      expect((action as Update).attributes).to.deep.equal(attrs);
    });
  });
});
