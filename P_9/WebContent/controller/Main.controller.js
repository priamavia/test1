sap.ui.define([
		"cj/pm0230/controller/BaseController",
		"cj/pm0230/util/ValueHelpHelper",
		"cj/pm0230/util/utils",
		"cj/pm0230/model/formatter",
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/m/MessageBox",
		"sap/m/MessageToast",
		"jquery.sap.global",
	], function (BaseController, ValueHelpHelper, utils, formatter, JSONModel, Filter, FilterOperator, Message, Toast, jQuery) {
		"use strict";

		return BaseController.extend("cj.pm0230.controller.Main", {
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
				
				var todayDate = this.formatter.strToDate(this.locDate);
				var c_year = todayDate.getFullYear()
				var c_month = todayDate.getMonth() + 1;
				var str_month;
				if(c_month < 10){
					str_month = "0" + c_month;
				}else{
					str_month = c_month.toString();
				}
				var str_month_from = "01";
				
				var period_from = this.getView().byId("period_from");			
				utils.set_year(period_from, c_year);
				period_from.setSelectedKey(c_year);
				
				var period_from_month = this.getView().byId("period_from_month");	
				utils.set_month(period_from_month);
				period_from_month.setSelectedKey(str_month_from);
				
				var period_to   = this.getView().byId("period_to");
				utils.set_year(period_to, c_year);
				period_to.setSelectedKey(c_year);
				
				var period_to_month = this.getView().byId("period_to_month");	
				utils.set_month(period_to_month);
				period_to_month.setSelectedKey(str_month);
				
			    this.getView().byId("table").setShowNoData(false);
			    
			    var default_swerk ;
				this.oSwerk = this.getView().byId("swerk");

				if(this.oSwerk && this.oSwerk.getItems().length == 0 ){
					for(var j=0; j<this.arr_swerk.length; j++){
						var template = new sap.ui.core.Item();
			            template.setKey(this.arr_swerk[j].Value);
			            template.setText(this.arr_swerk[j].KeyName);
			            this.oSwerk.addItem(template);
			            
			            if(this.arr_swerk[j].Default ===  'X'){
			            	default_swerk = j;
			            }
				     }
			        this.oSwerk.setSelectedKey(this.arr_swerk[default_swerk].Value);
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
					   
					   controll.chart_model();
					   controll.chart2_model();
					   controll.chart3_model();
					   controll.chart4_model();
					   controll.chart4_2_model();
					   controll.chart5_model();
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
				var result = utils.checkMandatory(this, "mainpage");
				
				if(result){
				   result = this.check_data();
					
				   if(result){
					this.get_data(oEvent);
				   }
				}else{
					sap.m.MessageBox.show(
						this.i18n.getText("check_mandatory"),
						sap.m.MessageBox.Icon.ERROR,
					    this.i18n.getText("Error")
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
			
			
			onClearAllSortings : function(oEvent){
				var oTable = this.getView().byId("table");
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
	
			onDownloadExcel2 : function(oEvent){
				var oModel, oTable, sFilename;
				
				oTable = this.getView().byId("table2");
				oModel = oTable.getModel();
				sFilename = "File";
				
				utils.makeExcel(oModel, oTable, sFilename);
			},
			
			
			onClearAllSortings2 : function(oEvent){
				var oTable = this.getView().byId("table2");
				oTable.getBinding("rows").sort(null);
				utils.resetSortingState(oTable);
			},
			
			
			onClearAllFilters2 : function(oEvent){
				var oTable = this.getView().byId("table2");

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
			
			onDownloadExcel3 : function(oEvent){
				var oModel, oTable, sFilename;
				
				oTable = this.getView().byId("table3");
				oModel = oTable.getModel();
				sFilename = "File";
				
				utils.makeExcel(oModel, oTable, sFilename);
			},
			
			
			onClearAllSortings3 : function(oEvent){
				var oTable = this.getView().byId("table3");
				oTable.getBinding("rows").sort(null);
				utils.resetSortingState(oTable);
			},
			
			
			onClearAllFilters3 : function(oEvent){
				var oTable = this.getView().byId("table3");

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
			
			onDownloadExcel4 : function(oEvent){
				var oModel, oTable, sFilename;
				
				oTable = this.getView().byId("table4");
				oModel = oTable.getModel();
				sFilename = "File";
				
				utils.makeExcel(oModel, oTable, sFilename);
			},
			
			
			onClearAllSortings4 : function(oEvent){
				var oTable = this.getView().byId("table4");
				oTable.getBinding("rows").sort(null);
				utils.resetSortingState(oTable);
			},
			
			
			onClearAllFilters4 : function(oEvent){
				var oTable = this.getView().byId("table4");

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
			
			onDownloadExcel5 : function(oEvent){
				var oModel, oTable, sFilename;
				
				oTable = this.getView().byId("table5");
				oModel = oTable.getModel();
				sFilename = "File";
				
				utils.makeExcel(oModel, oTable, sFilename);
			},
			
			
			onClearAllSortings5 : function(oEvent){
				var oTable = this.getView().byId("table5");
				oTable.getBinding("rows").sort(null);
				utils.resetSortingState(oTable);
			},
			
			
			onClearAllFilters5 : function(oEvent){
				var oTable = this.getView().byId("table5");

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
			
			// Maint. Plant甫 函版 沁阑锭  
			onSelChange : function(){
				
				//this.getView().byId("fl").removeAllTokens();
				this.oPls.setSelectedKey("");
				//this.oLoc.setSelectedKey("");
				this.oWoc.setSelectedKey("");
		    	//this.oTot.setSelectedKey("");
		    	//this.oAbi.setSelectedKey("");
		    	
		    	this._set_search_field();
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
								
		        var from = this.getView().byId("period_from").getSelectedKey();
		        var from_mon = this.getView().byId("period_from_month").getSelectedKey();
		        
				var to = this.getView().byId("period_to").getSelectedKey();
				var to_mon = this.getView().byId("period_to_month").getSelectedKey();
				
				if(parseInt(from) > parseInt(to)){
					var message = this.i18n.getText("err_date_period");
					sap.m.MessageBox.show(
					     message,
						 sap.m.MessageBox.Icon.ERROR,
						 this.i18n.getText("Error")
				   );
					this.getView().byId("period_from").setValueState("Error");
					this.getView().byId("period_to").setValueState("Error");
					
					_check = false;
					return 
				}else if(parseInt(from) == parseInt(to)){
					this.getView().byId("period_from").setValueState("None");
					this.getView().byId("period_to").setValueState("None");
					
					if(parseInt(from_mon) > parseInt(to_mon)){
						var message = this.i18n.getText("err_date_period");
						sap.m.MessageBox.show(
						     message,
							 sap.m.MessageBox.Icon.ERROR,
							 this.i18n.getText("Error")
					   );
						this.getView().byId("period_from_month").setValueState("Error");
						this.getView().byId("period_to_month").setValueState("Error");
						
						_check = false;
						return 
					}
				}
				
				var from_ym = from + from_mon;
				var to_ym   = to   + to_mon;
				var diff = parseInt(to_ym) - parseInt(from_ym); 
				if(diff > 99){
					var message = this.i18n.getText("err_date_period_1y");
					sap.m.MessageBox.show(
					     message,
						 sap.m.MessageBox.Icon.ERROR,
						 this.i18n.getText("Error")
				   );
					this.getView().byId("period_from").setValueState("Error");
					this.getView().byId("period_to").setValueState("Error");
					
					_check = false;
					return 					
				}
				
				this.getView().byId("period_from").setValueState("None");
				this.getView().byId("period_from_month").setValueState("None");
				this.getView().byId("period_to").setValueState("None");
				this.getView().byId("period_to_month").setValueState("None");
				
	    	    return _check;
	    		
			},
			
			// Search 
			get_data : function(oEvent){
				var oModel = this.getView().getModel();
				var controll = this;
				var lange = this.getLanguage();

				var oTable  = controll.getView().byId("table");
			  	var oTable2 = controll.getView().byId("table2");
			  	var oTable3 = controll.getView().byId("table3");
			  	var oTable4 = controll.getView().byId("table4");
			  	var oTable5 = controll.getView().byId("table5");
			  	this.oChart = this.getView().byId("chart");
			  	this.oChart2 = this.getView().byId("chart2");
			  	this.oChart3 = this.getView().byId("chart3");
			  	this.oChart4 = this.getView().byId("chart4");
			  	this.oChart4_2 = this.getView().byId("chart4_2");
			  	this.oChart5 = this.getView().byId("chart5");
				
				oModel.attachRequestSent(function(){oTable.setBusy(true);});
				oModel.attachRequestCompleted(function(){
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
				
				var s_swerk;         //swerk
				var s_fl  = [];      //F/L (Tplnr)
				var s_pls = [];      //P/S (Beber)
				var s_loc = [];      //Pros. line (Stort)
				var s_tot = [];      //Tech. Obj. Type (Eqart)	
				var s_abi = [];      //ABC Indicator	(Abckz)			
				var s_woc = [];      //Work Center (Gewrk)

				var s_filter = [];

				var gt_notiproc = [];
				
				s_swerk = this.oSwerk.getSelectedKey();
				
				
		    	var vPls = this.oPls.getSelectedKey();	
		    	if(vPls){
		    		s_pls.push(vPls);
		    	}
		    	if(s_pls.length>0){
		    		s_filter.push(utils.set_filter(s_pls, "Beber"));
			    }
		    			    	
		    	
		    	
		    	var vWoc = this.oWoc.getSelectedKey();    //work center(OBJID) 
		    	if(vWoc){
			    	var wocData = this.oWoc.getModel().getData().results;
			    	for(var j=0; j<wocData.length; j++){
		    			if(wocData[j].Key === vWoc){
		    				s_woc.push(wocData[j].Add2);
		    				break;
		    			}
			    	}
		    	}
		    	if(s_woc.length>0){
		    		s_filter.push(utils.set_filter(s_woc, "Gewrk"));
			    }
		    			    	
		    	var strfrom = this.getView().byId("period_from").getSelectedKey() + 
		    					this.getView().byId("period_from_month").getSelectedKey();
		    	var strto = this.getView().byId("period_to").getSelectedKey() + 
								this.getView().byId("period_to_month").getSelectedKey();
		    	s_filter.push(utils.set_bt_filter("Spmon", strfrom, strto));
	    		
	    		
				var filterStr;
				for(var i=0; i<s_filter.length; i++){
					
					if(i === 0){
						filterStr = s_filter[i];
					}else{
						filterStr = filterStr + " and " + s_filter[i];
					}
				}

				var path = "/InputSet(Spras='"+lange+"',Swerk='"+s_swerk+"')";
				var mParameters = {
					urlParameters : {
						"$expand" : "ResultList,ResultList2,ResultList3,ResultList4,ResultList5,ResultChart,ResultChart2,ResultChart3,ResultChart4,ResultChart4_2,ResultChart5",
						"$filter" : filterStr
					},
					success : function(oData) {
					
					for (var i = 0; i < oData.ResultList.results.length; i++) {
						  var oMttr = parseFloat(oData.ResultList.results[i].Mttr);
						  
						  oData.ResultList.results[i].Mttr = oMttr;			  
						}						
						
					 var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
					 oODataJSONModel.setData(oData);
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
					 
					 var oODataJSONModel_chart =  new sap.ui.model.json.JSONModel();  
					 oODataJSONModel_chart.setData(oData.ResultChart);
					 controll.oChart.setModel(oODataJSONModel_chart)
				
					 var oODataJSONModel_chart2 =  new sap.ui.model.json.JSONModel();  
					 oODataJSONModel_chart2.setData(oData.ResultChart2);
					 controll.oChart2.setModel(oODataJSONModel_chart2)						 
		
					 var oODataJSONModel_chart3 =  new sap.ui.model.json.JSONModel();  
					 oODataJSONModel_chart3.setData(oData.ResultChart3);
					 controll.oChart3.setModel(oODataJSONModel_chart3)						 
					 
					 var oODataJSONModel_chart4 =  new sap.ui.model.json.JSONModel();  
					 oODataJSONModel_chart4.setData(oData.ResultChart4);
					 controll.oChart4.setModel(oODataJSONModel_chart4)

					 var oODataJSONModel_chart4_2 =  new sap.ui.model.json.JSONModel();  
					 oODataJSONModel_chart4_2.setData(oData.ResultChart4_2);
					 controll.oChart4_2.setModel(oODataJSONModel_chart4_2)					 
					 
					 var oODataJSONModel_chart5 =  new sap.ui.model.json.JSONModel();  
					 oODataJSONModel_chart5.setData(oData.ResultChart5);
					 controll.oChart5.setModel(oODataJSONModel_chart5)					 
					 
                     controll.set_chart();
						 
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
			
			
			chart_model : function(){
				var chart = this.getView().byId("chart");
				
				var chartOdata = {};
				var list = [];
				
				var data = {};
				//data.Invnr = this.i18n.getText("lblMonth");//"Tag ID"; -> Month
				data.Totcost = "0";
				data.Waers = "";
				
				list.push(data);
			
				chartOdata.results = list;
				
				var oODataJSONModel_chart =  new sap.ui.model.json.JSONModel();  
				oODataJSONModel_chart.setData(chartOdata);
				chart.setModel(oODataJSONModel_chart)
				
				this.set_chart();
				 
			},
			
			set_chart : function(){
			    var chart = this.getView().byId("chart");
			    chart.destroyFeeds();
			    
			    var spmon = this.i18n.getText("lblMonth");
			    var notimplan = this.i18n.getText("notimplan");
			    var notimperf = this.i18n.getText("notimperf");
			    	
			    var chart_title = this.i18n.getText("chart_title_230_1");
		
				chart.setVizProperties({
/*	                plotArea: {
	                    dataLabel: {
	                        visible: true
	                    }
	                },*/
	                valueAxis: {
	                    label: {
	                       
	                    },
	                    title: {
	                        visible: false
	                    }
	                },
	                categoryAxis: {
	                    title: {
	                        visible: true
	                    }
	                },
	                title: {
	                    visible: true,
	                    text: chart_title
	                }
	            });
				
				
			    var oDataset = new sap.viz.ui5.data.FlattenedDataset({
					 dimensions : [{ 
			                name: spmon, 
			                value: '{Spmon}' 
			            }], 
			         measures : [{ 
			                name: notimplan, 
			                value: '{Notimplan}' 
			            },{ 
			                name: notimperf, 
			                value: '{Notimperf}' 
			         }],  			            
	                 data: {
	                      path: "/results"
	                 }
				});
			 
				chart.setDataset(oDataset);
				
				 //Category, Value积己 
			 	var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					'uid': "valueAxis",
					'type': "Measure",
					'values': [notimplan, notimperf] 
					}),
					feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					'uid': "categoryAxis",
					'type': "Dimension",
					'values':   [spmon]
					})
	 		
			 	 chart.addFeed(feedValueAxis);
			 	 chart.addFeed(feedCategoryAxis);
				
			},
			
			chart2_model : function(){
				var chart2 = this.getView().byId("chart2");
				
				var chart2Odata = {};
				var list = [];
				
				var data = {};
				//data.Invnr = this.i18n.getText("lblMonth");//"Tag ID"; -> Month
				data.Totcost = "0";
				data.Waers = "";
				
				list.push(data);
			
				chart2Odata.results = list;
				
				var oODataJSONModel_chart2 =  new sap.ui.model.json.JSONModel();  
				oODataJSONModel_chart2.setData(chart2Odata);
				chart2.setModel(oODataJSONModel_chart2)
				
				this.set_chart2();
				 
			},
			
			set_chart2 : function(){
			    var chart2 = this.getView().byId("chart2");
			    chart2.destroyFeeds();
			    
			    var spmon = this.i18n.getText("lblMonth");
			    var notimplan = this.i18n.getText("notimplan");
			    var notimperf = this.i18n.getText("notimperf");
			    	
			    var chart2_title = this.i18n.getText("chart_title_230_2");
		
				chart2.setVizProperties({
/*	                plotArea: {
	                    dataLabel: {
	                        visible: true
	                    }
	                },*/
	                valueAxis: {
	                    label: {
	                       
	                    },
	                    title: {
	                        visible: false
	                    }
	                },
	                categoryAxis: {
	                    title: {
	                        visible: true
	                    }
	                },
	                title: {
	                    visible: true,
	                    text: chart2_title
	                }
	            });
				
				
			    var oDataset = new sap.viz.ui5.data.FlattenedDataset({
					 dimensions : [{ 
			                name: spmon, 
			                value: '{Spmon}' 
			            }], 
			         measures : [{ 
			                name: notimplan, 
			                value: '{Notimplan}' 
			            },{ 
			                name: notimperf, 
			                value: '{Notimperf}' 
			         }],  			            
	                 data: {
	                      path: "/results"
	                 }
				});
			 
				chart2.setDataset(oDataset);
				
				 //Category, Value积己 
			 	var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					'uid': "valueAxis",
					'type': "Measure",
					'values': [notimplan, notimperf] 
					}),
					feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					'uid': "categoryAxis",
					'type': "Dimension",
					'values':   [spmon]
					})
	 		
			 	 chart2.addFeed(feedValueAxis);
			 	 chart2.addFeed(feedCategoryAxis);
				
			},			
		
			chart3_model : function(){
				var chart3 = this.getView().byId("chart3");
				
				var chart3Odata = {};
				var list = [];
				
				var data = {};
				//data.Invnr = this.i18n.getText("lblMonth");//"Tag ID"; -> Month
				data.Totcost = "0";
				data.Waers = "";
				
				list.push(data);
			
				chart3Odata.results = list;
				
				var oODataJSONModel_chart3 =  new sap.ui.model.json.JSONModel();  
				oODataJSONModel_chart3.setData(chart3Odata);
				chart3.setModel(oODataJSONModel_chart3)
				
				this.set_chart3();
				 
			},
			
			set_chart3 : function(){
			    var chart3 = this.getView().byId("chart3");
			    chart3.destroyFeeds();
			    
			    var spmon = this.i18n.getText("lblMonth");
			    var notimplan = this.i18n.getText("notimplan");
			    var notimperf = this.i18n.getText("notimperf");
			    	
			    var chart3_title = this.i18n.getText("chart_title_230_3");
		
				chart3.setVizProperties({
/*	                plotArea: {
	                    dataLabel: {
	                        visible: true
	                    }
	                },*/
	                valueAxis: {
	                    label: {
	                       
	                    },
	                    title: {
	                        visible: false
	                    }
	                },
	                categoryAxis: {
	                    title: {
	                        visible: true
	                    }
	                },
	                title: {
	                    visible: true,
	                    text: chart3_title
	                }
	            });
				
				
			    var oDataset = new sap.viz.ui5.data.FlattenedDataset({
					 dimensions : [{ 
			                name: spmon, 
			                value: '{Spmon}' 
			            }], 
			         measures : [{ 
			                name: notimplan, 
			                value: '{Notimplan}' 
			            },{ 
			                name: notimperf, 
			                value: '{Notimperf}' 
			         }],  			            
	                 data: {
	                      path: "/results"
	                 }
				});
			 
				chart3.setDataset(oDataset);
				
				 //Category, Value积己 
			 	var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					'uid': "valueAxis",
					'type': "Measure",
					'values': [notimplan, notimperf] 
					}),
					feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					'uid': "categoryAxis",
					'type': "Dimension",
					'values':   [spmon]
					})
	 		
			 	 chart3.addFeed(feedValueAxis);
			 	 chart3.addFeed(feedCategoryAxis);
				
			},				
			
			chart4_model : function(){
				var chart4 = this.getView().byId("chart4");
				
				var chart4Odata = {};

				
				var oODataJSONModel_chart4 =  new sap.ui.model.json.JSONModel();  
				oODataJSONModel_chart4.setData(chart4Odata);
				chart4.setModel(oODataJSONModel_chart4)
				
				this.set_chart4();
				 
			},
			
			set_chart4 : function(){
			    var chart4 = this.getView().byId("chart4");
			    chart4.destroyFeeds();
			    	
			    var chart4_title = this.i18n.getText("chart_title_230_4");
	
				chart4.setVizProperties({
	                plotArea: {
	                    dataLabel: {
	                        visible: true
	                    }
	                },
	                legend: {
	                    title: {
	                        visible: false
	                    }
	                },
	                title: {
	                    visible: true,
	                    text: chart4_title
	                }
	            });
				
				
			    var oDataset = new sap.viz.ui5.data.FlattenedDataset({
					 dimensions : [{ 
			                name: "Category", 
			                value: '{Gubun}'
			            }], 
			         measures : [{ 
			                name: "Value", 
			                value: '{Value}' 
			            }],  			            
	                 data: {
	                      path: "/results"
	                 }
				});
			 
				chart4.setDataset(oDataset);
				
				 //Category, Value积己 
			 	var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
			 		'uid': "size",
			 		'type': "Measure",
			 		'values': ["Value"]
					}),
					feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
						'uid': "color",
						'type': "Dimension",
						'values': ["Category"]
					})
	 		
			 	 chart4.addFeed(feedValueAxis);
			 	 chart4.addFeed(feedCategoryAxis);
				
			},			
			chart4_2_model : function(){
				var chart4_2 = this.getView().byId("chart4_2");
				
				var chart4Odata = {};

				
				var oODataJSONModel_chart4_2 =  new sap.ui.model.json.JSONModel();  
				oODataJSONModel_chart4_2.setData(chart4Odata);
				chart4_2.setModel(oODataJSONModel_chart4_2)
				
				this.set_chart4_2();
				 
			},
			
			set_chart4_2 : function(){
			    var chart4_2 = this.getView().byId("chart4_2");
			    chart4_2.destroyFeeds();
			    		    	
			    var chart4_2_title = this.i18n.getText("chart_title_230_4_2");
	
				chart4_2.setVizProperties({
	                plotArea: {
	                    dataLabel: {
	                        visible: true
	                    }
	                },
	                legend: {
	                    title: {
	                        visible: false
	                    }
	                },
	                title: {
	                    visible: true,
	                    text: chart4_2_title
	                }
	            });
				
				
			    var oDataset = new sap.viz.ui5.data.FlattenedDataset({
					 dimensions : [{ 
			                name: "Category", 
			                value: '{Gubun}'
			            }], 
			         measures : [{ 
			                name: "Value", 
			                value: '{Value}' 
			            }],  			            
	                 data: {
	                      path: "/results"
	                 }
				});
			 
				chart4_2.setDataset(oDataset);
				
				 //Category, Value积己 
			 	var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
			 		'uid': "size",
			 		'type': "Measure",
			 		'values': ["Value"]
					}),
					feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
						'uid': "color",
						'type': "Dimension",
						'values': ["Category"]
					})
	 		
			 	 chart4_2.addFeed(feedValueAxis);
			 	 chart4_2.addFeed(feedCategoryAxis);
				
			},				
			chart5_model : function(){
				var chart5 = this.getView().byId("chart5");
				
				var chart5Odata = {};
				var list = [];
				
				var data = {};
				//data.Invnr = this.i18n.getText("lblMonth");//"Tag ID"; -> Month
				data.Totcost = "0";
				data.Waers = "";
				
				list.push(data);
			
				chart5Odata.results = list;
				
				var oODataJSONModel_chart5 =  new sap.ui.model.json.JSONModel();  
				oODataJSONModel_chart5.setData(chart5Odata);
				chart5.setModel(oODataJSONModel_chart5)
				
				this.set_chart5();
				 
			},
			
			set_chart5 : function(){
			    var chart5 = this.getView().byId("chart5");
			    chart5.destroyFeeds();
			    
			    var spmon = this.i18n.getText("lblMonth");
			    var notimplan = this.i18n.getText("notimplan");
			    var notimperf = this.i18n.getText("notimperf");
			    	
			    var chart5_title = this.i18n.getText("chart_title_230_5");
		
				chart5.setVizProperties({
/*	                plotArea: {
	                    dataLabel: {
	                        visible: true
	                    }
	                },*/
	                valueAxis: {
	                    label: {
	                       
	                    },
	                    title: {
	                        visible: false
	                    }
	                },
	                categoryAxis: {
	                    title: {
	                        visible: true
	                    }
	                },
	                title: {
	                    visible: true,
	                    text: chart5_title
	                }
	            });
				
				
			    var oDataset = new sap.viz.ui5.data.FlattenedDataset({
					 dimensions : [{ 
			                name: spmon, 
			                value: '{Spmon}' 
			            }], 
			         measures : [{ 
			                name: notimplan, 
			                value: '{Notimplan}' 
			            },{ 
			                name: notimperf, 
			                value: '{Notimperf}' 
			         }],  			            
	                 data: {
	                      path: "/results"
	                 }
				});
			 
				chart5.setDataset(oDataset);
				
				 //Category, Value积己 
			 	var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					'uid': "valueAxis",
					'type': "Measure",
					'values': [notimplan, notimperf] 
					}),
					feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					'uid': "categoryAxis",
					'type': "Dimension",
					'values':   [spmon]
					})
	 		
			 	 chart5.addFeed(feedValueAxis);
			 	 chart5.addFeed(feedCategoryAxis);
				
			},			
			
	 /****************************************************************
	  *  Local Function
	  ****************************************************************/			
			_set_search_field : function(){
				
				var v_swerk = this.oSwerk.getSelectedKey();
				
				//P/S
				this.oPls = this.getView().byId("pls");
				if(this.oPls){
					utils.set_search_field(v_swerk, this.oPls, "pls", "C", "D", "");
				}	
								
				//Work center
				this.oWoc = this.getView().byId("woc");
				if(this.oWoc){
					utils.set_search_field(v_swerk, this.oWoc, "woc", "C", "", "");
				}
									
			},
			

			_filter : function() {
				var oFilter = null;

				if (this._oGlobalFilter) {
					oFilter = this._oGlobalFilter;
				}

				this.getView().byId("table").getBinding("rows").filter(oFilter,
						"Application");
			}

	      
	});
});