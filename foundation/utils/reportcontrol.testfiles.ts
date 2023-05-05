export const missingRptControl = `
<ReportControl name="someName">
    <TrgOps dchg="true" dupd="false" period="true"/>
    <OptFields seqNum="true" timeStamp="false" reasonCode="true" dataRef="false" configRef="true" bufOvfl="false"/>
</ReportControl>`;

export const existingRptControl = `
<ReportControl name="someName">
    <RptEnabled max="6" /> 
</ReportControl>`;

export const subscribedReport = `
<SCL version="2007">
<IED name="sinkIED">
    <AccessPoint name="someAP">
        <Server>
            <LDevice inst="someLDevice">
                <LN0 lnClass="LLN0" inst="" lnType="someLnType">
                    <Inputs desc="GSE">
                        <ExtRef 
                            iedName="srcIED" 
                            ldInst="someLDInst" 
                            lnClass="LLN0" 
                            doName="Op" 
                            daName="general"
                            srcLDInst="someLDInst"
                            srcLNClass="LLN0"
                            srcCBName="someReport"
                            serviceType="Report" />
                        <ExtRef 
                            iedName="srcIED" 
                            ldInst="someLDInst" 
                            lnClass="LLN0" 
                            doName="Op" 
                            daName="q"
                            srcLDInst="someLDInst"
                            srcLNClass="LLN0"
                            srcLNInst=""
                            srcCBName="someReport"
                            serviceType="Report" />
                    </Inputs>
                </LN0>
            </LDevice>
        </Server>
    </AccessPoint>
</IED>
<IED name="srcIED">
    <AccessPoint name="someAP">
        <Server>
            <LDevice inst="someLDInst">
                <LN0 lnClass="LLN0" inst="" lnType="someLnType">
                    <DataSet name="rptDataSet">
                        <FCDA 
                            ldInst="someLDInst" 
                            prefix="" 
                            lnClass="LLN0" 
                            lnInst="" 
                            doName="Op" 
                            daName="general" 
                            fc="ST" />
                        <FCDA 
                            ldInst="someLDInst" 
                            prefix="" 
                            lnClass="LLN0" 
                            lnInst="" 
                            doName="Op" 
                            daName="q" 
                            fc="ST" />
                        <FCDA 
                            ldInst="someLDInst" 
                            lnClass="LLN0" 
                            doName="Beh" 
                            daName="stVal" 
                            fc="ST" />
                        <FCDA 
                            ldInst="someLDInst" 
                            prefix="" 
                            lnClass="LLN0" 
                            lnInst="" 
                            doName="Beh" 
                            daName="q" 
                            fc="ST" />
                    </DataSet>
                    <ReportControl name="someReport" datSet="rptDataSet" confRev="10001"/>
                </LN0>
            </LDevice>
        </Server>
    </AccessPoint>
</IED>
<DataTypeTemplates>
    <LNodeType id="someLGOSType" lnClass="LGOS">
        <DO name="GoCBRef" type="someGseORG"/>
    </LNodeType>
    <LNodeType id="someLSVSType" lnClass="LSVS">
        <DO name="SvCBRef" type="someSmvORG"/>
    </LNodeType>
    <DOType cdc="ORG" id="someGseORG">
        <DA name="setSrcRef" valImport="true" valKind="RO" />
    </DOType>
    <DOType cdc="ORG" id="someSmvORG">
        <DA name="setSrcRef" />
    </DOType>
</DataTypeTemplates>
</SCL>`;
