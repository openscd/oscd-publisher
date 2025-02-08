/* eslint-disable import/no-extraneous-dependencies */
import { createElement } from '@openenergytools/scl-lib/dist/foundation/utils';
import { Insert } from '@openenergytools/open-scd-core';

function findFcda(
  dataSet: Element,
  attr: {
    ldInst: string;
    prefix: string;
    lnClass: string;
    lnInst?: string;
    doName: string;
    daName?: string;
    fc: string;
  }
): Element | undefined {
  return Array.from(dataSet.children).find(
    fcda =>
      fcda.tagName === 'FCDA' &&
      fcda.getAttribute('ldInst') === attr.ldInst &&
      (fcda.getAttribute('prefix') ?? '') === attr.prefix &&
      (fcda.getAttribute('lnInst') ?? '') === attr.lnInst &&
      fcda.getAttribute('lnClass') === attr.lnClass &&
      fcda.getAttribute('doName') === attr.doName &&
      fcda.getAttribute('daName') === (attr.daName ?? null) &&
      fcda.getAttribute('fc') === attr.fc
  );
}

/** @returns Action array adding new `FCDA`s to parent [[`DataSet`]] */
export function addFCDAs(dataSet: Element, paths: Element[][]): Insert[] {
  const actions: Insert[] = [];
  for (const path of paths) {
    const anyLn = path.find(
      section => section.tagName === 'LN' || section.tagName === 'LN0'
    );
    const lDevice = path.find(section => section.tagName === 'LDevice');

    const ldInst = lDevice?.getAttribute('inst');
    const prefix = anyLn?.getAttribute('prefix') ?? '';
    const lnClass = anyLn?.getAttribute('lnClass');
    const lnInst = anyLn?.getAttribute('inst') ?? '';

    // eslint-disable-next-line no-continue
    if (!ldInst || !lnClass) continue;

    let doName = '';
    let daName = '';
    let fc = '';

    for (const ancestor of path) {
      // eslint-disable-next-line no-continue
      if (!['DO', 'DA', 'SDO', 'BDA'].includes(ancestor.tagName)) continue;

      const name = ancestor.getAttribute('name')!;

      if (ancestor.tagName === 'DO') doName = name;
      if (ancestor.tagName === 'SDO') doName = `${doName}.${name}`;
      if (ancestor.tagName === 'DA') {
        daName = name;
        fc = ancestor.getAttribute('fc') ?? '';
      }
      if (ancestor.tagName === 'BDA') daName = `${daName}.${name}`;
    }
    // eslint-disable-next-line no-continue
    if (!doName || !daName || !fc) continue;

    const fcdaAttrs = {
      ldInst,
      prefix,
      lnClass,
      ...(lnClass !== 'LLN0' && { lnInst }),
      doName,
      daName,
      fc,
    };

    // eslint-disable-next-line no-continue
    if (findFcda(dataSet, fcdaAttrs)) continue;

    actions.push({
      parent: dataSet,
      node: createElement(dataSet.ownerDocument, 'FCDA', fcdaAttrs),
      reference: null,
    });
  }

  return actions;
}

/** @returns Action array adding new `FCDA`s to parent [[`DataSet`]] */
export function addFCDOs(
  dataSet: Element,
  fcPaths: { path: Element[]; fc: string }[]
): Insert[] {
  const actions: Insert[] = [];
  for (const fcPath of fcPaths) {
    const anyLn = fcPath.path.find(
      section => section.tagName === 'LN' || section.tagName === 'LN0'
    );
    const lDevice = fcPath.path.find(section => section.tagName === 'LDevice');

    const ldInst = lDevice?.getAttribute('inst');
    const prefix = anyLn?.getAttribute('prefix') ?? '';
    const lnClass = anyLn?.getAttribute('lnClass');
    const lnInst = anyLn?.getAttribute('inst') ?? '';

    // eslint-disable-next-line no-continue
    if (!ldInst || !lnClass) continue;

    let doName = '';
    const { fc } = fcPath;

    for (const ancestor of fcPath.path) {
      // eslint-disable-next-line no-continue
      if (!['DO', 'SDO'].includes(ancestor.tagName)) continue;

      const name = ancestor.getAttribute('name')!;

      if (ancestor.tagName === 'DO') doName = name;
      if (ancestor.tagName === 'SDO') doName = `${doName}.${name}`;
    }
    // eslint-disable-next-line no-continue
    if (!doName) continue;

    const fcdaAttrs = {
      ldInst,
      prefix,
      lnClass,
      lnInst,
      doName,
      fc,
    };

    // eslint-disable-next-line no-continue
    if (findFcda(dataSet, fcdaAttrs)) continue;

    actions.push({
      parent: dataSet,
      node: createElement(dataSet.ownerDocument, 'FCDA', fcdaAttrs),
      reference: null,
    });
  }

  return actions;
}

