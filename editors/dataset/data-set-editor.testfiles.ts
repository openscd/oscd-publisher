export const dataSetDoc = `
<SCL>
    <IED name="IED" >
        <Services>
            <ConfDataSet max="10" maxAttributes="10" />
        </Services>
        <AccessPoint name="AP1">
            <Server>
                <LDevice inst="ldInst1">
                    <LN0 lnClass="LLN0" inst="" lnType="LLN0">
                        <DataSet name="datSet">
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Beh" daName="stVal" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Beh" daName="q" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Mod" daName="t" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Mod" daName="stVal" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Mod" daName="q" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Mod" daName="t" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="MMXU" lnInst="1" doName="PhV.phsA" daName="cVal.mag.f" fc="MX" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="MMXU" lnInst="1" doName="PhV.phsA" daName="q" fc="MX" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="MMXU" lnInst="1" doName="PhV.phsA" daName="t" fc="MX" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="MMXU" lnInst="1" doName="PhV.phsB" fc="MX" />
                        </DataSet>
                    </LN0>
                    <LN prefix="prefix" lnClass="MMXU" inst="1" lnType="MMXU" />
                </LDevice>
                <LDevice inst="ldInst2">
                    <LN0 lnClass="LLN0" inst="">
                        <DataSet name="datSet">
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Beh" daName="stVal" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Beh" daName="q" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Mod" daName="t" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Mod" daName="stVal" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Mod" daName="q" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Mod" daName="t" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="MMXU" lnInst="1" doName="PhV.phsA" daName="cVal.mag.f" fc="MX" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="MMXU" lnInst="1" doName="PhV.phsA" daName="q" fc="MX" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="MMXU" lnInst="1" doName="PhV.phsA" daName="t" fc="MX" />
                        </DataSet>
                    </LN0>
                </LDevice>
                <LDevice inst="ldInst3">
                    <LN0 lnClass="LLN0" inst="">
                        <DataSet name="datSet">
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Beh" daName="stVal" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Beh" daName="q" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Mod" daName="t" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Mod" daName="stVal" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Mod" daName="q" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Mod" daName="t" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="MMXU" lnInst="1" doName="PhV.phsA" daName="cVal.mag.f" fc="MX" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="MMXU" lnInst="1" doName="PhV.phsA" daName="q" fc="MX" />
                        </DataSet>
                    </LN0>
                </LDevice>
                <LDevice inst="ldInst4">
                    <LN0 lnClass="LLN0" inst="">
                        <DataSet name="datSet">
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Beh" daName="stVal" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Beh" daName="q" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Mod" daName="t" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Mod" daName="stVal" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Mod" daName="q" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Mod" daName="t" fc="ST" />
                        </DataSet>
                    </LN0>
                </LDevice>
                <LDevice inst="ldInst5">
                    <LN0 lnClass="LLN0" inst="">
                        <DataSet name="datSet">
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Beh" daName="stVal" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Beh" daName="q" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Mod" daName="t" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Mod" daName="stVal" fc="ST" />
                        </DataSet>
                    </LN0>
                </LDevice>
                <LDevice inst="ldInst6">
                    <LN0 lnClass="LLN0" inst="">
                        <DataSet name="datSet">
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Beh" daName="stVal" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Beh" daName="q" fc="ST" />
                        </DataSet>
                    </LN0>
                </LDevice>
                <LDevice inst="ldInst7">
                    <LN0 lnClass="LLN0" inst="">
                        <DataSet name="datSet">
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Beh" daName="stVal" fc="ST" />
                        </DataSet>
                    </LN0>
                </LDevice>
                <LDevice inst="ldInst8">
                    <LN0 lnClass="LLN0" inst="" lnType="LLN0">
                        <DataSet name="datSet">
                        </DataSet>
                    </LN0>
                </LDevice>
            </Server>
        </AccessPoint>
    </IED>
    <IED name="IED2" >
        <Services>
            <ConfDataSet max="10" maxAttributes="10" />
        </Services>
        <AccessPoint name="AP1">
            <Server>
                <LDevice inst="ldInst1">
                    <LN0 lnClass="LLN0" inst="" lnType="LLN0">
                        <DataSet name="datSet">
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Beh" daName="stVal" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Beh" daName="q" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Mod" daName="t" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Mod" daName="stVal" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Mod" daName="q" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Mod" daName="t" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="MMXU" lnInst="1" doName="PhV.phsA" daName="cVal.mag.f" fc="MX" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="MMXU" lnInst="1" doName="PhV.phsA" daName="q" fc="MX" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="MMXU" lnInst="1" doName="PhV.phsA" daName="t" fc="MX" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="MMXU" lnInst="1" doName="PhV.phsB" fc="MX" />
                        </DataSet>
                    </LN0>
                    <LN prefix="prefix" lnClass="MMXU" inst="1" lnType="MMXU" />
                </LDevice>
                <LDevice inst="ldInst2">
                    <LN0 lnClass="LLN0" inst="">
                        <DataSet name="datSet">
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Beh" daName="stVal" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Beh" daName="q" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Mod" daName="t" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Mod" daName="stVal" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Mod" daName="q" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Mod" daName="t" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="MMXU" lnInst="1" doName="PhV.phsA" daName="cVal.mag.f" fc="MX" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="MMXU" lnInst="1" doName="PhV.phsA" daName="q" fc="MX" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="MMXU" lnInst="1" doName="PhV.phsA" daName="t" fc="MX" />
                        </DataSet>
                    </LN0>
                </LDevice>
                <LDevice inst="ldInst3">
                    <LN0 lnClass="LLN0" inst="">
                        <DataSet name="datSet">
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Beh" daName="stVal" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Beh" daName="q" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Mod" daName="t" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Mod" daName="stVal" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Mod" daName="q" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Mod" daName="t" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="MMXU" lnInst="1" doName="PhV.phsA" daName="cVal.mag.f" fc="MX" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="MMXU" lnInst="1" doName="PhV.phsA" daName="q" fc="MX" />
                        </DataSet>
                    </LN0>
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

export const otherDataSetDoc = `
<SCL>
    <IED name="IED" >
        <Services>
            <ConfDataSet max="10" maxAttributes="10" />
        </Services>
        <AccessPoint name="AP1">
            <Server>
                <LDevice inst="ldInst1">
                    <LN0 lnClass="LLN0" inst="" lnType="LLN0">
                        <DataSet name="datSet">
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Beh" daName="stVal" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Beh" daName="q" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Mod" daName="t" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Mod" daName="stVal" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Mod" daName="q" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Mod" daName="t" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="MMXU" lnInst="1" doName="PhV.phsA" daName="cVal.mag.f" fc="MX" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="MMXU" lnInst="1" doName="PhV.phsA" daName="q" fc="MX" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="MMXU" lnInst="1" doName="PhV.phsA" daName="t" fc="MX" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="MMXU" lnInst="1" doName="PhV.phsB" fc="MX" />
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

