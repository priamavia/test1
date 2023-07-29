sap.ui.define([
               "cj/pm_m010/controller/BaseController",
               "cj/pm_m010/util/ValueHelpHelper",
               "cj/pm_m010/util/utils",
               "cj/pm_m010/model/formatter",
           	   "cj/pm_m010/model/models",
               "sap/ui/Device",
               "sap/ui/model/Filter",
               "sap/ui/model/FilterOperator",
               "sap/ui/model/json/JSONModel",
               "sap/ui/core/Fragment",
              	"sap/m/Dialog",       
               "sap/m/MessageBox",
               "sap/m/MessageToast",
               "sap/ui/core/Core",
               "jquery.sap.global"
               ], function (BaseController, ValueHelpHelper, utils, formatter, models, Device, Filter, FilterOperator, JSONModel, Fragment, Dialog, MessageBox, MessageToast, Core, jQuery) {
	"use strict";

	return BaseController.extend("cj.pm_m010.controller.Main", {
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
			// Keeps reference to any of the created sap.m.ViewSettingsDialog-s in this sample
			this._mViewSettingsDialogs = {};
			
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

			this.byId("anlkl").setFilterFunction(function (sTerm, oItem) {
				// A case-insensitive "string contains" style filter
				return oItem.getText().match(new RegExp(sTerm, "i"));
			});
			
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
			this.arr_werks  = this.get_Auth("SWERK");
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
			this.oGsber = this.getView().byId("gsber");
			
			var default_gsber;				
			if(!this.oGsber.getSelectedItem()){
				for(var j=0; j<this.arr_werks.length; j++){
					var template = new sap.ui.core.Item();
				    template.setKey(this.arr_werks[j].Value);
			        template.setText(this.arr_werks[j].KeyName);
		            this.oGsber.addItem(template);
		            
		            if(this.arr_werks[j].Default === "X"){
		            	default_gsber = j;
		            }
				}
	            
				this.oGsber.setSelectedKey(this.arr_werks[default_gsber].Value); //Default Value Setting
			}else{
				this.oGsber.setSelectedKey(this.oGsber.getSelectedItem().getProperty("key"));
			}
			
			// Cctr 자동 설정.
			this.onChangeBA();
			
			// Asset Class List 
	    	var oModel = this.getView().getModel("possible", false);
//	    	oModel.setDefaultCountMode(sap.ui.model.odata.CountMode.None);
	    	var lange = this.getLanguage();
	    	var input = "";
			var path = "/ImportSet('AKL')" ;
						
			var controll = this;
			var urlParameters = {
					"$expand" : "Result" ,
				    "$filter" : "Spras eq '"+ lange + "' and Input1 eq '" + input +"'"
			}
			
			var mParameters = {
					urlParameters : urlParameters,
//			  async:false,
					success : function(oData) {
						var oAnlkl =  new sap.ui.model.json.JSONModel();
						oAnlkl.setData(oData.Result);
						this.getView().setModel(oAnlkl, 'Anlkl');
				  
					}.bind(this),
					error : function(oError){
						Toast.show( key + this.oMain.i18n.getText("SH_Error"));
					}
			}
			oModel.read(path, mParameters);
		},
	    	    
		set_screen_mode : function(){
			var oView = this.getView();
		    
		    oView.setModel(new JSONModel({
				aufnr 		: true,
				rsnum 		: true,
				budat 		: true,
				Search 		: true,
				GoodIssue 	: true,
				Cancel 		: true,
				filter		: false
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
		    	screenData.filter		= true;
		    }else{
		    	screenData.aufnr 		= false;
		    	screenData.rsnum 		= false;
		    	screenData.budat 		= true;
		    	screenData.Search 		= false;
		    	screenData.GoodIssue 	= true;
		    	screenData.Cancel		= true;
		    	screenData.filter		= true;
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
			}
			// else{
			// 	if(Device.system.phone){
			// 		MessageToast.show(this.i18n.getText("check_mandatory"));				
			// 	}else{
			// 		MessageBox.show(
			// 				this.i18n.getText("check_mandatory"),
			// 				MessageBox.Icon.ERROR,
			// 				this.i18n.getText("warning")
			// 		);		
			// 	}
			// }							
		},

		onBtnPrint : function(oEvent){
			var strArr = oEvent.oSource.getProperty("text").split("(");
			this.sizeType = strArr[1].substring(0,1); 
			var printType = "";
			var sizeInfo = "";
			
			if(this.sizeType == "M"){ // Medium
				printType = "Asset QR(Medium)";
				sizeInfo = "Width = 18cm, Height = 10cm";
			}else{ // Small
				printType = "Asset QR(Small)";
				sizeInfo = "Width = 5cm, Height = 10cm";
			}
			
			var control = this;
			var iGsber = control.getView().byId("gsber").getSelectedKey();
			if(!iGsber){
				MessageToast.show(this.i18n.getText("noGsber"));
			}else{
				
				var oTable = this.getView().byId("listTable");
				var oSelItems = oTable.getSelectedItems();
				if(oSelItems.length > 0){
					var cnt = oSelItems.length;
					var title = cnt + " " + this.i18n.getText("printConfirm");

					if (!this.oPrintDialog) {
						this.oPrintDialog = new Dialog({
							type: sap.m.DialogType.Message,
							title: "Print Confirm",
							content: [
								new sap.ui.layout.HorizontalLayout({
									content: [
										new sap.ui.layout.VerticalLayout({
											width: "120px",
											content: [
												new sap.m.Text({ text: "Type: " }),
												new sap.m.Text({ text: "Size: " }),
												new sap.m.Text({ text: "Items count: " }),
												new sap.m.Text({ 
													text: "Print count: ",
													class: "sapUiSmallMargin"
												})
											]
										}),
										new sap.ui.layout.VerticalLayout({
											content: [
												new sap.m.Text("PrintType", { text: printType }),
												new sap.m.Text("SizeInfo", { text: sizeInfo }),
												new sap.m.Text("LabelCount", { text: cnt }),
												new sap.m.Input("PrintCount", {
														width: "70px",
														value: "1",
														type: "Number"
												})
											]
										})
									]
								})
							],
							beginButton: new sap.m.Button({
								type: sap.m.ButtonType.Emphasized,
								text: "Print",
								press: function () {
									var sCount = Core.byId("PrintCount").getValue();
									if(sCount < 100){
										control.onPrint(control.sizeType, sCount);
										this.oPrintDialog.close();										
									}else{
										sap.m.MessageBox.show(
												  this.i18n.getText("over99"),
											      sap.m.MessageBox.Icon.ERROR,
											      this.i18n.getText("error")
												);
									}
								}.bind(this)
							}),
							endButton: new sap.m.Button({
								text: "Cancel",
								press: function () {
									this.oPrintDialog.close();
								}.bind(this)
							})
						});
					}else{
						Core.byId("PrintType").setText(printType);
						Core.byId("LabelCount").setText(cnt);
						Core.byId("SizeInfo").setText(sizeInfo);
						Core.byId("PrintCount").setValue(1);
					}

					this.oPrintDialog.open();

				}else{
					sap.m.MessageBox.show(
							  this.i18n.getText("noPrint"),
						      sap.m.MessageBox.Icon.ERROR,
						      this.i18n.getText("error")
							);	
				}
			}			
		},

		onBtnFilter : function (oEvent) {
			var oTable = this.getView().byId("listTable");
			var oData = {};
			oData.results = [];
			
			for(var i=0; i<this.oData.results.length; i++){
				oData.results.push(this.oData.results[i]);
			}
			
			var oList = oData.results;
			var oFilter = [];
			
			
			if(oEvent.getSource().getPressed()){
				for(var i=0; i<oList.length; i++){
					if(oList[i].Qrcnt == 0){
						oFilter.push(oList[i]);
					}
				}
				
				oData.results = oFilter;
			}
			
			var oODataJSONModel =  new sap.ui.model.json.JSONModel();
			oODataJSONModel.setData(oData);
			oTable.setModel(oODataJSONModel, 'ResList');
		
		},

		onFilterSelection : function(){
			var a = this.getView().byId("filter").getPressed();
			var b = this.getView().byId("GroupA").getSelectedIndex();
			this.filterList(a, b);
		},
		
		filterList : function(a, b){
			var oTable = this.getView().byId("listTable");
			var oData = {};
			oData.results = [];
			
			for(var i=0; i<this.oData.results.length; i++){
				oData.results.push(this.oData.results[i]);
			}
			
			var oList = oData.results;
			var oFilter = [];
			
			for(var i=0; i<oList.length; i++){
				var ok_a = true;
				var ok_b = true;
				
				if(oList[i].Qrcnt != 0){
					if(a){						
						ok_a = false;
					}
				}
				
				if(oList[i].Menge == 0){
					if(b != 0){						
						ok_b = false;
					}
				}
				
				if(ok_a && ok_b){
					oFilter.push(oList[i]);
				}
			}
				
			oData.results = oFilter;
						
			var oODataJSONModel =  new sap.ui.model.json.JSONModel();
			oODataJSONModel.setData(oData);
			oTable.setModel(oODataJSONModel, 'ResList');

			MessageToast.show(this.i18n.getText("resultCount", oData.results.length));
		},

		onPrint : function(size, iCount){
			var controll = this;
			controll.mainpage = this.getView().byId("mainpage");
			
			var data = {};
			data.Gsber = controll.getView().byId("gsber").getSelectedKey();
			data.PrintName 	= "LAN_ZT411";
			data.SizeType 	= size;
			data.PrintCount = iCount;			
			data.NavList 	= [];
			data.NavReturn 	= [];
			
			var oTable = this.getView().byId("listTable");
			var oResult = oTable.getModel("ResList").oData.results;
			var oSelItems = oTable.getSelectedItems();
			
			for (var i = 0; i < oSelItems.length; i++) {
			    var item = oSelItems[i];
			    var context = item.oBindingContexts.valueOf().ResList.getObject();
				var body = {};
				
				body.Bukrs = context.Bukrs;
				body.Asset = context.Asset;
				body.Anln1 = context.Anln1;
				body.Anln2 = context.Anln2;
				body.Txt50 = context.Txt50;
				body.Equnr = context.Equnr;
				body.Eqktx = context.Eqktx;
				body.Invnr = context.Invnr;
				body.Tplnr = context.Tplnr;
				body.Pltxt = context.Pltxt;
				body.Anlkl = context.Anlkl;
				body.Txk20 = context.Txk20;
				body.Txk50 = context.Txk50;
				body.Kokrs = context.Kokrs;
				body.Kostl = context.Kostl;
				body.Ktext = context.Ktext;
				body.Gsber = context.Gsber;
				body.Aktiv = context.Aktiv;
				body.Ndjar = context.Ndjar;
				body.Ndper = context.Ndper;
				
				data.NavList.push(body); 
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
								if(result[i].Rttyp == "E"){
									err = true;
									msg = result[i].Rtmsg;
									break;
								}else if(result[i].Rttyp == "S"){
									err = false;
									msg = result[i].Rtmsg;
									break;								
								}
								
								err = true;
								msg = result[i].Rtmsg;								
							}
							
							if(!err){
								sap.m.MessageBox.show(
									msg,
									sap.m.MessageBox.Icon.SUCCESS,
									this.i18n.getText("success")
								);
								
								// 출력 후 재조회.
								this.onSearch();
								
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
			oModel.create("/QrScanSet", data, mParameters);
		},
								
		checkMandatory : function(){
			var cnt = 0; 
			var oGsber = this.getView().byId("gsber").getSelectedKey();
			if(!oGsber){
				MessageBox.show(
						"B/A is required.",
						MessageBox.Icon.ERROR,
						this.i18n.getText("error")
				);		
				
				return false;
			}
			
			var oKostl = this.getView().byId("kostl").getSelectedKey();
			if(!oKostl){
				var oAnln1 = this.getView().byId("anln1").getValue();
				if(!oAnln1){
					MessageBox.show(
							"Either Cctr or Asset No. is required.",
							MessageBox.Icon.ERROR,
							this.i18n.getText("error")
					);	

					return false;
				}
			}
			
			return true;
		},


		onSearch : function(){
			
			var oModel = this.getView().getModel();
			var oTable = this.getView().byId("listTable");
			var controll = this;
			
			oModel.attachRequestSent(function(){oTable.setBusy(true);});
			oModel.attachRequestCompleted(function(){
				oTable.setBusy(false);
				oTable.setShowNoData(true);
			});

			oModel.setDefaultCountMode(sap.ui.model.odata.CountMode.None);

			// Set Range Condition ---------------------------------
			var s_filter = [];
			var s_gsber = [];
			var s_kostl = [];
			var s_equnr = [];
			var s_anlkl = [];
			var s_anln1 = [];
			var s_tplnr = [];
			
			var iGsber = this.getView().byId("gsber").getSelectedKey();
			if(iGsber){
				s_gsber.push(iGsber);
    			s_filter.push(utils.set_filter(s_gsber, "Gsber"));
			}
			
			var iKostl = this.getView().byId("kostl").getSelectedKey();
			if(iKostl){
				s_kostl.push(iKostl);
    			s_filter.push(utils.set_filter(s_kostl, "Kostl"));
			}
			
			var iEqunr = this.getView().byId("equnr").getValue();
			if(iEqunr){
				s_equnr.push(iEqunr);
    			s_filter.push(utils.set_filter(s_equnr, "Equnr"));
			}

			var iAnlkl = this.getView().byId("anlkl").getTokens();
			for(var k=0; k<iAnlkl.length; k++){
				s_anlkl.push(iAnlkl[k].getProperty("key"));
			}
			if(s_anlkl.length>0){
    			s_filter.push(utils.set_filter(s_anlkl, "Anlkl"));
			}
			
			var iAnln1 = this.getView().byId("anln1").getValue();
			if(iAnln1){
				s_anln1.push(iAnln1);
    			s_filter.push(utils.set_filter(s_anln1, "Anln1"));
			}
			
			var iTplnr = this.getView().byId("tplnr").getValue();
			if(iTplnr){
				s_tplnr.push(iTplnr);
    			s_filter.push(utils.set_filter(s_tplnr, "Tplnr"));
			}
			
			// Range to filterSrt ---------------------------------
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
			
			var path = "/DispListSet";

			var mParameters = {
					urlParameters : {
						"$filter" : filterStr
					},
					success : function(oData) {
						this.oData = oData;

						this.onFilterSelection();
						
//						var oODataJSONModel =  new sap.ui.model.json.JSONModel();
//						oODataJSONModel.setData(oData);
//						oTable.setModel(oODataJSONModel, 'ResList');						
//						
//						this.getView().byId("filter").setPressed(false);
						
						if(oData.results){
							if(oData.results.length < 1){
								MessageToast.show(this.i18n.getText("noResult"));
							}else{
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

		onChangeBA : function(oEvent){
			var gsber = this.getView().byId("gsber").getSelectedKey();

			this.oKostl = this.getView().byId("kostl");					
			if(this.oKostl){
				this.oKostl.removeAllItems();
				this.oKostl.setSelectedKey("");
				utils.set_search_field(gsber, this.oKostl, "cbc", "C", gsber, "");
			}
		},
				
        onValueHelpRequest : function(oEvent){
			var strArr = oEvent.oSource.sId.split("--");
			var cnt = strArr.length - 1;
			var sIdstr = strArr[cnt];
					
			var s_swerk = "3020";
			
			if(sIdstr === "equnr"){
            	this.getOwnerComponent().openSearchEqui_Dialog(this, "Single", s_swerk);
			}else if(sIdstr === "tplnr"){
				var tokens = oEvent.getSource().getTokens();
				this.getOwnerComponent().openFuncLocation_Dialog(this, "MultiToggle", s_swerk, tokens);					
			}else{
				utils.openValueHelp(sIdstr);
			}				
			
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