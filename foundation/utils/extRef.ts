const serviceType: Partial<Record<string, string>> = {
  GSEControl: 'GOOSE',
  SampledValueControl: 'SMV',
  ReportControl: 'Report',
};

/** @returns Whether src... type ExtRef attributes match */
export function matchExtRefCtrlBlockAttr(
  extRef: Element,
  ctrlBlock: Element
): boolean {
  const cbName = ctrlBlock.getAttribute('name');
  const srcLDInst = ctrlBlock.closest('LDevice')?.getAttribute('inst');
  const srcPrefix = ctrlBlock.closest('LN0, LN')?.getAttribute('prefix') ?? '';
  const srcLNClass = ctrlBlock.closest('LN0, LN')?.getAttribute('lnClass');
  const srcLNInst = ctrlBlock.closest('LN0, LN')?.getAttribute('inst');

  return (
    extRef.getAttribute('srcCBName') === cbName &&
    extRef.getAttribute('srcLDInst') === srcLDInst &&
    (extRef.getAttribute('srcPrefix') ?? '') === srcPrefix &&
    (extRef.getAttribute('srcLNInst') ?? '') === srcLNInst &&
    extRef.getAttribute('srcLNClass') === srcLNClass &&
    extRef.getAttribute('serviceType') === serviceType[ctrlBlock.tagName]
  );
}
