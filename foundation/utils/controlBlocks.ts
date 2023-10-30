/* eslint-disable import/no-extraneous-dependencies */
import { matchExtRefCtrlBlockAttr } from './extRef.js';

/** @returns Updated confRev attribute for control block */
export function updatedConfRev(ctrlBlock: Element): string {
  return `${parseInt(ctrlBlock.getAttribute('confRev') ?? '0', 10) + 10000}`;
}

/** @returns all ExtRef element subscribed to a controlBlock */
export function findCtrlBlockSubscription(ctrlBlock: Element): Element[] {
  const doc = ctrlBlock.ownerDocument;
  const iedName = ctrlBlock.closest('IED')!.getAttribute('name');

  return Array.from(
    doc.querySelectorAll(`ExtRef[iedName="${iedName}"]`)
  ).filter(extRef => matchExtRefCtrlBlockAttr(extRef, ctrlBlock));
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
