sap.ui.define([
		"cj/pm0140/controller/BaseController",
		"cj/pm0140/util/ValueHelpHelper",
		"cj/pm0140/util/utils",
		"cj/pm0140/model/formatter",
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/m/MessageBox",
		"sap/m/MessageToast",
		"jquery.sap.global",
	], function (BaseController, ValueHelpHelper, utils, formatter, JSONModel, Filter, FilterOperator, Message, Toast, jQuery) {
		"use strict";

		return BaseController.extend("cj.pm0140.controller.Main", {
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

/*			    var period_from = this.getView().byId("period_from");				
			    var period_to   = this.getView().byId("period_to");
			    
			    //period_from.setDisplayFormat(this.dateFormat);
			    period_from.setValueFormat("yyyyMM");
			    period_from.setDisplayFormat("yyyyMM");
			    
			    //period_to.setDisplayFormat(this.dateFormat);
			    period_to.setValueFormat("yyyyMM");
			    period_to.setDisplayFormat("yyyyMM");
			    
			    var todayDate = this.formatter.strToDate(this.locDate);
			    
				var fromDate = new Date()
				var fromDay =  todayDate.getDate();
				fromDate.setDate( fromDay );
				
			    var toDate = new Date();
				var toDay =  todayDate.getDate();
				toDate.setDate( toDay );
			
				period_from.setDateValue( fromDate );				
				period_to.setDateValue( toDate );*/	
				
				var todayDate = this.formatter.strToDate(this.locDate);
				var c_year = todayDate.getFullYear()
				var c_month = todayDate.getMonth() + 1;
				var str_month;
				if(c_month < 10){
					str_month = "0" + c_month;
				}else{
					str_month = c_month.toString();
				}
				
				var period_from = this.getView().byId("period_from");			
				utils.set_year(period_from, c_year);
				period_from.setSelectedKey(c_year);
				
				var period_from_month = this.getView().byId("period_from_month");	
				utils.set_month(period_from_month);
				period_from_month.setSelectedKey(str_month);
				
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
					   
//					   debugger;
					   this.i18n = this.getView().getModel("i18n").getResourceBundle();				
					   utils.makeSerachHelpHeader(this);	
					   
					   controll.chart_model();
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
			
								
			// Maint. Plant를 변경 했을때  
			onSelChange : function(){
				
				this.getView().byId("fl").removeAllTokens();
				this.oPls.setSelectedKey("");
				this.oLoc.setSelectedKey("");
				this.oWoc.setSelectedKey("");
		    	this.oTot.setSelectedKey("");
		    	this.oAbi.setSelectedKey("");
		    	
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
				
/*				var from = this.getView().byId("period_from").getDateValue();
				var to = this.getView().byId("period_to").getDateValue(); 
				
				if(from > to){
					var message = this.i18n.getText("err_date_period");
					sap.m.MessageBox.show(
					     message,
						 sap.m.MessageBox.Icon.ERROR,
						 this.i18n.getText("Error")
				   );
					_check = false;
					return _check;
				}*/
				
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
				
			  	this.oTable = this.getView().byId("table");
			  	this.oChart = this.getView().byId("chart");
				
				oModel.attachRequestSent(function(){controll.oTable.setBusy(true);});
				oModel.attachRequestCompleted(function(){
					controll.oTable.setBusy(false);
					controll.oTable.setShowNoData(true);
			    });
				
				var s_swerk;         //swerk
				var s_fl  = [];      //F/L (Tplnr)
				var s_pls = [];      //P/S (Beber)
				var s_loc = [];      //Pros. line (Stort)
				var s_tot = [];      //Tech. Obj. Type (Eqart)	
				var s_abi = [];      //ABC Indicator	(Abckz)			
				var s_woc = [];      //Work Center (Gewrk)

				var s_filter = [];
				
				s_swerk = this.oSwerk.getSelectedKey();
				
		    	var vFl = this.getView().byId("fl").getTokens();
		    	for(var j=0; j<vFl.length; j++){
		    		s_fl.push(vFl[j].getProperty("key"));
		    	}
		    	if(s_fl.length>0){
		    		s_filter.push(utils.set_filter(s_fl, "Tplnr"));
			    }
				
		    	var vPls = this.oPls.getSelectedKey();	
		    	if(vPls){
		    		s_pls.push(vPls);
		    	}
		    	if(s_pls.length>0){
		    		s_filter.push(utils.set_filter(s_pls, "Beber"));
			    }
		    			    	
		    	var vLoc = this.oLoc.getSelectedKey();	
		    	if(vLoc){
		    		s_loc.push(vLoc);
		    	}
		    	if(s_loc.length>0){
		    		s_filter.push(utils.set_filter(s_loc, "Stort"));
			    }
		    			    	
		    	var vTot = this.oTot.getSelectedKey();
		    	if(vTot){
		    		s_tot.push(vTot);
		    	}
		    	if(s_tot.length>0){
		    		s_filter.push(utils.set_filter(s_tot, "Eqart"));
			    }
		    	
		    	var vAbi = this.oAbi.getSelectedKey();
		    	if(vAbi){
		    		s_abi.push(vAbi);
		    	}
		    	if(s_abi.length>0){
		    		s_filter.push(utils.set_filter(s_abi, "Abckz"));
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
		    	

/*		    	this.oFormatYyyymmdd = sap.ui.core.format.DateFormat.getInstance({ pattern : "yyyyMM" });	
				var from = this.getView().byId("period_from").getDateValue();
				var to = this.getView().byId("period_to").getDateValue();
				var strfrom = this.oFormatYyyymmdd.format(from);
				var strto = this.oFormatYyyymmdd.format(to);
				//Qmdat ge '201701' and Qmdat le '201702'
	    		s_filter.push(utils.set_bt_filter("Spmon", strfrom, strto));*/
		    	
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
						"$expand" : "ResultList,ResultChart",
						"$filter" : filterStr
					},
					success : function(oData) {
					
						for (var i = 0; i < oData.ResultList.results.length; i++) {
						  var oIamatkose = parseFloat(oData.ResultList.results[i].Iamatkose);
						  var oIadienkos = parseFloat(oData.ResultList.results[i].Iadienkos);
						  var oIasonkost = parseFloat(oData.ResultList.results[i].Iasonkost);
						  var oTotcost   = parseFloat(oData.ResultList.results[i].Totcost);
						  
						  oData.ResultList.results[i].Iamatkose = oIamatkose;
						  oData.ResultList.results[i].Iadienkos = oIadienkos;
						  oData.ResultList.results[i].Iasonkost = oIasonkost;
						  oData.ResultList.results[i].Totcost   = oTotcost;					  
						}

//						debugger;
					 var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
					 oODataJSONModel.setData(oData.ResultList);
					 controll.oTable.setModel(oODataJSONModel);
					 controll.oTable.bindRows("/results");
					 
					 var oODataJSONModel_chart =  new sap.ui.model.json.JSONModel();  
					 oODataJSONModel_chart.setData(oData.ResultChart);
					 controll.oChart.setModel(oODataJSONModel_chart)
					 
                     controll.set_chart();
						 
					}.bind(this),
					error : function() {
					   sap.m.MessageBox.show(
						 controll.i18n.getText("oData_conn_error"),
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
				data.Invnr = this.i18n.getText("lblTagID"); //"Tag ID";
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
			    
			    var tagId = this.i18n.getText("lblTagID");
			    var totcost = this.i18n.getText("CCost");
			    	
			    var chart_title = this.i18n.getText("chart_title_140");
		
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
			                name: tagId, 
			                value: '{Invnr}' 
			            }], 
			         measures : [{ 
			                name: totcost, 
			                value: '{Totcost}' 
			            }],  
	                  data: {
	                      path: "/results"
	                   }
				});
			 
				chart.setDataset(oDataset);
				
				 //Category, Value생성 
			 	var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					'uid': "valueAxis",
					'type': "Measure",
					'values': [totcost] 
					}),
					feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					'uid': "categoryAxis",
					'type': "Dimension",
					'values':   [tagId]
					})
	 		
			 	 chart.addFeed(feedValueAxis);
			 	 chart.addFeed(feedCategoryAxis);
				
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
				
				//ProdLine
				this.oLoc = this.getView().byId("loc");
				if(this.oLoc){
					utils.set_search_field(v_swerk, this.oLoc, "loc", "C", "", "");
				}
				
				//TechObjType
				this.oTot = this.getView().byId("tot");
				if(this.oTot){
					utils.set_search_field(v_swerk, this.oTot, "tot", "C", "", "");
				}
				
				//ABC Indic.
				this.oAbi = this.getView().byId("abi");
				if(this.oAbi){
					utils.set_search_field(v_swerk, this.oAbi, "abi", "C", "", "");
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