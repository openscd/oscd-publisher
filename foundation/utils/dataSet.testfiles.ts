export const orphanDataSet = `<DataSet name="someName"></DataSet>`;

export const validDataSet = `<LN0 lnClass="LLN0" inst="">
    <DataSet name="someName"></DataSet>
    <ReportControl name="rp1" datSet="someName"/>
    <GSEControl name="g1" datSet="someName"/>
    <GSEControl name="g2" datSet="someOtherName"/>
    <SampledValueControl name="sv1" datSet="someName"/>
</LN0>`;
