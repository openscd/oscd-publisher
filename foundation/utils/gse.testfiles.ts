export const woInstType = `
<GSE ldInst="ldInst" cbName="cbName">
<Address>
    <P type="MAC-Address">01-0C-CD-01-00-03</P>
    <P type="APPID">0004</P>
    <P type="VLAN-ID">000</P>
    <P type="VLAN-PRIORITY">4</P>
</Address>
<MinTime unit="s" multiplier="m">8</MinTime>
<MaxTime unit="s" multiplier="m">4096</MaxTime>
</GSE>`;

export const withInstType = `
<GSE ldInst="ldInst" cbName="cbName">
<Address>
    <P xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="tP_MAC-Address" type="MAC-Address">01-0C-CD-01-00-03</P>
    <P xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="tP_APPID" type="APPID">0004</P>
    <P xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="tP_VLAN-ID" type="VLAN-ID">000</P>
    <P xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="tP_VLAN-PRIORITY" type="VLAN-PRIORITY">4</P>
</Address>
<MinTime unit="s" multiplier="m">8</MinTime>
<MaxTime unit="s" multiplier="m">4096</MaxTime>
</GSE>`;

export const partlyInstType = `
<GSE ldInst="ldInst" cbName="cbName">
<Address>
    <P type="MAC-Address">01-0C-CD-01-00-03</P>
    <P xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="tP_APPID" type="APPID">0004</P>
    <P type="VLAN-ID">000</P>
    <P xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="tP_VLAN-PRIORITY" type="VLAN-PRIORITY">4</P>
</Address>
<MinTime unit="s" multiplier="m">8</MinTime>
<MaxTime unit="s" multiplier="m">4096</MaxTime>
</GSE>`;

export const nulledGSE = `
<GSE ldInst="ldInst" cbName="cbName">
</GSE>`;
