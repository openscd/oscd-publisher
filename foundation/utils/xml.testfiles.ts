export const iedWithLDevice = `
  <IED>
    <AccessPoint>
      <Server>
        <LDevice inst="someOtherLDInst" />
        <LDevice inst="someLDInst" />
      </Server>
    </AccessPoint>
  </IED>
`;

export const copyControlDoc = `
<SCL xmlns="http://www.iec.ch/61850/2003/SCL" version="2007" revision="B" release="4" xmlns:esld="https://transpower.co.nz/SCL/SSD/SLD/v0">
	<Header id="CopyDS"/>
	<IED name="ToBeCopied" >
		<AccessPoint name="AP1">
			<Server>
				<LDevice inst="LD1">
					<LN0 lnClass="LLN0" inst="" lnType="unimportant" id="ToBeCopied_LN0">
						<DataSet name="datSet" >
							<FCDA ldInst="LD1" prefix="" lnClass="MMXU" lnInst="1" doName="A.phsA" daName="cVal.ang.f" fc="MX" />
							<FCDA ldInst="LD1" prefix="" lnClass="MMXU" lnInst="1" doName="A.phsA" daName="q" fc="MX" />
							<FCDA ldInst="LD1" prefix="" lnClass="MMXU" lnInst="1" doName="A.phsA" daName="t" fc="MX" />
							<FCDA ldInst="LD1" prefix="" lnClass="CILO" lnInst="1" doName="EnaOpn" daName="blkEna" fc="BL" />
							<FCDA ldInst="LD1" prefix="" lnClass="CILO" lnInst="1" doName="EnaOpn" fc="ST" />
						</DataSet>
						<GSEControl name="gse" type="GOOSE" datSet="datSet"/>
						<SampledValueControl name="smv" datSet="datSet"/>
					</LN0>
					<LN prefix="CBHost" lnClass="CILO" inst="1" lnType="CILO$oscd$_eb5ec6bb69650d07" id="ToBeCopied_CBHost1">
						<DataSet name="datSet" >
							<FCDA ldInst="LD1" prefix="" lnClass="MMXU" lnInst="1" doName="A.phsA" daName="cVal.ang.f" fc="MX" />
							<FCDA ldInst="LD1" prefix="" lnClass="MMXU" lnInst="1" doName="A.phsA" daName="q" fc="MX" />
							<FCDA ldInst="LD1" prefix="" lnClass="MMXU" lnInst="1" doName="A.phsA" daName="t" fc="MX" />
							<FCDA ldInst="LD1" prefix="" lnClass="CILO" lnInst="1" doName="EnaOpn" daName="blkEna" fc="BL" />
							<FCDA ldInst="LD1" prefix="" lnClass="CILO" lnInst="1" doName="EnaOpn" fc="ST" />
						</DataSet>
						<ReportControl name="rp" datSet="datSet"/>
					</LN>
					<LN lnClass="MMXU" inst="1" lnType="MMXU$oscd$_bcec88edb16399a2" id="ToBeCopied_MMXU"/>
					<LN prefix="" lnClass="CILO" inst="1" lnType="CILO$oscd$_eb5ec6bb69650d07"/>
				</LDevice>
			</Server>
		</AccessPoint>
	</IED>
	<IED name="ToCopieTo1" desc="Incorrect Parent1">
		<AccessPoint name="AP1">
			<Server>
				<LDevice inst="LD2">
					<LN0 lnClass="LLN0" inst="" lnType="unimportant" />
				</LDevice>
			</Server>
		</AccessPoint>
	</IED>
	<IED name="ToCopieTo2" desc="Incorrect Parent2">
		<AccessPoint name="AP1">
			<Server>
				<LDevice inst="LD1">
					<LN prefix="CBHost" lnClass="CILO" inst="1" lnType="CILO$oscd$_eb5ec6bb69650d07" />
					<LN lnClass="MMXU" inst="1" lnType="MMXU$oscd$_bcec88edb16399a2"/>
					<LN prefix="" lnClass="CILO" inst="1" lnType="CILO$oscd$_eb5ec6bb69650d07"/>
				</LDevice>
			</Server>
		</AccessPoint>
	</IED>
	<IED name="ToCopieTo3" >
		<AccessPoint name="AP1">
			<Server>
				<LDevice inst="LD1">
					<LN0 lnClass="LLN0" inst="" lnType="unimportant" />
					<LN prefix="CBHost" lnClass="CILO" inst="2" lnType="CILO$oscd$_eb5ec6bb69650d07" />
					<LN lnClass="MMXU" inst="1" lnType="MMXU$oscd$_bcec88edb16399a2"/>
					<LN prefix="" lnClass="CILO" inst="1" lnType="CILO$oscd$_eb5ec6bb69650d07"/>
				</LDevice>
			</Server>
		</AccessPoint>
	</IED>
	<IED name="ToCopieTo4" desc="Missing Data Points1">
		<AccessPoint name="AP1">
			<Server>
				<LDevice inst="LD1">
					<LN0 lnClass="LLN0" inst="" lnType="unimportant" />
					<LN prefix="CBHost" lnClass="CILO" inst="1" lnType="CILO$oscd$_eb5ec6bb69650d07" />
					<LN lnClass="MMXU" inst="1" lnType="MMXU$oscd$_8046c36011040649"/>
					<LN prefix="" lnClass="CILO" inst="1" lnType="CILO$oscd$_eb5ec6bb69650d07"/>
				</LDevice>
			</Server>
		</AccessPoint>
	</IED>
	<IED name="ToCopieTo5" desc="Missing Data Points2">
		<AccessPoint name="AP1">
			<Server>
				<LDevice inst="LD1">
					<LN0 lnClass="LLN0" inst="" lnType="unimportant" />
					<LN prefix="CBHost" lnClass="CILO" inst="1" lnType="CILO$oscd$_eb5ec6bb69650d07" />
					<LN lnClass="MMXU" inst="1" lnType="MMXU$oscd$_bcec88edb16399a2"/>
					<LN prefix="" lnClass="CILO" inst="1" lnType="CILO$oscd$_aa7ec79ef27309b1"/>
				</LDevice>
			</Server>
		</AccessPoint>
	</IED>
	<IED name="ToCopieTo6" desc="Existing CB">
		<AccessPoint name="AP1">
			<Server>
				<LDevice inst="LD1">
					<LN0 lnClass="LLN0" inst="" lnType="unimportant">
						<GSEControl name="gse" />
						<SampledValueControl name="smv" />
					</LN0>
					<LN prefix="CBHost" lnClass="CILO" inst="1" lnType="CILO$oscd$_eb5ec6bb69650d07">
						<ReportControl name="rp" />
					</LN>
					<LN lnClass="MMXU" inst="1" lnType="MMXU$oscd$_bcec88edb16399a2"/>
					<LN prefix="" lnClass="CILO" inst="1" lnType="CILO$oscd$_eb5ec6bb69650d07"/>
				</LDevice>
			</Server>
		</AccessPoint>
	</IED>
	<IED name="ToCopieTo7" desc="Existing CB">
		<AccessPoint name="AP1">
			<Server>
				<LDevice inst="LD1">
					<LN0 lnClass="LLN0" inst="" lnType="unimportant">
						<DataSet name="datSet" />
					</LN0>
					<LN prefix="CBHost" lnClass="CILO" inst="1" lnType="CILO$oscd$_eb5ec6bb69650d07">
						<DataSet name="datSet" />
					</LN>
					<LN lnClass="MMXU" inst="1" lnType="MMXU$oscd$_bcec88edb16399a2"/>
					<LN prefix="" lnClass="CILO" inst="1" lnType="CILO$oscd$_eb5ec6bb69650d07"/>
				</LDevice>
			</Server>
		</AccessPoint>
	</IED>
	<IED name="ToCopieTo8" >
		<AccessPoint name="AP1">
			<Server>
				<LDevice inst="LD1">
					<LN0 lnClass="LLN0" inst="" lnType="unimportant" />
					<LN prefix="CBHost" lnClass="CILO" inst="1" lnType="CILO$oscd$_eb5ec6bb69650d07" />
					<LN lnClass="MMXU" inst="1" lnType="MMXU$oscd$_bcec88edb16399a2"/>
					<LN prefix="" lnClass="CILO" inst="1" lnType="CILO$oscd$_eb5ec6bb69650d07"/>
				</LDevice>
			</Server>
		</AccessPoint>
	</IED>
	<DataTypeTemplates>
		<LNodeType lnClass="CILO" id="CILO$oscd$_aa7ec79ef27309b1" desc="woBlockEna">
			<DO name="Beh" type="Beh$oscd$_c6ed035c8137b35a"/>
			<DO name="EnaCls" type="EnaCls$oscd$_d915d66d9e42a575"/>
			<DO name="EnaOpn" type="EnaOpn$oscd$_d915d66d9e42a575"/>
		</LNodeType>
		<LNodeType lnClass="CILO" id="CILO$oscd$_eb5ec6bb69650d07">
			<DO name="Beh" type="Beh$oscd$_c6ed035c8137b35a"/>
			<DO name="EnaCls" type="EnaCls$oscd$_d915d66d9e42a575"/>
			<DO name="EnaOpn" type="EnaOpn$oscd$_55462dcb3eb76dd6"/>
		</LNodeType>
		<LNodeType lnClass="MMXU" id="MMXU$oscd$_bcec88edb16399a2" desc="wAng">
			<DO name="Beh" type="Beh$oscd$_c6ed035c8137b35a"/>
			<DO name="A" type="A$oscd$_94900320e0ade7f4"/>
		</LNodeType>
		<LNodeType lnClass="MMXU" id="MMXU$oscd$_8046c36011040649">
			<DO name="Beh" type="Beh$oscd$_c6ed035c8137b35a"/>
			<DO name="A" type="A$oscd$_77cd469bb496bbab"/>
		</LNodeType>
		<DOType cdc="SPS" id="EnaOpn$oscd$_d915d66d9e42a575">
			<DA name="stVal" fc="ST" dchg="true" bType="BOOLEAN"/>
			<DA name="q" fc="ST" qchg="true" bType="Quality"/>
			<DA name="t" fc="ST" bType="Timestamp"/>
		</DOType>
		<DOType cdc="SPS" id="EnaCls$oscd$_d915d66d9e42a575">
			<DA name="stVal" fc="ST" dchg="true" bType="BOOLEAN"/>
			<DA name="q" fc="ST" qchg="true" bType="Quality"/>
			<DA name="t" fc="ST" bType="Timestamp"/>
		</DOType>
		<DOType cdc="SPS" id="EnaOpn$oscd$_55462dcb3eb76dd6">
			<DA name="stVal" fc="ST" dchg="true" bType="BOOLEAN"/>
			<DA name="q" fc="ST" qchg="true" bType="Quality"/>
			<DA name="t" fc="ST" bType="Timestamp"/>
			<DA name="blkEna" fc="BL" bType="BOOLEAN"/>
		</DOType>
		<DOType cdc="CMV" id="phsA$oscd$_c63a8f4457479fb7">
			<DA name="cVal" fc="MX" dchg="true" dupd="true" bType="Struct" type="cVal$oscd$_21f679e08734a896"/>
			<DA name="q" fc="MX" qchg="true" bType="Quality"/>
			<DA name="t" fc="MX" bType="Timestamp"/>
		</DOType>
		<DOType cdc="WYE" id="A$oscd$_94900320e0ade7f4">
			<SDO name="phsA" type="phsA$oscd$_c63a8f4457479fb7"/>
		</DOType>
		<DOType cdc="ENS" id="Beh$oscd$_c6ed035c8137b35a">
			<DA name="stVal" fc="ST" dchg="true" dupd="true" bType="Enum" type="stVal$oscd$_48ba16345b8e7f5b"/>
			<DA name="q" fc="ST" qchg="true" bType="Quality"/>
			<DA name="t" fc="ST" bType="Timestamp"/>
		</DOType>
		<DOType cdc="CMV" id="phsA$oscd$_65ee65af9248ae5d">
			<DA name="cVal" fc="MX" dchg="true" dupd="true" bType="Struct" type="cVal$oscd$_80272042468595d1"/>
			<DA name="q" fc="MX" qchg="true" bType="Quality"/>
			<DA name="t" fc="MX" bType="Timestamp"/>
		</DOType>
		<DOType cdc="WYE" id="A$oscd$_77cd469bb496bbab">
			<SDO name="phsA" type="phsA$oscd$_65ee65af9248ae5d"/>
		</DOType>
		<DAType id="ang$oscd$_ed49c2f7a55ad05a">
			<BDA name="f" bType="FLOAT32"/>
		</DAType>
		<DAType id="cVal$oscd$_21f679e08734a896">
			<BDA name="mag" bType="Struct" type="mag$oscd$_ed49c2f7a55ad05a"/>
			<BDA name="ang" bType="Struct" type="ang$oscd$_ed49c2f7a55ad05a"/>
		</DAType>
		<DAType id="mag$oscd$_ed49c2f7a55ad05a">
			<BDA name="f" bType="FLOAT32"/>
		</DAType>
		<DAType id="cVal$oscd$_80272042468595d1">
			<BDA name="mag" bType="Struct" type="mag$oscd$_ed49c2f7a55ad05a"/>
		</DAType>
		<EnumType id="stVal$oscd$_48ba16345b8e7f5b">
			<EnumVal ord="1">on</EnumVal>
			<EnumVal ord="2">blocked</EnumVal>
			<EnumVal ord="3">test</EnumVal>
			<EnumVal ord="4">test/blocked</EnumVal>
			<EnumVal ord="5">off</EnumVal>
		</EnumType>
	</DataTypeTemplates>
</SCL>
`;
