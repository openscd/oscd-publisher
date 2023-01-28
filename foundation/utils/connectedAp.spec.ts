// eslint-disable-next-line import/no-extraneous-dependencies
import { expect } from '@open-wc/testing';
import { connectedAp } from './connectedAp.js';

const doc = new DOMParser().parseFromString(
  `<SCL>
    <Communication>
        <SubNetwork>
            <ConnectedAP iedName="someIED" apName="someAP">

            </ConnectedAP>
        </SubNetwork>
    </Communication>
    <IED name="someIED">
        <AccessPoint name="someAP">
            <Server>
                <LDevice inst="someLDInst">
                    <LN0 lnClass="LLN0" inst="">
                        <GSEControl name="somGse"/>
                    </LN0>
                </LDevice>
            </Server>
        </AccessPoint>
    </IED>
    <IED name="someOtherIED">
        <AccessPoint name="someOtherAP">
            <Server>
                <LDevice inst="someLDInst">
                    <LN0 lnClass="LLN0" inst="">
                        <GSEControl name="somGse"/>
                    </LN0>
                </LDevice>
            </Server>
        </AccessPoint>
    </IED>
</SCL>`,
  'application/xml'
);

const invalidParent = new DOMParser()
  .parseFromString(
    `<SCL>
      <Communication>
          <SubNetwork>
              <ConnectedAP name="someIED" apName="someAP">
  
              </ConnectedAP>
          </SubNetwork>
      </Communication>
      <GSEControl name="asd"/>
    </SCL>`,
    'application/xml'
  )
  .querySelector('GSEControl')!;

describe('ConnectedAP related util functions', () => {
  describe('connectedAp', () => {
    it('returns null for missing ConnectedAP', () =>
      expect(
        connectedAp(doc.querySelector('IED[name="someOtherIED"] LN0')!)
      ).to.equal(null));

    it('returns null for invalid parent', () =>
      expect(connectedAp(invalidParent)).to.equal(null));

    it('returns ConnectedAP with valid parent', () => {
      const parent = doc.querySelector('LN0')!;
      const connAp = doc.querySelector('ConnectedAP');
      expect(connectedAp(parent)).to.equal(connAp);
    });
  });
});
