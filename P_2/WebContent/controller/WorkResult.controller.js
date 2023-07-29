sap.ui.define([
               "sap/ui/base/Object",
               "sap/ui/model/json/JSONModel",
               "sap/ui/model/Filter",
               "sap/ui/model/FilterOperator",
               "sap/m/MessageBox",
               "sap/m/MessageToast",
               "cj/pm0101/util/ValueHelpHelper",
               "cj/pm0101/util/utils",
               "cj/pm0101/model/formatter",
               "cj/pm0101/util/Catalog",
               ], function (Object, JSONModel, Filter, FilterOperator, Message, Toast, ValueHelpHelper, utils, formatter, Catalog) {
	"use strict";

	return Object.extend("cj.pm0101.controller.WorkResult", {
 
		constructor : function (oView) {
			this.oMain = oView;
		},

		createHandler : function(oDialog, MainParam, wrMain){
			this.oDialog = oDialog;

			this.oMainParam = MainParam;
			this.wrMain     = wrMain;

			this.arr_swerk  = MainParam.arr_swerk;
			this.arr_kostl  = MainParam.arr_kostl;
			this.arr_kokrs  = MainParam.arr_kokrs;   

			this.locDate    = MainParam.locDate;
			this.locTime    = MainParam.locTime;
			this.dateFormat = MainParam.dateFormat;
			this.sep        = MainParam.sep; 
			this.Finish;

			this.msaus = "";
			this.ausvn = "";
			this.auztv = "";
			this.ausbs = "";
			this.auztb = "";
			this.ausztx = "";			
		},

		set_header : function(sObj, sMode){
			this.sWerks = sObj.Werks;
			this.sAufnr = sObj.Aufnr;
			this.sAuart = sObj.Auart;
			this.sEqunr = sObj.Equnr;
			this.sVaplz = sObj.Vaplz;
			this.sQmart = sObj.Qmart;
			this.sQmnum = sObj.Qmnum;
			this.sZbmind = sObj.Zbmind;		// BM/CM 구분
			this.sIlart = sObj.Ilart;			// PMActivity

			if(sObj.Auart=="PM01"){
				sObj.ZbmindEditStatus = true;
				sObj.ZbmindVisibleStatus = true;
				sObj.IlartEditStatus = true;
				sObj.IlartVisibleStatus = true;
			}else{
				sObj.ZbmindEditStatus = false;
				sObj.ZbmindVisibleStatus = false;
				sObj.IlartEditStatus = false;
				sObj.IlartVisibleStatus = false;
			}

			// 통지 없는  오더의 경우 BM CM 설정 비활성화 -> 통지 못만들것이기 때문 2018.11.23
			if(sObj.Qmnum){
				sObj.Zbmindrequired = true;
			}else{	
				sObj.Zbmindrequired = false;	
				sObj.ZbmindEditStatus = false;				
			}
			
			var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
			oODataJSONModel.setData(sObj);
			this.oDialog.setModel(oODataJSONModel, "header");

			this.sMode      = sMode;
		},

		onResultCloseDialog : function(){
			this.oDialog.close();
			this.wrMain.onClose_workResult();			
		},

		set_data : function(){
			utils.makeSerachHelpHeader(this.oMainParam);	
			this._set_search_field();

			var addat_hwr = this.oMain.oController.getView().byId("addat_hwr");				
			var qmdat_hwr = this.oMain.oController.getView().byId("qmdat_hwr");

			var Isdd = this.oMain.oController.getView().byId("Isdd");				
			var Iedd = this.oMain.oController.getView().byId("Iedd");

			//Malfunction start
			var ausvn_wr = this.oMain.oController.getView().byId("ausvn_wr");				
			var auztv_wr = this.oMain.oController.getView().byId("auztv_wr");				
			//Malfunction End
			var ausbs_wr = this.oMain.oController.getView().byId("ausbs_wr");
			var auztb_wr = this.oMain.oController.getView().byId("auztb_wr");
			var malfunction = this.oMain.oController.getView().byId("Malfunc");
					

			var shutdownF_date = this.oMain.oController.getView().byId("shutdownF_date");				
			var shutdownT_date = this.oMain.oController.getView().byId("shutdownT_date");				
			
			var Idate = this.oMain.oController.getView().byId("Idate_wr");				

			addat_hwr.setDisplayFormat(this.dateFormat);
			addat_hwr.setValueFormat("yyyyMMdd");		    	

			qmdat_hwr.setDisplayFormat(this.dateFormat);
			qmdat_hwr.setValueFormat("yyyyMMdd");

			Isdd.setDisplayFormat(this.dateFormat);
			Isdd.setValueFormat("yyyyMMdd");

			Iedd.setDisplayFormat(this.dateFormat);
			Iedd.setValueFormat("yyyyMMdd");

			ausvn_wr.setDisplayFormat(this.dateFormat);
			ausvn_wr.setValueFormat("yyyyMMdd");

			ausbs_wr.setDisplayFormat(this.dateFormat);
			ausbs_wr.setValueFormat("yyyyMMdd");

			Idate.setDisplayFormat(this.dateFormat);
			Idate.setValueFormat("yyyyMMdd");		    

			shutdownF_date.setDisplayFormat(this.dateFormat);
			shutdownF_date.setValueFormat("yyyyMMdd");

			shutdownT_date.setDisplayFormat(this.dateFormat);
			shutdownT_date.setValueFormat("yyyyMMdd");
			
			this.workResultList();
			this.tab1 = this.oMain.oController.getView().byId("wrtab1");			// tab1 selelct

			this.save = this.oMain.oController.getView().byId("resultSave");
			if(this.sMode == "R"){
				this.save.setVisible(true);
			}else{
				this.save.setVisible(false);
			}
			
			if(this.sAuart == "PM02") {
//				this.malfunction.setText("test");
//				this.malfunction.setRequired(false);
			}

			this.cancel = this.oMain.oController.getView().byId("resultCancel");
			this.cancel.setVisible(false);			
//			this.hd_chk = this.oMain.oController.getView().byId("hd_chk");
//			var bmcm_hwr = this.oMain.oController.getView().byId("bmcm_hwr");				
//			var act_hwr = this.oMain.oController.getView().byId("act_hwr");		 // ILART   			

			var headerScreenModel = this.oDialog.getModel("header");
			var oHeaderData = headerScreenModel.getData();			 

			this.add = this.oMain.oController.getView().byId("addBtn");
			this.del = this.oMain.oController.getView().byId("delBtn");
			if(this.sMode == "R"){
				this.add.setVisible(true);
				this.del.setVisible(true);
			}else{
				this.add.setVisible(false);
				this.del.setVisible(false);
				oHeaderData.ZbmindEditStatus = false;
				oHeaderData.IlartEditStatus = false;

				headerScreenModel.refresh();
			}
		},

		//Combobox의 Validation을 체크  화면의 모든 combobox는   change 속성에서 해당 function을 호출 해 한다.
		onCBChange : function(oEvent){
			var newValue = oEvent.getParameter("newValue");
			var key = oEvent.getSource().getSelectedItem();

			if(newValue != "" && key == null ){
				oEvent.getSource().setValueState("Error");
			}else{
				oEvent.getSource().setValueState("None");
			}

			var strArr = oEvent.oSource.sId.split("--");
			var cnt = strArr.length - 1;
			var sIdstr = strArr[cnt];
			
			//BM  Severity 필수입력 / Malfunc 필수입력 / shutdown 필수입력
			//CM  Severity Not relevant / Malfunc 비활성화 / shutdown 입력가능
			if(sIdstr == "bmcm_hwr"){
				this.sZbmind = key.getProperty("key");		// BM/CM 구분

				var screenModel = this.oDialog.getModel("break");
				var oData = screenModel.getData();
				var wtTable = this.oMain.oController.getView().byId("table_worktime");
				var oldData = wtTable.getModel().getData();
				
				//BM
				 if(key.getProperty("key") == "BM"){
					oData.Mstatus = true;	
					//oData.Msaus = true;
					
				 }else{
					//CM
					this.oMain.oController.getView().byId("qmcod_wr").setSelectedKey("04");
					
					oData.Mstatus = false;
					oData.Msaus = false;
				 }
				
				screenModel.refresh();		
				
				
			}

			if(sIdstr == "act_hwr"){
				this.sIlart = key.getProperty("key");			// PMActivity
			}			

//			var bmcm_hwr = this.oMain.oController.getView().byId("bmcm_hwr");				
//			var act_hwr = this.oMain.oController.getView().byId("act_hwr");		 // ILART   

//			bmcm_hwr.setSelectedKey(this.sZbmind);
//			act_hwr.setSelectedKey(this.sIlart);
			
		},		
		workResultList : function(){
			var oModel = this.oMain.getModel("workResult");
			var controll = this;
			var lange  = this.oMainParam.getLanguage();

			var headerScreenModel = this.oDialog.getModel("header");
			var oHeaderData = headerScreenModel.getData();

			var s_auart  = [];
			var s_spras  = [];  		
			var s_filter = [];

			if(this.sAuart){
				s_auart.push(this.sAuart);

				if(s_auart){
					s_filter.push(utils.set_filter(s_auart, "Auart"));
				}		
			}	

			if(lange){
				s_spras.push(lange);

				if(s_spras){
					s_filter.push(utils.set_filter(s_spras, "Spras"));
				}		
			}	

			var filterStr;
			for(var i=0; i<s_filter.length; i++){

				if(i === 0){
					filterStr = s_filter[i];
				}else{
					filterStr = filterStr + " and " + s_filter[i];
				}
			}

			var path = "/InputSet(Zmode='"+this.sMode+"',Werks='"+this.sWerks+"',Aufnr='"+this.sAufnr+"')";
			///sap/opu/odata/SAP/ZPM_GW_0073_SRV/InputSet(Zmode='R',Werks='2010',Aufnr='4000183')
			//?$expand=BreakdownList,FailurecodeList,MeasuringList,WorktimeList&$filter=Spras eq 'EN'
			var mParameters = {
					urlParameters : {
						"$expand" : "BreakdownList,FailurecodeList,MeasuringList/ListDeep,WorktimeList,ShutdownList", 
						"$filter" : filterStr
					},

					success : function(oData) {
						var oWtTable = controll.oMain.oController.getView().byId("table_worktime");
						var oFcTable = controll.oMain.oController.getView().byId("table_failure");
						var oMdTable = controll.oMain.oController.getView().byId("table_measure");

//						var oWtTable = this.tab1.mAggregations.content[0].mAggregations.content[0]._aElements[0]
						for (var i=0; i<oData.WorktimeList.results.length; i++) {
							oData.WorktimeList.results[i].Items = this.oGrd;
						}				    

						var breakDownList = [];
						for (var i=0; i<oData.BreakdownList.results.length; i++) {
							breakDownList.Qmnum  = oData.BreakdownList.results[i].Qmnum;
							breakDownList.Qmgrp  = oData.BreakdownList.results[i].Qmgrp;
							breakDownList.Qmcod  = oData.BreakdownList.results[i].Qmcod;

							if(oData.Zbmind =="CM" || oData.Zbmind =="PM") { 
								//CM 인경우 Severity 는 무조건 Not Relevant 04 
								//사용자는 해당 내용 선택 불가능
								breakDownList.Qmcod  = "04";
							}
							
//							breakDownList.Ausvn  = oData.BreakdownList.results[i].Ausvn;
							if(oData.BreakdownList.results[i].Ausvn == "00000000"){
								breakDownList.Ausvn  = "";
							}else{
								breakDownList.Ausvn  = oData.BreakdownList.results[i].Ausvn;
							}

//							breakDownList.Ausbs  = oData.BreakdownList.results[i].Ausbs;
							if(oData.BreakdownList.results[i].Ausbs == "00000000"){
								breakDownList.Ausbs  = "";
							}else{
								breakDownList.Ausbs  = oData.BreakdownList.results[i].Ausbs;
							}

//							breakDownList.Auztv  = oData.BreakdownList.results[i].Auztv;
							if(oData.BreakdownList.results[i].Auztv == "000000"){
								breakDownList.Auztv  = "";
							}else{
								breakDownList.Auztv  = oData.BreakdownList.results[i].Auztv;
							}

//							breakDownList.Auztb  = oData.BreakdownList.results[i].Auztb;
							if(oData.BreakdownList.results[i].Auztb == "000000"){
								breakDownList.Auztb  = "";
							}else{
								breakDownList.Auztb  = oData.BreakdownList.results[i].Auztb;
							}					 	
							breakDownList.Auszt  = oData.BreakdownList.results[i].Auszt;

							breakDownList.Maueh  = oData.BreakdownList.results[i].Maueh;
							breakDownList.Msaus  = oData.BreakdownList.results[i].Msaus;
//							breakDownList.Ausztx = oData.BreakdownList.results[i].Ausztx;
							if(oData.BreakdownList.results[i].Ausztx == "0.000"){
								breakDownList.Ausztx  = "0.0";
							}else{
								breakDownList.Ausztx  = oData.BreakdownList.results[i].Ausztx;
							}

							this.msaus  = breakDownList.Msaus;
							this.ausvn  = breakDownList.Ausvn;
							this.ausbs  = breakDownList.Ausbs;												 	
							this.auztv  = breakDownList.Auztv;
							this.auztb  = breakDownList.Auztb;
							this.ausztx = breakDownList.Ausztx;
							
							breakDownList.Status = oData.BreakdownList.results[i].Status;
							breakDownList.Mstatus = oData.BreakdownList.results[i].Mstatus;
							breakDownList.Enable = oData.BreakdownList.results[i].Enable;
						}						 

						var oBdownJSONModel =  new sap.ui.model.json.JSONModel();  
						oBdownJSONModel.setData(breakDownList);

						this.oDialog.setModel(oBdownJSONModel, "break");	
						controll.oMain.oController.getView().byId("qmcod_wr").setSelectedKey(breakDownList.Qmcod);

						//Order Type 이 PM02인 경우 필요없는 필드 필수값 해제
						if(oData.Auart =="PM02") {
							controll.oMain.oController.getView().byId("Malfunc").setRequired(false);
							controll.oMain.oController.getView().byId("ausvn_wr").setRequired(false);
							controll.oMain.oController.getView().byId("auztv_wr").setRequired(false);
							controll.oMain.oController.getView().byId("MalfuncTo").setRequired(false);
							controll.oMain.oController.getView().byId("ausbs_wr").setRequired(false);
							controll.oMain.oController.getView().byId("auztb_wr").setRequired(false);
						}

						// Shutdown Information ------------------------------------------------------------------
						if(oData.ShutdownList != null) {
							var shutDownList = [];
							for (var i=0; i<oData.ShutdownList.results.length; i++) {
								shutDownList.Zshutid     = oData.ShutdownList.results[i].Zshutid;
								
								if(oData.ShutdownList.results[i].Zshutfrdate == "00000000"){
									shutDownList.Zshutfrdate = "";
								}else{
									shutDownList.Zshutfrdate = oData.ShutdownList.results[i].Zshutfrdate;								
								}
								
								if(oData.ShutdownList.results[i].Zshutfrtime == "000000"){
									shutDownList.Zshutfrtime = "";
								}else{
									shutDownList.Zshutfrtime = oData.ShutdownList.results[i].Zshutfrtime;
								}
								
								if(oData.ShutdownList.results[i].Zshuttodate == "00000000"){
									shutDownList.Zshuttodate = "";
								}else{
									shutDownList.Zshuttodate = oData.ShutdownList.results[i].Zshuttodate;
								}
								
								if(oData.ShutdownList.results[i].Zshuttotime == "000000"){
									shutDownList.Zshuttotime = "";
								}else{
									shutDownList.Zshuttotime = oData.ShutdownList.results[i].Zshuttotime;
								}
								
							}						 
	
							var oSdownJSONModel =  new sap.ui.model.json.JSONModel();  
							oSdownJSONModel.setData(shutDownList);
	
							this.oDialog.setModel(oSdownJSONModel, "shutdown");					
						}
						// Shutdown Information ------------------------------------------------------------------

						var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
						oODataJSONModel.setData(oData);

						//debugger;
						for (var i=0; i<oData.WorktimeList.results.length; i++) {				 	
							oData.WorktimeList.results[i].Idaur = utils.cal_duration(oData.WorktimeList.results[i].Isdd, 
									oData.WorktimeList.results[i].Isdz, 
									oData.WorktimeList.results[i].Iedd, 
									oData.WorktimeList.results[i].Iedz);					 	
						}	

						oWtTable.setModel(oODataJSONModel);
						oWtTable.bindRows("/WorktimeList/results");

						oFcTable.setModel(oODataJSONModel);
						oFcTable.bindRows("/FailurecodeList/results");

						oMdTable.setModel(oODataJSONModel);
						oMdTable.bindRows("/MeasuringList/results");
//						this.onMalfuncDuration();	

						if( (oData.Stat == "I0009" || oData.Stat == "I0045" || oData.Stat == "I0046") 
								&& (oData.Ustat != "E0004") ){
							controll.cancel.setVisible(true);
						}else{
							if(this.sMode == "D" && oData.Stat == "I0010" && oData.Ustat == "E0003" ){
								controll.cancel.setVisible(true);

								oHeaderData.ZbmindEditStatus = false;
								oHeaderData.IlartEditStatus = false;

								headerScreenModel.refresh();

							}else{
								controll.cancel.setVisible(false);	 
							}
						}
					}.bind(this),
					error : function() {
						sap.m.MessageBox.show(
								controll.oMainParam.i18n.getText("oData_conn_error"),
								sap.m.MessageBox.Icon.ERROR,
								controll.oMainParam.i18n.getText("error")
						);
					}.bind(this)
			};

			oModel.read(path, mParameters);
		},

		checkMandatory : function(){
			var controll = this;
			var errCnt   = 0;
			var failureCnt;

			var bmcm_hwr = controll.oMain.oController.getView().byId("bmcm_hwr");				
			var act_hwr = controll.oMain.oController.getView().byId("act_hwr");		 // ILART   

			if(controll.sQmnum){ // Notification No 있을 경우 필수입력 체크. 
				if(!bmcm_hwr.getSelectedKey()){
					bmcm_hwr.setValueState("Error");
					errCnt++;
				}else{
					bmcm_hwr.setValueState("None");
				}				
			}
			
			if(!act_hwr.getSelectedKey()){
				act_hwr.setValueState("Error");
				errCnt++;
			}else{
				act_hwr.setValueState("None");
			}

			var wtTable = controll.oMain.oController.getView().byId("table_worktime");
			var faTable = controll.oMain.oController.getView().byId("table_failure");
			var oData   = wtTable.getModel().getData();
			var rows    = wtTable.getRows();

			for (var i=0; i<oData.WorktimeList.results.length; i++) {
				if(oData.WorktimeList.results[i].Isdd == "" || oData.WorktimeList.results[i].Isdd == "00000000"){
					oData.WorktimeList.results[i].IsddValSt = 'Error';
					errCnt++;
				}else{
					oData.WorktimeList.results[i].IsddValSt = 'None';
				}

				if(oData.WorktimeList.results[i].Isdz == "" || oData.WorktimeList.results[i].Isdz == "000000") {
					oData.WorktimeList.results[i].IsdzValSt = 'Error';
					errCnt++;
				}else{
					oData.WorktimeList.results[i].IsdzValSt = 'None';
				}

				if(oData.WorktimeList.results[i].Iedd == "" || oData.WorktimeList.results[i].Iedd == "00000000"){
					oData.WorktimeList.results[i].IeddValSt = 'Error';
					errCnt++;
				}else{
					oData.WorktimeList.results[i].IeddValSt = 'None';
				}

				if(oData.WorktimeList.results[i].Iedz == "" || oData.WorktimeList.results[i].Iedz == "000000"){
					oData.WorktimeList.results[i].IedzValSt = 'Error';
					errCnt++;
				}else{
					oData.WorktimeList.results[i].IedzValSt = 'None';
				}		

				if(oData.WorktimeList.results[i].Ismnw == "" || oData.WorktimeList.results[i].Ismnw == "0.0"
					|| oData.WorktimeList.results[i].Ismnw == "0"){
					oData.WorktimeList.results[i].IsmnwValSt = 'Error';
					errCnt++;
				}else{
					oData.WorktimeList.results[i].IsmnwValSt = 'None';
				}					 
			}

//			debugger;
			if(controll.oMain.oController.getView().byId("Severity").getRequired()){
				var sQmcod = controll.oMain.oController.getView().byId("qmcod_wr");
				if(sQmcod.getSelectedKey() == "" ){
					sQmcod.setValueState('Error');
					errCnt++;				
				}else{
					sQmcod.setValueState('None');
				}				 
			}

			debugger;
			if(controll.oMain.oController.getView().byId("Malfunc").getRequired()){
				for (var i=0; i<oData.BreakdownList.results.length; i++) {
					//cm bm 상관없이 Malfunction 시간은 모두 필수값이므로 조건 삭제
					if(controll.oMain.oController.getView().byId("msaus_wr").getSelected()){ 
						var sAusvn = controll.oMain.oController.getView().byId("ausvn_wr");
						if(sAusvn.getValue() == "" || sAusvn.getValue() == "00000000"){
							sAusvn.setValueState('Error');
							errCnt++;				
						}else{
							sAusvn.setValueState('None');
						}					

						var sAusbs = controll.oMain.oController.getView().byId("ausbs_wr");
						if(sAusbs.getValue() == "" || sAusbs.getValue() == "00000000"){
							sAusbs.setValueState('Error');
							errCnt++;				
						}else{
							sAusbs.setValueState('None');
						}	

						var sAuztv = controll.oMain.oController.getView().byId("auztv_wr");
						if(sAuztv.getValue() == "" || sAuztv.getValue() == "000000"){
							sAuztv.setValueState('Error');
							errCnt++;				
						}else{
							sAuztv.setValueState('None');
						}	

						var sAuztb = controll.oMain.oController.getView().byId("auztb_wr");
						if(sAuztb.getValue() == "" || sAuztb.getValue() == "000000"){
							sAuztb.setValueState('Error');
							errCnt++;				
						}else{
							sAuztb.setValueState('None');
						}			
					}						 
				}	

				  // Notification의 유형 (ZPMT1150-ZBMIND)이 “BM”인 경우 최소 1줄의 정보 (부위, 현상, 원인, 조치)가 고장   코드로 입력될 수 있도록 강제화 시켜 주시기 바랍니다.
				if(this.sZbmind == "BM"){
					for (var i=0; i<oData.FailurecodeList.results.length; i++) {
						failureCnt = 0;
						if(oData.FailurecodeList.results[i].Oteil == ""){
							oData.FailurecodeList.results[i].OteilValSt = 'Error';
							errCnt++;
							failureCnt++;
						}else{
							oData.FailurecodeList.results[i].OteilValSt = 'None';
						}

						if(oData.FailurecodeList.results[i].Fecod == ""){
							oData.FailurecodeList.results[i].FecodValSt = 'Error';
							errCnt++;
							failureCnt++;
						}else{
							oData.FailurecodeList.results[i].FecodValSt = 'None';
						}				

						if(failureCnt == 0){
							break;
						}
					}
					for (var i=0; i<oData.ShutdownList.results.length; i++) {
						var shutdownF_date = controll.oMain.oController.getView().byId("shutdownF_date");
						if(shutdownF_date.getValue() == "" || shutdownF_date.getValue() == "00000000"){
							shutdownF_date.setValueState('Error');
							errCnt++;				
						}else{
							shutdownF_date.setValueState('None');
						}					

						var shutdownF_time = controll.oMain.oController.getView().byId("shutdownF_time");
						if(shutdownF_time.getValue() == "" || shutdownF_time.getValue() == "00000000"){
							shutdownF_time.setValueState('Error');
							errCnt++;				
						}else{
							shutdownF_time.setValueState('None');
						}	

						var shutdownT_date = controll.oMain.oController.getView().byId("shutdownT_date");
						if(shutdownT_date.getValue() == "" || shutdownT_date.getValue() == "000000"){
							shutdownT_date.setValueState('Error');
							errCnt++;				
						}else{
							shutdownT_date.setValueState('None');
						}	

						var shutdownT_time = controll.oMain.oController.getView().byId("shutdownT_time");
						if(shutdownT_time.getValue() == "" || shutdownT_time.getValue() == "000000"){
							shutdownT_time.setValueState('Error');
							errCnt++;				
						}else{
							shutdownT_time.setValueState('None');
						}	
					}
				}else {
					for (var i=0; i<oData.ShutdownList.results.length; i++) {
						var shutdownF_date = controll.oMain.oController.getView().byId("shutdownF_date");
							shutdownF_date.setValueState('None');

						var shutdownF_time = controll.oMain.oController.getView().byId("shutdownF_time");
							shutdownF_time.setValueState('None');

						var shutdownT_date = controll.oMain.oController.getView().byId("shutdownT_date");
							shutdownT_date.setValueState('None');

						var shutdownT_time = controll.oMain.oController.getView().byId("shutdownT_time");
							shutdownT_time.setValueState('None');
					}
				}
			}		

			if(errCnt > 0){
				wtTable.getModel().refresh();
				faTable.getModel().refresh();
				return false;				
			}else{
				return true;
			}
		},

		onResultSaveDialog  : function(oEvent){
			var controll = this;
			var sTitle;
			var sMessage;

			var result = this.checkMandatory();
			if(result){

			//	var sFinish = controll.oMain.oController.getView().byId("hd_chk");
			//	this.Finish = sFinish.getSelected();
			// Finish 여부 항상 체크하기로 해서 True로 고정
				this.Finish = true;
				
				if(this.Finish){
					sMessage = controll.oMainParam.i18n.getText("workresultSaveComplete");
					sTitle   = controll.oMainParam.i18n.getText("saveComplete_title");

				}else{
					sMessage = controll.oMainParam.i18n.getText("workresultSave");
					sTitle   = controll.oMainParam.i18n.getText("save_title");
				}

				Message.confirm(sMessage, 
						{
					title: sTitle,
					onClose : function(oAction){
						if(oAction=="OK"){
							controll.onResultSave("C");	
						}else{
							return false;
						}
					},
					styleClass: "",
					initialFocus: sap.m.MessageBox.Action.OK,
					textDirection : sap.ui.core.TextDirection.Inherit }
				);

			}else{
				sap.m.MessageBox.show(
						controll.oMainParam.i18n.getText("check_mandatory"),
						sap.m.MessageBox.Icon.ERROR,
						controll.oMainParam.i18n.getText("Error")
				);	
			}				
		},

		onResultSave : function(mode){
			var oModel = this.oMain.getModel("workResult");
			var controll = this;
			var lange  = this.oMainParam.getLanguage();
			var sMessage;

			var oContent =  controll.oMain.oController.getView().byId("dialog_result");

			oModel.attachRequestSent(function(){oContent.setBusy(true);});
			oModel.attachRequestCompleted(function(){oContent.setBusy(false);});				

			var data = {};
//			//Header Info
			data.Werks = controll.sWerks;
			data.Aufnr = controll.sAufnr;
			data.Auart = controll.sAuart;
			data.Equnr = controll.sEqunr;
			data.Spras = lange;

//			Mode : C : Create, U : Update(Cancel)
			data.Zmode = mode;
			data.Zbmind = controll.sZbmind;
			data.Ilart  = controll.sIlart;

			data.WorktimeList    = [];
			data.BreakdownList   = [];
			data.FailurecodeList = [];
			data.MeasuringList   = [];
			data.ShutdownList    = [];

			var wtTable = controll.oMain.oController.getView().byId("table_worktime");
			var oData   = wtTable.getModel().getData();
			var rows    = wtTable.getRows();

			for (var i=0; i<oData.WorktimeList.results.length; i++) {
				var workItem = {};			 
//				var cxt = wtTable.getContextByIndex(i);
//				var path = cxt.sPath;
//				var obj = wtTable.getModel().getProperty(path);

				workItem.Arbpl  = controll.sVaplz;
				workItem.Vornr  = oData.WorktimeList.results[i].Vornr;
				workItem.Rueck  = oData.WorktimeList.results[i].Rueck;
				workItem.Isdd   = oData.WorktimeList.results[i].Isdd; 
				workItem.Isdz   = oData.WorktimeList.results[i].Isdz;
				workItem.Iedd   = oData.WorktimeList.results[i].Iedd;
				workItem.Iedz   = oData.WorktimeList.results[i].Iedz;
				workItem.Idaur  = oData.WorktimeList.results[i].Idaur.toString();
				workItem.Idaue  = oData.WorktimeList.results[i].Idaue;
				workItem.Ismnw  = oData.WorktimeList.results[i].Ismnw.toString();
				workItem.Ismne  = oData.WorktimeList.results[i].Ismne;
				workItem.Zid    = oData.WorktimeList.results[i].Zid;   
				workItem.Zname  = oData.WorktimeList.results[i].Zname;
//				workItem.Aueru  = oData.WorktimeList.results[i].Aueru;
				workItem.Aueru  = true;
				workItem.Grund  = oData.WorktimeList.results[i].Grund;			// 문제 있음 
				workItem.Ltxa1  = oData.WorktimeList.results[i].Ltxa1;
				workItem.Zdate  = oData.WorktimeList.results[i].Zdate;
				workItem.Enable = oData.WorktimeList.results[i].Enable;

				data.WorktimeList.push(workItem);				 
			}	

			for (var i=0; i<oData.BreakdownList.results.length; i++) {
				var breakItem = {};

				if (oData.BreakdownList.results[i].Qmnum == ""){
					breakItem.Qmnum = "";
				}else{
					breakItem.Qmnum  = oData.BreakdownList.results[i].Qmnum;
				}

				if(controll.oMain.oController.getView().byId("qmcod_wr").getSelectedKey() == ""){
					continue;
				}

				breakItem.Qmgrp  = oData.BreakdownList.results[i].Qmgrp;
				breakItem.Qmcod  = controll.oMain.oController.getView().byId("qmcod_wr").getSelectedKey();
				breakItem.Msaus  = controll.oMain.oController.getView().byId("msaus_wr").getSelected();			 
				breakItem.Enable = oData.BreakdownList.results[i].Enable;

				if(controll.oMain.oController.getView().byId("msaus_wr").getSelected()){
					breakItem.Ausvn  = controll.oMain.oController.getView().byId("ausvn_wr").getValue();
					breakItem.Ausbs  = controll.oMain.oController.getView().byId("ausbs_wr").getValue();
					breakItem.Auztv  = controll.oMain.oController.getView().byId("auztv_wr").getValue();
					breakItem.Auztb  = controll.oMain.oController.getView().byId("auztb_wr").getValue();

					breakItem.Auszt  = oData.BreakdownList.results[i].Auszt.toString();
					breakItem.Maueh  = oData.BreakdownList.results[i].Maueh;
					breakItem.Ausztx = controll.oMain.oController.getView().byId("ausztx_wr").getValue();
				}else{
					//BM CM 상관없이 Malfucntion 시간 입력
/*					breakItem.Ausvn  = "00000000";
					breakItem.Ausbs  = "00000000";
					breakItem.Auztv  = "000000";
					breakItem.Auztb  = "000000";*/		
					breakItem.Ausvn  = controll.oMain.oController.getView().byId("ausvn_wr").getValue();
					breakItem.Ausbs  = controll.oMain.oController.getView().byId("ausbs_wr").getValue();
					breakItem.Auztv  = controll.oMain.oController.getView().byId("auztv_wr").getValue();
					breakItem.Auztb  = controll.oMain.oController.getView().byId("auztb_wr").getValue();

					breakItem.Auszt  = oData.BreakdownList.results[i].Auszt.toString();
					breakItem.Maueh  = oData.BreakdownList.results[i].Maueh;
					breakItem.Ausztx = controll.oMain.oController.getView().byId("ausztx_wr").getValue();
				}

				data.BreakdownList.push(breakItem);	
			}		

			// ShutdownList ------------------------------------------------------------------------------
			for (var i=0; i<oData.ShutdownList.results.length; i++) {
				var shutItem = {};

				shutItem.Zshutid 	 = true;
				shutItem.Zshutfrdate = controll.oMain.oController.getView().byId("shutdownF_date").getValue();
				shutItem.Zshutfrtime = controll.oMain.oController.getView().byId("shutdownF_time").getValue();
				shutItem.Zshuttodate = controll.oMain.oController.getView().byId("shutdownT_date").getValue();
				shutItem.Zshuttotime = controll.oMain.oController.getView().byId("shutdownT_time").getValue();

				data.ShutdownList.push(shutItem);	
			}				
			// ShutdownList ------------------------------------------------------------------------------
			
			for (var i=0; i<oData.FailurecodeList.results.length; i++) {
				if(oData.FailurecodeList.results[i].Fecod != ""){
					var failureItem = {};

					if (oData.BreakdownList.results[0].Qmnum == ""){
						failureItem.Qmnum = "";
					}else{
						failureItem.Qmnum    = oData.FailurecodeList.results[i].Qmnum;
					}

					failureItem.Seq      = oData.FailurecodeList.results[i].Seq;
					failureItem.Fenum    = oData.FailurecodeList.results[i].Fenum;
					failureItem.Equnr    = controll.sEqunr;
					failureItem.Fecod    = oData.FailurecodeList.results[i].Fecod;
					failureItem.Fegrp    = oData.FailurecodeList.results[i].Fegrp;
					failureItem.Fetxt    = oData.FailurecodeList.results[i].Fetxt;
					failureItem.Fktextgr = oData.FailurecodeList.results[i].Fktextgr;
					failureItem.Matxt    = oData.FailurecodeList.results[i].Matxt;
					failureItem.Mktextgr = oData.FailurecodeList.results[i].Mktextgr;
					failureItem.Manum    = oData.FailurecodeList.results[i].Manum;
					failureItem.Mncod    = oData.FailurecodeList.results[i].Mncod;
					failureItem.Mngrp    = oData.FailurecodeList.results[i].Mngrp;
					failureItem.Oteil    = oData.FailurecodeList.results[i].Oteil;
					failureItem.Otgrp    = oData.FailurecodeList.results[i].Otgrp;
					failureItem.Qktextgr = oData.FailurecodeList.results[i].Qktextgr;
					failureItem.Txtcdfe  = oData.FailurecodeList.results[i].Txtcdfe;
					failureItem.Txtcdma  = oData.FailurecodeList.results[i].Txtcdma;
					failureItem.Txtcdot  = oData.FailurecodeList.results[i].Txtcdot;
					failureItem.Txtcdur  = oData.FailurecodeList.results[i].Txtcdur;
					failureItem.Uktextgr = oData.FailurecodeList.results[i].Uktextgr;
					failureItem.Urnum    = oData.FailurecodeList.results[i].Urnum;
					failureItem.Urcod    = oData.FailurecodeList.results[i].Urcod;
					failureItem.Urgrp    = oData.FailurecodeList.results[i].Urgrp;
					failureItem.Urtxt    = oData.FailurecodeList.results[i].Urtxt;
					failureItem.Enable   = oData.FailurecodeList.results[i].Enable;

					data.FailurecodeList.push(failureItem);						 
				}
			}	

			if(oData.MeasuringList != null){
				for (var i=0; i<oData.MeasuringList.results.length; i++) {
					var measuringItem = {};

					if(oData.MeasuringList.results[i].Recdc){				 
						measuringItem.Codgr    = oData.MeasuringList.results[i].Codgr;
						measuringItem.Decim    = oData.MeasuringList.results[i].Decim;
						measuringItem.Enable   = oData.MeasuringList.results[i].Enable;
						measuringItem.Expon    = oData.MeasuringList.results[i].Expon;
						measuringItem.Idate    = oData.MeasuringList.results[i].Idate;
						measuringItem.Itime    = oData.MeasuringList.results[i].Itime;			 
						measuringItem.Mrngu    = oData.MeasuringList.results[i].Mrngu;
						measuringItem.Mseh6    = oData.MeasuringList.results[i].Mseh6;
						measuringItem.Mseht    = oData.MeasuringList.results[i].Mseht;
						measuringItem.Point    = oData.MeasuringList.results[i].Point;
						measuringItem.Pttxt    = oData.MeasuringList.results[i].Pttxt;
						measuringItem.Readr    = oData.MeasuringList.results[i].Readr;
						measuringItem.Recdc    = oData.MeasuringList.results[i].Recdc;
						measuringItem.Recdu    = oData.MeasuringList.results[i].Recdu;
						measuringItem.Recdv    = oData.MeasuringList.results[i].Recdv.toString();;
						measuringItem.Recdvi   = oData.MeasuringList.results[i].Recdvi;
						measuringItem.Vlcod    = oData.MeasuringList.results[i].Vlcod;

						data.MeasuringList.push(measuringItem);					 
					}				 
				}
			}				 

			var mParameters = {
					success : function(oData) {

						this.oMainParam.refresh = true;

						var headerScreenModel = this.oDialog.getModel("header");
						var oHeaderData = headerScreenModel.getData();    				

						var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
						oODataJSONModel.setData(oData);

						if(oData.RetType == "E" ){
							sap.m.MessageBox.show(
									oData.RetMsg,
									sap.m.MessageBox.Icon.ERROR,
									controll.oMainParam.i18n.getText("error")
							);
						}else if(oData.RetType == "W" ){
							sap.m.MessageBox.show(
									oData.RetMsg,
									sap.m.MessageBox.Icon.WARNING,
									controll.oMainParam.i18n.getText("info")
							);	 
						}else{
							var oWtTable = controll.oMain.oController.getView().byId("table_worktime");
							var oFcTable = controll.oMain.oController.getView().byId("table_failure");
							var oMdTable = controll.oMain.oController.getView().byId("table_measure");


							for (var i=0; i<oData.WorktimeList.results.length; i++) {
								oData.WorktimeList.results[i].Items = this.oGrd;
							}			

							var breakDownList = [];
							for (var i=0; i<oData.BreakdownList.results.length; i++) {
								breakDownList.Qmnum  = oData.BreakdownList.results[i].Qmnum;
								breakDownList.Qmgrp  = oData.BreakdownList.results[i].Qmgrp;
								breakDownList.Qmcod  = oData.BreakdownList.results[i].Qmcod;

//								breakDownList.Ausvn  = oData.BreakdownList.results[i].Ausvn;
								if(oData.BreakdownList.results[i].Ausvn == "00000000"){
									breakDownList.Ausvn  = "";
								}else{
									breakDownList.Ausvn  = oData.BreakdownList.results[i].Ausvn;
								}

//								breakDownList.Ausbs  = oData.BreakdownList.results[i].Ausbs;
								if(oData.BreakdownList.results[i].Ausbs == "00000000"){
									breakDownList.Ausbs  = "";
								}else{
									breakDownList.Ausbs  = oData.BreakdownList.results[i].Ausbs;
								}

//								breakDownList.Auztv  = oData.BreakdownList.results[i].Auztv;
								if(oData.BreakdownList.results[i].Auztv == "000000"){
									breakDownList.Auztv  = "";
								}else{
									breakDownList.Auztv  = oData.BreakdownList.results[i].Auztv;
								}

//								breakDownList.Auztb  = oData.BreakdownList.results[i].Auztb;
								if(oData.BreakdownList.results[i].Auztb == "000000"){
									breakDownList.Auztb  = "";
								}else{
									breakDownList.Auztb  = oData.BreakdownList.results[i].Auztb;
								}							 	

								breakDownList.Auszt  = oData.BreakdownList.results[i].Auszt;
								breakDownList.Maueh  = oData.BreakdownList.results[i].Maueh;
								breakDownList.Msaus  = oData.BreakdownList.results[i].Msaus;
//								breakDownList.Ausztx = oData.BreakdownList.results[i].Ausztx;
								if(oData.BreakdownList.results[i].Ausztx == "0.000"){
									breakDownList.Ausztx  = "0.0";
								}else{
									breakDownList.Ausztx  = oData.BreakdownList.results[i].Ausztx;
								}							 	
								breakDownList.Status = oData.BreakdownList.results[i].Status;
								breakDownList.Mstatus = oData.BreakdownList.results[i].Mstatus;
								breakDownList.Enable = oData.BreakdownList.results[i].Enable;
							}						 

							var oBdownJSONModel =  new sap.ui.model.json.JSONModel();  
							oBdownJSONModel.setData(breakDownList);

							this.oDialog.setModel(oBdownJSONModel, "break");	
							controll.oMain.oController.getView().byId("qmcod_wr").setSelectedKey(breakDownList.Qmcod);							

							// Shutdown Information ------------------------------------------------------------------
							if(oData.ShutdownList != null) {
								var shutDownList = [];
								for (var i=0; i<oData.ShutdownList.results.length; i++) {
									shutDownList.Zshutid     = oData.ShutdownList.results[i].Zshutid;
									
									if(oData.ShutdownList.results[i].Zshutfrdate == "00000000"){
										shutDownList.Zshutfrdate = "";
									}else{
										shutDownList.Zshutfrdate = oData.ShutdownList.results[i].Zshutfrdate;								
									}
									
									if(oData.ShutdownList.results[i].Zshutfrtime == "000000"){
										shutDownList.Zshutfrtime = "";
									}else{
										shutDownList.Zshutfrtime = oData.ShutdownList.results[i].Zshutfrtime;
									}
									
									if(oData.ShutdownList.results[i].Zshuttodate == "00000000"){
										shutDownList.Zshuttodate = "";
									}else{
										shutDownList.Zshuttodate = oData.ShutdownList.results[i].Zshuttodate;
									}
									
									if(oData.ShutdownList.results[i].Zshuttotime == "000000"){
										shutDownList.Zshuttotime = "";
									}else{
										shutDownList.Zshuttotime = oData.ShutdownList.results[i].Zshuttotime;
									}
									
								}						 
	
								var oSdownJSONModel =  new sap.ui.model.json.JSONModel();  
								oSdownJSONModel.setData(shutDownList);
	
								this.oDialog.setModel(oSdownJSONModel, "shutdown");					
							}
								// Shutdown Information ------------------------------------------------------------------

							
							var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
							oODataJSONModel.setData(oData);

							//debugger;
							for (var i=0; i<oData.WorktimeList.results.length; i++) {				 	
								oData.WorktimeList.results[i].Idaur = utils.cal_duration(oData.WorktimeList.results[i].Isdd, 
										oData.WorktimeList.results[i].Isdz, 
										oData.WorktimeList.results[i].Iedd, 
										oData.WorktimeList.results[i].Iedz);					 	
							}	

							oWtTable.setModel(oODataJSONModel);
							oWtTable.bindRows("/WorktimeList/results");

							oFcTable.setModel(oODataJSONModel);
							oFcTable.bindRows("/FailurecodeList/results");

							oMdTable.setModel(oODataJSONModel);
							oMdTable.bindRows("/MeasuringList/results");


							if(mode == "C"){
								if(this.Finish){

									sMessage = controll.oMainParam.i18n.getText("saveCompleteMessage", [this.sAufnr, this.sQmnum]);

								}else{
									sMessage = controll.oMainParam.i18n.getText("saveMessage", [this.sAufnr]);
								}		

							}else{
								sMessage = controll.oMainParam.i18n.getText("cancelMessage", [this.sAufnr]);
							} 

							if( (oData.Stat == "I0009") && (oData.Ustat != "E0004") ){
								controll.cancel.setVisible(true);
								controll.save.setVisible(true);
							}else if( (oData.Stat == "I0010") && (oData.Ustat != "E0004") ){
								controll.cancel.setVisible(false);
								controll.save.setVisible(true);
							}else if( (oData.Stat == "I0045" || oData.Stat == "I0046") && (oData.Ustat != "E0004") ){
								controll.cancel.setVisible(true);
								controll.save.setVisible(false);	
//								controll.hd_chk.setEnabled(false);
//								controll.bmcm_hwr.setEnabled(false);
//								controll.act_hwr.setEnabled(false);

								oHeaderData.ZbmindEditStatus = false;
								oHeaderData.IlartEditStatus = false;

								headerScreenModel.refresh();
							}else{
								controll.cancel.setVisible(false);
							}

							sap.m.MessageBox.show(
									//oData.RetMsg,
									sMessage,
									sap.m.MessageBox.Icon.SUCCESS,
									controll.oMainParam.i18n.getText("success")
							);	

							if(this.sMode == "D" && data.Zmode == "U"){ // pconf 에서 Cancel 시 창을 닫아준다.
								this.oDialog.close();
								this.wrMain.onClose_workResult();										
							}						


						}	 

					}.bind(this),
					error : function() {
						sap.m.MessageBox.show(
								controll.oMainParam.i18n.getText("oData_conn_error"),
								sap.m.MessageBox.Icon.ERROR,
								controll.oMainParam.i18n.getText("error")
						);
					}.bind(this)
			};

			oModel.create("/InputSet", data, mParameters);				
		},


		onResultCancelDialog  : function(oEvent){
			var controll = this;		

			Message.confirm(controll.oMainParam.i18n.getText("workresultCancel"), 
					{
				title: controll.oMainParam.i18n.getText("cancel_title"),
				onClose : function(oAction){
					if(oAction=="OK"){
						controll.onResultSave("U");	
					}else{
						return false;
					}
				},
				styleClass: "",
				initialFocus: sap.m.MessageBox.Action.OK,
				textDirection : sap.ui.core.TextDirection.Inherit }
			);
		},

		// MalFunction breakdown 
		onChKSelect : function(oEvent){		
			var controll = this;
			var screenModel = this.oDialog.getModel("break");
			var oData = screenModel.getData();

			if(oEvent.getParameters().selected){
				oData.Enable = true;	

				var today = new Date();


				if(this.msaus){
					oData.Msaus = this.msaus;
				}

				if(this.ausvn){
					oData.Ausvn = this.ausvn;
				}else{
					controll.oMain.oController.getView().byId("ausvn_wr").setDateValue(today);	
				}

				if(this.ausbs){
					oData.Ausbs = this.ausbs;
				}else{
					controll.oMain.oController.getView().byId("ausbs_wr").setDateValue(today);	
				}

				if(this.auztv){
					oData.Auztv = this.auztv;
				}				

				if(this.auztb){
					oData.Auztb = this.auztb;
				}	

				if(this.ausztx){
					oData.Ausztx = this.ausztx;	
				}


				//this.onMalfuncDuration();
			}else{
				controll.oMain.oController.getView().byId("ausvn_wr").setValue("");
				controll.oMain.oController.getView().byId("auztv_wr").setValue("");
				controll.oMain.oController.getView().byId("ausbs_wr").setValue("");
				controll.oMain.oController.getView().byId("auztb_wr").setValue("");
				controll.oMain.oController.getView().byId("ausztx_wr").setValue("0.0");

				controll.oMain.oController.getView().byId("ausvn_wr").setValueState("None");
				controll.oMain.oController.getView().byId("auztv_wr").setValueState("None");
				controll.oMain.oController.getView().byId("ausbs_wr").setValueState("None");
				controll.oMain.oController.getView().byId("auztb_wr").setValueState("None");

				oData.Enable = false;	
			}
			screenModel.refresh();

		},		

		onAdd : function(oEvent){

			var oData = {};
			var oFcTable = this.oMain.oController.getView().byId("table_failure");
			var tableModel = oFcTable.getModel();

			var seq = 0;
			var hditem = [];

			if(tableModel.getData()){
				oData = tableModel.getData();
				hditem = oData.FailurecodeList.results;
				if(oData.FailurecodeList.results.length > 0){
					var idx = hditem.length - 1;
					seq = hditem[idx].Seq;
				}else{
					seq = 0;
				}
			};

			var next_seq = parseInt(seq) + 1;

			hditem.push({
				"Seq" : next_seq,
				"Otgrp" : "",
				"Qktextgr" : "",
				"Oteil" : "",
				"Txtcdot" : "",
				"Fegrp" : "",
				"Fktextgr" : "",
				"Fecod" : "",
				"Txtcdfe" : "",
				"Fetxt" : "",
				"Urgrp" : "",
				"Uktextgr" : "",
				"Urcod" : "",
				"Txtcdur" : "",
				"Urtxt" : "",
				"Mngrp" : "",
				"Mktextgr" : "",
				"Mncod" : "",
				"Txtcdma" : "",
				"Matxt" : ""
			});

			oData.FailurecodeList.results = hditem;
			tableModel.setData(oData);

			var idx = hditem.length-1;
			oFcTable.setFirstVisibleRow(idx);
			$("input[id*='Seq']").focus().trigger("click");
		},


		onDelete : function(oEvent){		
			var oFcTable = this.oMain.oController.getView().byId("table_failure");

			var aIndices = oFcTable.getSelectedIndices();
			if (aIndices.length < 1) {
				Toast.show(this.i18n.getText("isnotselected"));
				return;
			}

			//var tableModel = oTable.getModel("tableModel");
			var tableModel = oFcTable.getModel();
			var odata = tableModel.getData();
			var hditem = odata.FailurecodeList.results;

			var cnt = hditem.length - 1 ;

			for(var i=cnt; i>=0; i--){
				for(var j=0; j<aIndices.length; j++){
					if(i === aIndices[j] ){
						var removed = hditem.splice(i, 1);
						break;
					}
				}	
			};

			odata.FailurecodeList.results = hditem;
			tableModel.setData(odata);

			oFcTable.clearSelection();
		},

		/* 
		 * PM Possible Entry Odata Set 
		 */	
		_set_search_field : function() {
			this.oCac = this.oMain.oController.getView().byId("qmcod_wr");		    // Order Type
			this.oCac.removeAllItems();
			if(this.oCac){
				utils.set_search_field("", this.oCac, "cac", "C", "D", "PM");
			}				

			this.oGrd = [];		    // Order Type
			if(this.oGrd){
				utils.set_search_field(this.sWerks, this.oGrd, "grd", "A", "", "");
			}	

//			//PM Activity type 의 경우 Order type에 따라 달라져야 하므로 Order type 변경시 가져오도록 수정 
			if(this.sAuart){
				this.oAct = this.oMain.oController.getView().byId("act_hwr");	
				var v_noti = this.oMain.oController.getView().byId("qmnum_hwr").getValue();					
				if(this.oAct){
					utils.set_search_field(this.sWerks, this.oAct, "ac2", "C", this.sAuart, v_noti);
				}
			}				
		},

		onTabBtn_cat : function(oEvent){
			var controll = this;

			if(!this.sEqunr){
				sap.m.MessageBox.show(
						controll.oMainParam.i18n.getText("err_equnr"),
						sap.m.MessageBox.Icon.ERROR,
						controll.oMainParam.i18n.getText("error")
				);
			}else{
				this.sel_row = oEvent.getSource().getParent().getIndex();
				this._getDialog_Catalog().open();
			}
		},		

		/*  
		 * Catalog Dialog open
		 */
		_getDialog_Catalog  : function(){
			var controll = this;

			if (!this._oDialog_Catalog) {
				this._oDialog_Catalog = sap.ui.xmlfragment("cj.pm0101.view.Catalog_pop", this);

				this.oTree_catalog = sap.ui.getCore().byId("Catalog_tree");
				this._Catalog_Dialog_handler = new Catalog(this._oDialog_Catalog, this);

				controll.oMain.oController.getView().addDependent(this._oDialog_Catalog);      		         
			}

			this._Catalog_Dialog_handler.get_catalog_data("B", this.sEqunr, this.sQmart);

			return this._oDialog_Catalog;
		},

		//*******************Catalog_pop********************************
		onCloseDialog_Catalog : function(oEvent){
			if(this.oQkatart == "B"){
				this._oDialog_Catalog.close();			
			}else{
				this._Catalog_Dialog_handler.cancelDialog_sub();			
			}
		},

		//confirm(select)
		onConfirmDialog_Catalog : function(oEvent){
			this._Catalog_Dialog_handler.confirmDialog_sub(oEvent);
		},

		//Adopt & Close
		onAdoptDialog_Catalog : function(oEvent){

			//debugger;

			var catalogSet = [];
			var sCatalog;
			catalogSet = this._Catalog_Dialog_handler.adoptDialog_Sub(oEvent);

			if(catalogSet){
				var oTable = this.oMain.oController.getView().byId("table_failure");
				//var tableModel = oTable.getModel("tableModel");
				var tableModel = oTable.getModel();
				var oData = tableModel.oData;


				var idx = this.sel_row;

				for(var i=0; i<catalogSet.length; i++){
					sCatalog = catalogSet[i][0];

					if(catalogSet[i][0] == "B"){
						oData.FailurecodeList.results[idx].Otgrp    = catalogSet[i][4];
						oData.FailurecodeList.results[idx].Qktextgr = catalogSet[i][5];
						oData.FailurecodeList.results[idx].Oteil    = catalogSet[i][1];
						oData.FailurecodeList.results[idx].Txtcdot  =  catalogSet[i][2];
					}else if(catalogSet[i][0] == "C"){
						oData.FailurecodeList.results[idx].Fegrp    = catalogSet[i][4];
						oData.FailurecodeList.results[idx].Fktextgr = catalogSet[i][5];
						oData.FailurecodeList.results[idx].Fecod    = catalogSet[i][1];
						oData.FailurecodeList.results[idx].Txtcdfe  = catalogSet[i][2];
						oData.FailurecodeList.results[idx].Fetxt    = catalogSet[i][3];
					}else if(catalogSet[i][0] == "5"){
						oData.FailurecodeList.results[idx].Urgrp    = catalogSet[i][4];
						oData.FailurecodeList.results[idx].Uktextgr = catalogSet[i][5];
						oData.FailurecodeList.results[idx].Urcod    = catalogSet[i][1];
						oData.FailurecodeList.results[idx].Txtcdur  = catalogSet[i][2];
						oData.FailurecodeList.results[idx].Urtxt    = catalogSet[i][3];
					}else if(catalogSet[i][0] == "A"){
						oData.FailurecodeList.results[idx].Mngrp    = catalogSet[i][4];
						oData.FailurecodeList.results[idx].Mktextgr = catalogSet[i][5];
						oData.FailurecodeList.results[idx].Mncod    = catalogSet[i][1];
						oData.FailurecodeList.results[idx].Txtcdma  = catalogSet[i][2];
						oData.FailurecodeList.results[idx].Matxt    = catalogSet[i][3];
					}
				}

				if(sCatalog == "C"){
					oData.FailurecodeList.results[idx].Urgrp    = "";
					oData.FailurecodeList.results[idx].Uktextgr = "";
					oData.FailurecodeList.results[idx].Urcod    = "";
					oData.FailurecodeList.results[idx].Txtcdur  = "";
					oData.FailurecodeList.results[idx].Urtxt    = "";	

					oData.FailurecodeList.results[idx].Mngrp    = "";
					oData.FailurecodeList.results[idx].Mktextgr = "";
					oData.FailurecodeList.results[idx].Mncod    = "";
					oData.FailurecodeList.results[idx].Txtcdma  = "";
					oData.FailurecodeList.results[idx].Matxt    = "";					  
				}

				if(sCatalog == "5"){
					oData.FailurecodeList.results[idx].Mngrp    = "";
					oData.FailurecodeList.results[idx].Mktextgr = "";
					oData.FailurecodeList.results[idx].Mncod    = "";
					oData.FailurecodeList.results[idx].Txtcdma  = "";
					oData.FailurecodeList.results[idx].Matxt    = "";					
				}

				oData.FailurecodeList.results[idx].OteilValSt = 'None';
				oData.FailurecodeList.results[idx].FecodValSt = 'None';				

				tableModel.setData(oData);

				this.sel_row = "";				
			}
			/*				
			 *          this._oDialog_Catalog.destroy();
			this._oDialog_Catalog = "";
			this._Catalog_Dialog_handler.destroy();
			this._Catalog_Dialog_handler = "";
			 */
		},	

		onCollapse : function(oEvent){
			var tree = sap.ui.getCore().byId("Catalog_tree");
			tree.collapseAll();
		},


		onExpand : function(oEvent){
			var tree = sap.ui.getCore().byId("Catalog_tree");
			tree.expandToLevel("1");
		},


		handleChangeAusvn : function(oEvent){
			var oDP = oEvent.oSource;
			var sValue = oEvent.getParameter("value");
			var bValid = oEvent.getParameter("valid");
			this._iEvent++;

			if (bValid) {
				oDP.setValueState(sap.ui.core.ValueState.None);

				this.onMalfuncDuration();

			} else {
				oDP.setValueState(sap.ui.core.ValueState.Error);
			}				
		},

		handleChangeAuztv : function(oEvent){
			var oDP = oEvent.oSource;
			var sValue = oEvent.getParameter("value");
			var bValid = oEvent.getParameter("valid");
			this._iEvent++;

			if (bValid) {
				oDP.setValueState(sap.ui.core.ValueState.None);

				this.onMalfuncDuration();

			} else {
				oDP.setValueState(sap.ui.core.ValueState.Error);
			}			

		},

		handleChangeAusbs : function(oEvent){
			var oDP = oEvent.oSource;
			var sValue = oEvent.getParameter("value");
			var bValid = oEvent.getParameter("valid");
			this._iEvent++;

			if (bValid) {
				oDP.setValueState(sap.ui.core.ValueState.None);

				this.onMalfuncDuration();

			} else {
				oDP.setValueState(sap.ui.core.ValueState.Error);
			}	
		},

		handleChangeAuztb : function(oEvent){
			var oDP = oEvent.oSource;
			var sValue = oEvent.getParameter("value");
			var bValid = oEvent.getParameter("valid");
			this._iEvent++;

			if (bValid) {
				oDP.setValueState(sap.ui.core.ValueState.None);

				this.onMalfuncDuration();

			} else {
				oDP.setValueState(sap.ui.core.ValueState.Error);
			}			

		},

		onMalfuncDuration : function(){
			var differ;
			var startDate;
			var startTime;
			var endDate;
			var endTime;

			startDate = this.oMain.oController.getView().byId("ausvn_wr").getValue();
			if(this.oMain.oController.getView().byId("auztv_wr").getValue() != ""  ){
				startTime = this.oMain.oController.getView().byId("auztv_wr").getValue();	
			}else{
				startTime = "000000";
			}

			endDate   = this.oMain.oController.getView().byId("ausbs_wr").getValue();
			if(this.oMain.oController.getView().byId("auztb_wr").getValue() != ""  ){
				endTime = this.oMain.oController.getView().byId("auztb_wr").getValue();	
			}else{
				endTime = "000000";
			}			

			var duration  = this.oMain.oController.getView().byId("ausztx_wr");

			differ = utils.cal_duration(startDate, startTime, endDate, endTime);

			duration.setValue(differ)	

		},

		handleChangeIsdd : function(oEvent){
			var oDP = oEvent.oSource;
			var sValue = oEvent.getParameter("value");
			var bValid = oEvent.getParameter("valid");
			this._iEvent++;
			if (bValid) {
				oDP.setValueState(sap.ui.core.ValueState.None);

				this.onWorkTimeDuration(oEvent);

			} else {
				oDP.setValueState(sap.ui.core.ValueState.Error);
			}			
		}, 

		handleChangeIsdz : function(oEvent){
			var oDP = oEvent.oSource;
			var sValue = oEvent.getParameter("value");
			var bValid = oEvent.getParameter("valid");
			this._iEvent++;
			if (bValid) {
				oDP.setValueState(sap.ui.core.ValueState.None);

				this.onWorkTimeDuration(oEvent);

			} else {
				oDP.setValueState(sap.ui.core.ValueState.Error);
			}
		}, 

		handleChangeIedd : function(oEvent){
			var oDP = oEvent.oSource;
			var sValue = oEvent.getParameter("value");
			var bValid = oEvent.getParameter("valid");
			this._iEvent++;
			if (bValid) {
				oDP.setValueState(sap.ui.core.ValueState.None);

				this.onWorkTimeDuration(oEvent);

			} else {
				oDP.setValueState(sap.ui.core.ValueState.Error);
			}	
		}, 

		handleChangeIedz : function(oEvent){
			var oDP = oEvent.oSource;
			var sValue = oEvent.getParameter("value");
			var bValid = oEvent.getParameter("valid");
			this._iEvent++;

			if (bValid) {
				oDP.setValueState(sap.ui.core.ValueState.None);

				this.onWorkTimeDuration(oEvent);

			} else {
				oDP.setValueState(sap.ui.core.ValueState.Error);
			}
		}, 

		handleChangeIsmnw : function(oEvent){
			var oDP = oEvent.oSource;
			var sValue = oEvent.getParameter("value");
			this._iEvent++;

			if (sValue != "") {
				oDP.setValueState(sap.ui.core.ValueState.None);		
			} else {
				oDP.setValueState(sap.ui.core.ValueState.Error);
			}
		},		
		handleChangeQmcod : function(oEvent){
			var controll = this;
			var oDP = oEvent.oSource;
			var screenModel = this.oDialog.getModel("break");
			var oData = screenModel.getData();
			var sValue = controll.oMain.oController.getView().byId("qmcod_wr").getSelectedKey();
			this._iEvent++;

			if (sValue != "") {				
				if (sValue != "04") { //Not Relevant (04)
					oData.Msaus = true;
				} else{
					oData.Msaus = false;
				}
				oDP.setValueState(sap.ui.core.ValueState.None);
			} else {
				oDP.setValueState(sap.ui.core.ValueState.Error);
			}	
		},

//		onChangeGrund : function(oEvent){
//		//oEvent.getParameter("selectedItem").getKey();
//		var oTable = this.oMain.oController.getView().byId("table_worktime");

//		var oContext = oEvent.getParameter('selectedItem').getBindingContext();
//		var itemPath = oContext.sPath;
//		var itemObj = oTable.getModel().getProperty(itemPath);

//		var idx = oEvent.getSource().getParent().getIndex();
//		var cxt = oTable.getContextByIndex(idx);
//		var tablePath = cxt.sPath;
//		var tableObj = oTable.getModel().getProperty(tablePath);

//		tableObj.Grund = itemObj.Key;
//		},

//		onChangeVlcod : function(oEvent){
//		var oTable = this.oMain.oController.getView().byId("table_measure");

//		var oContext = oEvent.getParameter('selectedItem').getBindingContext();
//		var itemPath = oContext.sPath;
//		var itemObj = oTable.getModel().getProperty(itemPath);

//		var idx = oEvent.getSource().getParent().getIndex();
//		var cxt = oTable.getContextByIndex(idx);
//		var tablePath = cxt.sPath;
//		var tableObj = oTable.getModel().getProperty(tablePath);

//		tableObj.Vlcod = itemObj.Key;
//		},

		onWorkTimeDuration : function(oEvent){
			var oTable = this.oMain.oController.getView().byId("table_worktime");

			var idx = oEvent.getSource().getParent().getIndex();
			var cxt = oTable.getContextByIndex(idx);
			var path = cxt.sPath;
			var obj = oTable.getModel().getProperty(path);

			obj.Idaur = utils.cal_duration(obj.Isdd, obj.Isdz, obj.Iedd, obj.Iedz);

		},

		onFinish : function(oEvent){			
			var oDP = oEvent.oSource.getProperty("selected");
			var notif = this.sQmnum;
			
			var oModel = this.oMain.getModel("workResult");

			var controll = this;				
			var wtTable = controll.oMain.oController.getView().byId("table_worktime");
			var breakdown = controll.oMain.oController.getView().byId("msaus_wr").getSelected();
			var bmcm_hwr  = controll.oMain.oController.getView().byId("bmcm_hwr").getSelectedKey();
			var qmnum_hwr = controll.oMain.oController.getView().byId("qmnum_hwr").getValue();
			var auart_hwr = controll.oMain.oController.getView().byId("auart_hwr").getValue();
			
			var oData   = wtTable.getModel().getData();

			var screenModel = this.oDialog.getModel("break");
			var oBreakData = screenModel.getData();

			if(oDP && qmnum_hwr){
				for(var i=0; i<oData.WorktimeList.results.length; i++){
					oData.WorktimeList.results[i].Aueru = oDP;
				}	

				// Breakdown Data Hnadle
				oBreakData.Status = true;
//				if(oData.Zbmind == "BM"){
				if(auart_hwr =="PM01") {
					if(bmcm_hwr == "BM"){
						oBreakData.Mstatus = true;
						oBreakData.Msaus   = true;
					}else{					
						oBreakData.Mstatus = false;
						oBreakData.Msaus   = false;
					}
				}else {
					oBreakData.Mstatus = false;
					oBreakData.Msaus   = false;
				}

				if(oBreakData.Msaus){ // breakdown
					var today = new Date();
//					controll.oMain.oController.getView().byId("qmcod_wr").setSelectedKey(oBreakData.Qmcod);
					if(this.msaus){
						oBreakData.Msaus = this.msaus;
					}
					if(this.ausvn){
						oBreakData.Ausvn = this.ausvn;
					}else{
						controll.oMain.oController.getView().byId("ausvn_wr").setDateValue(today);	
					}

					if(this.ausbs){
						oBreakData.Ausbs = this.ausbs;
					}else{
						controll.oMain.oController.getView().byId("ausbs_wr").setDateValue(today);	
					}

					if(this.auztv){
						oBreakData.Auztv = this.auztv;
					}				

					if(this.auztb){
						oBreakData.Auztb = this.auztb;
					}	
//					debugger;
					if(this.ausztx){
						oBreakData.Ausztx = this.ausztx;	
					}

					oBreakData.Enable = true;						
				}else{
					oBreakData.Enable = false;
				}

			}else{
				for(var i=0; i<oData.WorktimeList.results.length; i++){
					oData.WorktimeList.results[i].Aueru = oDP;
				}	

				//Breakdown Data Hnadle
//				controll.oMain.oController.getView().byId("qmcod_wr").setValue("");
//				controll.oMain.oController.getView().byId("qmcod_wr").setSelectedKey("");
				controll.oMain.oController.getView().byId("qmcod_wr").setValueState("None");

				controll.oMain.oController.getView().byId("ausvn_wr").setValue("");
				controll.oMain.oController.getView().byId("auztv_wr").setValue("");
				controll.oMain.oController.getView().byId("ausbs_wr").setValue("");
				controll.oMain.oController.getView().byId("auztb_wr").setValue("");
				controll.oMain.oController.getView().byId("ausztx_wr").setValue("0.0");

				controll.oMain.oController.getView().byId("ausvn_wr").setValueState("None");
				controll.oMain.oController.getView().byId("auztv_wr").setValueState("None");
				controll.oMain.oController.getView().byId("ausbs_wr").setValueState("None");
				controll.oMain.oController.getView().byId("auztb_wr").setValueState("None");
				
				if(bmcm_hwr == "BM" & qmnum_hwr){
					oBreakData.Mstatus = true;
				}else{
					oBreakData.Mstatus = false;
				}	
			
				oBreakData.Msaus   = false;
//				oBreakData.Mstatus = false;
				oBreakData.Status  = false;
				oBreakData.Enable  = false;	
				
				
				for (var i=0; i<oData.FailurecodeList.results.length; i++) {
					oData.FailurecodeList.results[i].OteilValSt = 'None';
					oData.FailurecodeList.results[i].FecodValSt = 'None';
				}
							
			}

			wtTable.getModel().refresh();
			screenModel.refresh();
		},


	});

});