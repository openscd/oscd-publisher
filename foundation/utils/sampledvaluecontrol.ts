/* eslint-disable import/no-extraneous-dependencies */
import { Update } from '@openscd/open-scd-core';

type SmvOptsAttributes = {
  refreshTime?: string | null;
  sampleSynchronized?: string | null;
  sampleRate?: string | null;
  dataSet?: string | null;
  security?: string | null;
  dataRef?: string | null;
  synchSourceId?: string | null;
};

/** @returns action array to update all `SmvOps` attributes */
export function updateSmvOpts(
  smvOpts: Element,
  attributes: SmvOptsAttributes
): Update {
  return { element: smvOpts, attributes };
}
