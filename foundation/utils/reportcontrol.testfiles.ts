export const missingRptControl = `
<ReportControl name="someName">
    <TrgOps dchg="true" dupd="false" period="true"/>
    <OptFields seqNum="true" timeStamp="false" reasonCode="true" dataRef="false" configRef="true" bufOvfl="false"/>
</ReportControl>`;

export const existingRptControl = `
<ReportControl name="someName">
    <RptEnabled max="6" /> 
</ReportControl>`;
