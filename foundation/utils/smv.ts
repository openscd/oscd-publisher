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
