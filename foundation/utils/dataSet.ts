/* eslint-disable import/no-extraneous-dependencies */
import { Remove, Update } from '@openscd/open-scd-core';

import { controlBlocks } from './controlBlocks.js';
import { removeFCDAs } from './fcda.js';

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
