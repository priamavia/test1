sap.ui.define([
               "cj/pm_m110/controller/BaseController",
               "cj/pm_m110/util/ValueHelpHelper",
               "cj/pm_m110/util/utils",
               "cj/pm_m110/model/formatter",
           	   "cj/pm_m110/model/models",
               "sap/ui/Device",
               "sap/ui/model/Filter",
               "sap/ui/model/FilterOperator",
               "sap/ui/model/json/JSONModel",
           	"sap/m/Dialog",       
               "sap/m/MessageBox",
               "sap/m/MessageToast",
               "sap/ui/core/Core",
               "jquery.sap.global"
               ], function (BaseController, ValueHelpHelper, utils, formatter, models, Device, Filter, FilterOperator, JSONModel, Dialog, MessageBox, MessageToast, Core, jQuery) {
	"use strict";

	return BaseController.extend("cj.pm_m110.controller.Main", {
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
			this.oWerks = this.getView().byId("Werks");
			
			var default_werks;				
			if(!this.oWerks.getSelectedItem()){
				for(var j=0; j<this.arr_werks.length; j++){
					var template = new sap.ui.core.Item();
				    template.setKey(this.arr_werks[j].Value);
			        template.setText(this.arr_werks[j].KeyName);
		            this.oWerks.addItem(template);
		            
		            if(this.arr_werks[j].Default === "X"){
		            	default_werks = j;
		            }
				}
	            
				this.oWerks.setSelectedKey(this.arr_werks[default_werks].Value); //Default Value Setting
			}else{
				this.oWerks.setSelectedKey(this.oWerks.getSelectedItem().getProperty("key"));
			}

			var iWerks = this.oWerks.getSelectedKey();
			this.oLgort = this.getView().byId("Lgort");
			
			if(this.oLgort){
				this.oLgort.removeAllItems();
				this.oLgort.setSelectedKey("");
				utils.set_search_field(iWerks, this.oLgort, "stl", "C", iWerks, "");
			}
			
			this.oMatkl = this.getView().byId("Matkl");
			
			if(this.oMatkl){
				this.oMatkl.removeAllItems();
				this.oMatkl.setSelectedKey("");
				utils.set_search_field("", this.oMatkl, "mag", "C", "", "");
			}

			this.oSubtype = this.getView().byId("Subtype");
			
			if(this.oSubtype){
				this.oSubtype.removeAllItems();
				this.oSubtype.setSelectedKey("");
				utils.set_search_field("", this.oSubtype, "sbg", "C", "ERSA", "");
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
				this.onClearAllSortings();
				this.onClearAllFilters();
				
				this.onSearch(true);
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

		onChangePlant : function(oEvent){
		    var v_werks = oEvent.oSource.getSelectedKey();
		    
			this.oLgort = this.getView().byId("Lgort");
			
			if(this.oLgort){
				this.oLgort.removeAllItems();
				this.oLgort.setSelectedKey("");
				utils.set_search_field(v_werks, this.oLgort, "stl", "C", v_werks, "");
			}
		},
		
		onBtnPrint : function(oEvent){
			var strArr = oEvent.oSource.getProperty("text").split("(");
			this.sizeType = strArr[1].substring(0,1); 
			var printType = "";
			var sizeInfo = "";
			
			if(this.sizeType == "M"){ // Medium
				printType = "Material QR(Medium)";
				sizeInfo = "width = 10cm, height = 5cm";
			}else{ // Small
				printType = "Material QR(Small)";
				sizeInfo = "width = 8cm, height = 5cm";
			}
			
			var control = this;
			var iWerks = control.getView().byId("Werks").getSelectedKey();
			if(!iWerks){
				MessageToast.show(this.i18n.getText("noPlant"));
			}else{
				
				var oTable = this.getView().byId("listTable");
				var aInd = oTable.getSelectedIndices();
				// var oSelItems = oTable.getSelectedItems();
				if(aInd.length > 0){
					var cnt = aInd.length;
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

		onPrint : function(size, iCount){
			var controll = this;
			controll.mainpage = this.getView().byId("mainpage");
			
			var data = {};
			data.Gsber = "";
			data.Werks = controll.getView().byId("Werks").getSelectedKey();
			data.PrintName 	= "LAN_ZT411";
			
			if(size == "M"){
				data.SizeType	= "O";				
			}else{
				data.SizeType	= "P";
			}
			data.PrintCount = iCount;
			data.NavList 	= [];
			data.NavMatList	= [];
			data.NavReturn 	= [];
			
			var oTable = this.getView().byId("listTable");
			var aInd = oTable.getSelectedIndices();
			
			for (var i = 0; i < aInd.length; i++) {
				var j = aInd[i];
				var context = oTable.getContextByIndex(j).getObject();
				var body = {};

				body.Bukrs = context.Bukrs;
				body.Matnr = context.Matnr;
				body.Werks = context.Werks;
				body.Lgort = context.Lgort;
				body.Lgobe = context.Lgobe;
				body.Maabc = context.Maabc;
				body.Meins = context.Meins;
				
				body.Eisbe = context.Eisbe.toString();
				
				body.Maktx = context.Maktx;
				body.Matkl = context.Matkl;
//				body.Wgbez = context.Wgbez;
				body.Mtart = context.Mtart;
//				body.Mtbez = context.Mtbez;
				body.Zusge = context.Zusge;
				body.Rackno = context.Rackno;
//				body.Qrcnt = context.Qrcnt;
//				body.Datum = context.Datum;
//				body.Uzeit = context.Uzeit;
//				body.Uname = context.Uname;
//				body.Zicon = context.Zicon;
//				body.Ztool = context.Ztool;

				data.NavMatList.push(body); 
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
								this.onSearch(false);
								
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
			var oWerks = this.getView().byId("Werks").getSelectedKey();
			if(!oWerks){
				return false;
			}
			
			var oLgort = this.getView().byId("Lgort").getSelectedKey();
			var oMaabc = this.getView().byId("Maabc").getSelectedKey();
			if(!oLgort && !oMaabc){
				return false;
			}
			return true;
		},

		onFilterSelection : function(ind){
			var a = this.getView().byId("filter").getPressed();
			var b = this.getView().byId("GroupA").getSelectedIndex();
			this.filterList(a, b, ind);
		},

		filterList : function(a, b, ind){
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
				
				if(oList[i].Labst == 0){
					if(b != 0){						
						ok_b = false;
					}
				}
				
				if(ok_a && ok_b){
					var oEisbe = parseFloat(oList[i].Eisbe);
					var oQrcnt = parseFloat(oList[i].Qrcnt);
					var oLabst = parseFloat(oList[i].Labst);
					
					oList[i].Eisbe = oEisbe;
					oList[i].Qrcnt = oQrcnt;
					oList[i].Labst = oLabst;
					
					oFilter.push(oList[i]);
				}
			}
				
			oData.results = oFilter;
						
			var oODataJSONModel =  new sap.ui.model.json.JSONModel();
			oODataJSONModel.setData(oData);
			// oTable.setModel(oODataJSONModel, 'ResList');
			oTable.setModel(oODataJSONModel);			
			oTable.bindRows("/results");

			var aColumns = oTable.getColumns();
			for (var i = 0; i < aColumns.length; i++) {
				if(aColumns[i].getFilterValue()){
					oTable.filter(aColumns[i], aColumns[i].getFilterValue());
				}else{
					oTable.filter(aColumns[i], null);
				}

				if(aColumns[i].getSorted()){
					oTable.sort(aColumns[i], aColumns[i].getSortOrder());
				}
			}

			if(ind){
				MessageToast.show(this.i18n.getText("resultCount", oData.results.length));	
			}
			
		},

		onClearAllSortings : function(oEvent){
			var oTable = this.getView().byId("listTable");
			if(oTable.getBinding("rows")){
				oTable.getBinding("rows").sort(null);
				utils.resetSortingState(oTable);				
			}
		},
		
		
		onClearAllFilters : function(oEvent){
			var oTable = this.getView().byId("listTable");

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
		_filter : function() {
			var oFilter = null;

			if (this._oGlobalFilter) {
				oFilter = this._oGlobalFilter;
			}

			var oRows = this.getView().byId("listTable").getBinding("rows");
			if(oRows){
				oRows.filter(oFilter, "Application");
			}
		},
		
		onSearch : function(ind){
			
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
			var s_werks = [];
			var s_lgort = [];
			var s_subtype = [];
			var s_maabc = [];
			var s_matnr = [];
			var s_rackno = [];
			var s_matkl = [];
			
			var iWerks = this.getView().byId("Werks").getSelectedKey();
			if(iWerks){
				s_werks.push(iWerks);
    			s_filter.push(utils.set_filter(s_werks, "Werks"));
			}
			
			var iLgort = this.getView().byId("Lgort").getSelectedKey();
			if(iLgort){
				s_lgort.push(iLgort);
    			s_filter.push(utils.set_filter(s_lgort, "Lgort"));
			}
			
			var iMaabc = this.getView().byId("Maabc").getSelectedKey();
			if(iMaabc){
				s_maabc.push(iMaabc);
    			s_filter.push(utils.set_filter(s_maabc, "Maabc"));
			}

			// var iSubtype = this.getView().byId("Subtype").getSelectedKey();
			// if(iSubtype){
			// 	s_subtype.push(iSubtype);
   //  			s_filter.push(utils.set_filter(s_subtype, "Subtype"));
			// }
			
			var iMatnr = this.getView().byId("Matnr").getValue();
			if(iMatnr){
				s_matnr.push(iMatnr);
    			s_filter.push(utils.set_filter(s_matnr, "Matnr"));
			}

			// var iRackno = this.getView().byId("Rackno").getValue();
			// if(iRackno){
			// 	s_rackno.push(iRackno);
   //  			s_filter.push(utils.set_filter(s_rackno, "Rackno"));
			// }			
			
			// var iMatkl = this.getView().byId("Matkl").getSelectedKey();
			// if(iMatkl){
			// 	s_matkl.push(iMatkl);
   //  			s_filter.push(utils.set_filter(s_matkl, "Matkl"));
			// }
			
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
			
			var path = "/MatListSet";

			var mParameters = {
					urlParameters : {
						"$filter" : filterStr
					},
					success : function(oData) {

						this.oData = oData;
						this.onFilterSelection(ind);
						
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

		/****************************************************************
		 *  Event Handler
		 ****************************************************************/

		// Search filter set
		onFilterSearch : function(oEvent){
			
		},
		

		onDownloadExcel : function(oEvent){
			var oModel, oTable, sFilename, v_werks;
			
			
			v_werks = this.getView().byId("Werks").getSelectedKey();
			oTable = this.getView().byId("listTable");
			oModel = oTable.getModel();
			sFilename = "File";
			
			utils.makeExcel(oModel, oTable, sFilename, v_werks);
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