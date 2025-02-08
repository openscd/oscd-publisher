/* eslint-disable import/no-extraneous-dependencies */
import { identity } from '@openenergytools/scl-lib';
import { Tree } from '@openenergytools/tree-grid';

function dataAttributeObject(da: Element, daiOrsdi?: Element): Tree {
  const tree: Tree = {};
  const children: Tree = {};

  const daType = da.ownerDocument.querySelector(
    `DAType[id="${da.getAttribute('type')}"]`
  );
  if (!daType) return tree;

  Array.from(daType.querySelectorAll(':scope > BDA')).forEach(bda => {
    const name = bda.getAttribute('name');
    const sdiOrDai =
      daiOrsdi?.querySelector(
        `:scope > SDI[name="${name}"], :scope > DAI[name="${name}"]`
      ) ?? undefined;
    let desc = sdiOrDai?.getAttribute('desc');

    if (!desc) {
      desc =
        sdiOrDai?.querySelector(':scope > DAI[name="d"] > Val')?.textContent ??
        null;
    }

    const bdaName = `${name ?? 'UNKNOWN_BDA'}${desc ? ` (${desc})` : ''}`;
    const id = `BDA: ${identity(bda)}`;
    if (bda.getAttribute('bType') === 'Struct') {
      children[id] = dataAttributeObject(bda, sdiOrDai);
      children[id]!.text = bdaName;
    } else {
      children[id] = {};
      children[id]!.text = bdaName;
    }
  });

  tree.children = children;
  return tree;
}

function subDataObjectsObject(sdo: Element, sDiOrDai?: Element): Tree {
  const tree: Tree = {};
  const children: Tree = {};

  const doType = sdo.ownerDocument.querySelector(
    `DOType[id="${sdo.getAttribute('type')}"]`
  );
  if (!doType) return tree;

  Array.from(doType.querySelectorAll(':scope > SDO, :scope > DA')).forEach(
    sDoOrDa => {
      if (sDoOrDa.tagName === 'SDO') {
        const name = sDoOrDa.getAttribute('name') ?? 'UNKNOWN_SDO';
        const sdi =
          sDiOrDai?.querySelector(`:scope > SDI[name="${name}"]`) ?? undefined;
        let desc = sdi?.getAttribute('desc');

        if (!desc) {
          desc =
            sdi?.querySelector(':scope > DAI[name="d"] > Val')?.textContent ??
            null;
        }

        const sDoName = `${name}${desc ? ` (${desc})` : ''}`;
        const id = `SDO: ${identity(sDoOrDa)}`;
        children[id] = subDataObjectsObject(sDoOrDa, sdi);
        children[id]!.text = sDoName;
      } else {
        const name = sDoOrDa.getAttribute('name') ?? 'UNKNOWN_SDO_OR_DA';
        const sdiOrDai =
          sDiOrDai?.querySelector(
            `:scope > SDI[name="${name}"], :scope > DAI[name="${name}"]`
          ) ?? undefined;
        let desc = sdiOrDai?.getAttribute('desc');

        if (!desc && sdiOrDai?.tagName === 'SDI') {
          desc =
            sdiOrDai?.querySelector(':scope > DAI[name="d"] > Val')
              ?.textContent ?? null;
        }

        const fc = sDoOrDa.getAttribute('fc') ?? 'UNKNOWN_FC';

        const daName = `${name}${fc ? ` - FC: ${fc}` : ''}${
          desc ? ` (${desc})` : ''
        }`;
        const id = `DA: ${identity(sDoOrDa)}`;
        if (sDoOrDa.getAttribute('bType') === 'Struct') {
          children[id] = dataAttributeObject(sDoOrDa, sdiOrDai);
          children[id]!.text = daName;
        } else {
          children[id] = {};
          children[id]!.text = daName;
        }
      }
    }
  );

  tree.children = children;
  return tree;
}

