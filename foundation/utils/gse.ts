/* eslint-disable import/no-extraneous-dependencies */
import { Insert, Remove } from '@openscd/open-scd-core';
import { getReference } from './scldata.js';

const gSEselectors: Record<string, string> = {
  MinTime: ':scope > MinTime',
  MaxTime: ':scope > MaxTime',
  'MAC-Address': ':scope > Address > P[type="MAC-Address"]',
  APPID: ':scope > Address > P[type="APPID"]',
  'VLAN-ID': ':scope > Address > P[type="VLAN-ID"]',
  'VLAN-PRIORITY': ':scope > Address > P[type="VLAN-PRIORITY"]',
};

/** @returns Whether the `gSE`s element attributes or instType has changed */
export function checkGSEDiff(
  gSE: Element,
  attrs: Record<string, string | null>,
  instType?: boolean
): boolean {
  return Object.entries(attrs).some(([key, value]) => {
    const oldValue = gSE.querySelector(gSEselectors[key])?.textContent ?? null;
    if (instType === undefined) return oldValue !== value;

    const oldInstType =
      key === 'MinTime' || key === 'MaxTime'
        ? undefined
        : gSE.querySelector(gSEselectors[key])?.hasAttribute('xsi:type');
    if (oldInstType === undefined) return oldValue !== value;

    return oldValue !== value || instType !== oldInstType;
  });
}

function checkTimeMinMaxTimeDiff(
  gSE: Element,
  attrs: Record<string, string | null>
): boolean {
  const timeAttrs: Record<string, string | null> = {};
  timeAttrs.MinTime = attrs.MinTime;
  timeAttrs.MaxTime = attrs.MaxTime;

  return checkGSEDiff(gSE, timeAttrs);
}

function checkTimeAddressDiff(
  gSE: Element,
  attrs: Record<string, string | null>,
  instType?: boolean
): boolean {
  const timeAttrs: Record<string, string | null> = {};
  timeAttrs['MAC-Address'] = attrs['MAC-Address'];
  timeAttrs.APPID = attrs.APPID;
  timeAttrs['VLAN-ID'] = attrs['VLAN-ID'];
  timeAttrs['VLAN-PRIORITY'] = attrs['VLAN-PRIORITY'];

  return checkGSEDiff(gSE, timeAttrs, instType);
}

/** @returns a new [[`tag`]] element owned by [[`doc`]]. */
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

function updateGseTimes(
  gSE: Element,
  attr: Record<string, string | null>
): (Insert | Remove)[] {
  const actions: (Insert | Remove)[] = [];

  if (attr.MinTime !== undefined) {
    if (attr.MinTime !== null) {
      const newMinTime = createElement(gSE.ownerDocument, 'MinTime', {
        unit: 's',
        multiplier: 'm',
      });
      newMinTime.textContent = attr.MinTime;
      actions.push({
        parent: gSE,
        node: newMinTime,
        reference: getReference(gSE, 'MinTime'),
      });
    }

    const oldMinTime = gSE.querySelector('MinTime');
    if (oldMinTime) actions.push({ node: oldMinTime });
  }

  if (attr.MaxTime !== undefined) {
    if (attr.MaxTime !== null) {
      const newMaxTime = createElement(gSE.ownerDocument, 'MaxTime', {
        unit: 's',
        multiplier: 'm',
      });
      newMaxTime.textContent = attr.MaxTime;
      actions.push({
        parent: gSE,
        node: newMaxTime,
        reference: getReference(gSE, 'MaxTime'),
      });
    }

    const oldMaxTime = gSE.querySelector('MaxTime');
    if (oldMaxTime) actions.push({ node: oldMaxTime });
  }

  return actions;
}

function updateGseAddress(
  gSE: Element,
  attrs: Record<string, string | null>,
  instType?: boolean
): (Insert | Remove)[] {
  const actions: (Insert | Remove)[] = [];

  const newAddress = createElement(gSE.ownerDocument, 'Address', {});

  Object.entries(attrs)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(([_, value]) => value !== null)
    .forEach(([type, value]) => {
      const child = createElement(gSE.ownerDocument, 'P', { type });
      if (instType)
        child.setAttributeNS(
          'http://www.w3.org/2001/XMLSchema-instance',
          'xsi:type',
          `tP_${type}`
        );
      child.textContent = value;
      newAddress.appendChild(child);
    });

  actions.push({
    parent: gSE,
    node: newAddress,
    reference: getReference(gSE, 'Address'),
  });

  const oldAddress = gSE.querySelector('Address');
  if (oldAddress) actions.push({ node: oldAddress });

  return actions;
}

/**
 * @param gSE - the element to be updated
 * @param attrs - input values containing potential changes
 * @param instType - Whether xsi:type attributes shall be set
 * @returns Action array updating GSEs children Address, MinTine and MaxTime
 * */
export function updateGSE(
  gSE: Element,
  attrs: Record<string, string | null>,
  instType?: boolean
): (Insert | Remove)[] {
  const addressActions = checkTimeAddressDiff(gSE, attrs, instType)
    ? updateGseAddress(gSE, attrs, instType)
    : [];
  const timeActions = checkTimeMinMaxTimeDiff(gSE, attrs)
    ? updateGseTimes(gSE, attrs)
    : [];

  return addressActions.concat(timeActions);
}
