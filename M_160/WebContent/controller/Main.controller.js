sap.ui.define([
		"cj/pm_m160/controller/BaseController",
		"cj/pm_m160/util/ValueHelpHelper",
		"cj/pm_m160/util/utils",
		"cj/pm_m160/model/formatter",
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/m/MessageBox",
		"sap/m/MessageToast",
		"jquery.sap.global",
	], function (BaseController, ValueHelpHelper, utils, formatter, JSONModel, Filter, FilterOperator, Message, Toast, jQuery) {
		"use strict";

		return BaseController.extend("cj.pm_m160.controller.Main", {
           formatter : formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @public
		 */
			onInit : function () {
			
				var oView = this.getView();

				oView.setModel(new JSONModel({
					globalFilter: "",
					availabilityFilterOn: false,
					cellFilterOn: false
				}), "ui");

			},

		/**
		* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		* (NOT before the first rendering! onInit() is used for that one!).
		*/
			onBeforeRendering: function() {
//				this.i18n = this.getView().getModel("i18n").getResourceBundle();
//			
//				utils.makeSerachHelpHeader(this);	
				
				this.getLoginInfo();
				this.set_userData();  //"User Auth"
				this.set_screen_mode();
		
//				this.chart_model();
			},
			
		/**
		* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		* This hook is the same one that SAPUI5 controls get after being rendered.
		*/
/*		    onAfterRendering: function() {

			    jQuery.sap.delayedCall(d5000, this, function() {
			    	$("input[id*='createby']").focus().trigger("");
			    });
			
			},*/

		/**
		* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		*/
//			onExit: function() {
//			},
			
			
			setInitData : function(){
								
			    this.getView().byId("table").setShowNoData(false);
			    this.getView().byId("table2").setShowNoData(false);
			    this.getView().byId("table3").setShowNoData(false);

			
			    var default_werks ;
				this.oWerks = this.getView().byId("Werks");

				if(this.oWerks && this.oWerks.getItems().length == 0 ){
					for(var j=0; j<this.arr_swerk.length; j++){
						var template = new sap.ui.core.Item();
			            template.setKey(this.arr_swerk[j].Value);
			            template.setText(this.arr_swerk[j].KeyName);
			            this.oWerks.addItem(template);
			
			            if(this.arr_swerk[j].Default ===  'X'){
			            	default_werks = j;
			            }
				     }
			        this.oWerks.setSelectedKey(this.arr_swerk[default_werks].Value);
				}
				
				debugger;
			    var v_werks = this.oWerks.getSelectedKey();

				this.oSpmon = this.getView().byId("Spmon");
				
				if(this.oSpmon){
					this.oSpmon.removeAllItems();
					this.oSpmon.setSelectedKey("");
					utils.set_search_field(v_werks, this.oSpmon, "aud", "C", v_werks, "M");
				}
				
			},

	        /*
	         * get User Default Value
	         */
			set_userData : function() {
				
			    var oModel = this.getView().getModel("userInfo");
			    var path = "/UserAuthSet";
			
				var controll = this;

				var mParameters = {
				    urlParameters : {
						"$filter" : "UserName eq '"+ controll.getLoginId() + "'"	
					},
					success : function(oData) {
					   var userDefault = [];
					
					   for(var i=0; i<oData.results.length; i++){
						  userDefault.push(
							 {
						    	"Auth" : oData.results[i].Auth,
						    	"Value" : oData.results[i].Value,
						    	"Name"  : oData.results[i].Name,
						    	"KeyName" : oData.results[i].KeyName,
						    	"Default" : oData.results[i].Default,
						    	"Add1" : oData.results[i].Add1,
						    	"Add2" : oData.results[i].Add2
							  }
						   );
					   }				   				
					   controll.set_UserInfo(userDefault);
					
					   debugger;
					   this.i18n = this.getView().getModel("i18n").getResourceBundle();				
					   utils.makeSerachHelpHeader(this);	
					
					   controll.set_auth();
					   controll.setInitData();
					   controll._set_search_field();  // set Search Help
					}.bind(this),
					error : function(oError) {
						jQuery.sap.log.info("Odata Error occured");
						Toast.show("Error");
					}.bind(this)
				};
				oModel.read(path, mParameters);			
			},

			
			//* User Default Setting
			set_auth : function(){
				this.arr_swerk = this.get_Auth("SWERK");				
				this.arr_kostl = this.get_Auth("KOSTL");
				this.arr_kokrs = this.get_Auth("KOKRS");
//				this.local_date = this.get_Auth("LOCDAT");
//				this.dateformat = this.get_Auth("DATFORMAT");
//				this.timezone = this.get_Auth("TIMEZ");			
				this.locDate    = this.get_Auth("LOCDAT")[0].Value;
				this.locTime    = this.get_Auth("LOCTIM")[0].Value;
				this.dateFormat = this.get_Auth("DATFORMAT")[0].Value;
				this.sep        = this.get_Auth("SEP")[0].Value;
				
				//테스트 20220719
				//sap.m.URLHelper.redirect("www.naver.com", true); 인가받지 않은 ip? mac? 일 경우 에러페이지로 이동
				
			},

	/****************************************************************
	 *  External SearchHelp Event Handler
	 ****************************************************************/			
			onClose_searchEquip : function(aTokens){
				var oEqunr = this.getView().byId("equnr");
				oEqunr.setTokens(aTokens);
			},
			
			
			onClose_funcLocation : function(aTokens){
				var oFl = this.getView().byId("fl");
				oFl.setTokens(aTokens);
			},
			
			
	/****************************************************************
	 *  Event Handler
	 ****************************************************************/
			
           onValueHelpRequest : function(oEvent){
				
				var strArr = oEvent.oSource.sId.split("--");
				var cnt = strArr.length - 1;
				var sIdstr = strArr[cnt];
				
				var s_swerk = this.oSwerk.getSelectedKey();
				
				if(sIdstr === "equnr"){
                	this.getOwnerComponent().openSearchEqui_Dialog(this, "MultiToggle", s_swerk);
				}else if(sIdstr === "fl"){
					this.getOwnerComponent().openFuncLocation_Dialog(this, "Single",  s_swerk);   //"MultiToggle"
				}else{
					utils.openValueHelp(sIdstr);
				}
			},
						
			
			onSearch : function(oEvent){
				debugger;
				
				//var result = utils.checkMandatory(this, "mainpage");
				var result = this.checkMandatory();
				
				if(result){
				   //result = this.check_data();
					
				   if(result){
					this.get_data(oEvent);
				   }
				}else{
				   sap.m.MessageBox.show(
							 this.i18n.getText("check_mandatory"),
							 sap.m.MessageBox.Icon.ERROR,
							 this.i18n.getText("error")
						   );						
				}							
			},

			onReqApprove : function(oEvent){
				debugger;
				
				//var result = utils.checkMandatory(this, "mainpage");
				var result = this.checkMandatory();
				
				if(result){
				   //result = this.check_data();
					
				   if(result){
					this.req_approve(oEvent);
				   }
				}else{
				   sap.m.MessageBox.show(
							 this.i18n.getText("check_mandatory"),
							 sap.m.MessageBox.Icon.ERROR,
							 this.i18n.getText("error")
						   );						
				}							
			},
			
			checkMandatory : function(){
				
				var oWerks = this.getView().byId("Werks").getSelectedKey();
				if(!oWerks){
					return false;
				}
				var oSpmon = this.getView().byId("Spmon").getSelectedKey();
				if(!oSpmon){
					return false;
				}			
				
				return true;
			},
			
		
			
			
			
			onDownloadExcel : function(oEvent){
				var oModel, oTable, sFilename;
				
				oTable = this.getView().byId("table");
				oModel = oTable.getModel();
				sFilename = "File";
				
				utils.makeExcel(oModel, oTable, sFilename);
			},
			
			onDownloadExcel2 : function(oEvent){
				var oModel, oTable, sFilename;
				
				oTable = this.getView().byId("table2");
				oModel = oTable.getModel();
				sFilename = "File";
				
				utils.makeExcel(oModel, oTable, sFilename);
			},
			
			onDownloadExcel3 : function(oEvent){
				var oModel, oTable, sFilename;
				
				oTable = this.getView().byId("table3");
				oModel = oTable.getModel();
				sFilename = "File";
				
				utils.makeExcel(oModel, oTable, sFilename);
			},			
			
			onClearAllSortings : function(oEvent){
				var oTable = this.getView().byId("table");
				oTable.getBinding("rows").sort(null);
				utils.resetSortingState(oTable);
			},
			
			onClearAllSortings2 : function(oEvent){
				var oTable = this.getView().byId("table2");
				oTable.getBinding("rows").sort(null);
				utils.resetSortingState(oTable);
			},
			
			onClearAllSortings3 : function(oEvent){
				var oTable = this.getView().byId("table3");
				oTable.getBinding("rows").sort(null);
				utils.resetSortingState(oTable);
			},			
			
			
			onClearAllFilters : function(oEvent){
				var oTable = this.getView().byId("table");

				var oUiModel = this.getView().getModel("ui");
				oUiModel.setProperty("/globalFilter", "");
				oUiModel.setProperty("/availabilityFilterOn", false);
				oUiModel.setProperty("/cellFilterOn", false);

				this._oGlobalFilter = null;
				this._filter();

				var aColumns = oTable.getColumns();
				for (var i = 0; i < aColumns.length; i++) {
					oTable.filter(aColumns[i], null);
				}
			},
			
			onClearAllFilters2 : function(oEvent){
				var oTable = this.getView().byId("table2");

				var oUiModel = this.getView().getModel("ui");
				oUiModel.setProperty("/globalFilter", "");
				oUiModel.setProperty("/availabilityFilterOn", false);
				oUiModel.setProperty("/cellFilterOn", false);

				this._oGlobalFilter = null;
				this._filter2();

				var aColumns = oTable.getColumns();
				for (var i = 0; i < aColumns.length; i++) {
					oTable.filter(aColumns[i], null);
				}
			},
			
			onClearAllFilters3 : function(oEvent){
				var oTable = this.getView().byId("table3");

				var oUiModel = this.getView().getModel("ui");
				oUiModel.setProperty("/globalFilter", "");
				oUiModel.setProperty("/availabilityFilterOn", false);
				oUiModel.setProperty("/cellFilterOn", false);

				this._oGlobalFilter = null;
				this._filter3();

				var aColumns = oTable.getColumns();
				for (var i = 0; i < aColumns.length; i++) {
					oTable.filter(aColumns[i], null);
				}
			},			
			
			onChangewerks : function(oEvent){
			    var v_werks = oEvent.oSource.getSelectedKey();

				this.oSpmon = this.getView().byId("Spmon");
				
				if(this.oSpmon){
					this.oSpmon.removeAllItems();
					this.oSpmon.setSelectedKey("");
					//utils.set_search_field(v_werks, this.oSpmon, "aud", "C", v_werks, "");
					utils.set_search_field(v_werks, this.oSpmon, "aud", "C", v_werks, "M");
				}
			},
			

			onHandleDateChange : function(oEvent){
				var oDP = oEvent.oSource;
				var bValid = oEvent.getParameter("valid");

				if (bValid) {
					oDP.setValueState(sap.ui.core.ValueState.None);
				} else {
					oDP.setValueState(sap.ui.core.ValueState.Error);
				}
			},
			
			
      //**************************************************************/		
			
			check_data : function(){
				
				var _check = true;
								
		        var Spmon = this.getView().byId("Spmon").getSelectedKey();
		        if(Spmon != null || Spmon != ""){
					this.getView().byId("Spmon").setValueState("None");				
		    	    return _check;		    	
		        }else{
		        	return false;
		        }
	    		
			},			
			
			// Search
			get_data : function(oEvent){
				var oModel = this.getView().getModel();
				var controll = this;
				var lange = this.getLanguage();
				
			  	//this.oTable = this.getView().byId("table");
			  	var oTable   = controll.getView().byId("table");
			  	var oTable2  = controll.getView().byId("table2");
			  	var oTable3  = controll.getView().byId("table3");
				
				oModel.attachRequestSent(function(){oTable.setBusy(true);});
				oModel.attachRequestCompleted(function(){
					//controll.oTable.setBusy(false);
					//controll.oTable.setShowNoData(true);
					oTable.setBusy(false);
					oTable.setShowNoData(true);
			    });

				oModel.attachRequestSent(function(){oTable2.setBusy(true);});
				oModel.attachRequestCompleted(function(){
					oTable2.setBusy(false);
					oTable2.setShowNoData(true);
			    });
				
				oModel.attachRequestSent(function(){oTable3.setBusy(true);});
				oModel.attachRequestCompleted(function(){
					oTable3.setBusy(false);
					oTable3.setShowNoData(true);
			    });				
				
				debugger;
				
				var s_werks;         //swerk
				var s_spmon  = [];   //spmon
				var s_round  = [];   //round


				var s_filter = [];
				
				s_werks = this.getView().byId("Werks").getSelectedKey();
				//s_werks = this.oWerks.getSelectedKey();				
				var text   = this.getView().byId("Spmon").getSelectedKey();
				//var text   = this.oSpmon.getSelectedKey();
				var rndArr = text.split("-");
				
				var iSpmon = rndArr[0];
				var iRound = rndArr[1];
				
				
		    	//var vSpmon = this.oSpmon.getSelectedKey();
		    	//if(vSpmon){
		    	if(iSpmon){
		    		s_spmon.push(iSpmon);
		    	}
		    	if(s_spmon.length>0){
		    		s_filter.push(utils.set_filter(s_spmon, "Spmon"));
			    }
	    		
		    	if(iRound){
		    		s_round.push(iRound);
		    	}
		    	if(s_round.length>0){
		    		s_filter.push(utils.set_filter(s_round, "Round"));
			    }		    	
		    	
		    	//s_filter.push(utils.set_filter(s_spmon, "Spmon"));
	    		
				var filterStr;
				for(var i=0; i<s_filter.length; i++){
					
					if(i === 0){
						filterStr = s_filter[i];
					}else{
						filterStr = filterStr + " and " + s_filter[i];
					}
				}

				// /InputSet의 param과 segw data model property에 key로 지정된건 맞춰야함 + $filter는 모든 필드 다 맞춰야 함.&nbsp;
				var path = "/InputSet(Werks='"+s_werks+"',Spras='"+lange+"',Spmon='"+s_spmon+"',Round='"+s_round+"')";
				var mParameters = {
					urlParameters : {
						"$expand" : "ResultList,ResultList2,ResultList3",
						"$filter" : filterStr
					},
					success : function(oData) {
				    	var screenModel = this.getView().getModel("screenMode");
				    	var screenData = screenModel.getData();
				    	
						if(oData.Stat == "A" || oData.Stat == "P"){
							screenData.approve 	= false;							
						}else{
							screenData.approve 	= true;
						}
						
						screenModel.refresh();
						
						for (var i = 0; i < oData.ResultList.results.length; i++) {
							  var oCntt_sap = parseFloat(oData.ResultList.results[i].Cntt_sap);
							  var oCnt_sap  = parseFloat(oData.ResultList.results[i].Cnt_sap);
							  var oCnt_real = parseFloat(oData.ResultList.results[i].Cnt_real);
							  var oQty_sap  = parseFloat(oData.ResultList.results[i].Qty_sap);					
							  var oQty_real = parseFloat(oData.ResultList.results[i].Qty_real);							
							  var oQty_diff = parseFloat(oData.ResultList.results[i].Qty_diff);
							
							  oData.ResultList.results[i].Cntt_sap = oCntt_sap;
							  oData.ResultList.results[i].Cnt_sap  = oCnt_sap;	
							  oData.ResultList.results[i].Cnt_real = oCnt_real;	
							  oData.ResultList.results[i].Qty_sap  = oQty_sap;							
							  oData.ResultList.results[i].Qty_real = oQty_real;
							  oData.ResultList.results[i].Qty_diff = oQty_diff;		
							}	
						
						for (var i = 0; i < oData.ResultList2.results.length; i++) {
							  var oQty_sap  = parseFloat(oData.ResultList2.results[i].Qty_sap);
							  var oQty_real = parseFloat(oData.ResultList2.results[i].Qty_real);
							  var oQty_diff = parseFloat(oData.ResultList2.results[i].Qty_diff);
							
							  oData.ResultList2.results[i].Qty_sap  = oQty_sap;
							  oData.ResultList2.results[i].Qty_real = oQty_real;
							  oData.ResultList2.results[i].Qty_diff = oQty_diff;
	
							}							
						
						for (var i = 0; i < oData.ResultList3.results.length; i++) {
							  var oQty_sap  = parseFloat(oData.ResultList3.results[i].Qty_sap);
							  var oQty_real = parseFloat(oData.ResultList3.results[i].Qty_real);
							  var oQty_bad  = parseFloat(oData.ResultList3.results[i].Qty_bad);
							
							  oData.ResultList3.results[i].Qty_sap  = oQty_sap;
							  oData.ResultList3.results[i].Qty_real = oQty_real;
							  oData.ResultList3.results[i].Qty_bad  = oQty_bad;
	
							}							
					
				     oTable.setVisibleRowCount(oData.ResultList.results.length);
				
					 var oODataJSONModel =  new sap.ui.model.json.JSONModel();
					 oODataJSONModel.setData(oData);
					 //controll.oTable.setModel(oODataJSONModel);
					 //controll.oTable.bindRows("/results");
					 oTable.setModel(oODataJSONModel);
					 oTable.bindRows("/ResultList/results");
					
					 var oODataJSONModel2 =  new sap.ui.model.json.JSONModel();
					 oODataJSONModel2.setData(oData);
					 oTable2.setModel(oODataJSONModel2);
					 oTable2.bindRows("/ResultList2/results");					
					
					 var oODataJSONModel3 =  new sap.ui.model.json.JSONModel();
					 oODataJSONModel3.setData(oData);
					 oTable3.setModel(oODataJSONModel3);
					 oTable3.bindRows("/ResultList3/results");						
					
					 this.ResultList = [];
					 this.ResultList = oData.ResultList;
					 this.ResultList2 = [];
					 this.ResultList2 = oData.ResultList2;
					 this.ResultList3 = [];
					 this.ResultList3 = oData.ResultList3;
					 
					 //this.Nav2160 = [];
					 //this.Nav2160 = oData.Nav2160;
					 
					 //controll.openWin("http://dev.cjwise.net/officeon/globalcj/approval/approval.detailPopup?approKey=51425");
					 //controll.openWin("http://www.naver.com"); //전자결재 포탈 open
					}.bind(this),
					error : function() {
					   sap.m.MessageBox.show(
						 controll.i18n.getText("error"),
						 sap.m.MessageBox.Icon.ERROR,
						 controll.i18n.getText("error")
					   );
					}.bind(this)
				};
			     oModel.read(path, mParameters);
			},

			// 전자결재 호출 URL get
			req_approve : function(oEvent){
				
				debugger;
				
				var oModel = this.getView().getModel();
				var controll = this;
				var lange = this.getLanguage();
				//controll.mainpage = this.getView().byId("mainpage");
				
				var data = {};

				data.Werks = controll.getView().byId("Werks").getSelectedKey();
				var text   = this.getView().byId("Spmon").getSelectedKey();
				var rndArr = text.split("-");				
				data.Spmon = rndArr[0];
				data.Round = rndArr[1];
				data.Spras = this.getLanguage();

		        data.ResultList 	= [];
				data.ResultList2	= [];
				data.ResultList3 	= [];
				
				/*data.InputOutput 	= [];
				data.InputOutput2	= [];
				data.InputOutput3 	= [];*/
				
				//var oTable  = controll.getView().byId("Table");
				//if(oTable.getModel().getData()){
				if(controll.ResultList.results){
					var matData = controll.ResultList.results; 
					for (var i = 0; i < matData.length; i++) {
						var mat = {};
						if(matData[i].Lgort){
							mat.Werks    = data.Werks
							mat.Spmon    = data.Spmon
							mat.Lgort    = matData[i].Lgort;
							mat.Lgobe    = matData[i].Lgobe;
							mat.Cntt_sap = matData[i].Cntt_sap.toString();
							mat.Cnt_sap  = matData[i].Cnt_sap.toString();
							mat.Cnt_real = matData[i].Cnt_real.toString();
							mat.Rate     = matData[i].Rate;
							mat.Qty_sap  = matData[i].Qty_sap.toString();
							mat.Qty_real = matData[i].Qty_real.toString();
							mat.Qty_diff = matData[i].Qty_diff.toString();
							mat.Qty_bad  = matData[i].Qty_bad.toString();
							mat.Meins    = matData[i].Meins;
							mat.Waers    = matData[i].Waers;

							data.ResultList.push(mat);
							//data.InputOutput.push(mat);	 
						}						
					}  	
				}
				
				//var oTable2 = this.getView().byId("Table2");
				if(controll.ResultList2.results){
					var matData2 = controll.ResultList2.results; 
					for (var i = 0; i < matData2.length; i++) {
						var mat2 = {};
						if(matData2[i].Lgort){
							mat2.Lgort    = matData2[i].Lgort;
							mat2.Matnr    = matData2[i].Matnr;
							mat2.Maktx    = matData2[i].Maktx;
							mat2.Qty_sap  = matData2[i].Qty_sap.toString();
							mat2.Qty_real = matData2[i].Qty_real.toString();
							mat2.Qty_diff = matData2[i].Qty_diff.toString();
							mat2.Reason   = matData2[i].Reason;
							mat2.Rackno   = matData2[i].Rackno;
							mat2.Meins    = matData2[i].Meins;
							mat2.Waers    = matData2[i].Waers;
							
							data.ResultList2.push(mat2);
							//data.InputOutput2.push(mat);
						}						
					}  
				}
				
				//var oTable3 = this.getView().byId("Table3");
				if(controll.ResultList3.results){
					var matData3 = controll.ResultList3.results; 
					for (var i = 0; i < matData3.length; i++) {
						var mat3 = {};
						if(matData3[i].Lgort){
							mat3.Lgort    = matData3[i].Lgort;
							mat3.Matnr    = matData3[i].Matnr;
							mat3.Maktx    = matData3[i].Maktx;
							mat3.Qty_sap  = matData3[i].Qty_sap.toString();
							mat3.Qty_real = matData3[i].Qty_real.toString();
							mat3.Qty_bad  = matData3[i].Qty_bad.toString();
							mat3.Reason   = matData3[i].Reason;
							mat3.Rackno   = matData3[i].Rackno;
							mat3.Meins    = matData3[i].Meins;
							mat3.Waers    = matData3[i].Waers;
							
							data.ResultList3.push(mat3);	
							//data.InputOutput3.push(mat);
						}						
					}  
				}			
 					
				
				var mParameters = {
						success : function(oData) {
							// 전자결재 URL 받아오는거 여기에 코딩하기
							if(oData.Zpturl){     // 전자결재 URL 리턴 시 새창
								controll.openWin( oData.Zpturl);
							}
							 //controll.openWin("http://dev.cjwise.net/officeon/globalcj/approval/approval.detailPopup?approKey=51425");
							 //controll.openWin("http://www.naver.com"); //전자결재 포탈 open	

						}.bind(this),
						error : function() {
							sap.m.MessageBox.show(
									this.i18n.getText("oData_conn_error"),
									sap.m.MessageBox.Icon.ERROR,
									this.i18n.getText("error")
							);
						}.bind(this)
				};
				oModel.create("/InputSet", data, mParameters);
			},
			
			openWin : function(sPath){
				var html = new sap.ui.core.HTML();

				$(document).ready(function(){
					window.open(sPath);
				});
			},			
			
		    set_screen_mode : function(){
		        var oView = this.getView();

		        oView.setModel(new JSONModel({
			        approve 	 : true,
		        }), "screenMode");
		    },			
			
			_set_search_field : function(){
				
				var v_werks = this.oWerks.getSelectedKey();
				
				// Month End Closing
				this.oSpmon = this.getView().byId("Spmon");
				if(this.oSpmon){
					utils.set_search_field(v_werks, this.oSpmon, "aud", "C", v_werks, "M");					
				}	
									
			},

			_filter : function() {
				var oFilter = null;

				if (this._oGlobalFilter) {
					oFilter = this._oGlobalFilter;
				}

				this.getView().byId("table").getBinding("rows").filter(oFilter,
						"Application");
			},
			
			_filter2 : function() {
				var oFilter = null;

				if (this._oGlobalFilter) {
					oFilter = this._oGlobalFilter;
				}

				this.getView().byId("table2").getBinding("rows").filter(oFilter,
						"Application");
			},	

			_filter3 : function() {
				var oFilter = null;

				if (this._oGlobalFilter) {
					oFilter = this._oGlobalFilter;
				}

				this.getView().byId("table3").getBinding("rows").filter(oFilter,
						"Application");
			},	
			
	
	});
});