export function queryDataTypeLeaf(
  dataTypeTemplates: Element,
  lnType: string,
  doSegments: string[],
  daSegments: string[]
): Element | null {
  const lNodeType = dataTypeTemplates.querySelector(
    `LNodeType[id="${lnType}"]`
  );
  if (!lNodeType) {
    return null;
  }

  let leaf = lNodeType;

  for (const doSegement of doSegments) {
    const dataObject = leaf.querySelector(
      `DO[name="${doSegement}"], SDO[name="${doSegement}"]`
    );
    if (!dataObject) {
      return null;
    }

    const doType = dataObject.getAttribute('type');
    if (!doType) {
      return null;
    }

    const doTypeElement = dataTypeTemplates.querySelector(
      `DOType[id="${doType}"]`
    );
    if (!doTypeElement) {
      return null;
    }

    leaf = doTypeElement;
  }

  for (const [index, daSegment] of daSegments.entries()) {
    const dataAttribute = leaf.querySelector(
      `DA[name="${daSegment}"], BDA[name="${daSegment}"]`
    );
    if (!dataAttribute) {
      return null;
    }

    const isLastEntry = index === daSegments.length - 1;
    if (isLastEntry) {
      // Do not search for type, because last entry is a leaf node and should be basic type
      break;
    }

    const daType = dataAttribute.getAttribute('type');
    if (!daType) {
      return null;
    }

    const daTypeElement = dataTypeTemplates.querySelector(
      `DAType[id="${daType}"]`
    );
    if (!daTypeElement) {
      return null;
    }

    leaf = daTypeElement;
  }

  return leaf;
}

export function hasDataType(
  dataTypeTemplates: Element,
  lnType: string,
  doSegments: string[],
  daSegments: string[]
): boolean {
  const leaf = queryDataTypeLeaf(
    dataTypeTemplates,
    lnType,
    doSegments,
    daSegments
  );

  return Boolean(leaf);
}

export function queryLN(
  lDevice: Element,
  lnClass: string,
  inst: string,
  prefix: string | null
): Element | null {
  const ln0Query = `:scope > LN0[lnClass="${lnClass}"]`;
  let lnQuery = `:scope > LN[lnClass="${lnClass}"][inst="${inst}"]`;

  if (prefix) {
    lnQuery += `[prefix="${prefix}"]`;
  } else {
    lnQuery += `:not([prefix]), ${lnQuery}[prefix=""]`;
  }

  return lDevice.querySelector(`${ln0Query}, ${lnQuery}`);
}

export function queryLDevice(ied: Element, inst: string): Element | null {
  return ied.querySelector(
    `:scope > AccessPoint > Server > LDevice[inst="${inst}"]`
  );
}

export function isFCDACompatibleWithIED(fcda: Element, ied: Element): boolean {
  const ldInst = fcda.getAttribute('ldInst');
  const lnClass = fcda.getAttribute('lnClass');
  const prefix = fcda.getAttribute('prefix');
  const lnInst = fcda.getAttribute('lnInst');
  const doName = fcda.getAttribute('doName');
  const daName = fcda.getAttribute('daName');

  const daSegments = daName ? daName.split('.') : [];

  if (!ldInst || !lnClass || !doName || !lnInst) {
    return false;
  }

  const doSegments = doName.split('.');

  if (doSegments.length === 0) {
    return false;
  }

  const lDevice = queryLDevice(ied, ldInst);
  if (!lDevice) {
    return false;
  }

  const ln = queryLN(lDevice, lnClass, lnInst, prefix);
  if (!ln) {
    return false;
  }

  const lnType = ln.getAttribute('lnType');
  if (!lnType) {
    return false;
  }

  const dataTypeTemplates =
    ied.parentElement?.querySelector('DataTypeTemplates');
  if (!dataTypeTemplates) {
    return false;
  }

  return hasDataType(dataTypeTemplates, lnType, doSegments, daSegments);
}