export const dataSetDocWithDescs = `
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
                    <LN0 lnClass="LLN0" inst="" lnType="LLN0">
                        <DataSet name="datSet">
                            <FCDA ldInst="ldInst1" prefix="" lnClass="LLN0" doName="Beh" daName="stVal" fc="ST" />
                            <FCDA ldInst="ldInst1" prefix="" lnClass="LLN0" doName="Beh" daName="q" fc="ST" />
                            <FCDA ldInst="ldInst1" prefix="" lnClass="LLN0" doName="Mod" daName="t" fc="ST" />
                            <FCDA ldInst="ldInst1" prefix="" lnClass="LLN0" doName="Mod" daName="stVal" fc="ST" />
                            <FCDA ldInst="ldInst1" prefix="" lnClass="LLN0" doName="Mod" daName="q" fc="ST" />
                            <FCDA ldInst="ldInst1" prefix="" lnClass="LLN0" doName="Mod" daName="t" fc="ST" />
                            <FCDA ldInst="ldInst1" prefix="prefix" lnClass="MMXU" lnInst="1" doName="PhV.phsA" daName="cVal.mag.f" fc="MX" />
                            <FCDA ldInst="ldInst1" prefix="prefix" lnClass="MMXU" lnInst="1" doName="PhV.phsA" daName="q" fc="MX" />
                            <FCDA ldInst="ldInst1" prefix="prefix" lnClass="MMXU" lnInst="1" doName="PhV.phsA" daName="t" fc="MX" />
                            <FCDA ldInst="ldInst1" prefix="prefix" lnClass="MMXU" lnInst="1" doName="PhV.phsB" fc="MX" />
                        </DataSet>
                        <DOI name="Beh" desc="Behaviour"></DOI>
                        <DOI name="Mod">
                            <DAI name="d">
                                <Val>Mode</Val>
                            </DAI>

                        </DOI>
                    </LN0>
                    <LN prefix="prefix" lnClass="MMXU" inst="1" lnType="MMXU" desc="Line">
                        <DOI name="PhV" desc="Phase voltages">
                            <SDI name="phsA">
                                <SDI name="cVal" desc="complex value">
                                    <SDI name="mag" desc="magnitude">
                                        <DAI name="f" desc="fundamental" />
                                    </SDI>
                                </SDI>
                                <DAI name="d">
                                    <Val>Red Phase</Val>
                                </DAI>
                            </SDI>
                            <SDI name="phsB" desc="Phase B"></SDI>
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
