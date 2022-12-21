/* eslint-disable import/no-extraneous-dependencies */
import { Remove, Update } from '@openscd/open-scd-core';

import { removeDataSet } from './dataSet.js';
import { matchExtRefCtrlBlockAttr, unsubscribe } from './extRef.js';

function findCtrlBlockSubscription(ctrlBlock: Element): Element[] {
  const doc = ctrlBlock.ownerDocument;
  const iedName = ctrlBlock.closest('IED')!.getAttribute('name');

  return Array.from(
    doc.querySelectorAll(`ExtRef[iedName="${iedName}"]`)
  ).filter(extRef => matchExtRefCtrlBlockAttr(extRef, ctrlBlock));
}

/** @returns object reference acc. IEC 61850-7-3 for control block elements */
export function controlBlockObjectReference(ctrlBlock: Element): string | null {
  const iedName = ctrlBlock.closest('IED')?.getAttribute('name');
  const ldInst = ctrlBlock.closest('LDevice')?.getAttribute('inst');

  const parentLn = ctrlBlock.closest('LN,LN0');

  const prefix = parentLn?.getAttribute('prefix') ?? '';
  const lnClass = parentLn?.getAttribute('lnClass');
  const lnInst = parentLn?.getAttribute('inst') ?? '';

  const cbName = ctrlBlock.getAttribute('name');
  if (!iedName || !ldInst || !lnClass || !cbName) return null;

  return `${iedName}${ldInst}/${prefix}${lnClass}${lnInst}.${cbName}`;
}

/** @returns control block or null for a given external reference */
export function controlBlock(extRef: Element): Element | null {
  const [iedName, srcLDInst, srcPrefix, srcLNClass, srcLNInst, srcCBName] = [
    'iedName',
    'srcLDInst',
    'srcPrefix',
    'srcLNClass',
    'srcLNInst',
    'srcCBName',
  ].map(attr => extRef.getAttribute(attr) ?? '');

  return (
    Array.from(
      extRef.ownerDocument.querySelectorAll(
        `IED[name="${iedName}"] ReportControl, 
        IED[name="${iedName}"] GSEControl, 
        IED[name="${iedName}"] SampledValueControl`
      )
    ).find(
      cBlock =>
        cBlock.closest('LDevice')!.getAttribute('inst') === srcLDInst &&
        (cBlock.closest('LN, LN0')!.getAttribute('prefix') ?? '') ===
          srcPrefix &&
        cBlock.closest('LN, LN0')!.getAttribute('lnClass') === srcLNClass &&
        cBlock.closest('LN, LN0')!.getAttribute('inst') === srcLNInst &&
        cBlock.getAttribute('name') === srcCBName
    ) ?? null
  );
}

/** @returns control blocks for a given data attribute or data set */
export function controlBlocks(fcdaOrDataSet: Element): Element[] {
  const datSet = fcdaOrDataSet.closest('DataSet')?.getAttribute('name');
  const parentLn = fcdaOrDataSet.closest('LN0, LN');

  return Array.from(
    parentLn?.querySelectorAll(
      `:scope > ReportControl[datSet="${datSet}"],
             :scope > GSEControl[datSet="${datSet}"],
             :scope > SampledValueControl[datSet="${datSet}"]`
    ) ?? []
  );
}

/** @returns Action array removing control block and its referenced data */
export function removeControlBlock(ctrlBlock: Element): (Remove | Update)[] {
  const ctrlBlockRemoveAction: (Remove | Update)[] = [{ node: ctrlBlock }];

  const dataSet = ctrlBlock.parentElement?.querySelector(
    `DataSet[name="${ctrlBlock.getAttribute('datSet')}"]`
  );
  if (!dataSet) return ctrlBlockRemoveAction;

  const multiUseDataSet = controlBlocks(dataSet).length > 1;
  if (multiUseDataSet)
    return ctrlBlockRemoveAction.concat(
      unsubscribe(findCtrlBlockSubscription(ctrlBlock))
    );

  return ctrlBlockRemoveAction.concat(removeDataSet(dataSet));
}
