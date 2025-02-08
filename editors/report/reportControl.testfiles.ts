export const reportControlDoc = `
<SCL>
    <IED name="IED" >
        <Services>
            <ConfDataSet max="15" />
            <ConfReportControl max="15" />
        </Services>
        <AccessPoint name="AP1">
            <Server>
                <LDevice inst="ldInst1">
                    <LN0 lnClass="LLN0" inst="" lnType="LLN0">
                        <DataSet name="datSet">
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Beh" daName="stVal" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Beh" daName="q" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Mod" daName="t" fc="ST" />
                        </DataSet>
                        <ReportControl name="rp1" buffered="true" rptID="" />
                        <ReportControl name="rp2" buffered="true" datSet="datSet" intgPd="1000" bufTime="100" indexed="true" rptID="someID" desc="desc" confRev="53">
                            <TrgOps dchg="true" qchg="true" dupd="true" period="true" gi="true"/>
                            <OptFields seqNum="true" timeStamp="true" dataSet="true" reasonCode="true" dataRef="true" entryID="true" configRef="true" bufOvfl="true" />
                            <RptEnabled max="5" >
                            </RptEnabled>
                        </ReportControl>
                    </LN0>
                    <LN prefix="prefix" lnClass="MMXU" inst="1" lnType="MMXU">
                        <DataSet name="datSet">
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="MMXU" lnInst="1" doName="Phv.phsA" daName="cVal.mag.f" fc="MX" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="MMXU" lnInst="1" doName="Phv.phsA" daName="q" fc="MX" />
                        </DataSet>
                        <DataSet name="datSet2">
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Beh" daName="stVal" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Beh" daName="q" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Mod" daName="t" fc="ST" />
                        </DataSet>
                        <ReportControl name="rp3" />
                    </LN>
                </LDevice>
            </Server>
        </AccessPoint>
    </IED>
    <IED name="IED2" >
        <AccessPoint name="AP1">
            <Server>
                <LDevice inst="ldInst1">
                    <LN0 lnClass="LLN0" inst="" lnType="LLN0">
                        <DataSet name="datSet">
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Beh" daName="stVal" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Beh" daName="q" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Mod" daName="t" fc="ST" />
                        </DataSet>
                        <ReportControl name="rp1" buffered="true" rptID="" />
                        <ReportControl name="rp2" buffered="true" datSet="datSet" intgPd="1000" bufTime="100" indexed="true" rptID="someID" desc="desc" confRev="53">
                            <TrgOps dchg="true" qchg="true" dupd="true" period="true" gi="true"/>
                            <OptFields seqNum="true" timeStamp="true" dataSet="true" reasonCode="true" dataRef="true" entryID="true" configRef="true" bufOvfl="true" />
                            <RptEnabled max="5" >
                            </RptEnabled>
                        </ReportControl>
                    </LN0>
                    <LN prefix="prefix" lnClass="MMXU" inst="1" lnType="MMXU">
                        <DataSet name="datSet">
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="MMXU" lnInst="1" doName="Phv.phsA" daName="cVal.mag.f" fc="MX" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="MMXU" lnInst="1" doName="Phv.phsA" daName="q" fc="MX" />
                        </DataSet>
                        <ReportControl name="rp3" datSet="datSet" />
                        <ReportControl name="rp4" datSet="datSet">
                            <OptFields seqNum="true" timeStamp="true" dataSet="true" reasonCode="true" dataRef="true" entryID="true" configRef="true" bufOvfl="true" />
                        </ReportControl>
                    </LN>
                </LDevice>
            </Server>
        </AccessPoint>
    </IED>
    <DataTypeTemplates>
        <LNodeType lnClass="LLN0" id="LLN0">
            <DO name="Beh" type="ENS"/>
        </LNodeType>
        <LNodeType lnClass="MMXU" id="MMXU">
            <DO name="PhV" type="WYE"/>
        </LNodeType>
        <DOType cdc="ENS" id="ENS">
            <DA name="stVal" bType="Enum" fc="ST" />
            <DA name="q" bType="Quality" fc="ST" />
            <DA name="t" bType="Timestamp" fc="ST" />
            <DA name="dc" bType="VisString255" fc="DC" />
        </DOType>
        <DOType cdc="WYE" id="WYE">
            <SDO name="phsA" type="CMV" />
            <SDO name="phsB" type="CMV" />
            <SDO name="phsC" type="CMV" />
            <SDO name="phRes" type="CustomWYE" />
        </DOType>
        <DOType cdc="WYE" id="CustomWYE" >
            <SDO name="phsA" type="CMV" />
        </DOType>
        <DOType cdc="CMV" id="CMV">
            <DA name="cVal" bType="Struct" type="Vector" fc="MX"/>
            <DA name="q" bType="Quality" fc="MX" />
            <DA name="t" bType="Timestamp" fc="MX" />
            <DA name="d" bType="VisibleString255" fc="DC" />
        </DOType>
        <DAType id="Vector" >
            <BDA name="mag" bType="Struct" type="AnalogueValue" />
            <BDA name="ang" bType="Struct" type="AnalogueValue" />
        </DAType>
        <DAType id="AnalogueValue" >
            <BDA name="f" bType="FLOAT32" />
        </DAType>    
        </DataTypeTemplates>
</SCL>
`;