function dataObjectObject(dO: Element, dOI?: Element): Tree {
  const tree: Tree = {};
  const children: Tree = {};

  const doType = dO.ownerDocument.querySelector(
    `DOType[id="${dO.getAttribute('type')}"]`
  );
  if (!doType) return tree;

  Array.from(doType.querySelectorAll(':scope > SDO, :scope > DA')).forEach(
    sDoOrDa => {
      if (sDoOrDa.tagName === 'SDO') {
        const name = sDoOrDa.getAttribute('name') ?? 'UNKNOWN_SDO';
        const sDi =
          dOI?.querySelector(`:scope > SDI[name="${name}"]`) ?? undefined;

        let sDiDesc = sDi?.getAttribute('desc');

        if (!sDiDesc) {
          sDiDesc =
            sDi?.querySelector(':scope > DAI[name="d"] > Val')?.textContent ??
            null;
        }

        const sDoName = `${name}${sDiDesc ? ` (${sDiDesc})` : ''}`;

        const id = `SDO: ${identity(sDoOrDa)}`;
        children[id] = subDataObjectsObject(sDoOrDa, sDi);
        children[id]!.text = sDoName;
      } else {
        const name = sDoOrDa.getAttribute('name') ?? 'UNKNOWN_DA';
        const dAi =
          dOI?.querySelector(`:scope > DAI[name="${name}"]`) ?? undefined;
        const desc = dAi?.getAttribute('desc');
        const fc = sDoOrDa.getAttribute('fc') ?? 'UNKNOWN_FC';

        const daName = `${name}${fc ? ` - FC: ${fc}` : ''}${
          desc ? ` (${desc})` : ''
        }`;
        const id = `DA: ${identity(sDoOrDa)}`;
        if (sDoOrDa.getAttribute('bType') === 'Struct') {
          children[id] = dataAttributeObject(sDoOrDa, dAi);
          children[id]!.text = daName;
        } else {
          children[id] = {};
          children[id]!.text = daName;
        }
      }
    }
  );

  tree.children = children;
  return tree;
}

function anyLnObject(anyLn: Element): Tree {
  const tree: Tree = {};
  const children: Tree = {};

  const lnType = anyLn.ownerDocument.querySelector(
    `LNodeType[id="${anyLn.getAttribute('lnType')}"]`
  );
  if (!lnType) return tree;

  Array.from(lnType.querySelectorAll('DO')).forEach(dO => {
    const name = dO.getAttribute('name') ?? 'UNKNOWN_DO';
    const dOi =
      anyLn.querySelector(`:scope > DOI[name="${name}"]`) ?? undefined;
    let desc = dOi?.getAttribute('desc');
    if (!desc) {
      desc = dOi?.querySelector(':scope > DAI[name="d"] > Val')?.textContent;
    }

    const doName = `${name}${desc ? ` (${desc})` : ''}`;

    const id = `DO: ${identity(dO)}`;
    children[id] = dataObjectObject(dO, dOi);
    children[id]!.text = doName;
  });

  tree.children = children;
  return tree;
}

function lDeviceObject(lDevice: Element): Tree {
  const tree: Tree = {};
  const children: Tree = {};

  Array.from(lDevice.querySelectorAll('LN0,LN')).forEach(anyLn => {
    const desc = anyLn.getAttribute('desc');

    const anyLnClass = `${anyLn.getAttribute('prefix') ?? ''} ${
      anyLn.getAttribute('lnClass') ?? 'UNKNOWN_INST'
    } ${anyLn.getAttribute('inst') ?? ''}${desc ? ` (${desc})` : ''}`;

    const id = `${anyLn.tagName}: ${identity(anyLn)}`;
    children[id] = anyLnObject(anyLn);
    children[id]!.text = anyLnClass;
  });

  tree.children = children;

  return tree;
}

export function dataAttributeTree(server: Element): Tree {
  const tree: Tree = {};

  Array.from(server.querySelectorAll('LDevice')).forEach(lDevice => {
    const desc = lDevice.getAttribute('desc');

    const lDeviceInst = `${lDevice.getAttribute('inst') ?? 'UNKNOWN_LDEVICE'}${
      desc ? ` (${desc})` : ''
    }`;

    const id = `LDevice: ${identity(lDevice)}`;
    tree[id] = lDeviceObject(lDevice);
    tree[id]!.text = lDeviceInst;
  });

  return tree;
}
