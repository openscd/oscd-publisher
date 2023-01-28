/** @returns ConnectedAP element for any given element within an AccessPoint */
export function connectedAp(parent: Element): Element | null {
  const apName = parent.closest('AccessPoint')?.getAttribute('name');
  const iedName = parent.closest('IED')?.getAttribute('name');

  return parent.ownerDocument.querySelector(
    `ConnectedAP[iedName="${iedName}"][apName="${apName}"]`
  );
}
