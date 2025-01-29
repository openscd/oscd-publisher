// eslint-disable-next-line import/no-extraneous-dependencies
import { Insert, Remove, SetAttributes } from '@openenergytools/open-scd-core';

import { getReference } from '@openenergytools/scl-lib';

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

/** @returns action to update max clients in ReportControl element */
export function updateMaxClients(
  reportControl: Element,
  max: string | null
): Remove | SetAttributes | Insert | null {
  const rptEnabled = reportControl.querySelector(':scope > RptEnabled');

  if (rptEnabled && !max) return { node: rptEnabled };
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

  return { element: rptEnabled!, attributes: { max }, attributesNS: {} };
}
