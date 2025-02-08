export const fcdaDescriptions = `
<SCL xmlns="http://www.iec.ch/61850/2003/SCL" version="2007" revision="B" release="4">
    <Header id="ReportControl with description" version="1" revision="1" toolID="OpenSCD, tada!" nameStructure="IEDName">
    </Header>
    <IED name="IED">
        <Services>
            <ConfDataSet max="10" maxAttributes="10" />
        </Services>
        <AccessPoint name="AP1">
            <Server>
                <Authentication></Authentication>
                <LDevice inst="ldInst1" desc="First logical device">
                    <LN0 lnClass="LLN0" inst="" lnType="LLN0" desc="Configuration LN">
                        <DataSet name="datSet">
                            <FCDA ldInst="ldInst1" prefix="" lnClass="LLN0" doName="Beh" daName="stVal" fc="ST" />
                            <FCDA ldInst="ldInst1" prefix="" lnClass="LLN0" doName="Beh" daName="q" fc="ST" />
                            <FCDA ldInst="ldInst1" lnClass="LLN0" doName="Mod" daName="t" fc="ST" />
                            <FCDA ldInst="ldInst1" lnClass="LLN0" doName="Mod" daName="stVal" fc="ST" />
                            <FCDA ldInst="ldInst1" lnClass="LLN0" doName="Mod" daName="q" fc="ST" />
                            <FCDA ldInst="ldInst1" lnClass="LLN0" doName="Mod" daName="t" fc="ST" />
                            <FCDA ldInst="ldInst1" prefix="prefix" lnClass="MMXU" lnInst="1" doName="PhV.phsA" daName="cVal.mag.f" fc="MX" />
                            <FCDA ldInst="ldInst1" prefix="prefix" lnClass="MMXU" lnInst="1" doName="PhV.phsA" daName="q" fc="MX" />
                            <FCDA ldInst="ldInst1" prefix="prefix" lnClass="MMXU" lnInst="1" doName="PhV.phsA" daName="t" fc="MX" />
                            <FCDA ldInst="ldInst1" prefix="prefix" lnClass="MMXU" lnInst="1" doName="PhV.phsB" fc="MX" />
                            <FCDA ldInst="ldInst2" prefix="prefix" lnClass="MMXU" lnInst="2" doName="PhV.phsB" fc="MX" />
                            <FCDA ldInst="ldInst2" prefix="prefix" lnClass="MMXU" lnInst="2" doName="PhV.phsA.random" fc="MX" />
                            <FCDA ldInst="ldInst2" prefix="prefix" lnClass="MMXU" lnInst="7000" doName="PhV.phsA.random" fc="MX" />
                            <FCDA ldInst="ldInst2" prefix="prefix" lnClass="MMXU" lnInst="2" doName="BlahBlahBlah" fc="MX" />
                            <FCDA ldInst="ldInst2" prefix="prefix" lnClass="MMXU" lnInst="3" doName="PhV.phsA" daName="nothingreally" fc="MX" />
                            <FCDA ldInst="ldInst2" prefix="prefix" lnClass="MMXU" lnInst="3" doName="PhV.phsA" fc="MX" />
                            <FCDA ldInst="ldInst999" prefix="prefix" lnClass="MMXU" lnInst="3" doName="PhV.phsA" fc="MX" />
                            <FCDA ldInst="ldInst1" prefix="prefix" lnClass="MMXU" lnInst="1" doName="PhV.phsC" daName="cVal.mag.f" fc="MX" />
                        </DataSet>
                        <DOI name="Beh" desc="Behaviour">
                            <DAI name="stVal" desc="State"/>
                        </DOI>
                        <DOI name="Mod">
                            <DAI name="d">
                                <Val>Mode</Val>
                            </DAI>
                        </DOI>
                    </LN0>
                    <LN prefix="prefix" lnClass="MMXU" inst="1" lnType="MMXU" desc="Line">
                        <DOI name="PhV">
                            <SDI name="phsA">
                                <DAI name="d">
                                    <Val>Red Phase</Val>
                                </DAI>
                            </SDI>
                            <SDI name="phsB" desc="Phase B"></SDI>
                            <SDI name="phsC" desc="Phase C">
                                <SDI name="cVal" desc="complex value">
                                    <SDI name="mag" desc="magnitude">
                                        <DAI name="f" desc="fundamental" />
                                    </SDI>
                                </SDI>
                            </SDI>
                        </DOI>
                    </LN>
                </LDevice>
                <LDevice inst="ldInst2">
                    <LN prefix="prefix" lnClass="MMXU" inst="2" lnType="MMXU">
                        <DOI name="PhV">
                            <SDI name="phsA" desc="Phase A">
                                <SDI name="random" desc="Something">
                                </SDI>
                            </SDI>
                            <SDI name="phsB" desc="Phase B+">
                            </SDI>
                        </DOI>
                    </LN>
                    <LN prefix="prefix" lnClass="MMXU" inst="3" lnType="MMXU">
                    <DOI name="PhV">
                        <SDI name="phsA">                            
                        </SDI>
                    </DOI>
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
