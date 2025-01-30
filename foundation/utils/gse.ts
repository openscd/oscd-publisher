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

function pElement(smv: Element, type: string): Element | null {
  return (
    Array.from(smv.querySelectorAll(':scope > Address > P')).find(
      p => p.getAttribute('type') === type
    ) ?? null
  );
}

/** @returns Whether the `gSE`s element attributes or instType has changed */
export function checkGSEDiff(
  gSE: Element,
  attrs: Record<string, string | null>,
  instType?: boolean
): boolean {
  const valueDiff = Object.entries(attrs).some(([key, value]) => {
    if (key === 'MinTime' || key === 'MaxTime') {
      const oldValue =
        gSE.querySelector(`:scope > ${key}`)?.textContent?.trim() ?? null;
      return oldValue !== value;
    }

    const oldValue = pElementContent(gSE, key);
    return oldValue !== value;
  });

  if (valueDiff) return valueDiff;

  const instTypeDiff = Object.keys(attrs).some(key => {
    const pType = pElement(gSE, key);
    if (!pType) return false;

    const hasInstType = pType.hasAttribute('xsi:type');
    return hasInstType !== !!instType;
  });

  return instTypeDiff;
}
