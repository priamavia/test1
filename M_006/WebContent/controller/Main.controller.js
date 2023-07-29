sap.ui.define([
		"cj/pm_m060/controller/BaseController",
		"cj/pm_m060/util/ValueHelpHelper",
		"cj/pm_m060/util/utils",
		"cj/pm_m060/model/formatter",
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/m/MessageBox",
		"sap/m/MessageToast",
		"jquery.sap.global",
	], function (BaseController, ValueHelpHelper, utils, formatter, JSONModel, Filter, FilterOperator, Message, Toast, jQuery) {
		"use strict";

		return BaseController.extend("cj.pm_m060.controller.Main", {
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
			    this.getView().byId("table4").setShowNoData(false);
			    this.getView().byId("table5").setShowNoData(false);
			    
			    var default_gsber ; 
				this.oGsber = this.getView().byId("Gsber");

				if(this.oGsber && this.oGsber.getItems().length == 0 ){
					for(var j=0; j<this.arr_swerk.length; j++){
						var template = new sap.ui.core.Item();
			            template.setKey(this.arr_swerk[j].Value);
			            template.setText(this.arr_swerk[j].KeyName);
			            this.oGsber.addItem(template);
			            
			            if(this.arr_swerk[j].Default ===  'X'){
			            	default_gsber = j;
			            }
				     }
			        this.oGsber.setSelectedKey(this.arr_swerk[default_gsber].Value);
				}
				
//				debugger;
//				
//				if (navigator.geolocation) {
//					navigator.geolocation.getCurrentPosition(function (position) {
//						alert(position.coords.latitude);
//						alert(position.coords.longitude);
//					});
//				} else {
//					MessageToast.show("Geolocation is not supported by this browser.");
//				}
				
				
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
 

			checkMandatory : function(){
				
				var oGsber = this.getView().byId("Gsber").getSelectedKey();
				if(!oGsber){
					return false;
				}
				var oSpmon = this.getView().byId("Spmon").getSelectedKey();
				if(!oSpmon){
					return false;
				}			
				
				return true;
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
			
			onDownloadExcel4 : function(oEvent){
				var oModel, oTable, sFilename;
				
				oTable = this.getView().byId("table4");
				oModel = oTable.getModel();
				sFilename = "File";
				
				utils.makeExcel(oModel, oTable, sFilename);
			},			
			
			onDownloadExcel5 : function(oEvent){
				var oModel, oTable, sFilename;
				
				oTable = this.getView().byId("table5");
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
			
			onClearAllSortings4 : function(oEvent){
				var oTable = this.getView().byId("table4");
				oTable.getBinding("rows").sort(null);
				utils.resetSortingState(oTable);
			},			

			onClearAllSortings5 : function(oEvent){
				var oTable = this.getView().byId("table5");
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
			
			onClearAllFilters4 : function(oEvent){
				var oTable = this.getView().byId("table4");

				var oUiModel = this.getView().getModel("ui");
				oUiModel.setProperty("/globalFilter", "");
				oUiModel.setProperty("/availabilityFilterOn", false);
				oUiModel.setProperty("/cellFilterOn", false);

				this._oGlobalFilter = null;
				this._filter4(); 

				var aColumns = oTable.getColumns();
				for (var i = 0; i < aColumns.length; i++) {
					oTable.filter(aColumns[i], null);
				}
			},			
			
			onClearAllFilters5 : function(oEvent){
				var oTable = this.getView().byId("table5");

				var oUiModel = this.getView().getModel("ui");
				oUiModel.setProperty("/globalFilter", "");
				oUiModel.setProperty("/availabilityFilterOn", false);
				oUiModel.setProperty("/cellFilterOn", false);

				this._oGlobalFilter = null;
				this._filter5(); 

				var aColumns = oTable.getColumns();
				for (var i = 0; i < aColumns.length; i++) {
					oTable.filter(aColumns[i], null);
				}
			},				
			
			onChangeGsber : function(oEvent){
			    var v_gsber = oEvent.oSource.getSelectedKey();

				this.oSpmon = this.getView().byId("Spmon");
				
				if(this.oSpmon){
					this.oSpmon.removeAllItems();
					this.oSpmon.setSelectedKey("");
					utils.set_search_field(v_gsber, this.oSpmon, "aud", "C", v_gsber, "");
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
								
		        var spmon = this.getView().byId("Spmon").getSelectedKey();
		        if(spmon != null || spmon != ""){
					this.getView().byId("Spmon").setValueState("None");				
		    	    return _check;		    	
		        }else{
		        	return false; 
		        }
	    		
			},			
			
			/*
			// Search 
			get_data : function(oEvent){
				var oModel = this.getView().getModel();
				var controll = this;
				var lange = this.getLanguage();
				
			  	//this.oTable = this.getView().byId("table");
			  	var oTable   = controll.getView().byId("table");
			  	var oTable2  = controll.getView().byId("table2");
			  	var oTable3  = controll.getView().byId("table3");
			  	var oTable4  = controll.getView().byId("table4");
			  	var oTable5  = controll.getView().byId("table5");
				
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
				
				oModel.attachRequestSent(function(){oTable4.setBusy(true);});
				oModel.attachRequestCompleted(function(){
					oTable4.setBusy(false);
					oTable4.setShowNoData(true);
			    });				
		
				oModel.attachRequestSent(function(){oTable5.setBusy(true);});
				oModel.attachRequestCompleted(function(){
					oTable5.setBusy(false);
					oTable5.setShowNoData(true);
			    });					
				
				debugger;
				
				var s_gsber;         //swerk
				var s_spmon  = [];   //spmon


				var s_filter = [];
				
				s_gsber = this.oGsber.getSelectedKey();
				
		    	var vSpmon = this.oSpmon.getSelectedKey();
		    	if(vSpmon){
		    		s_spmon.push(vSpmon);
		    	}
		    	if(s_spmon.length>0){
		    		s_filter.push(utils.set_filter(s_spmon, "Spmon"));
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

				var path = "/InputSet(Gsber='"+s_gsber+"',Spras='"+lange+"',Spmon='"+s_spmon+"')";
				var mParameters = {
					urlParameters : {
						"$expand" : "ResultList,ResultList2,ResultList3,ResultList4,ResultList5",
						"$filter" : filterStr
					},
					success : function(oData) {
						
						for (var i = 0; i < oData.ResultList.results.length; i++) {
							  var oAmt_sap  = parseFloat(oData.ResultList.results[i].Amt_sap);
							  var oAmt_real = parseFloat(oData.ResultList.results[i].Amt_real);
							  var oAmt_diff = parseFloat(oData.ResultList.results[i].Amt_diff);
							  var oAmt_idle = parseFloat(oData.ResultList.results[i].Amt_idle);
							  var oAmt_poor = parseFloat(oData.ResultList.results[i].Amt_poor);
							  
							  oData.ResultList.results[i].Amt_sap  = oAmt_sap;
							  oData.ResultList.results[i].Amt_real = oAmt_real;
							  oData.ResultList.results[i].Amt_diff = oAmt_diff;
							  oData.ResultList.results[i].Amt_idle = oAmt_idle;
							  oData.ResultList.results[i].Amt_poor = oAmt_poor;	
							}	
						
						for (var i = 0; i < oData.ResultList2.results.length; i++) {
							  var oQty_sap  = parseFloat(oData.ResultList2.results[i].Qty_sap);
							  var oQty_real = parseFloat(oData.ResultList2.results[i].Qty_real);
							  var oQty_diff = parseFloat(oData.ResultList2.results[i].Qty_diff);
							  var oQty_idle = parseFloat(oData.ResultList2.results[i].Qty_idle);
							  var oQty_poor = parseFloat(oData.ResultList2.results[i].Qty_poor);
							  
							  oData.ResultList2.results[i].Qty_sap  = oQty_sap;
							  oData.ResultList2.results[i].Qty_real = oQty_real;
							  oData.ResultList2.results[i].Qty_diff = oQty_diff;
							  oData.ResultList2.results[i].Qty_idle = oQty_idle;
							  oData.ResultList2.results[i].Qty_poor = oQty_poor;	
							}		
						
						for (var i = 0; i < oData.ResultList3.results.length; i++) {
							  var oQty_diff = parseFloat(oData.ResultList3.results[i].Qty_diff);
							  var oAmt_diff = parseFloat(oData.ResultList3.results[i].Amt_diff);
							  
							  oData.ResultList3.results[i].Qty_diff = oQty_diff;
							  oData.ResultList3.results[i].Amt_diff = oAmt_diff;
							}	
						
						for (var i = 0; i < oData.ResultList4.results.length; i++) {
							  var oQty_diff = parseFloat(oData.ResultList4.results[i].Qty_diff);
							  var oAmt_diff = parseFloat(oData.ResultList4.results[i].Amt_diff);
							  
							  oData.ResultList4.results[i].Qty_diff = oQty_diff;
							  oData.ResultList4.results[i].Amt_diff = oAmt_diff;
							}	
						
						for (var i = 0; i < oData.ResultList5.results.length; i++) {
							  var oQty_diff = parseFloat(oData.ResultList5.results[i].Qty_diff);
							  var oAmt_diff = parseFloat(oData.ResultList5.results[i].Amt_diff);
							  
							  oData.ResultList5.results[i].Qty_diff = oQty_diff;
							  oData.ResultList5.results[i].Amt_diff = oAmt_diff;
							}							
						
						
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
					 
					 var oODataJSONModel4 =  new sap.ui.model.json.JSONModel();  
					 oODataJSONModel4.setData(oData);
					 oTable4.setModel(oODataJSONModel4);
					 oTable4.bindRows("/ResultList4/results");						 
	
					 var oODataJSONModel5 =  new sap.ui.model.json.JSONModel();  
					 oODataJSONModel5.setData(oData);
					 oTable5.setModel(oODataJSONModel5);
					 oTable5.bindRows("/ResultList5/results");
					 
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
			},*/

			
			// Search 
			get_data : function(oEvent){
				var oModel = this.getView().getModel();
				var controll = this;
				var lange = this.getLanguage();    	
				
			  	//this.oTable = this.getView().byId("table");
			  	var oTable   = controll.getView().byId("table");
			  	var oTable2  = controll.getView().byId("table2");
			  	var oTable3  = controll.getView().byId("table3");
			  	var oTable4  = controll.getView().byId("table4");
			  	var oTable5  = controll.getView().byId("table5");
				
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
				
				oModel.attachRequestSent(function(){oTable4.setBusy(true);});
				oModel.attachRequestCompleted(function(){
					oTable4.setBusy(false);
					oTable4.setShowNoData(true);
			    });				
		
				oModel.attachRequestSent(function(){oTable5.setBusy(true);});
				oModel.attachRequestCompleted(function(){
					oTable5.setBusy(false);
					oTable5.setShowNoData(true);
			    });					
				
				debugger;
				
				// Set Range Condition ---------------------------------
				var s_gsber;         //swerk
				var s_spmon  = [];   //spmon
				var s_filter = [];
				
				s_gsber = this.oGsber.getSelectedKey();
				
		    	var vSpmon = this.oSpmon.getSelectedKey();
		    	if(vSpmon){
		    		s_spmon.push(vSpmon);
		    	}
		    	if(s_spmon.length>0){
		    		s_filter.push(utils.set_filter(s_spmon, "Spmon"));
			    }	    		
		    	//s_filter.push(utils.set_filter(s_spmon, "Spmon"));
	    		
		    	// Range to filterSrt ---------------------------------
				var filterStr;
				for(var i=0; i<s_filter.length; i++){
					
					if(i === 0){
						filterStr = s_filter[i];
					}else{
						filterStr = filterStr + " and " + s_filter[i];
					}
				}

				var path = "/InputSet(Gsber='"+s_gsber+"',Spras='"+lange+"',Spmon='"+s_spmon+"')";
				var mParameters = {
					urlParameters : {
						"$expand" : "ResultList,ResultList2,ResultList3,ResultList4,ResultList5",
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
							  var oAmt_sap  = parseFloat(oData.ResultList.results[i].Amt_sap);
							  var oAmt_real = parseFloat(oData.ResultList.results[i].Amt_real);
							  var oAmt_diff = parseFloat(oData.ResultList.results[i].Amt_diff);
							  var oAmt_idle = parseFloat(oData.ResultList.results[i].Amt_idle);
							  var oAmt_poor = parseFloat(oData.ResultList.results[i].Amt_poor);
							  var oWaers    = oData.ResultList.results[i].Waers;
							  
							  oData.ResultList.results[i].Amt_sap  = oAmt_sap;
							  oData.ResultList.results[i].Amt_real = oAmt_real;
							  oData.ResultList.results[i].Amt_diff = oAmt_diff;
							  oData.ResultList.results[i].Amt_idle = oAmt_idle;
							  oData.ResultList.results[i].Amt_poor = oAmt_poor;	
							  oData.ResultList.results[i].Waers    = oWaers;	
							}	
						
						for (var i = 0; i < oData.ResultList2.results.length; i++) {
							  var oQty_sap  = parseFloat(oData.ResultList2.results[i].Qty_sap);
							  var oQty_real = parseFloat(oData.ResultList2.results[i].Qty_real);
							  var oQty_diff = parseFloat(oData.ResultList2.results[i].Qty_diff);
							  var oQty_idle = parseFloat(oData.ResultList2.results[i].Qty_idle);
							  var oQty_poor = parseFloat(oData.ResultList2.results[i].Qty_poor);
							  
							  oData.ResultList2.results[i].Qty_sap  = oQty_sap;
							  oData.ResultList2.results[i].Qty_real = oQty_real;
							  oData.ResultList2.results[i].Qty_diff = oQty_diff;
							  oData.ResultList2.results[i].Qty_idle = oQty_idle;
							  oData.ResultList2.results[i].Qty_poor = oQty_poor;	
							}		
						
						for (var i = 0; i < oData.ResultList3.results.length; i++) {
							  var oQty_diff = parseFloat(oData.ResultList3.results[i].Qty_diff);
							  var oAmt_diff = parseFloat(oData.ResultList3.results[i].Amt_diff);
							  
							  oData.ResultList3.results[i].Qty_diff = oQty_diff;
							  oData.ResultList3.results[i].Amt_diff = oAmt_diff;
							}	
						
						for (var i = 0; i < oData.ResultList4.results.length; i++) {
							  var oQty_diff = parseFloat(oData.ResultList4.results[i].Qty_diff);
							  var oAmt_diff = parseFloat(oData.ResultList4.results[i].Amt_diff);
							  
							  oData.ResultList4.results[i].Qty_diff = oQty_diff;
							  oData.ResultList4.results[i].Amt_diff = oAmt_diff;
							}	
						
						for (var i = 0; i < oData.ResultList5.results.length; i++) {
							  var oQty_diff = parseFloat(oData.ResultList5.results[i].Qty_diff);
							  var oAmt_diff = parseFloat(oData.ResultList5.results[i].Amt_diff);
							  
							  oData.ResultList5.results[i].Qty_diff = oQty_diff;
							  oData.ResultList5.results[i].Amt_diff = oAmt_diff;
							}							
						
						
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
					 
					 var oODataJSONModel4 =  new sap.ui.model.json.JSONModel();  
					 oODataJSONModel4.setData(oData);
					 oTable4.setModel(oODataJSONModel4);
					 oTable4.bindRows("/ResultList4/results");						 
	
					 var oODataJSONModel5 =  new sap.ui.model.json.JSONModel();  
					 oODataJSONModel5.setData(oData);
					 oTable5.setModel(oODataJSONModel5);
					 oTable5.bindRows("/ResultList5/results");
					 
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

				data.Gsber = controll.getView().byId("Gsber").getSelectedKey();
				var text   = this.getView().byId("Spmon").getSelectedKey();
				var rndArr = text.split("-");				
				data.Spmon = rndArr[0];
				data.Round = rndArr[1];
				data.Spras = this.getLanguage();

		        data.ResultList 	= [];
				data.ResultList2	= [];
				data.ResultList3 	= [];
				data.ResultList4 	= [];
				data.ResultList5 	= [];

				//M060, M160 => controll, this 차이가 뭐지?
				
				var oTable = this.getView().byId("table");
				
				if(oTable.getModel().oData){
				//if(this.ResultList.results){	
					var astData = oTable.getModel().oData.ResultList.results; 
					//var astData = this.ResultList.results; 
					for (var i = 0; i < astData.length; i++) {
						var ast = {};
						if(astData[i].Anlkl){
							ast.Gsber    = data.Gsber
							ast.Spmon    = data.Spmon
							ast.Anlkl    = astData[i].Anlkl;
							ast.Txk50    = astData[i].Txk50;
							ast.Amt_sap  = astData[i].Amt_sap.toString();
							ast.Amt_real = astData[i].Amt_real.toString();
							ast.Amt_diff = astData[i].Amt_diff.toString();
							ast.Amt_idle = astData[i].Amt_idle.toString();
							ast.Amt_poor = astData[i].Amt_poor.toString();

							data.ResultList.push(ast); 
						}						
					}  	
				}

				var oTable2 = this.getView().byId("table2");
				
				if(oTable2.getModel().oData){
					var astData2 = oTable2.getModel().oData.ResultList2.results; 
					for (var i = 0; i < astData2.length; i++) {
						var ast2 = {};
						if(astData2[i].Anlkl){
							ast2.Anlkl    = astData2[i].Anlkl;
							ast2.Txk50    = astData2[i].Txk50;
							ast2.Maktx    = astData2[i].Maktx;
							ast2.Qty_sap  = astData2[i].Qty_sap.toString();
							ast2.Qty_real = astData2[i].Qty_real.toString();
							ast2.Qty_diff = astData2[i].Qty_diff.toString();
							ast2.Qty_idle = astData2[i].Qty_idle.toString();
							ast2.Qty_poor = astData2[i].Qty_poor.toString();
							
							data.ResultList2.push(ast2);
						}						
					}  
				}
				
				var oTable3 = this.getView().byId("table3");
				
				if(oTable3.getModel().oData){
					var astData3 = oTable3.getModel().oData.ResultList3.results; 
					for (var i = 0; i < astData3.length; i++) {
						var ast3 = {};
						if(astData3[i].Anln1){
							ast3.Anln1    = astData3[i].Anln1;
							ast3.Txt50    = astData3[i].Txt50;
							ast3.Qty_diff = astData3[i].Qty_diff.toString();
							ast3.Amt_diff = astData3[i].Amt_diff.toString();
							ast3.Reason   = astData3[i].Reason;
							ast3.Measure  = astData3[i].Measure;
							
							data.ResultList3.push(ast3);	
						}						
					}  
				}			
 				
				var oTable4 = this.getView().byId("table4");
				
				if(oTable4.getModel().oData){
					var astData4 = oTable4.getModel().oData.ResultList4.results; 
					for (var i = 0; i < astData4.length; i++) {
						var ast4 = {};
						if(astData4[i].Anlkl){
							ast4.Anlkl    = astData4[i].Anlkl;
							ast4.Txk50    = astData4[i].Txk50;
							ast4.Qty_diff = astData4[i].Qty_diff.toString();
							ast4.Amt_diff = astData4[i].Amt_diff.toString();
							ast4.Reason   = astData4[i].Reason;
							ast4.Measure  = astData4[i].Measure;
							
							data.ResultList4.push(ast4);	
						}						
					}  
				}					
				
				var oTable5 = this.getView().byId("table5");
				
				if(oTable5.getModel().oData){
					var astData5 = oTable5.getModel().oData.ResultList5.results; 
					for (var i = 0; i < astData5.length; i++) {
						var ast5 = {};
						if(astData5[i].Anln1){
							ast5.Anln1    = astData5[i].Anln1;
							ast5.Txt50    = astData5[i].Txt50;
							ast5.Qty_diff = astData5[i].Qty_diff.toString();
							ast5.Amt_diff = astData5[i].Amt_diff.toString();
							ast5.Reason   = astData5[i].Reason;
							ast5.Measure  = astData5[i].Measure;
							
							data.ResultList5.push(ast5);	
						}						
					}  
				}					
				
				var mParameters = {
						success : function(oData) {
							if(oData.RetType == "E" ){
								sap.m.MessageBox.show(
										oData.RetMsg ,
										sap.m.MessageBox.Icon.ERROR,
										this.i18n.getText("error")
										);
							}
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
				
				var v_gsber = this.oGsber.getSelectedKey();
				
				// Month End Closing
				this.oSpmon = this.getView().byId("Spmon");
				if(this.oSpmon){
					utils.set_search_field(v_gsber, this.oSpmon, "aud", "C", v_gsber, "");					
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
			
			_filter4 : function() {
				var oFilter = null;

				if (this._oGlobalFilter) {
					oFilter = this._oGlobalFilter;
				}

				this.getView().byId("table4").getBinding("rows").filter(oFilter,
						"Application");
			},

			_filter5 : function() {
				var oFilter = null;

				if (this._oGlobalFilter) {
					oFilter = this._oGlobalFilter;
				}

				this.getView().byId("table5").getBinding("rows").filter(oFilter,
						"Application");
			}			
			
	      
	});
});