import { SCLTag } from '../utils/scldata.js';

import {
  associationSelector,
  clientLNSelector,
  connectedAPSelector,
  controlBlockSelector,
  enumValSelector,
  extRefSelector,
  fCDASelector,
  hitemSelector,
  idNamingSelector,
  iEDNameSelector,
  ixNamingSelector,
  kDCSelector,
  lDeviceSelector,
  lNodeSelector,
  lNSelector,
  namingSelector,
  physConnSelector,
  protNsSelector,
  pSelector,
  sCLSelector,
  singletonSelector,
  terminalSelector,
  valSelector,
  voidSelector,
} from './selector.js';

type SelectorFunction = (tagName: SCLTag, identity: string) => string;

export const tags: Record<
  SCLTag,
  {
    selector: SelectorFunction;
  }
> = {
  AccessControl: {
    selector: singletonSelector,
  },
  AccessPoint: {
    selector: namingSelector,
  },
  Address: {
    selector: singletonSelector,
  },
  Association: {
    selector: associationSelector,
  },
  Authentication: {
    selector: singletonSelector,
  },
  BDA: {
    selector: namingSelector,
  },
  BitRate: {
    selector: singletonSelector,
  },
  Bay: {
    selector: namingSelector,
  },
  ClientLN: {
    selector: clientLNSelector,
  },
  ClientServices: {
    selector: singletonSelector,
  },
  CommProt: {
    selector: singletonSelector,
  },
  Communication: {
    selector: singletonSelector,
  },
  ConductingEquipment: {
    selector: namingSelector,
  },
  ConfDataSet: {
    selector: singletonSelector,
  },
  ConfLdName: {
    selector: singletonSelector,
  },
  ConfLNs: {
    selector: singletonSelector,
  },
  ConfLogControl: {
    selector: singletonSelector,
  },
  ConfReportControl: {
    selector: singletonSelector,
  },
  ConfSG: {
    selector: singletonSelector,
  },
  ConfSigRef: {
    selector: singletonSelector,
  },
  ConnectedAP: {
    selector: connectedAPSelector,
  },
  ConnectivityNode: {
    selector: namingSelector,
  },
  DA: {
    selector: namingSelector,
  },
  DAI: {
    selector: ixNamingSelector,
  },
  DAType: {
    selector: idNamingSelector,
  },
  DO: {
    selector: namingSelector,
  },
  DOI: {
    selector: namingSelector,
  },
  DOType: {
    selector: idNamingSelector,
  },
  DataObjectDirectory: {
    selector: singletonSelector,
  },
  DataSet: {
    selector: namingSelector,
  },
  DataSetDirectory: {
    selector: singletonSelector,
  },
  DataTypeTemplates: {
    selector: singletonSelector,
  },
  DynAssociation: {
    selector: singletonSelector,
  },
  DynDataSet: {
    selector: singletonSelector,
  },
  EnumType: {
    selector: idNamingSelector,
  },
  EnumVal: {
    selector: enumValSelector,
  },
  EqFunction: {
    selector: namingSelector,
  },
  EqSubFunction: {
    selector: namingSelector,
  },
  ExtRef: {
    selector: extRefSelector,
  },
  FCDA: {
    selector: fCDASelector,
  },
  FileHandling: {
    selector: singletonSelector,
  },
  Function: {
    selector: namingSelector,
  },
  GeneralEquipment: {
    selector: namingSelector,
  },
  GetCBValues: {
    selector: singletonSelector,
  },
  GetDataObjectDefinition: {
    selector: singletonSelector,
  },
  GetDataSetValue: {
    selector: singletonSelector,
  },
  GetDirectory: {
    selector: singletonSelector,
  },
  GOOSE: {
    selector: singletonSelector,
  },
  GOOSESecurity: {
    selector: namingSelector,
  },
  GSE: {
    selector: controlBlockSelector,
  },
  GSEDir: {
    selector: singletonSelector,
  },
  GSEControl: {
    selector: namingSelector,
  },
  GSESettings: {
    selector: singletonSelector,
  },
  GSSE: {
    selector: singletonSelector,
  },
  Header: {
    selector: singletonSelector,
  },
  History: {
    selector: singletonSelector,
  },
  Hitem: {
    selector: hitemSelector,
  },
  IED: {
    selector: namingSelector,
  },
  IEDName: {
    selector: iEDNameSelector,
  },
  Inputs: {
    selector: singletonSelector,
  },
  IssuerName: {
    selector: singletonSelector,
  },
  KDC: {
    selector: kDCSelector,
  },
  LDevice: {
    selector: lDeviceSelector,
  },
  LN: {
    selector: lNSelector,
  },
  LN0: {
    selector: singletonSelector,
  },
  LNode: {
    selector: lNodeSelector,
  },
  LNodeType: {
    selector: idNamingSelector,
  },
  Line: {
    selector: namingSelector,
  },
  Log: {
    selector: namingSelector,
  },
  LogControl: {
    selector: namingSelector,
  },
  LogSettings: {
    selector: singletonSelector,
  },
  MaxTime: {
    selector: singletonSelector,
  },
  McSecurity: {
    selector: singletonSelector,
  },
  MinTime: {
    selector: singletonSelector,
  },
  NeutralPoint: {
    selector: terminalSelector,
  },
  OptFields: {
    selector: singletonSelector,
  },
  P: {
    selector: pSelector,
  },
  PhysConn: {
    selector: physConnSelector,
  },
  PowerTransformer: {
    selector: namingSelector,
  },
  Private: {
    selector: () => voidSelector,
  },
  Process: {
    selector: namingSelector,
  },
  ProtNs: {
    selector: protNsSelector,
  },
  Protocol: {
    selector: singletonSelector,
  },
  ReadWrite: {
    selector: singletonSelector,
  },
  RedProt: {
    selector: singletonSelector,
  },
  ReportControl: {
    selector: namingSelector,
  },
  ReportSettings: {
    selector: singletonSelector,
  },
  RptEnabled: {
    selector: singletonSelector,
  },
  SamplesPerSec: {
    selector: singletonSelector,
  },
  SampledValueControl: {
    selector: namingSelector,
  },
  SecPerSamples: {
    selector: singletonSelector,
  },
  SCL: {
    selector: sCLSelector,
  },
  SDI: {
    selector: ixNamingSelector,
  },
  SDO: {
    selector: namingSelector,
  },
  Server: {
    selector: singletonSelector,
  },
  ServerAt: {
    selector: singletonSelector,
  },
  Services: {
    selector: singletonSelector,
  },
  SetDataSetValue: {
    selector: singletonSelector,
  },
  SettingControl: {
    selector: singletonSelector,
  },
  SettingGroups: {
    selector: singletonSelector,
  },
  SGEdit: {
    selector: singletonSelector,
  },
  SmpRate: {
    selector: singletonSelector,
  },
  SMV: {
    selector: controlBlockSelector,
  },
  SmvOpts: {
    selector: singletonSelector,
  },
  SMVsc: {
    selector: singletonSelector,
  },
  SMVSecurity: {
    selector: namingSelector,
  },
  SMVSettings: {
    selector: singletonSelector,
  },
  SubEquipment: {
    selector: namingSelector,
  },
  SubFunction: {
    selector: namingSelector,
  },
  SubNetwork: {
    selector: namingSelector,
  },
  Subject: {
    selector: singletonSelector,
  },
  Substation: {
    selector: namingSelector,
  },
  SupSubscription: {
    selector: singletonSelector,
  },
  TapChanger: {
    selector: namingSelector,
  },
  Terminal: {
    selector: terminalSelector,
  },
  Text: {
    selector: singletonSelector,
  },
  TimerActivatedControl: {
    selector: singletonSelector,
  },
  TimeSyncProt: {
    selector: singletonSelector,
  },
  TransformerWinding: {
    selector: namingSelector,
  },
  TrgOps: {
    selector: singletonSelector,
  },
  Val: {
    selector: valSelector,
  },
  ValueHandling: {
    selector: singletonSelector,
  },
  Voltage: {
    selector: singletonSelector,
  },
  VoltageLevel: {
    selector: namingSelector,
  },
};
