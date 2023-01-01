/* eslint-disable import/no-extraneous-dependencies */
import { Insert, Remove, Update } from '@openscd/open-scd-core';

import {
  controlBlockObjectReference,
  findCtrlBlockSubscription,
} from './controlBlocks.js';
import { referencedGSE } from './gse.js';

/** @returns action array to update all `GSEControl` attributes */
export function updateGseControl(
  gseControl: Element,
  attrs: Record<string, string | null>
): (Update | Remove | Insert)[] {
  const ctrlBlockUpdates: (Update | Remove | Insert)[] = [
    { element: gseControl, attributes: attrs },
  ];
  if (!attrs.name) return ctrlBlockUpdates;

  const extRefUpdates: Update[] = findCtrlBlockSubscription(gseControl).map(
    extRef => ({
      element: extRef,
      attributes: { srcCBName: attrs.name },
    })
  );

  const objRefUpdates: (Remove | Insert)[] = Array.from(
    gseControl.ownerDocument.querySelectorAll('Val')
  )
    .filter(val => val.textContent === controlBlockObjectReference(gseControl))
    .flatMap(val => {
      const [path] = controlBlockObjectReference(gseControl)!.split('.');
      const newVal = gseControl.ownerDocument.createTextNode(
        `${path}.${attrs.name}`
      ) as Text;

      return [
        { node: val.firstChild as Text },
        { parent: val, node: newVal, reference: null },
      ];
    });

  const updateGseAction: Update[] = [];
  const gSE = referencedGSE(gseControl);
  if (gSE) {
    updateGseAction.push({ element: gSE, attributes: { cbName: attrs.name } });
  }

  return ctrlBlockUpdates.concat(extRefUpdates, objRefUpdates, updateGseAction);
}
