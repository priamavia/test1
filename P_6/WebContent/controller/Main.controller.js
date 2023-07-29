sap.ui.define([
		"cj/pm0200/controller/BaseController",
		"cj/pm0200/util/ValueHelpHelper",
		"cj/pm0200/util/utils",
		"cj/pm0200/model/formatter",
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/m/MessageBox",
		"sap/m/MessageToast",
		"jquery.sap.global",
	], function (BaseController, ValueHelpHelper, utils, formatter, JSONModel, Filter, FilterOperator, Message, Toast, jQuery) {
		"use strict";

		return BaseController.extend("cj.pm0200.controller.Main", {
           formatter : formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @public
		 */
			onInit : function () {
			   
				var oView = this.getView();
			 	var oTable = oView.byId("table");
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
				this.getLoginInfo();
				this.set_userData();  //"User Auth"			
			},
			
		    setInitData : function(){
			    var period_from = this.getView().byId("period_from");				
			    var period_to   = this.getView().byId("period_to");
			    
			    period_from.setDisplayFormat(this.dateFormat);

			    period_from.setValueFormat("yyyyMMdd");
			    
			    period_to.setDisplayFormat(this.dateFormat);
			    period_to.setValueFormat("yyyyMMdd");
			    		    

			    var todayDate = this.formatter.strToDate(this.locDate);
			    
				var fromDate = new Date()
				var fromDay =  todayDate.getDate() - 30;
				fromDate.setDate( fromDay );
				
			    var toDate = new Date();
				var toDay =  todayDate.getDate() + 14;
				toDate.setDate( toDay );
			
				period_from.setDateValue( fromDate );				
				period_to.setDateValue( toDate );	

			    this.getView().byId("table").setShowNoData(false);
			    
         		if(window.location.hostname != "localhost"){
           			this.getView().byId("createby").setValue(this.getLoginId());
         		}else{
         			this.getView().byId("createby").setValue("ȫ�浿");
         		}
			    
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
				
				var oView = this.getView();
				var v_swerk = this.oSwerk.getSelectedKey();
				if(v_swerk.substring(0,1) == "2"){
					oView.setModel(new JSONModel({
						ExtWorkVisible : true
					}), "readNoti");				
					
				}else{
					oView.setModel(new JSONModel({
						ExtWorkVisible : false
					}), "readNoti");									
				}		
			},		
			
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
						    	"Default" : oData.results[i].Default
							  }
						   );
					   }				   				   
					   controll.set_UserInfo(userDefault);
					   
//					   debugger;
					   controll.i18n = controll.getView().getModel("i18n").getResourceBundle();				
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
			
			

			setInitData : function(){

			    var period_from = this.getView().byId("period_from");				
			    var period_to   = this.getView().byId("period_to");
			    
			    period_from.setDisplayFormat(this.dateFormat);
			    period_from.setValueFormat("yyyyMMdd");
			    
			    period_to.setDisplayFormat(this.dateFormat);
			    period_to.setValueFormat("yyyyMMdd");
			    		    
			    var todayDate = this.formatter.strToDate(this.locDate);
			    
				var fromDate = new Date()
				var fromDay =  todayDate.getDate() - 30;
				fromDate.setDate( fromDay );
			    var toDate = new Date();
				var toDay =  todayDate.getDate() + 14;
				toDate.setDate( toDay );
			
				period_from.setDateValue( fromDate );				
				period_to.setDateValue( toDate );	

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
				
				var oView = this.getView();
				var v_swerk = this.oSwerk.getSelectedKey();
				if(v_swerk.substring(0,1) == "2"){
					oView.setModel(new JSONModel({
						ExtWorkVisible : true
					}), "readNoti");				
					
				}else{
					oView.setModel(new JSONModel({
						ExtWorkVisible : false
					}), "readNoti");									
				}
							   
			},		
			
		//* User Default Setting 
		set_auth : function(){
				this.arr_swerk = this.get_Auth("SWERK");				
	            this.arr_kostl = this.get_Auth("KOSTL");
				this.arr_kokrs = this.get_Auth("KOKRS");
				this.local_date = this.get_Auth("LOCDAT");
		    	this.dateformat = this.get_Auth("DATFORMAT");
				this.timezone = this.get_Auth("TIMEZ");			
				this.locDate    = this.get_Auth("LOCDAT")[0].Value;
                this.locTime    = this.get_Auth("LOCTIM")[0].Value;
				this.dateFormat = this.get_Auth("DATFORMAT")[0].Value;
				this.sep        = this.get_Auth("SEP")[0].Value;	
				this.zpm_role   = this.get_Auth("ZPM_ROLE");
			},
			
			
			/****************************************************************
			 *  Event Handler
			 ****************************************************************/
			
			
			onSearch : function(oEvent){
				var result = utils.checkMandatory(this, "mainpage");
				
				if(result){
//				   result = this.check_data();			
				   if(result){
					this.get_data(oEvent);
				   }
				}else{
//					debugger;
					sap.m.MessageBox.show(
						this.i18n.getText("check_mandatory"),
						sap.m.MessageBox.Icon.ERROR,
					    this.i18n.getText("Error")
					);
				}
			},
					
			// Search 
			    get_data : function(oEvent){
				var oModel = this.getView().getModel();
				var controll = this;
				var lange = this.getLanguage();
				
			  	this.oTable = this.getView().byId("table");
//			  	debugger;
				oModel.attachRequestSent(function(){controll.oTable.setBusy(true);});
				oModel.attachRequestCompleted(function(){
					controll.oTable.setBusy(false);
					controll.oTable.setShowNoData(true);
			    });
				
				var s_swerk;         //swerk
				var s_pls = [];      //P/S (Beber)
				var s_woc = [];      //Work Center 
				var s_bmcm = [];
				var s_extWork = [];			
				var s_filter = [];

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
		    		s_woc.push(vWoc);
		    	}
		    	if(s_woc.length>0){
		    		s_filter.push(utils.set_filter(s_woc, "Arbpl"));
			    }
		    	
		    	// Noti date 
		    	this.oFormatYyyymmdd = sap.ui.core.format.DateFormat.getInstance({ pattern : "yyyyMMdd" });	
				var from = this.getView().byId("period_from").getDateValue();
				var to = this.getView().byId("period_to").getDateValue();
				var strfrom = this.oFormatYyyymmdd.format(from);
				var strto = this.oFormatYyyymmdd.format(to);
				
	     		s_filter.push(utils.set_bt_filter("Qmdat", strfrom, strto));
	
				var filterStr;
				for(var i=0; i<s_filter.length; i++){
					
					if(i === 0){
						filterStr = s_filter[i];
					}else{
						filterStr = filterStr + " and " + s_filter[i];
					}
				}
				
				if(filterStr == undefined){
					filterStr = "";
				}
	    		
				var path = "/InputSet(Spras='"+lange+"',Swerk='"+s_swerk+"')";
				var mParameters = {
					urlParameters : {
						"$expand" : "ResultList",
						"$filter" : filterStr
					},
					success : function(oData) {
						
					 var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
					 oODataJSONModel.setData(oData);
					 controll.oTable.setModel(oODataJSONModel);
					 controll.oTable.bindRows("/ResultList/results");
//					 debugger;
////			         var colorRows = function() {
//			            var rowCount = controll.oTable.getVisibleRowCount(); //number of visible rows
//			            var rowStart = controll.oTable.getFirstVisibleRow(); //starting Row index
//			            var currentRowContext;
//			            for (var i = 0; i < rowCount; i++) {
//			              currentRowContext = controll.oTable.getContextByIndex(rowStart + i); //content
//
//			                var cellValue = oODataJSONModel.getProperty("Beber", currentRowContext); // Get Amount
//		                	var row = controll.oTable.getRows()[i];
//			                // Set Row color conditionally
//			                if (cellValue == "W/C") {
////			                	controll.oTable.getRows()[i].$().addClass("yellowBackground");
//			                	row.addStyleClass("yellowBackground");
//			                } else if (cellValue == "PLT") {
////			                	controll.oTable.getRows()[i].$().addClass("redBackground");
//			                	row.addStyleClass("redBackground");
//			                }
//			            }
////			        }
////			        $(document).ready(function() {
//////			            // Attach Scroll Handler
//////			        	controll.oTable._oVSb.attachScroll(function() {
//////			                colorRows()
//////			            });
////			            colorRows(); // Color Rows initially
////			        });
					 
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
					
			 /****************************************************************
			  *  Local Function
			  ****************************************************************/			
					_set_search_field : function(){
						
					
						var v_swerk = this.oSwerk.getSelectedKey();
						
						
						this.oWoc = this.getView().byId("woc");
						if(this.oWoc){
							utils.set_search_field(v_swerk, this.oWoc, "woc", "C", "", "");
						}

						
						this.oPls = this.getView().byId("pls");
						if(this.oPls){
							utils.set_search_field(v_swerk, this.oPls, "pls", "C", "", "");
						}

					},
					
					onSelChange : function(oEvent){
					
				    	this.getView().byId("pls").setSelectedKey("");
				    	
				      	this.getView().byId("woc").setSelectedKey("");
				      	
				    	this._set_search_field();
					}			
	});
});