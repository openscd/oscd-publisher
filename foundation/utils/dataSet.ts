/* eslint-disable import/no-extraneous-dependencies */
import { Insert, Remove, Update } from '@openscd/open-scd-core';

import { controlBlocks } from './controlBlocks.js';
import { removeFCDAs } from './fcda.js';
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

export function removeDataSet(dataSet: Element): (Remove | Update)[] {
  const dataSetRemove: (Remove | Update)[] = [{ node: dataSet }];
  const ctrlBlockUpdates: (Remove | Update)[] = controlBlocks(dataSet).map(
    ctrlBlock => ({
      element: ctrlBlock,
      attributes: { datSet: null },
    })
  );
  const removeFCDAsActions: (Remove | Update)[] = removeFCDAs(
    Array.from(dataSet.querySelectorAll(':scope > FCDA'))
  );

  return dataSetRemove.concat(ctrlBlockUpdates, removeFCDAsActions);
}

/** @returns Update actions for `DataSet`s attributes and its `datSet` references */
export function updateDateSetName(
  dataSet: Element,
  attr: Record<string, string | null>
): Update[] {
  const parent = dataSet.parentElement as Element;
  if (!parent) return [];

  const dataSetUpdate = {
    element: dataSet,
    attributes: attr,
  } as Update;

  const newName = attr.name;
  if (!newName) return [dataSetUpdate];

  const controlBlockUpdates = controlBlocks(dataSet).map(element => ({
    element,
    attributes: { datSet: newName },
  })) as Update[];

  return [dataSetUpdate].concat(controlBlockUpdates);
}

function uniqueDataSetName(anyLn: Element): string {
  const nameCore = 'newDataSet';

  const siblingNames = Array.from(anyLn.querySelectorAll('DataSet')).map(
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

/** @returns Action inserting new `DataSet` to [[`parent`]] element */
export function addDataSet(parent: Element): Insert | null {
  const anyLn =
    parent.tagName === 'LN' || parent.tagName === 'LN0'
      ? parent
      : parent.querySelector('LN0, LN');
  if (!anyLn) return null;

  const dataSet = createElement(anyLn.ownerDocument, 'DataSet', {
    name: uniqueDataSetName(anyLn),
  });

  return {
    parent: anyLn,
    node: dataSet,
    reference: getReference(anyLn, 'DataSet'),
  };
}