export const otherReportControlDoc = `
<SCL>
    <IED name="IED" >
        <Services>
            <ConfDataSet max="15" />
            <GOOSE max="15" />
        </Services>
        <AccessPoint name="AP1">
            <Server>
                <LDevice inst="ldInst1">
                    <LN0 lnClass="LLN0" inst="" lnType="LLN0">
                        <DataSet name="datSet">
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Beh" daName="stVal" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Beh" daName="q" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Mod" daName="t" fc="ST" />
                        </DataSet>
                        <ReportControl name="rp1" buffered="true" rptID="" />
                        <ReportControl name="rp3" buffered="true" datSet="datSet" intgPd="1000" bufTime="100" indexed="true" rptID="someID" desc="desc" confRev="53">
                            <TrgOps dchg="true" qchg="true" dupd="true" period="true" gi="true"/>
                            <OptFields seqNum="true" timeStamp="true" dataSet="true" reasonCode="true" dataRef="true" entryID="true" configRef="true" bufOvfl="true" />
                            <RptEnabled max="5" >
                            </RptEnabled>
                        </ReportControl>
                    </LN0>
                    <LN prefix="prefix" lnClass="MMXU" inst="1" lnType="MMXU">
                        <DataSet name="datSet">
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="MMXU" lnInst="1" doName="Phv.phsA" daName="cVal.mag.f" fc="MX" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="MMXU" lnInst="1" doName="Phv.phsA" daName="q" fc="MX" />
                        </DataSet>
                    </LN>
                </LDevice>
            </Server>
        </AccessPoint>
    </IED>
    <IED name="IED2" >
        <AccessPoint name="AP1">
            <Server>
                <LDevice inst="ldInst1">
                    <LN0 lnClass="LLN0" inst="" lnType="LLN0">
                        <DataSet name="datSet">
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Beh" daName="stVal" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Beh" daName="q" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Mod" daName="t" fc="ST" />
                        </DataSet>
                        <GSEControl name="pr1" rptID="" buffered="true" datSet="datSet" />
                        <GSEControl name="pr2" rptID="" buffered="false" datSet="datSet" />
                    </LN0>
                    <LN prefix="prefix" lnClass="MMXU" inst="1" lnType="MMXU" />
                </LDevice>
            </Server>
        </AccessPoint>
    </IED>
    <DataTypeTemplates>
        <LNodeType lnClass="LLN0" id="LLN0">
            <DO name="Beh" type="ENS"/>
        </LNodeType>
        <LNodeType lnClass="MMXU" id="MMXU">
            <DO name="PhV" type="WYE"/>
        </LNodeType>
        <DOType cdc="ENS" id="ENS">
            <DA name="stVal" bType="Enum" fc="ST" />
            <DA name="q" bType="Quality" fc="ST" />
            <DA name="t" bType="Timestamp" fc="ST" />
            <DA name="dc" bType="VisString255" fc="DC" />
        </DOType>
        <DOType cdc="WYE" id="WYE">
            <SDO name="phsA" type="CMV" />
            <SDO name="phsB" type="CMV" />
            <SDO name="phsC" type="CMV" />
            <SDO name="phRes" type="CustomWYE" />
        </DOType>
        <DOType cdc="WYE" id="CustomWYE" >
            <SDO name="phsA" type="CMV" />
        </DOType>
        <DOType cdc="CMV" id="CMV">
            <DA name="cVal" bType="Struct" type="Vector" fc="MX"/>
            <DA name="q" bType="Quality" fc="MX" />
            <DA name="t" bType="Timestamp" fc="MX" />
            <DA name="d" bType="VisibleString255" fc="DC" />
        </DOType>
        <DAType id="Vector" >
            <BDA name="mag" bType="Struct" type="AnalogueValue" />
            <BDA name="ang" bType="Struct" type="AnalogueValue" />
        </DAType>
        <DAType id="AnalogueValue" >
            <BDA name="f" bType="FLOAT32" />
        </DAType>    
        </DataTypeTemplates>
</SCL>
`;

