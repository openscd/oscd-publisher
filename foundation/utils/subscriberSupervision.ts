/* eslint-disable import/no-extraneous-dependencies */
import { Remove } from '@openscd/open-scd-core';

import { controlBlock, controlBlockObjectReference } from './controlBlocks.js';

function subscriberSupervision(
  ctrlBlock: Element,
  subscriberIed: Element
): { ln: Element; doi: Element } | null {
  const supervisionType = ctrlBlock.tagName === 'GSEControl' ? 'LGOS' : 'LSVS';

  const valElement = Array.from(
    subscriberIed.querySelectorAll(
      `LN0[lnClass="${supervisionType}"] > DOI > DAI > Val,
       LN[lnClass="${supervisionType}"] > DOI > DAI > Val`
    )
  ).find(val => val.textContent === controlBlockObjectReference(ctrlBlock));
  if (!valElement) return null;

  const ln = valElement.closest('LN0, LN')!;
  const doi = valElement.closest('DOI')!;

  return { ln, doi };
}

/** @returns Whether `setSrcRef` can edited by SCL editor */
function isSrcRefEditable(ctrlBlock: Element, subscriberIed: Element): boolean {
  const supervision = subscriberSupervision(ctrlBlock, subscriberIed)!;
  if (!supervision) return false;

  const rootNode = supervision.ln.ownerDocument;
  const lnClass = supervision.ln.getAttribute('lnClass');
  const goOrSvCBRef = rootNode.querySelector(
    `DataTypeTemplates > 
      LNodeType[id="${supervision.ln.getAttribute(
        'lnType'
      )}"][lnClass="${lnClass}"] > DO[name="${
      lnClass === 'LGOS' ? 'GoCBRef' : 'SvCBRef'
    }"]`
  );

  const setSrcRef = rootNode.querySelector(
    `DataTypeTemplates > DOType[id="${goOrSvCBRef?.getAttribute(
      'type'
    )}"] > DA[name="setSrcRef"]`
  );

  return (
    (setSrcRef?.getAttribute('valKind') === 'Conf' ||
      setSrcRef?.getAttribute('valKind') === 'RO') &&
    setSrcRef.getAttribute('valImport') === 'true'
  );
}

/** Whether there is another subscribed ExtRef of the same ctrlBlock */
function otherCtrlBlockSubscriberData(extRefs: Element[]): boolean {
  const [
    srcCBName,
    srcLDInst,
    srcLNClass,
    iedName,
    srcPrefix,
    srcLNInst,
    serviceType,
  ] = [
    'srcCBName',
    'srcLDInst',
    'srcLNClass',
    'iedName',
    'srcPrefix',
    'srcLNInst',
    'serviceType',
  ].map(attr => extRefs[0].getAttribute(attr));

  const parentIed = extRefs[0].closest('IED');
  return Array.from(parentIed!.getElementsByTagName('ExtRef')).some(
    otherExtRef =>
      !extRefs.includes(otherExtRef) &&
      (otherExtRef.getAttribute('srcPrefix') ?? '') === (srcPrefix ?? '') &&
      (otherExtRef.getAttribute('srcLNInst') ?? '') === (srcLNInst ?? '') &&
      otherExtRef.getAttribute('srcCBName') === srcCBName &&
      otherExtRef.getAttribute('srcLDInst') === srcLDInst &&
      otherExtRef.getAttribute('srcLNClass') === srcLNClass &&
      otherExtRef.getAttribute('iedName') === iedName &&
      otherExtRef.getAttribute('serviceType') === serviceType
  );
}

/**
 * @param extRefs - a set of external references
 * @returns node's representing subscription supervision
 */
export function removeSubscriptionSupervision(extRefs: Element[]): Remove[] {
  if (extRefs.length === 0) return [];

  const isEd1 = !extRefs[0].ownerDocument
    .querySelector('SCL')
    ?.hasAttribute('version');
  if (isEd1) return [];

  const groupedExtRefs: Record<
    string,
    { extRefs: Element[]; ctrlBlock: Element; subscriberIed: Element }
  > = {};
  extRefs.forEach(extRef => {
    const ctrlBlock = controlBlock(extRef);
    if (ctrlBlock) {
      const ctrlBlockRef = controlBlockObjectReference(ctrlBlock)!;
      if (groupedExtRefs[ctrlBlockRef])
        groupedExtRefs[ctrlBlockRef].extRefs.push(extRef);
      else
        groupedExtRefs[ctrlBlockRef] = {
          extRefs: [extRef],
          ctrlBlock,
          subscriberIed: extRef.closest('IED')!,
        };
    }
  });

  return (
    Object.values(groupedExtRefs)
      .map(extRefGroup => {
        if (
          otherCtrlBlockSubscriberData(extRefGroup.extRefs) ||
          !isSrcRefEditable(extRefGroup.ctrlBlock, extRefGroup.subscriberIed)
        )
          return null;

        const { ln, doi } = subscriberSupervision(
          extRefGroup.ctrlBlock,
          extRefGroup.subscriberIed
        )!;

        // do not remove logical nodes LGOS, LSVS unless privately tagged
        const canRemoveLn = ln.querySelector(
          ':scope > Private[type="OpenSCD.create"]'
        );

        return canRemoveLn ? ln : doi;
      })
      .filter(element => element) as Element[]
  ).map(node => ({ node }));
}
