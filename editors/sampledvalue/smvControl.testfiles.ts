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

export const otherGseControlDoc = `
<SCL>
    <Communication>
        <SubNetwork name="subNet" >
            <ConnectedAP iedName="IED" apName="AP1" >
                <GSE ldInst="ldInst1" cbName="gse2" >
                    <Address>
                        <P type="MAC-Address">01-0C-CD-01-00-01</P>
                        <P type="APPID">0001</P>
                        <P type="VLAN-ID">001</P>
                        <P type="VLAN-PRIORITY">3</P>
                    </Address>
                    <MinTime unit="s" multiplier="m">2</MinTime>
                    <MaxTime unit="s" multiplier="m">200</MaxTime>
                </GSE>
                <GSE ldInst="ldInst1" cbName="gse3" >
                    <Address>
                        <P xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="tP_MAC" type="MAC-Address">01-0C-CD-01-00-02</P>
                        <P type="APPID">0002</P>
                    </Address>
                </GSE>
            </ConnectedAP>
        </SubNetwork>
    </Communication>
    <IED name="IED" >
        <AccessPoint name="AP1">
            <Server>
                <LDevice inst="ldInst1">
                    <LN0 lnClass="LLN0" inst="" lnType="LLN0">
                        <DataSet name="datSet">
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Beh" daName="stVal" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Beh" daName="q" fc="ST" />
                            <FCDA ldInst="ldInst" prefix="prefix" lnClass="LLN0" doName="Mod" daName="t" fc="ST" />
                        </DataSet>
                        <GSEControl name="gse1" type="GSSE" appID="" securityEnabled="Signature" fixedOffs="true" />
                        <GSEControl name="gse3" type="GOOSE" appID="someAppID" desc="GOOSE with GSE" />
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
                        <GSEControl name="gse1" type="GSSE" appID="" securityEnabled="Signature" fixedOffs="true" />
                        <GSEControl name="gse3" type="GOOSE" appID="someAppID" desc="GOOSE with GSE" />
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
