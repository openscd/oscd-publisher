const gSEselectors: Record<string, string> = {
  MinTime: ':scope > MinTime',
  MaxTime: ':scope > MaxTime',
  'MAC-Address': ':scope > Address > P[type="MAC-Address"]',
  APPID: ':scope > Address > P[type="APPID"]',
  'VLAN-ID': ':scope > Address > P[type="VLAN-ID"]',
  'VLAN-PRIORITY': ':scope > Address > P[type="VLAN-PRIORITY"]',
};

/** @returns a `GSE` element referenced to `GSEControl` element or `null` */
export function referencedGSE(gseControl: Element): Element | null {
  const iedName = gseControl.closest('IED')?.getAttribute('name');
  const apName = gseControl.closest('AccessPoint')?.getAttribute('name');
  const ldInst = gseControl.closest('LDevice')?.getAttribute('inst');
  const cbName = gseControl.getAttribute('name');

  return gseControl.ownerDocument.querySelector(
    `Communication 
      > SubNetwork
      > ConnectedAP[iedName="${iedName}"][apName="${apName}"] 
      > GSE[ldInst="${ldInst}"][cbName="${cbName}"]`
  );
}

function pElementContent(gse: Element, type: string): string | null {
  return (
    Array.from(gse.querySelectorAll(':scope > Address > P'))
      .find(p => p.getAttribute('type') === type)
      ?.textContent?.trim() ?? null
  );
}

/** @returns Whether the `gSE`s element attributes or instType has changed */
export function checkGSEDiff(
  gSE: Element,
  attrs: Record<string, string | null>,
  instType?: boolean
): boolean {
  return Object.entries(attrs).some(([key, value]) => {
    if (key === 'MinTime' || key === 'MaxTime') {
      const oldValue =
        gSE.querySelector(`:scope > ${key}`)?.textContent?.trim() ?? null;
      return oldValue !== value;
    }

    const oldValue = pElementContent(gSE, key);
    if (instType === undefined) return oldValue !== value;

    const oldInstType = gSE
      .querySelector(gSEselectors[key])
      ?.hasAttribute('xsi:type');
    if (oldInstType === undefined) return oldValue !== value;

    return oldValue !== value || instType !== oldInstType;
  });
}
