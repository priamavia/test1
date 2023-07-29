sap.ui.define([
               "cj/pm0220/controller/BaseController",
               "cj/pm0220/util/ValueHelpHelper",
               "cj/pm0220/util/utils",
               "cj/pm0220/model/formatter",
           		"cj/pm0220/model/models",
               "sap/ui/Device",
               "sap/ui/model/Filter",
               "sap/ui/model/FilterOperator",
               "sap/ui/model/json/JSONModel",
               "sap/m/MessageBox",
               "sap/m/MessageToast",
               "jquery.sap.global"
               ], function (BaseController, ValueHelpHelper, utils, formatter, models, Device, Filter, FilterOperator, JSONModel, MessageBox, MessageToast, jQuery) {
	"use strict";

	return BaseController.extend("cj.pm0220.controller.Main", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @public
		 */
		onInit : function () {
			/*
			 * Table Filter 
			 */
			this._oGlobalFilter = null;	

			var oComponent = this.getOwnerComponent();
			this.getView().addStyleClass(oComponent.getContentDensityClass());			

			this._router = oComponent.getRouter();
			var oTarget = this._router.getTarget("main");
			oTarget.attachDisplay(this._onRouteMatched, this);

			var oView = this.getView();
			// Table Filter set 
			var oTable = oView.byId("listTable");
			oView.setModel(new JSONModel({
				globalFilter: "",
				availabilityFilterOn: false,
				cellFilterOn: false
			}), "ui");

			this.set_screen_mode();
			this.set_displayMode("X");
		},
		
		_onRouteMatched : function (oEvent) {
			var controll = this;
			
			this.i18n = this.getView().getModel("i18n").getResourceBundle();

			this.getLoginInfo();
			this.set_userData();  //"User Auth"		
			
//			this.oArgs = oEvent.getParameter("arguments");
			this.oArgs = oEvent.getParameter("data");		// //store the data
		},		

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 */
		onBeforeRendering: function() {

		},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 */
		onAfterRendering: function() {
//			debugger;
		},

		/**
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
										"add2" : oData.results[i].Add2,					    	
										"Add3" : oData.results[i].Add3
//										"Add4" : oData.results[i].Add4,
//										"Add5" : oData.results[i].Add5										
									}
							);
						}

						controll.set_UserInfo(userDefault);			
						utils.makeSerachHelpHeader(this);	

						controll.set_auth();
						controll.setInitData();

					}.bind(this),
					error : function(oError) {
						if(Device.system.phone){
							MessageToast.show(this.i18n.getText("oData_conn_error"));				
						}else{
							MessageBox.show(
									this.i18n.getText("oData_conn_error"),
									MessageBox.Icon.ERROR,
									this.i18n.getText("error")
							);		
						}

						//jQuery.sap.log.info("Odata Error occured");
						//Toast.show("Error");
					}.bind(this)
			};
			oModel.read(path, mParameters);			
		},			
		/*
		 * User Default Setting 
		 */
		set_auth : function(){
			this.arr_werks  = this.get_Auth("SWERK");
			this.locDate    = this.get_Auth("LOCDAT")[0].Value;
			this.locTime    = this.get_Auth("LOCTIM")[0].Value;
			this.dateFormat = this.get_Auth("DATFORMAT")[0].Value;
//			""	1.234.567,89
//			X  1,234,567.89
//			Y  1 234 567,89			
			this.decimalFormat = this.get_Auth("DECFOR")[0].Value;		
			this.sep        = this.get_Auth("SEP")[0].Value;
			this.pd         = this.get_Auth("ZPMUI0220");
		},
		/* 
		 * PM Possible Entry Odata Set 
		 */	
		_set_search_field : function() {
			var v_swerk = this.oSwerk.getSelectedKey();

			this.oArbpl = this.getView().byId("Arbpl");		    // Work Center
			if(this.oArbpl){
				utils.set_search_field(v_swerk, this.oArbpl, "woc", "C", "", "");
			}				
		},
		/*
		 * Plan Date Default Setting 
		 */
		setInitData : function(){
			this.oSwerk = this.getView().byId("Werks");
			
			var default_swerk;				
			if(!this.oSwerk.getSelectedItem()){
				
				for(var j=0; j<this.arr_werks.length; j++){
					var template = new sap.ui.core.Item();
				    template.setKey(this.arr_werks[j].Value);
			        template.setText(this.arr_werks[j].KeyName);
		            this.oSwerk.addItem(template);
		            
		            if(this.arr_werks[j].Default === "X"){
		            	default_swerk = j;
		            }
				}
	            
				this.oSwerk.setSelectedKey(this.arr_werks[default_swerk].Value); //Default Value Setting
			
			}else{
				this.oSwerk.setSelectedKey(this.oSwerk.getSelectedItem().getProperty("key"));
			}				
			
			var fdate = this.getView().byId("Fdate");
			var fvalue = fdate.getValue(); 
			if(!fvalue){
				var locDate = this.locDate;
				var adjust  = -7;
				fvalue = utils.getTermDate(locDate, adjust);
				fdate.setValue(fvalue);
			}
			
			var tdate = this.getView().byId("Tdate");
			var tvalue = tdate.getValue(); 
			if(!tvalue){
				var locDate = this.locDate;
				var adjust  = 7;
				tvalue = utils.getTermDate(locDate, adjust);
				tdate.setValue(tvalue);
			}
			
			
			this._set_search_field();
		},

		onSwerkSelect : function(oEvent) {
	    	this._set_search_field();
		},

		iconLink : function(oEvent){
			
			var path = oEvent.getParameter("listItem").getBindingContext("PmList").getPath()

			var oPmList =  this.getView().byId("listTable");
			var obj = oPmList.getModel("PmList").getProperty(path);
						
//			this._router.navTo("detail", {Ebeln : obj.Ebeln}, true);
			//Display a Target Without Changing the Hash
			this._router.getTargets().display("input", {
				fromTarget : "main",
				iAufnr  : obj.Aufnr,
				iAuart  : obj.Auart,
				iAufnrT : obj.AufnrT,
				iEqunr  : obj.Equnr,
				iEqunrT : obj.EqunrT,
				iWerks  : obj.Werks
			});	
			
		},	
		
		set_screen_mode : function(){
			var oView = this.getView();
		    
		    oView.setModel(new JSONModel({
				werks 		: true,
				kostl 		: true,
				fdate 		: true,
				tdate 		: true,
				search  	: true
			}), "screenMode");	
		},	    

		set_displayMode : function(mode){
			
		    var screenModel = this.getView().getModel("screenMode");
			var screenData = screenModel.getData();
		    
//		    if(mode === "X"){
//		    	screenData.aufnr 		= true;
//		    	screenData.rsnum 		= true;
//		    	screenData.budat 		= true;
//		    	screenData.Search 		= true;
//		    	screenData.GoodIssue 	= false;
//		    	screenData.Cancel		= false;			    	
//		    }else{
//		    	screenData.aufnr 		= false;
//		    	screenData.rsnum 		= false;
//		    	screenData.budat 		= true;
//		    	screenData.Search 		= false;
//		    	screenData.GoodIssue 	= true;
//		    	screenData.Cancel		= true;			    	
//		    }	
		    		
		    screenModel.refresh();
		},
		/*
		 * Search by search Button
		 */
		onBtnSearch: function(){
			var result = this.checkMandatory();

			if(result){
				this.onSearch();
			}else{
				if(Device.system.phone){
					MessageToast.show(this.i18n.getText("check_mandatory"));				
				}else{
					MessageBox.show(
							this.i18n.getText("check_mandatory"),
							MessageBox.Icon.ERROR,
							this.i18n.getText("warning")
					);		
				}
			}							
		},
						
		checkMandatory : function(){

			var oWerks = this.getView().byId("Werks").getSelectedKey();
			if(!oWerks){
				return false;
			}else {
				var w = Number(oWerks);
				this.getView().byId("Werks").setValue(w);				
			}
			
//			var oKostl = this.getView().byId("Kostl").getSelectedKey();
//			if(!oKostl){
//				return false;
//			}else {
//				var k = Number(oKostl);
//				this.getView().byId("Kostl").setValue(k);				
//			}
			
			
			return true;
		},


		onSearch : function(){
			var oModel = this.getView().getModel();
			var controll = this;

			var oTable =  controll.getView().byId("listTable");

			oModel.attachRequestSent(function(){oTable.setBusy(true);});
			oModel.attachRequestCompleted(function(){
				oTable.setBusy(false);
				oTable.setShowNoData(true);
			});

			oModel.setDefaultCountMode(sap.ui.model.odata.CountMode.None);

			// Key 
			var lange 	= this.getLanguage();
			var s_swerk = this.getView().byId("Werks").getValue();
			
			var s_arbpl_s = [];
			var s_color = [];   // Color
			var s_assign = [];	// assign
			var s_notass = [];  // not assign
			var s_mityp = [];   // Plan Category
			var s_istat = []; // Status - REL
			var s_filter = [];
			var filterStr;
			
			// Order Status
			s_istat.push("I0002");

	    	if(s_istat){
	    		s_filter.push(utils.set_filter(s_istat, "Istat"));
		    }
			
			// Work Center
			var arbpl = this.getView().byId("Arbpl").getSelectedKey();
			if(arbpl){
				s_arbpl_s.push(arbpl);

		    	if(s_arbpl_s){
		    		s_filter.push(utils.set_filter(s_arbpl_s, "Arbpl"));
			    }		
			}			
			
			// Plan Date
			var fDate = this.getView().byId("Fdate").getDateValue();
			var tDate = this.getView().byId("Tdate").getDateValue();
			var nplda_f = this.formatter.dateToStr(fDate);
			var nplda_t = this.formatter.dateToStr(tDate);
			
			if(nplda_f != "00000000" || nplda_t != "00000000"){
				s_filter.push(utils.set_bt_filter("Nplda", nplda_f, nplda_t));
			}

			// Status
  			s_color.push("yellow");
			s_color.push("green");
			s_color.push("red");
		
			s_filter.push(utils.set_filter(s_color, "Color"));
		
			// Assigned & Not Assigned
			s_assign.push("X");
			
	    	if(s_assign){
	    		s_filter.push(utils.set_filter(s_assign, "Assign"));
		    }		
    	
    		s_notass.push("X");
			
	    	if(s_notass){
	    		s_filter.push(utils.set_filter(s_notass, "Nassign"));
		    }		
	    	
			// Plan Category	    	
			s_mityp.push("P1");
			
	    	if(s_mityp){
	    		s_filter.push(utils.set_filter(s_mityp, "Mityp"));
		    }		    	
	    	
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
//						 var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
//						 oODataJSONModel.setData(oData);
//						 oTable.setModel(oODataJSONModel);
//						 oTable.bindRows("/ResList/results");						
						
						if(oData.ResultList){
							if(oData.ResultList.length < 1){
								MessageToast.show(this.i18n.getText("noResult"));
							}else{
								var oODataJSONModel =  new sap.ui.model.json.JSONModel();
								oODataJSONModel.setData(oData);
								
								oData.results = oData.ResultList.results;
								oTable.setModel(oODataJSONModel, 'PmList');
//								oTable.setModel(oODataJSONModel);
//								oTable.bindRows("/ResultList/results");

								this.set_screen_mode();
								this.set_displayMode(" ");				
							}
						}else{
							MessageToast.show(this.i18n.getText("noResult"));						
						}
					}.bind(this),
					error : function(oError) {
						if(Device.system.phone){
							MessageToast.show(this.i18n.getText("oData_conn_error"));				
						}else{
							MessageBox.show(
									this.i18n.getText("oData_conn_error"),
									MessageBox.Icon.ERROR,
									this.i18n.getText("error")
							);		
						}
					}.bind(this)
			};

			oModel.read(path, mParameters);
		},			
		
		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 */
		//onExit: function() {
		//},

		/****************************************************************
		 *  Event Handler
		 ****************************************************************/

		// Search filter set

		/*
		 * ComboBox select
		 */
		handleDateChangeFrom: function (oEvent) {
			var oText = this.byId("bedat_from");
			var oDP = oEvent.oSource;
			var sValue = oEvent.getParameter("value");
			var bValid = oEvent.getParameter("valid");
			this._iEvent++;

			if (bValid) {
				oDP.setValueState(sap.ui.core.ValueState.None);
			} else {
				oDP.setValueState(sap.ui.core.ValueState.Error);
			}
		},

		onIconPress : function(oEvent){
			var idx = oEvent.getSource().getParent().getIndex();
		},


		/****************************************************************
		 *  Local function
		 ****************************************************************/

		_handleLogout:function(oEvent){
			debugger;
			$.ajax({  
				type: "GET",  
				url: "/sap/public/bc/icf/logoff",  //Clear SSO cookies: SAP Provided service to do that  
			}).done(function(data){ //Now clear the authentication header stored in the browser  
				if (!document.execCommand("ClearAuthenticationCache")) {  
					//"ClearAuthenticationCache" will work only for IE. Below code for other browsers  
					$.ajax({  
						type: "GET",  
						url: "/sap/public/bc/icf/logoff", //any URL to a Gateway service  
						username: '', //dummy credentials: when request fails, will clear the authentication header  
						password: '',  
						statusCode: { 401: function() {  
							//This empty handler function will prevent authentication pop-up in chrome/firefox  
						} },  
						error: function() {  
							//alert('reached error of wrong username password')  
						}  
					});  
				}  
			});
			var myVar = setInterval(function(oEvent){
				window.location.replace("/sap/bc/ui5_ui5/sap/zpm_ui_0220/index.html");}, 100);
		}


	});
}
);