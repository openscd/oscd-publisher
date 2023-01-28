/* eslint-disable no-param-reassign */
/* eslint-disable import/no-extraneous-dependencies */
import { Insert, Remove, Update } from '@openscd/open-scd-core';
import { identity } from '../identities/identity.js';
import { connectedAp } from './connectedAp.js';

import {
  controlBlockObjectReference,
  findCtrlBlockSubscription,
} from './controlBlocks.js';
import { addGSE, referencedGSE } from './gse.js';
import { getReference } from './scldata.js';

function createElement(
  doc: Document,
  tag: string,
  attrs: Record<string, string | null>
): Element {
  const element = doc.createElementNS(doc.documentElement.namespaceURI, tag);
  Object.entries(attrs)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(([_, value]) => value !== null)
    .forEach(([name, value]) => element.setAttribute(name, value!));
  return element;
}

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

function uniqueGSEControlName(ln0: Element): string {
  const nameCore = 'newGSEControl';

  const siblingNames = Array.from(ln0.querySelectorAll('GSEControl')).map(
    child => child.getAttribute('name') ?? child.tagName
  );
  if (!siblingNames.length) return `${nameCore}_001`;

  let newName = '';
  // eslint-disable-next-line no-plusplus
  let i = 1;
  newName = `${nameCore}_${i.toString().padStart(3, '0')}`;
  while (i < siblingNames.length + 1) {
    if (!siblingNames.includes(newName)) break;

    i += 1;
    newName = `${nameCore}_${i.toString().padStart(3, '0')}`;
  }

  return newName;
}

/** Function processing GSEControl creation
 * @parent Parent element such as `LN0`, `LDevice`, `AccessPoint` and `IED`
 * @attributes GSEControl element attributes. Required but missing attributes
 *             will be added automatically
 * @returns Action inserting new `GSEControl` to [[`parent`]] element
 * */
export function addGSEControl(
  parent: Element,
  attributes: Record<string, string | null> = {}
): Insert[] | null {
  const ln0 = parent.tagName === 'LN0' ? parent : parent.querySelector('LN0');
  if (!ln0) return null;

  if (!attributes.name) attributes.name = uniqueGSEControlName(ln0);
  if (!attributes.confRev) attributes.confRev = '1';
  if (!attributes.type) attributes.type = 'GOOSE';
  if (!attributes.appId)
    attributes.appId = `${identity(ln0)}>${uniqueGSEControlName(ln0)}`;

  const gseControl = createElement(ln0.ownerDocument, 'GSEControl', attributes);

  const actions: Insert[] = [];
  actions.push({
    parent: ln0,
    node: gseControl,
    reference: getReference(ln0, 'GSEControl'),
  });

  const connAp = connectedAp(ln0);
  if (!connAp) return actions;

  const ldInst = ln0.closest('LDevice')!.getAttribute('inst');
  const cbName = gseControl.getAttribute('name');
  if (!ldInst || !cbName) return actions;

  const gseAttrs = { ldInst, cbName };
  return actions.concat(addGSE(connAp, gseAttrs));
}