export const reportControlDocWithDescs = `
<SCL xmlns="http://www.iec.ch/61850/2003/SCL" version="2007" revision="B" release="4">
    <Header id="ReportControl with description" version="1" revision="1" toolID="OpenSCD, tada!" nameStructure="IEDName">
    </Header>
    <IED name="IED">
        <Services>
            <ConfDataSet max="15" />
            <GOOSE max="15" />
        </Services>
        <AccessPoint name="AP1">
            <Server>
                <Authentication></Authentication>
                <LDevice inst="ldInst1" desc="Control">
                    <LN0 lnClass="LLN0" inst="" lnType="LLN0" desc="">
                        <DataSet name="datSet">
                            <FCDA ldInst="ldInst1" prefix="" lnClass="LLN0" doName="Beh" daName="stVal" fc="ST" />
                            <FCDA ldInst="ldInst1" prefix="" lnClass="LLN0" doName="Beh" daName="q" fc="ST" />
                            <FCDA ldInst="ldInst1" prefix="" lnClass="LLN0" doName="Mod" daName="t" fc="ST" />
                        </DataSet>
                        <ReportControl name="rp3" buffered="true" datSet="datSet" intgPd="1000" bufTime="100" indexed="true" rptID="someID" desc="desc" confRev="53">
                            <TrgOps dchg="true" qchg="true" dupd="true" period="true" gi="true"/>
                            <OptFields seqNum="true" timeStamp="true" dataSet="true" reasonCode="true" dataRef="true" entryID="true" configRef="true" bufOvfl="true" />
                            <RptEnabled max="5">
                            </RptEnabled>
                        </ReportControl>
                        <DOI name="Beh">
                            <DAI name="d">
                                <Val>Behaviour of IEC 61850 Test Mode</Val>
                            </DAI>
                        </DOI>
                        <DOI name="Mod" desc="Preferred description, just the Mode thanks">
                            <DAI name="d">
                                <Val>Mode of IEC 61850 Test Mode - not actually used</Val>
                            </DAI>
                        </DOI>
                    </LN0>
                    <LN prefix="prefix" lnClass="MMXU" inst="1" lnType="MMXU">
                        <DataSet name="datSet">
                            <FCDA ldInst="ldInst1" prefix="prefix" lnClass="MMXU" lnInst="1" doName="PhV.phsA" daName="cVal.mag.f" fc="MX" />
                            <FCDA ldInst="ldInst1" prefix="prefix" lnClass="MMXU" lnInst="1" doName="PhV.phsA" daName="q" fc="MX" />
                        </DataSet>
                    </LN>
                </LDevice>
            </Server>
        </AccessPoint>
    </IED>
    <IED name="IED2">
        <AccessPoint name="AP1">
            <Server>
                <Authentication></Authentication>
                <LDevice inst="ldInst1">
                    <LN0 lnClass="LLN0" inst="" lnType="LLN0" desc="A happy LN0">
                        <DataSet name="datSet">
                            <FCDA ldInst="ldInst1" prefix="" lnClass="LLN0" doName="Beh" daName="stVal" fc="ST" />
                            <FCDA ldInst="ldInst1" prefix="" lnClass="LLN0" doName="Beh" daName="q" fc="ST" />
                            <FCDA ldInst="ldInst1" prefix="" lnClass="LLN0" doName="Mod" daName="t" fc="ST" />
                        </DataSet>
                    </LN0>
                    <LN prefix="prefix" lnClass="MMXU" inst="1" lnType="MMXU" />
                </LDevice>
            </Server>
        </AccessPoint>
    </IED>
    <DataTypeTemplates>
        <LNodeType lnClass="LLN0" id="LLN0">
            <DO name="Beh" type="ENS"/>
        </LNodeType>
        <LNodeType lnClass="MMXU" id="MMXU">
            <DO name="PhV" type="WYE"/>
        </LNodeType>
        <DOType cdc="ENS" id="ENS">
            <DA name="stVal" bType="Enum" fc="ST" />
            <DA name="q" bType="Quality" fc="ST" />
            <DA name="t" bType="Timestamp" fc="ST" />
            <DA name="dc" bType="VisString255" fc="DC" />
        </DOType>
        <DOType cdc="WYE" id="WYE">
            <SDO name="phsA" type="CMV" />
            <SDO name="phsB" type="CMV" />
            <SDO name="phsC" type="CMV" />
            <SDO name="phRes" type="CustomWYE" />
        </DOType>
        <DOType cdc="WYE" id="CustomWYE">
            <SDO name="phsA" type="CMV" />
        </DOType>
        <DOType cdc="CMV" id="CMV">
            <DA name="cVal" bType="Struct" type="Vector" fc="MX"/>
            <DA name="q" bType="Quality" fc="MX" />
            <DA name="t" bType="Timestamp" fc="MX" />
            <DA name="d" bType="VisString255" fc="DC" />
        </DOType>
        <DAType id="Vector">
            <BDA name="mag" bType="Struct" type="AnalogueValue" />
            <BDA name="ang" bType="Struct" type="AnalogueValue" />
        </DAType>
        <DAType id="AnalogueValue">
            <BDA name="f" bType="FLOAT32" />
        </DAType>
    </DataTypeTemplates>
</SCL>
`;
