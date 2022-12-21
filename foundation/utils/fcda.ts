/* eslint-disable import/no-extraneous-dependencies */
import { Remove, Update } from '@openscd/open-scd-core';

import { controlBlocks } from './controlBlocks.js';
import {
  matchExtRefCtrlBlockAttr,
  matchExtRefFcda,
  unsubscribe,
} from './extRef.js';

function findFcdaSubscription(fcda: Element): Element[] {
  const doc = fcda.ownerDocument;
  const iedName = fcda.closest('IED')?.getAttribute('name');
  if (!iedName) return [];

  const isEd1 = !fcda.ownerDocument
    .querySelector('SCL')
    ?.getAttribute('version');

  if (isEd1)
    return Array.from(
      doc.querySelectorAll(`ExtRef[iedName="${iedName}"]`)
    ).filter(extRef => matchExtRefFcda(extRef, fcda));

  return controlBlocks(fcda).flatMap(controlBlock =>
    Array.from(doc.querySelectorAll(`ExtRef[iedName="${iedName}"]`)).filter(
      extRef =>
        matchExtRefFcda(extRef, fcda) &&
        matchExtRefCtrlBlockAttr(extRef, controlBlock)
    )
  );
}

/** @returns Action array removing multi FCDA and its subscriber information */
export function removeFCDAs(fCDAs: Element[]): (Update | Remove)[] {
  const removeFCDAsActions: (Remove | Update)[] = fCDAs.map(fCDA => ({
    node: fCDA,
  }));

  const extRefActions: (Remove | Update)[] = [];
  extRefActions.push(
    ...unsubscribe(fCDAs.flatMap(fCDA => findFcdaSubscription(fCDA)))
  );

  return removeFCDAsActions.concat(extRefActions);
}

/** @returns Action array removing FCDA and its subscriber information */
export function removeFCDA(fCDA: Element): (Update | Remove)[] {
  const removeActionFcda: (Remove | Update)[] = [{ node: fCDA }];

  const extRefActions: (Remove | Update)[] = [];
  extRefActions.push(...unsubscribe(findFcdaSubscription(fCDA)));

  return removeActionFcda.concat(extRefActions);
}

/** @returns Whether a data attribute is subscribed  */
export function isSubscribed(fcda: Element): boolean {
  return !!findFcdaSubscription(fcda).length;
}