export type fcdaDesc = {
  LDevice?: string | null;
  LN?: string | null;
  DOI?: string | null;
  SDI?: string[];
  DAI?: string | null;
};

export function getFcdaInstDesc(fcda: Element): fcdaDesc {
  const [doName, daName] = ['doName', 'daName'].map(attr =>
    fcda.getAttribute(attr)
  );

  const ied = fcda.closest('IED')!;
  if (!ied) return {};

  const anyLn = Array.from(
    ied.querySelectorAll(
      `:scope > AccessPoint > Server > LDevice[inst="${fcda.getAttribute(
        'ldInst'
      )}"] > LN, :scope > AccessPoint > Server > LDevice[inst="${fcda.getAttribute(
        'ldInst'
      )}"] > LN0`
    )
  ).find(
    lN =>
      (lN.getAttribute('prefix') ?? '') ===
        (fcda.getAttribute('prefix') ?? '') &&
      lN.getAttribute('lnClass') === (fcda.getAttribute('lnClass') ?? '') &&
      (lN.getAttribute('inst') ?? '') === (fcda.getAttribute('lnInst') ?? '')
  );

  if (!anyLn) return {};

  let descs: fcdaDesc = {};

  const ldDesc = anyLn.closest('LDevice')!.getAttribute('desc');
  descs = { ...descs, ...(ldDesc && ldDesc !== '' && { LDevice: ldDesc }) };

  const lnDesc = anyLn.getAttribute('desc');
  descs = { ...descs, ...(lnDesc && lnDesc !== '' && { LN: lnDesc }) };

  const doNames = doName!.split('.');
  const daNames = daName?.split('.');

  const doi = anyLn.querySelector(`:scope > DOI[name="${doNames[0]}"`);

  if (!doi) return descs;

  let doiDesc = doi?.getAttribute('desc');

  if (!doiDesc) {
    doiDesc =
      doi?.querySelector(':scope > DAI[name="d"] > Val')?.textContent ?? null;
  }

  descs = { ...descs, ...(doiDesc && doiDesc !== '' && { DOI: doiDesc }) };

  let previousDI: Element = doi;
  const daAsSDI = daNames ? daNames.slice(0, daNames.length - 1) : [];
  doNames
    .concat(daAsSDI)
    .slice(1)
    .forEach(sdiName => {
      const sdi = previousDI.querySelector(`:scope > SDI[name="${sdiName}"]`);
      if (sdi) previousDI = sdi;
      let sdiDesc = sdi?.getAttribute('desc');

      if (!sdiDesc) {
        sdiDesc =
          sdi?.querySelector(':scope > DAI[name="d"] > Val')?.textContent ??
          null;
      }
      if (!('SDI' in descs)) {
        descs = {
          ...descs,
          ...(sdiDesc && sdiDesc !== '' && { SDI: [sdiDesc] }),
        };
      } else if (sdiDesc) descs.SDI!.push(sdiDesc);
    });

  if (!daName || !daNames) return descs;

  // ix and array elements not supported
  const lastdaName = daNames?.slice(daNames.length - 1);
  const dai = previousDI.querySelector(`:scope > DAI[name="${lastdaName}"]`);
  if (!dai) return descs;

  const daiDesc = dai.getAttribute('desc');
  descs = { ...descs, ...(daiDesc && daiDesc !== '' && { DAI: daiDesc }) };

  return descs;
}
