/* eslint-disable import/no-extraneous-dependencies */
import { Insert, Remove } from '@openscd/open-scd-core';

type pTypes = {
  'MAC-Address'?: string | null;
  APPID?: string | null;
  'VLAN-ID'?: string | null;
  'VLAN-PRIORITY'?: string | null;
};

type smvAttributes = {
  pTypes: pTypes;
  instType?: boolean;
};

const sMVselectors: Record<string, string> = {
  'MAC-Address': ':scope > Address > P[type="MAC-Address"]',
  APPID: ':scope > Address > P[type="APPID"]',
  'VLAN-ID': ':scope > Address > P[type="VLAN-ID"]',
  'VLAN-PRIORITY': ':scope > Address > P[type="VLAN-PRIORITY"]',
};

/** @returns a new [[`tag`]] element owned by [[`doc`]]. */
function createElement(
  doc: Document,
  tag: string,
  attrs: Record<string, string | null>
): Element {
  const element = doc.createElementNS(doc.documentElement.namespaceURI, tag);
  Object.entries(attrs)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(([_, value]) => value !== null)
    .forEach(([name, value]) => element.setAttribute(name, value!));
  return element;
}

/** @returns Whether the `sMV`s element attributes or instType has changed */
export function checkSMVDiff(
  sMV: Element,
  attributes: smvAttributes = { pTypes: {} }
): boolean {
  const pTypeDiff = Object.entries(attributes.pTypes).some(
    ([key, value]) =>
      (sMV.querySelector(sMVselectors[key])?.textContent ?? null) !== value
  );
  if (pTypeDiff) return true;

  if (attributes.instType === undefined) return false;

  const instTypeDiff = Object.keys(attributes.pTypes).some(key => {
    const pType = sMV.querySelector(sMVselectors[key]);
    if (!pType) return false;

    const hasInstType = pType.hasAttribute('xsi:type');
    return hasInstType !== attributes.instType;
  });

  return instTypeDiff;
}

/** Update function for SMV element's Address field
 * @sMV the `SMV` element to update the address element of
 * @attributes pType values `MAC-Address`,`APPID`,`VLAN-ID` or `VLAN-PRIORITY`
 *           instType whether to add xsi:type attributes for better XML parsing
 * @return action array to update a `SMV`s `Address` child element
 */
export function updateSmvAddress(
  sMV: Element,
  attributes: smvAttributes = { pTypes: {}, instType: false }
): (Insert | Remove)[] {
  const actions: (Insert | Remove)[] = [];

  const newAddress = createElement(sMV.ownerDocument, 'Address', {});

  Object.entries(attributes.pTypes)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(([_, value]) => value !== null)
    .forEach(([type, value]) => {
      const child = createElement(sMV.ownerDocument, 'P', { type });
      if (attributes.instType)
        child.setAttributeNS(
          'http://www.w3.org/2001/XMLSchema-instance',
          'xsi:type',
          `tP_${type}`
        );
      child.textContent = value;
      newAddress.appendChild(child);
    });

  actions.push({
    parent: sMV,
    node: newAddress,
  });

  const oldAddress = sMV.querySelector('Address');
  if (oldAddress) actions.push({ node: oldAddress });

  return actions;
}
