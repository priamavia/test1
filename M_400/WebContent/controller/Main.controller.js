sap.ui.define([
               "cj/mm0010/controller/BaseController",
               "cj/mm0010/util/ValueHelpHelper",
               "cj/mm0010/util/utils",
               "cj/mm0010/model/formatter",
               "sap/ui/Device",
               "sap/ui/model/Filter",
               "sap/ui/model/FilterOperator",
               "sap/ui/model/json/JSONModel",
               "sap/m/MessageBox",
               "sap/m/MessageToast",
               "jquery.sap.global"
               ], function (BaseController, ValueHelpHelper, utils, formatter, Device, Filter, FilterOperator, JSONModel, MessageBox, MessageToast, jQuery) {
	"use strict";

	return BaseController.extend("cj.mm0010.controller.Main", {
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
						// set default value 
						controll._set_search_field();  // set Search Help

						if(this.oArgs.rEkgrp){
							this.setSelectCon();							
							this.onSearch();
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
		},
		/*
		 * Plan Date Default Setting 
		 */
		setInitData : function(){				
			var bedat_from = this.getView().byId("bedat_from");				
			var bedat_to   = this.getView().byId("bedat_to");

			bedat_from.setDisplayFormat(this.dateFormat);
			bedat_from.setValueFormat("yyyyMMdd");

			bedat_to.setDisplayFormat(this.dateFormat);
			bedat_to.setValueFormat("yyyyMMdd");

			var toDate = this.formatter.strToDate(this.locDate);
			var fromDate = new Date();
			var fromDay =  toDate.getDate() - 7;
			fromDate.setDate( fromDay );

			bedat_from.setDateValue( fromDate );				
			bedat_to.setDateValue( toDate );	

			this.oWerks = this.getView().byId("werks");

			this.getView().byId("ekgrp").setSelectedKey("");
			
			if(Device.system.phone){
				this.getView().byId("spaeText").setVisible(false);
			}else{
				this.getView().byId("spaeText").setVisible(true);			
			}

			var default_werks;				
			if(!this.oWerks.getSelectedItem()){
				for(var j=0; j<this.arr_werks.length; j++){
					var template = new sap.ui.core.Item();
					template.setKey(this.arr_werks[j].Value);
					template.setText(this.arr_werks[j].KeyName);
					this.oWerks.addItem(template);

					if(default_werks == undefined && this.arr_werks[j].Default === "X"){
						default_werks = j;
					}
				}

				this.oWerks.setSelectedKey(this.arr_werks[default_werks].Value); //Default Value Setting

			}else{
				this.oWerks.setSelectedKey(this.oWerks.getSelectedItem().getProperty("key"));
			}			

		},

	    set_model_count : function(){},
	    
	    get_purchase_order_data : function(){},
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

		onSelChange : function(oEvent){
			var strArr = oEvent.oSource.sId.split("--");
			var cnt = strArr.length - 1;
			var sIdstr = strArr[cnt];			

			if(sIdstr === "ekgrp"){				// Combo
				var oEkgrp =  oEvent.getParameter("newValue");
				if(oEkgrp){  // .getKey()
					oEvent.getSource().setValueState("None");
				}
				this.oArgs.rEkgrp = "";
			}else if(sIdstr === "matnr" ){
				var oMatnr =  oEvent.getParameter("selectedItem");
				if(oMatnr){  // .getKey()
					oEvent.getSource().setValueState("None");
				}
				this.oArgs.rMatnr = "";
			}else if(sIdstr === "werks"){	
				var oWerks =  oEvent.getParameter("selectedItem");
				if(oWerks){ // .getKey()
					oEvent.getSource().setValueState("None");
					
					var v_werks = oEvent.getParameter("selectedItem").getKey();
					this.oStl = this.getView().byId("lgort");		    // Location
					if(this.oStl){
						utils.set_search_field(v_werks, this.oStl, "stl", "C", "", "");
					}								
					
				}
				this.oArgs.rWerks = "";
			}else if(sIdstr === "lgort"){	
				var oLgort =  oEvent.getParameter("selectedItem");
				if(oLgort){ // .getKey()
					oEvent.getSource().setValueState("None");
				}	

				this.oArgs.rLgort = "";
			}	

		},		
		
		
		setSelectCon : function(){
			
			if(this.oArgs.rBedatF){
				this.getView().byId("bedat_from").setDateValue(this.formatter.strToDate(this.oArgs.rBedatF));
				delete this.oArgs.rBedatF;
				
			}
			if(this.oArgs.rBedatT){
				this.getView().byId("bedat_to").setDateValue(this.formatter.strToDate(this.oArgs.rBedatT));
				delete this.oArgs.rBedatT;
			}
			
//			if(this.oArgs.rLifnr){
//				var oLifnr = this.getView().byId("lifnr").setTokens();	
//			}
			
			var oEkgrp = this.getView().byId("ekgrp")
			if(this.oArgs.rEkgrp && oEkgrp.getSelectedKey() == "" ){
				oEkgrp.setSelectedKey(this.oArgs.rEkgrp);
			}
			
			var oMatnr = this.getView().byId("matnr");
			if(this.oArgs.rMatnr && oMatnr.getSelectedKey() == "" ){
				oMatnr.setSelectedKey(this.oArgs.rMatnr);
			}
			
			var oWerks = this.getView().byId("werks")
			if(this.oArgs.rWerks && oWerks.getSelectedKey() == "" ){
				oWerks.setSelectedKey(this.oArgs.rWerks);
			}
			
			var oLgort = this.getView().byId("lgort")
			if(this.oArgs.rLgort && oLgort.getSelectedKey() == "" ){
				oLgort.setSelectedKey(this.oArgs.rLgort);
			}				
		},
		
		checkMandatory : function(){
			var cnt = 0; 
			
			if(this.oArgs.rEkgrp){
				this.setSelectCon();							
			}						
			
			var oEkgrp = this.getView().byId("ekgrp");
			if(!oEkgrp.getSelectedKey()){
				oEkgrp.setValueState("Error");
				cnt = cnt - 1;
			}else{
				oEkgrp.setValueState("None");
				cnt = cnt + 1;
			}

			if(!utils.checkMandatory(this, "mainpage")){
				cnt = cnt - 1;
			}else{
				cnt = cnt + 1;
			}

			if(cnt == 2){
				return true;   //success
			}else{ 

				return false;  //fail
			}			
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

			var s_lifnr = [];   // Vendor
			var s_matnr = [];   		// Material
			var s_werks = [];   		// Plant
			var s_lgort = [];   		// Location

			var s_filter = [];

			/*
			 * Key
			 */				
			var lange = this.getLanguage();
			// Maint. Plant
			var s_ekgrp = this.getView().byId("ekgrp").getSelectedKey();
			
			/*
			 * filter
			 */					
			// Vendor
			var oLifnr = this.getView().byId("lifnr").getTokens();
			for(var j=0; j<oLifnr.length; j++){
				s_lifnr.push(oLifnr[j].getProperty("key"));
			}
			if(s_lifnr.length>0){
				s_filter.push(utils.set_filter(s_lifnr, "Lifnr"));
			}

			// Material
			var oMatnr = this.getView().byId("matnr").getSelectedKey();
			if(oMatnr){
				s_matnr.push(oMatnr);

				if(s_matnr){
					s_filter.push(utils.set_filter(s_matnr, "Matnr"));
				}		
			}

			// Plant
			var oWerks = this.getView().byId("werks").getSelectedKey();
			if(oWerks){
				s_werks.push(oWerks);

				if(s_werks){
					s_filter.push(utils.set_filter(s_werks, "Werks"));
				}		
			}			

			// Location
			var oLgort = this.getView().byId("lgort").getSelectedKey();
			if(oLgort){
				s_lgort.push(oLgort);

				if(s_lgort){
					s_filter.push(utils.set_filter(s_lgort, "Lgort"));
				}		
			}		
			
			// Plan Date
			var startDate = this.getView().byId("bedat_from").getDateValue();
			var endDate = this.getView().byId("bedat_to").getDateValue();
			var bedat_f = this.formatter.dateToStr(startDate);
			var bedat_t = this.formatter.dateToStr(endDate);

			if(bedat_f != "00000000" || bedat_t != "00000000"){
				s_filter.push(utils.set_bt_filter("Bedat", bedat_f, bedat_t));
			}				

			// Return Value setting
			this.Ekgrp = s_ekgrp;
			this.Lifnr = oLifnr;
			this.Matnr = oMatnr;
			this.Werks = oWerks;
			this.Lgort = oLgort;
			this.BedatF = bedat_f;
			this.BedatT = bedat_t;
			
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


			var path = "/InputSet(Spras='"+lange+"',Ekgrp='"+s_ekgrp+"')";

			var mParameters = {
					urlParameters : {
						"$expand" : "ResultList",
						"$filter" : filterStr
					},
					success : function(oData) {
						var oODataJSONModel =  new sap.ui.model.json.JSONModel();
						oODataJSONModel.setData(oData);
						oTable.setModel(oODataJSONModel, 'PoList');						

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

		/* 
		 * PM Possible Entry Odata Set 
		 */	
		_set_search_field : function() {
			var v_werks = this.oWerks.getSelectedKey();

			this.oPug = this.getView().byId("ekgrp");		    // Buyer
			if(this.oPug){
				utils.set_search_field(v_werks, this.oPug, "pug", "C", "", "");
			}				

			this.lifnr = this.getView().byId("lifnr");
			var v_ekorg1 = "";
			var v_ekorg2 = "";
			for(var j=0; j<this.arr_werks.length; j++){
				if(this.arr_werks[j].Value === v_werks){
					v_ekorg1 = this.arr_werks[j].Add3;
					v_ekorg2 = this.arr_werks[j].Add4;
					break;
				}
			}

			if(this.lifnr){
				utils.set_search_field("", this.lifnr, "lfa", "H", v_ekorg1, v_ekorg2);
			}		


			this.oMat = this.getView().byId("matnr");		    // Materail
			if(this.oMat){
				utils.set_search_field("", this.oMat, "mat", "C", "", "");
			}				

			this.oStl = this.getView().byId("lgort");		    // Location
			if(this.oStl && v_werks != ""){
				utils.set_search_field(v_werks, this.oStl, "stl", "C", "", "");
			}				

		},


		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 */
		//onExit: function() {
		//},

		onValueHelpRequest : function(oEvent){
			var strArr = oEvent.oSource.sId.split("--");
			var cnt = strArr.length - 1;
			var sIdstr = strArr[cnt];

			var s_werks = this.oWerks.getSelectedKey();

			if(sIdstr === "tplnr"){
				var tokens = oEvent.getSource().getTokens();
				this.getOwnerComponent().openFuncLocation_Dialog(this, "MultiToggle", s_werks, tokens);
			}else{
				utils.openValueHelp(sIdstr);
			}				
		},			
		/****************************************************************
		 *  Event Handler
		 ****************************************************************/
		onCreatePo : function (){
//			this._router.navTo("detail", null, true);

			this._router.getTargets().display("detail", {
				fromTarget : "main"
			});					
		},	

		onDeletePo : function (){

		},	

		onItemPress: function(oEvent){
			var path =oEvent.getParameter("listItem").getBindingContext("PoList").getPath();

			var oPoList =  this.getView().byId("listTable");
			var obj = oPoList.getModel("PoList").getProperty(path);

//			this._router.navTo("detail", {Ebeln : obj.Ebeln}, true);
			//Display a Target Without Changing the Hash
			this._router.getTargets().display("detail", {
				fromTarget : "main",
				Ebeln : obj.Ebeln,
				rEkgrp : this.Ekgrp,
				rLifnr : this.Lifnr,
				rMatnr : this.Matnr,
				rWerks : this.Werks,
				rLgort : this.Lgort,
				rBedatF : this.BedatF,
				rBedatT : this.BedatT
//				Matnr : obj.Matnr
			});			
		},		


		// download excel
		downloadExcel : function(oEvent) {
			var oModel, oTable, sFilename;

			oTable = this.getView().byId("listTable");
			oModel = oTable.getModel();
			sFilename = "File";

			utils.makeExcel(oModel, oTable, sFilename);
		},

		// clear Sort 	
		clearAllSortings : function(oEvent) {
			var oTable = this.getView().byId("listTable");
			oTable.getBinding("rows").sort(null);
			this._resetSortingState();
		},

		// clear filter
		clearAllFilters : function(oEvent) {
			var oTable = this.getView().byId("listTable");

			var oUiModel = this.getView().getModel("ui");
			oUiModel.setProperty("/globalFilter", "");
			oUiModel.setProperty("/availabilityFilterOn", false);

			this._oGlobalFilter = null;

			var aColumns = oTable.getColumns();
			for (var i = 0; i < aColumns.length; i++) {
				oTable.filter(aColumns[i], null);
			}
		},

		// Search filter set
		filterGlobally : function(oEvent) {
			var sQuery = oEvent.getParameter("query");
			this._oGlobalFilter = null;
			if (sQuery) {
				this._oGlobalFilter = new Filter(
						[
						 new Filter("MitypCt", FilterOperator.Contains,sQuery),
						 new Filter("WarplCt", FilterOperator.Contains,sQuery),
						 new Filter("PlanSortT", FilterOperator.Contains,sQuery) 			
						 ], 
						 false)
			}
			this._filter();
		},

		/*
		 * ComboBox select
		 */
		onWerksSelect : function(oEvent) {	
			this.oStl.setSelectedKey("");
			this._set_search_field();
		},

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

		handleDateChangeTo: function (oEvent) {
			var oText = this.byId("bedat_to");
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

		_resetSortingState : function() {
			var oTable = this.getView().byId("listTable");
			var aColumns = oTable.getColumns();
			for (var i = 0; i < aColumns.length; i++) {
				aColumns[i].setSorted(false);
			}
		},

		_filter : function() {
			var oFilter = null;

			if (this._oGlobalFilter) {
				oFilter = this._oGlobalFilter;
			}

			this.getView().byId("listTable").getBinding("rows").filter(oFilter,	"Application");
		},

		_handleLogout:function(oEvent){
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
				window.location.replace("/sap/bc/ui5_ui5/sap/zmm_ui_0010/index.html");}, 100);
		}


	});
}
);