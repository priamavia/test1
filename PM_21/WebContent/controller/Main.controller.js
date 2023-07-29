sap.ui.define([
               "cj/pm0210/controller/BaseController",
               "cj/pm0210/util/ValueHelpHelper",
               "cj/pm0210/util/utils",
               "cj/pm0210/model/formatter",
           		"cj/pm0210/model/models",
               "sap/ui/Device",
               "sap/ui/model/Filter",
               "sap/ui/model/FilterOperator",
               "sap/ui/model/json/JSONModel",
               "sap/m/MessageBox",
               "sap/m/MessageToast",
               "jquery.sap.global"
               ], function (BaseController, ValueHelpHelper, utils, formatter, models, Device, Filter, FilterOperator, JSONModel, MessageBox, MessageToast, jQuery) {
	"use strict";

	return BaseController.extend("cj.pm0210.controller.Main", {
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

			var oWerks;					
			var arr_werks = [];
			var arr_kostl = [];
			var arr_kokrs = [];

			var oTable;

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
			this.arr_werks  = this.get_Auth("WERKS");
			this.locDate    = this.get_Auth("LOCDAT")[0].Value;
			this.locTime    = this.get_Auth("LOCTIM")[0].Value;
			this.dateFormat = this.get_Auth("DATFORMAT")[0].Value;
//			""	1.234.567,89
//			X  1,234,567.89
//			Y  1 234 567,89			
			this.decimalFormat = this.get_Auth("DECFOR")[0].Value;		
			this.sep        = this.get_Auth("SEP")[0].Value;
			this.pd         = this.get_Auth("ZPMUI0210");
		},
		/*
		 * Plan Date Default Setting 
		 */
		setInitData : function(){
			var budat = this.getView().byId("budat").getValue();
			if(!budat){
				budat = this.locDate;
				this.getView().byId("budat").setValue(budat);
			}
		},
	    	    
		set_screen_mode : function(){
			var oView = this.getView();
		    
		    oView.setModel(new JSONModel({
				aufnr 		: true,
				rsnum 		: true,
				budat 		: true,
				Search 		: true,
				GoodIssue 	: true,
				Cancel 		: true
			}), "screenMode");	
		},	    

		set_displayMode : function(mode){
			
		    var screenModel = this.getView().getModel("screenMode");
			var screenData = screenModel.getData();
		    
		    if(mode === "X"){
		    	screenData.aufnr 		= true;
		    	screenData.rsnum 		= true;
		    	screenData.budat 		= true;
		    	screenData.Search 		= true;
		    	screenData.GoodIssue 	= false;
		    	screenData.Cancel		= false;			    	
		    }else{
		    	screenData.aufnr 		= false;
		    	screenData.rsnum 		= false;
		    	screenData.budat 		= true;
		    	screenData.Search 		= false;
		    	screenData.GoodIssue 	= true;
		    	screenData.Cancel		= true;			    	
		    }	
		    		
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

		onBtnGoodIssue : function(){
			var control = this;
			var budat   = control.getView().byId("budat").getValue();
			if(!budat){
				MessageToast.show(this.i18n.getText("noBudat"));
			}else{
				MessageBox.confirm(this.i18n.getText("goodIssueConfirm"), 
						{//title: "", 
			             onClose : function(oAction){
						   	if(oAction=="OK"){
						   		control.onGoodIssue();
							}else{
								return false;
							}
						 },
			             styleClass: "",
			             initialFocus: sap.m.MessageBox.Action.OK,
			             textDirection : sap.ui.core.TextDirection.Inherit }
				);	
			}			
		},

		onGoodIssue : function(){
			var controll = this;
			controll.mainpage = this.getView().byId("mainpage");
			
			var data = {};
//			data.Budat = utils.getCurrentDate();
			data.Budat = this.getView().byId("budat").getValue();
			
			data.NavMain = [];
			data.NavReturn = [];
			
			var oTable = this.getView().byId("listTable");
			var oResult = oTable.getModel("ResList").oData.results;
			for(var i=0; i<oResult.length; i++){
				var body = {};
				body.Rsnum = oResult[i].Rsnum;
				body.Rspos = oResult[i].Rspos;
				body.Matnr = oResult[i].Matnr;
				body.Maktx = oResult[i].Maktx;
				body.Werks = oResult[i].Werks;
				body.Wname = oResult[i].Wname;
				body.Lgort = oResult[i].Lgort;
				body.Lgobe = oResult[i].Lgobe;
				body.Menge = oResult[i].Menge;
				body.Meins = oResult[i].Meins;
				body.Stock = oResult[i].Stock;
//				body.Enmng = oResult[i].;
				body.Giqty = oResult[i].Giqty;
				
				if(!body.Giqty){
					body.Giqty = "0";
				}
				
				data.NavMain.push(body);				
			}

			var oModel = this.getView().getModel();
			oModel.attachRequestSent(
					function(){
						controll.mainpage.setBusy(true);});
			oModel.attachRequestCompleted(
					function(){
						controll.mainpage.setBusy(false);});
			
			var mParameters = {
					success : function(oData) {
						if(oData.NavReturn){
							var err;
							var msg;
							var result = oData.NavReturn.results;
							
							for(var i=0; i<result.length; i++){
								if(result[i].Type == "E"){
									err = true;
									msg = result[i].Message;
									break;
								}else if(result[i].Type == "S"){
									err = false;
									msg = result[i].Message;
									break;								
								}
								
								err = true;
								msg = result[i].Message;								
							}
							
							if(!err){
								sap.m.MessageBox.show(
									msg,
									sap.m.MessageBox.Icon.SUCCESS,
									this.i18n.getText("success")
								);		
								this.onReset();
							}else{
								sap.m.MessageBox.show(
										msg,
										sap.m.MessageBox.Icon.ERROR,
										this.i18n.getText("error")
									);		
							}
						}else{
							MessageToast.show(this.i18n.getText("noResult"));						
						}
					}.bind(this),
					error : function() {
						sap.m.MessageBox.show(
								this.i18n.getText("oData_conn_error"),
								sap.m.MessageBox.Icon.ERROR,
								this.i18n.getText("error")
						);
					}.bind(this)
			};
			oModel.create("/GoodIssueSet", data, mParameters);
		},

		onBtnCancel : function(){
			var control = this;
			
			MessageBox.confirm(this.i18n.getText("resetConfirm"), 
					{//title: "", 
		             onClose : function(oAction){
					   	if(oAction=="OK"){
					   		control.onReset();
						}else{
							return false;
						}
					 },
		             styleClass: "",
		             initialFocus: sap.m.MessageBox.Action.OK,
		             textDirection : sap.ui.core.TextDirection.Inherit }
			);
		},
		
		onReset : function(){
			// Header clear
			this.getView().byId("aufnr").setValue("");
			// List clear			
			var oODataJSONModel =  new sap.ui.model.json.JSONModel();
			var oTable = this.getView().byId("listTable");
			oODataJSONModel.setData(null);
			oTable.setModel(oODataJSONModel, 'ResList');						
			// Screen Refresh
			this.set_screen_mode();
			this.set_displayMode("X");
		},
						
		checkMandatory : function(){
			var cnt = 0; 
			var oAufnr = this.getView().byId("aufnr").getValue();
			if(!oAufnr){
				return false;
			}
			
			var a = Number(oAufnr);
			this.getView().byId("aufnr").setValue(a);
			
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

			var oAufnr = this.getView().byId("aufnr").getValue();
			
			var filterStr;
			filterStr = "Aufnr eq '"+oAufnr+"'";
			var path = "/DispListSet";

			var mParameters = {
					urlParameters : {
						"$filter" : filterStr
					},
					success : function(oData) {
						if(oData.results){
							if(oData.results.length < 1){
								MessageToast.show(this.i18n.getText("noResult"));
							}else{
								
								var ok;
								var noauth;
								
								for(var i=0; i<oData.results.length; i++){
									ok = false;
									
									for(var k=0; k<this.pd.length; k++){
										if(oData.results[i].Werks == this.pd[k].Value){
											ok = true;
											break;
										}
									}
									
									if(!ok){
										noauth = true;
										break;
									}
								}
								
								if(!noauth){
									var oODataJSONModel =  new sap.ui.model.json.JSONModel();
									oODataJSONModel.setData(oData);
									oTable.setModel(oODataJSONModel, 'ResList');						

									this.set_screen_mode();
									this.set_displayMode(" ");									
								}else{
									MessageToast.show(this.i18n.getText("noauthPlant", [oAufnr]));
								}

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
				window.location.replace("/sap/bc/ui5_ui5/sap/zpm_ui_0210/index.html");}, 100);
		}


	});
}
);