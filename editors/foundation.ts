import { html, TemplateResult } from 'lit';

import { identity } from '../foundation/identities/identity.js';
import { selector } from '../foundation/identities/selector.js';

type Path = string[];

interface Directory {
  path: Path;
  header?: TemplateResult;
  entries: string[];
}

export function getDisplayString(entry: string): string {
  if (entry.startsWith('IED:')) return entry.replace(/^.*:/, '').trim();
  if (entry.startsWith('LN0:')) return 'LLN0';
  return entry.replace(/^.*>/, '').trim();
}

export function getDataAttributeChildren(parent: Element): Element[] {
  if (['LDevice', 'Server'].includes(parent.tagName))
    return Array.from(parent.children).filter(
      child =>
        child.tagName === 'LDevice' ||
        child.tagName === 'LN0' ||
        child.tagName === 'LN'
    );

  const id =
    parent.tagName === 'LN' || parent.tagName === 'LN0'
      ? parent.getAttribute('lnType')
      : parent.getAttribute('type');

  return Array.from(
    parent.ownerDocument.querySelectorAll(
      `LNodeType[id="${id}"] > DO, DOType[id="${id}"] > SDO, DOType[id="${id}"] > DA, DAType[id="${id}"] > BDA`
    )
  );
}

export function getDataObjectChildren(parent: Element): (Element | string)[] {
  if (['LDevice', 'Server'].includes(parent.tagName))
    return Array.from(parent.children).filter(
      child =>
        child.tagName === 'LDevice' ||
        child.tagName === 'LN0' ||
        child.tagName === 'LN'
    );

  const id =
    parent.tagName === 'LN' || parent.tagName === 'LN0'
      ? parent.getAttribute('lnType')
      : parent.getAttribute('type');

  const dOs = Array.from(
    parent.ownerDocument.querySelectorAll(
      `LNodeType[id="${id}"] > DO, DOType[id="${id}"] > SDO`
    )
  );

  const fCs = new Set<string>();
  Array.from(
    parent.ownerDocument.querySelectorAll(`DOType[id="${id}"] > DA`)
  ).forEach(da => {
    fCs.add(da.getAttribute('fc')!);
  });
  const fcArr: string[] = Array.from(fCs);

  const out: (Element | string)[] = [];
  return out.concat(dOs, fcArr);
}

export function getReader(
  doc: Document,
  getChildren: (element: Element) => (Element | string)[]
): (path: string[]) => Promise<Directory> {
  return async (path: string[]) => {
    // eslint-disable-next-line no-unsafe-optional-chaining
    const [tagName, id] = path[path.length - 1]?.split(': ', 2);
    const element = doc.querySelector(selector(tagName, id));
    if (tagName === 'FC') return { path, header: undefined, entries: [] };

    if (!element) return { path, header: html`<p>error</p>`, entries: [] };

    return {
      path,
      header: undefined,
      entries: getChildren(element).map(child => {
        if (typeof child === 'string') return `FC: ${child}`;
        return `${child.tagName}: ${identity(child)}`;
      }),
    };
  };
}
