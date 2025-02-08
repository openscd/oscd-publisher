export const smvControlDoc = `
<SCL>
    <Communication>
        <SubNetwork name="subNet" >
            <ConnectedAP iedName="IED" apName="AP1" >
                <SMV ldInst="ldInst1" cbName="smv2" >
                    <Address>
                        <P type="MAC-Address">01-0C-CD-04-00-01</P>
                        <P type="APPID">4001</P>
                        <P type="VLAN-ID">001</P>
                        <P type="VLAN-PRIORITY">3</P>
                    </Address>
                </SMV>
                <SMV ldInst="ldInst1" cbName="smv3" >
                    <Address>
                        <P xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="tP_MAC" type="MAC-Address">01-0C-CD-04-00-02</P>
                        <P type="APPID">0002</P>
                    </Address>
                </SMV>
            </ConnectedAP>
        </SubNetwork>
    </Communication>
    <IED name="IED" >
        <Services>
            <ConfDataSet max="15" />
            <SMVsc max="15" />
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
                        <DataSet name="datSet2">
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Beh" daName="stVal" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Beh" daName="q" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Mod" daName="t" fc="ST" />
                        </DataSet>
                        <SampledValueControl name="smv1" multicast="false" smvID="" securityEnabled="Signature" smpMod="SmpPerSec" smpRate="4000" nofASDU="1" />
                        <SampledValueControl name="smv2" smvID="someSmvID" desc="SMV with SMV" datSet="datSet" smpMod="SmpPerPeriod" smpRate="80" nofASDU="1" confRev="43">
                            <SmvOpts refreshTime="true" sampleSynchronized="true" sampleRate="true" dataSet="true" security="true" timestamp="true" synchSourceId="true" />
                        </SampledValueControl>
                        <SampledValueControl name="smv3" smvID="someSmvID" desc="SMV with SMV" smpMod="SecPerSmp" smpRate="1" nofASDU="1"/>
                    </LN0>
                    <LN prefix="prefix" lnClass="MMXU" inst="1" lnType="MMXU" />
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
                        <SampledValueControl name="smv1" smvID="" securityEnabled="Signature" />
                        <SampledValueControl name="smv2" smvID="someSmvID" desc="SMV with SMV" datSet="datSet" />
                        <SampledValueControl name="smv3" smvID="someSmvID" desc="SMV with SMV" />
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

export const otherSmvControlDoc = `
<SCL>
    <Communication>
        <SubNetwork name="subNet" >
            <ConnectedAP iedName="IED" apName="AP1" >
                <SMV ldInst="ldInst1" cbName="smv2" >
                    <Address>
                        <P type="MAC-Address">01-0C-CD-04-00-01</P>
                        <P type="APPID">4001</P>
                        <P type="VLAN-ID">001</P>
                        <P type="VLAN-PRIORITY">3</P>
                    </Address>
                </SMV>
                <SMV ldInst="ldInst1" cbName="smv3" >
                    <Address>
                        <P xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="tP_MAC" type="MAC-Address">01-0C-CD-04-00-02</P>
                        <P type="APPID">0002</P>
                    </Address>
                </SMV>
            </ConnectedAP>
        </SubNetwork>
    </Communication>
    <IED name="IED" >
        <Services>
            <ConfDataSet max="15" />
            <SMVsc max="15" />
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
                        <DataSet name="datSet2">
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Beh" daName="stVal" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Beh" daName="q" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Mod" daName="t" fc="ST" />
                        </DataSet>
                        <SampledValueControl name="smv1" multicast="false" smvID="" securityEnabled="Signature" smpMod="SmpPerSec" smpRate="4000" nofASDU="1" />
                        <SampledValueControl name="smv3" smvID="someSmvID" desc="SMV with SMV" smpMod="SecPerSmp" smpRate="1" nofASDU="1"/>
                    </LN0>
                    <LN prefix="prefix" lnClass="MMXU" inst="1" lnType="MMXU" />
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
                        <SampledValueControl name="smv1" smvID="" securityEnabled="Signature" />
                        <SampledValueControl name="smv2" smvID="someSmvID" desc="SMV with SMV" datSet="datSet" />
                        <SampledValueControl name="smv3" smvID="someSmvID" desc="SMV with SMV" />
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

export const smvControlDocWithDescs = `
<SCL xmlns="http://www.iec.ch/61850/2003/SCL" version="2007" revision="B" release="4">
    <Header id="SMV with description" version="1" revision="1" toolID="OpenSCD, tada!" nameStructure="IEDName">
    </Header>
    <Communication>
        <SubNetwork name="subNet">
            <ConnectedAP iedName="IED" apName="AP1">
                <SMV ldInst="ldInst1" cbName="smv2">
                    <Address>
                        <P type="MAC-Address">01-0C-CD-04-00-01</P>
                        <P type="APPID">4001</P>
                        <P type="VLAN-ID">001</P>
                        <P type="VLAN-PRIORITY">3</P>
                    </Address>
                </SMV>
                <SMV ldInst="ldInst1" cbName="smv2">
                    <Address>
                        <P xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="tP_MAC" type="MAC-Address">01-0C-CD-04-00-02</P>
                        <P type="APPID">0002</P>
                    </Address>
                </SMV>
            </ConnectedAP>
        </SubNetwork>
    </Communication>
    <IED name="IED1">
        <AccessPoint name="AP1">
            <Server>
                <Authentication></Authentication>
                <LDevice inst="ldInst1" desc="Logical Device for SV">
                    <LN0 lnClass="LLN0" inst="" lnType="LLN0" desc="Some things">
                        <DataSet name="datSet">
                            <FCDA ldInst="ldInst1" lnClass="LLN0" doName="Beh" daName="stVal" fc="ST" />
                            <FCDA ldInst="ldInst1" lnClass="LLN0" doName="Beh" daName="q" fc="ST" />
                            <FCDA ldInst="ldInst1" lnClass="LLN0" doName="Mod" daName="t" fc="ST" />
                            <FCDA ldInst="ldInst1" lnClass="LLN0" doName="Mod" daName="t" fc="ST" />
                            <FCDA ldInst="ldInst1" lnClass="LLN0" doName="Mod" daName="t" fc="ST" />
                            <FCDA ldInst="ldInst1" prefix="prefix" lnInst="1" lnClass="MMXU" doName="PhV.phsA" daName="cVal" fc="ST" />
                        </DataSet>
                        <DOI name="Mod" desc="IEC 61850 test mode"></DOI>
                        <DOI name="Beh" desc="IEC 61850 test behaviour"></DOI>
                        <SampledValueControl name="smv2" smvID="someSmvID" desc="SMV with SMV" smpMod="SecPerSmp" smpRate="1" nofASDU="1" datSet="datSet">
                            <SmvOpts refreshTime="false" sampleSynchronized="true" sampleRate="false" dataSet="false" security="false" synchSourceId="true"/>
                        </SampledValueControl>
                    </LN0>
                    <LN prefix="prefix" lnClass="MMXU" inst="1" lnType="MMXU" desc="A measuring unit">
                        <DOI name="PhV" desc="Phase Voltages IXX terminal">
                            <SDI name="phsA" desc="Red phase"></SDI>
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
