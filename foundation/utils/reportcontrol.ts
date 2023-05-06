/* eslint-disable no-param-reassign */
// eslint-disable-next-line import/no-extraneous-dependencies
import { Insert, Remove, Update } from '@openscd/open-scd-core';

import { getReference } from './scldata.js';
import { findCtrlBlockSubscription, updatedConfRev } from './controlBlocks.js';

type ReportControlAttributes = {
  name?: string | null;
  desc?: string | null;
  buffered?: string | null;
  rptID?: string | null;
  indexed?: string | null;
  bufTime?: string | null;
  intgPd?: string | null;
};

type TrgOpsAttributes = {
  dchg?: string | null;
  qchg?: string | null;
  dupd?: string | null;
  period?: string | null;
  gi?: string | null;
};

type OptFieldsAttributes = {
  seqNum?: string | null;
  timeStamp?: string | null;
  reasonCode?: string | null;
  dataRef?: string | null;
  entryID?: string | null;
  configRef?: string | null;
  bufOvfl?: string | null;
};

function createElement(
  doc: XMLDocument,
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

/** @returns action array to update all `OptFields` attributes */
export function updateOptFields(
  optFields: Element,
  attributes: OptFieldsAttributes
): Update {
  return { element: optFields, attributes };
}

/** @returns action array to update all `TrgOps` attributes */
export function updateTrgOps(
  trgOps: Element,
  attributes: TrgOpsAttributes
): Update {
  return { element: trgOps, attributes };
}

/** @returns action array to update all `ReportControl` attributes */
export function updateReportControl(
  reportControl: Element,
  attributes: ReportControlAttributes
): Update[] {
  const confRev = updatedConfRev(reportControl); // +10000 for update
  const attrs = { ...attributes, confRev };

  const ctrlBlockUpdates: Update[] = [
    { element: reportControl, attributes: attrs },
  ];
  if (!attributes.name) return ctrlBlockUpdates;

  const extRefUpdates: Update[] = findCtrlBlockSubscription(reportControl).map(
    extRef => ({
      element: extRef,
      attributes: { srcCBName: attributes.name },
    })
  );

  return ctrlBlockUpdates.concat(extRefUpdates);
}

/** @returns action to update max clients in ReportControl element */
export function updateMaxClients(
  reportControl: Element,
  max: string | null
): Remove | Update | Insert | null {
  const rptEnabled = reportControl.querySelector(':scope > RptEnabled');

  if (rptEnabled && !max)
    return {
      node: rptEnabled,
    };
  if (!rptEnabled && !max) return null;
  if (!rptEnabled && max) {
    const newRptEnabled = createElement(
      reportControl.ownerDocument,
      'RptEnabled',
      { max }
    );

    return {
      parent: reportControl,
      node: newRptEnabled,
      reference: getReference(reportControl, 'RptEnabled'),
    };
  }

  return { element: rptEnabled!, attributes: { max } };
}

function uniqueReportControlName(anyLn: Element): string {
  const nameCore = 'newReportControl';

  const siblingNames = Array.from(anyLn.querySelectorAll('ReportControl')).map(
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

/** Function processing ReportControl creation
 * @parent Parent element such as `LN0`, `LN`, `LDevice`, `AccessPoint` and `IED`
 * @attributes ReportControl, TrgOps and OptFields elements attributes. Missing and required
 *             attributes are set to their defaults.
 * @option allow to overwrite `confRev` and `max` clients
 * @returns Action object adding new `ReportControl` to [[`parent`]] element
 * */
export function addReportControl(
  parent: Element,
  attributes: {
    rpt: ReportControlAttributes;
    trgOps: TrgOpsAttributes;
    optFields: OptFieldsAttributes;
    confRev?: string;
    maxClients?: string;
  } = { rpt: {}, trgOps: {}, optFields: {} }
): Insert[] | null {
  const anyLn =
    parent.tagName === 'LN0' || parent.tagName === 'LN'
      ? parent
      : parent.querySelector('LN0, LN');
  if (!anyLn) return null;

  if (!attributes.rpt.name)
    attributes.rpt.name = uniqueReportControlName(anyLn);
  if (!attributes.rpt.buffered) attributes.rpt.buffered = 'true';
  if (!attributes.rpt.rptID) attributes.rpt.rptID = '';
  if (!attributes.rpt.bufTime) attributes.rpt.bufTime = '100';
  if (attributes.trgOps.period === 'true' && !attributes.rpt.intgPd)
    attributes.rpt.intgPd = '1000';
  const confRev = attributes.confRev ? attributes.confRev : '0';

  if (
    (attributes.rpt.intgPd && !attributes.trgOps.period) ||
    attributes.trgOps.period === 'false'
  )
    attributes.trgOps.period = 'true';

  const reportControl = createElement(anyLn.ownerDocument, 'ReportControl', {
    ...attributes.rpt,
    confRev,
  });

  if (Object.keys(attributes.trgOps).length) {
    const trgOps = createElement(
      anyLn.ownerDocument,
      'TrgOps',
      attributes.trgOps
    );

    reportControl.insertBefore(trgOps, null);
  }

  if (Object.keys(attributes.optFields).length) {
    const optFields = createElement(
      anyLn.ownerDocument,
      'OptFields',
      attributes.optFields
    );

    reportControl.insertBefore(optFields, null);
  }

  if (attributes.maxClients) {
    const rptEnabled = createElement(anyLn.ownerDocument, 'RptEnabled', {
      max: attributes.maxClients,
    });
    reportControl.insertBefore(rptEnabled, null);
  }

  const actions: Insert[] = [];
  actions.push({
    parent: anyLn,
    node: reportControl,
    reference: getReference(anyLn, 'ReportControl'),
  });

  return actions;
}
