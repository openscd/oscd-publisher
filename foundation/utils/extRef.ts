/* eslint-disable import/no-extraneous-dependencies */
import { isRemove } from '@openscd/open-scd-core';
import { removeSubscriptionSupervision } from './subscriberSupervision.js';

type Remove = { node: Node };
type Update = { element: Element; attributes: Record<string, string | null> };

const serviceType: Partial<Record<string, string>> = {
  GSEControl: 'GOOSE',
  SampledValueControl: 'SMV',
  ReportControl: 'Report',
};

function duplicates(arr: Element[], val: Element): number {
  let count = 0;
  // eslint-disable-next-line no-plusplus
  for (const value of arr) if (value === val) count++;

  return count;
}

function correctInputs(
  extRefActions: (Update | Remove)[]
): (Update | Remove)[] {
  const removeInputs: Remove[] = [];
  (
    extRefActions
      .filter(extRefAction => isRemove(extRefAction))
      .map(
        removeAction => ((removeAction as Remove).node as Element).parentElement
      )
      .filter(input => input) as Element[]
  ).forEach((input, _index, inputs) => {
    const number = duplicates(inputs, input);
    if (
      input.querySelectorAll('ExtRef').length === number &&
      !removeInputs.some(removeInput => removeInput.node === input)
    )
      removeInputs.push({ node: input });
  });

  return extRefActions.concat(removeInputs);
}

export function unsubscribe(extRefs: Element[]): (Update | Remove)[] {
  const actions: (Update | Remove)[] = [];
  extRefs.forEach(extRef => {
    if (extRef.getAttribute('intAddr'))
      actions.push({
        element: extRef,
        attributes: {
          iedName: null,
          ldInst: null,
          prefix: null,
          lnClass: null,
          lnInst: null,
          doName: null,
          daName: null,
          srcLDInst: null,
          srcPrefix: null,
          srcLNClass: null,
          srcLNInst: null,
          srcCBName: null,
          serviceType: null,
        },
      });
    else actions.push({ node: extRef });
  });

  return correctInputs(actions).concat(removeSubscriptionSupervision(extRefs));
}

/** @returns Whether a ExtRef to FCDA reference match */
export function matchExtRefFcda(extRef: Element, fcda: Element): boolean {
  return (
    extRef.getAttribute('ldInst') === fcda.getAttribute('ldInst') &&
    (extRef.getAttribute('prefix') ?? '') ===
      (fcda.getAttribute('prefix') ?? '') &&
    extRef.getAttribute('lnClass') === fcda.getAttribute('lnClass') &&
    (extRef.getAttribute('lnInst') ?? '') ===
      (fcda.getAttribute('lnInst') ?? '') &&
    extRef.getAttribute('doName') === fcda.getAttribute('doName') &&
    (extRef.getAttribute('daName') ?? '') ===
      (fcda.getAttribute('daName') ?? '')
  );
}

/** @returns Whether src... type ExtRef attributes match */
export function matchExtRefCtrlBlockAttr(
  extRef: Element,
  ctrlBlock: Element
): boolean {
  const cbName = ctrlBlock.getAttribute('name');
  const srcLDInst = ctrlBlock.closest('LDevice')?.getAttribute('inst');
  const srcPrefix = ctrlBlock.closest('LN0, LN')?.getAttribute('prefix') ?? '';
  const srcLNClass = ctrlBlock.closest('LN0, LN')?.getAttribute('lnClass');
  const srcLNInst = ctrlBlock.closest('LN0, LN')?.getAttribute('inst');

  return (
    extRef.getAttribute('srcCBName') === cbName &&
    extRef.getAttribute('srcLDInst') === srcLDInst &&
    (extRef.getAttribute('srcPrefix') ?? '') === srcPrefix &&
    (extRef.getAttribute('srcLNInst') ?? '') === srcLNInst &&
    extRef.getAttribute('srcLNClass') === srcLNClass &&
    extRef.getAttribute('serviceType') === serviceType[ctrlBlock.tagName]
  );
}
