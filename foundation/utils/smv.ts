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

function pElementContent(smv: Element, type: string): string | null {
  return (
    Array.from(smv.querySelectorAll(':scope > Address > P'))
      .find(p => p.getAttribute('type') === type)
      ?.textContent?.trim() ?? null
  );
}

function pElement(smv: Element, type: string): Element | null {
  return (
    Array.from(smv.querySelectorAll(':scope > Address > P')).find(
      p => p.getAttribute('type') === type
    ) ?? null
  );
}

/** @returns Whether the `sMV`s element attributes or instType has changed */
export function checkSMVDiff(
  sMV: Element,
  attributes: smvAttributes = { pTypes: {} }
): boolean {
  const pTypeDiff = Object.entries(attributes.pTypes).some(
    ([key, value]) => pElementContent(sMV, key) !== value
  );
  if (pTypeDiff) return true;

  if (attributes.instType === undefined) return false;

  const instTypeDiff = Object.keys(attributes.pTypes).some(key => {
    const pType = pElement(sMV, key);
    if (!pType) return false;

    const hasInstType = pType.hasAttribute('xsi:type');
    return hasInstType !== attributes.instType;
  });

  return instTypeDiff;
}
