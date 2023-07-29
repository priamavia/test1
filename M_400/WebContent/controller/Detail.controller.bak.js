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
               ], function (BaseController, ValueHelpHelper, utils, formatter, Device, 
            		   Filter, FilterOperator, JSONModel, MessageBox, MessageToast, jQuery) {
	"use strict";

	return BaseController.extend("cj.mm0010.controller.Detail", {
		formatter: formatter,
		/**
		 * Boardled when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @public
		 */
		onInit : function () {
			var oView = this.getView();

			var oComponent = this.getOwnerComponent();
			this.getView().addStyleClass(oComponent.getContentDensityClass());			

			this._router = oComponent.getRouter();
//			this._router.getRoute("detail").attachMatched(this._onRouteMatched, this);

			var oTarget = this._router.getTarget("detail");
			oTarget.attachDisplay(this._onRouteMatched, this);

			this.getView().setModel(new JSONModel(Device), "device");
			
			this.modelCount = 0;
		},

		_onRouteMatched : function (oEvent) {
			var controll = this;

			this.oPoDetail = this.getView().byId("PoDetail");

//			this.oArgs = oEvent.getParameter("arguments");
			this.oArgs = oEvent.getParameter("data");		// //store the data

			this.i18n = this.getView().getModel("i18n").getResourceBundle();

			this.getLoginInfo();
			this.set_userData();
			this.set_screen_mode();

//			if(this.oArgs.Ebeln){  // Release Statue : Frgzu is space Change 
//				this.set_displayMode("U");
//				this.get_purchase_order_data();				
//			}else{
//				this.set_displayMode("C");
//			}			
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 */
		onBeforeRendering: function() {
//			debugger;
//			this.i18n = this.getView().getModel("i18n").getResourceBundle();

//			this.getLoginInfo();
//			this.setInitData();
//			this.set_screen_mode();	
		},

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
						//controll.setMateriaUnit(this.oArgs.Matnr); // Material 에 따른 Unit, Price Unit 조회

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
			this.sep        = this.get_Auth("SEP")[0].Value;
		},
		/*
		 * Plan Date Default Setting 
		 */
		setInitData : function(){	
			this.oWerks = this.getView().byId("werks");

			var default_werks;				
			if(!this.oWerks.getSelectedKey()){
				for(var j=0; j<this.arr_werks.length; j++){
					var template = new sap.ui.core.Item();
					template.setKey(this.arr_werks[j].Value);
					template.setText(this.arr_werks[j].KeyName);
					this.oWerks.addItem(template);
//					debugger;
					if(default_werks == undefined && this.arr_werks[j].Default === "X"){
						default_werks = j;
					}
				}

				this.oWerks.setSelectedKey(this.arr_werks[default_werks].Value); //Default Value Setting

			}else{
//				this.oWerks.setSelectedKey(this.oWerks.getSelectedKey().getProperty("key"));
				this.oWerks.setSelectedKey(this.oWerks.getSelectedKey());
			}
			

			this.getView().byId("mwskz").setSelectedKey("I0");
			this.getView().byId("zblcWaers").setSelectedKey("BRL");
			this.getView().byId("zfc4Waers").setSelectedKey("BRL");
			this.getView().byId("zbalWaers").setSelectedKey("BRL");
			
		},		

		_set_search_field : function() {
			var controll = this;
			var v_werks = this.oWerks.getSelectedKey();

			this.oPug = this.getView().byId("ekgrp");		    // Buyer
			if(this.oPug){
				utils.set_search_field("", this.oPug, "pug", "C", "", "");
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

//			if(this.oMat.getSelectedKey()){
//			this.oUom = this.getView().byId("meins");		    // Unit of Materail
//			if(this.oUom){
//			utils.set_search_field("", this.oUom, "uom", "C", "", "");
//			}								
//			}

			
			this.oSfr = this.getView().byId("zzcttxt01");		    // SAFRA
			if(this.oSfr){
				utils.set_search_field("", this.oSfr, "sfr", "C", "", "");
			}
			
			this.oInc = this.getView().byId("inco1");		    // Incoterm
			if(this.oInc){
				utils.set_search_field("", this.oInc, "inc", "C", "", "");
			}

			this.oReg = this.getView().byId("zzaddi1");		    // Region
			if(this.oReg){
				utils.set_search_field("", this.oReg, "reg", "C", "", "");
			}

			this.oTax = this.getView().byId("mwskz");		    // Tax Code
			if(this.oTax){
				utils.set_search_field("", this.oTax, "tax", "C", "", "");
			}	
			
//			debugger;
//			var searchModel = this.oTax.getModel();
//
//			if(this.oArgs.Ebeln){  // Release Statue : Frgzu is space Change 
//				this.set_displayMode("U");
//
//				searchModel.attachRequestCompleted( function(){ controll.get_purchase_order_data(); });
//								
//			}else{
//				this.set_displayMode("C");
//			}			
			
			if(this.oArgs.Ebeln){  // Release Statue : Frgzu is space Change 
				this.set_displayMode("U");
				this.get_purchase_order_data();				
			}else{
				this.set_displayMode("C");
			}					
		},

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

		set_search_selected_data : function(Obj,selection,selRow,err){
			if(Obj == "lifnr"){
				if(err){
					this.getView().byId("lifnr").setValueState("Error");
					this.getView().byId("lifnrT").setText("");
				}else{
					this.getView().byId("lifnr").setValueState("None");
					this.getView().byId("lifnr").setValue(selection.getKey());
					this.getView().byId("lifnrT").setText(selection.getText());
				}
			}
		},

		set_screen_mode : function(){
			var oView = this.getView();

			oView.setModel(new JSONModel({
				isvisible : false,		// ebeln : Visible
				dispMode : true,		//	생성  : true, 변경 : false
				editMode : true,		//	생성  : true, 변경 : true
				visiMode : true			//	생성  : true, 변경 : true, 조회 : false
			}), "screenMode");
		},		


		set_displayMode : function(vMode){
			var screenModel = this.getView().getModel("screenMode");
			var screenData = screenModel.getData();

			if(vMode == "C"){	// Create Mode
				screenData.isvisible = false;
				screenData.dispMode = true;
				screenData.editMode = true;
				screenData.visiMode = true;

				this.oPoDetail.setTitle(this.i18n.getText("CreatePo_title"));
			}
			else if(vMode == "D"){   // Display mode
				screenData.isvisible = true;
				screenData.dispMode = false;
				screenData.editMode = false;
				screenData.visiMode = false;

			}else if(vMode == "U"){	// Change Mode
				screenData.isvisible = true;
				screenData.dispMode = false;
				screenData.editMode = true;			    					
				screenData.visiMode = true;			    	
			}

			screenModel.refresh();
		},		

		onNavBack: function (oEvent) {
			var oView = this.getView();

			this.initControll();

			var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
			oODataJSONModel.setData({});
			oView.setModel(oODataJSONModel, "PoHeader")

			var oODataJSONModel_item =  new sap.ui.model.json.JSONModel();  
			oODataJSONModel_item.setData({});
			oView.setModel(oODataJSONModel_item, "PoItem")

			oODataJSONModel.updateBindings(true);
			oODataJSONModel.refresh(true);

			oODataJSONModel_item.updateBindings(true);
			oODataJSONModel_item.refresh(true);

//			sap.ui.getCore().byId("refresh")

//			this.getOwnerComponent().onNavBack(true);
			// in some cases we could display a certain target when the back button is pressed
			if (this.oArgs && this.oArgs.fromTarget) {
				this._router.getTargets().display(this.oArgs.fromTarget,{
											rEkgrp : this.oArgs.rEkgrp,
											rLifnr : this.oArgs.rLifnr,
											rMatnr : this.oArgs.rMatnr,
											rWerks : this.oArgs.rWerks,
											rLgort : this.oArgs.rLgort,
											rBedatF : this.oArgs.rBedatF,
											rBedatT : this.oArgs.rBedatT
											}
				);
			
				delete this.oArgs.fromTarget;
				delete this.oArgs.Ebeln;
				delete this.oArgs.Matnr;
				
				delete this.oArgs.rEkgrp;
				delete this.oArgs.rLifnr;
				delete this.oArgs.rMatnr;
				delete this.oArgs.rWerks;
				delete this.oArgs.rLgort;				
				
				this.eTag = "";
				this.Ebeln = "";
				this.Ebelp = "";
				this.Frgzu = "";				
				return;
			}
			// call the parent's onNavBack
//			BaseController.prototype.onNavBack(this, arguments);
		},		

		onChange : function(oEvent){
			var strArr = oEvent.oSource.sId.split("--");
			var cnt = strArr.length - 1;
			var sIdstr = strArr[cnt];

			if(sIdstr === "lifnr" ){
				if(oEvent.getParameter("newValue")){
					utils.get_fl_info(oEvent.getParameter("newValue"), v_swerk);
				}else{
					oEvent.getSource().setValueState("None");
					this.getView().byId("lifnrT").setText("");
				}
			}
		},


		// Maint Plant select를  change 할때 
		onSelChange : function(oEvent){
			var strArr = oEvent.oSource.sId.split("--");
			var cnt = strArr.length - 1;
			var sIdstr = strArr[cnt];			

			if(sIdstr === "ekgrp"){				// Combo
				var oEkgrp =  oEvent.getParameter("selectedItem");
				if(oEkgrp){  // .getKey()
					oEvent.getSource().setValueState("None");
				}

				this.Ekgrp = "";
			}else if(sIdstr === "matnr" ){
				if(oEvent.getParameter("selectedItem") != null){
					var v_matnr = oEvent.getParameter("selectedItem").getKey();
					this.oUom = this.getView().byId("meins");		    // Unit of Materail
					this.oOpu = this.getView().byId("bprme");		    // Order Price Unit
					
					var v_uom = this.oUom.getSelectedKey(); 
					var v_opu = this.oOpu.getSelectedKey();	

					if(v_matnr){
						if(this.oUom){
							utils.set_search_field("", this.oUom, "uom", "C", v_matnr, "");
						}

						if(this.oOpu){
							utils.set_search_field("", this.oOpu, "uom", "C", v_matnr, "");
						}								
					}
					
					if(!v_uom){
						this.oUom.setSelectedKey("KG")
					}
					if(!v_opu){
						this.oOpu.setSelectedKey("BAG")
					}
					
					oEvent.getSource().setValueState("None");
				}else{
					this.oUom.setSelectedKey("");	
					this.oUom.removeAllItems();
				}

				this.Matnr = "";
			}else if(sIdstr === "menge" ){	
				var oMenge = oEvent.getParameter("newValue");
				if(oMenge){
					oEvent.getSource().setValueState("None");
				}
			}else if(sIdstr === "meins"){		
				var oMeins =  oEvent.getParameter("selectedItem");
				if(oMeins){ // .getKey()
					oEvent.getSource().setValueState("None");
				}

				this.Meins = "";
			}else if(sIdstr === "zzcttxt01" ){	
				var oSafra = oEvent.getParameter("selectedItem");
				if(oSafra){
					oEvent.getSource().setValueState("None");
				}
			}else if(sIdstr === "netpr" ){	
				var oNetpr = oEvent.getParameter("newValue");
				if(oNetpr){
					oEvent.getSource().setValueState("None");
				}
			}else if(sIdstr === "waers"){	
				var oWaers =  oEvent.getParameter("selectedItem");
				if(oWaers){ // .getKey()
					oEvent.getSource().setValueState("None");								
				}
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
			}else if(sIdstr === "lgort"){	
				var oLgort =  oEvent.getParameter("selectedItem");
				if(oLgort){ // .getKey()
					oEvent.getSource().setValueState("None");
				}	

				this.Lgort = "";
			}else if(sIdstr === "lifnr" ){	
				var oLifnr = oEvent.getParameter("newValue");
				if(oLifnr){
					oEvent.getSource().setValueState("None");
				}
			}else if(sIdstr === "bprme" ){	
				var oBprme = oEvent.getParameter("selectedItem");
				if(oBprme){		// .getKey()
					oEvent.getSource().setValueState("None");
				}

				this.Bprme = "";
			}else if(sIdstr === "mwskz" ){
				var oMwskz = oEvent.getParameter("selectedItem");
				if(oMwskz){  // .getKey()
					oEvent.getSource().setValueState("None");
				}		

				this.Mwskz = "";
			}else if(sIdstr === "zblcWaers" ){	
				var oZblcWaers =  oEvent.getParameter("selectedItem");
				if(oZblcWaers){	// .getKey()
					oEvent.getSource().setValueState("None");
				}	
			}else if(sIdstr === "zfc4Waers" ){	
				var oZfc4Waers =  oEvent.getParameter("selectedItem");
				if(oZfc4Waers){		// .getKey()
					oEvent.getSource().setValueState("None");
				}	
			}else if(sIdstr === "zbalWaers" ){	
				var oZbalWaers =  oEvent.getParameter("selectedItem");
				if(oZbalWaers){ 	// .getKey()
					oEvent.getSource().setValueState("None");
				}					
			}			

		},

		setMateriaUnit : function(v_matnr){
			this.oUom = this.getView().byId("meins");		    // Unit of Materail
			this.oOpu = this.getView().byId("bprme");		    // Order Price Unit

			if(v_matnr){
				if(this.oUom){
					utils.set_search_field("", this.oUom, "uom", "C", v_matnr, "");
				}

				if(this.oOpu){
					utils.set_search_field("", this.oOpu, "uom", "C", v_matnr, "");
				}

//				var unitModel = this.getView().getModel("PoItem");
////				var poItemData = unitModel.getData();

//				unitModel.refresh()				
			}
		},

		onInputChange : function(oEvent){
			var strArr = oEvent.oSource.sId.split("--");
			var cnt = strArr.length - 1;
			var sIdstr = strArr[cnt];			

			if(sIdstr === "zblc"){
				var oZblc = this.getView().byId("zblc");
				var oZblcWaers = this.getView().byId("zblcWaers");
				if(oZblc.getValue() != ""){
					if(parseFloat(oZblc.getValue()) <0 || isNaN(parseFloat(oZblc.getValue()))){
						oZblc.setValueState("Error");

						if(Device.system.phone){
							MessageToast.show(this.i18n.getText("err_zblc"));				
						}else{
							MessageBox.show(
									this.i18n.getText("err_zblc"),
									MessageBox.Icon.WARNING,
									this.i18n.getText("error")
							);						
						}

						return false;
					}else{
						oZblc.setValueState("None");

						if(!oZblcWaers.getSelectedKey()){
							oZblcWaers.setValueState("Error");

							if(Device.system.phone){
								MessageToast.show(this.i18n.getText("err_zblcwaers"));				
							}else{
								MessageBox.show(
										this.i18n.getText("err_zblcwaers"),
										MessageBox.Icon.WARNING,
										this.i18n.getText("error")
								);				
							}

							return false;					
						}else{
							oZblcWaers.setValueState("None");
						}


						if(oZblcWaers.getSelectedKey() == 'BRL'){
							if(parseFloat(oZblc.getValue()) > 2.5){
								oZblc.setValueState("Error");

								if(Device.system.phone){
									MessageToast.show(this.i18n.getText("err_zblc_brl"));				
								}else{
									MessageBox.show(
											this.i18n.getText("err_zblc_brl"),
											MessageBox.Icon.WARNING,
											this.i18n.getText("error")
									);				
								}		

								return false;
							}else{
								oZblc.setValueState("None");		
							}
						}else if(oZblcWaers.getSelectedKey() == 'PER'){
							if(parseFloat(oZblc.getValue()) > 5){
								oZblc.setValueState("Error");

								if(Device.system.phone){
									MessageToast.show(this.i18n.getText("err_zblc_percentage"));				
								}else{
									MessageBox.show(
											this.i18n.getText("err_zblc_percentage"),
											MessageBox.Icon.WARNING,
											this.i18n.getText("error")
									);			
								}

								return false;
							}else{
								oZblc.setValueState("None");						
							}				
						}
					}						
				}
			}

		},

		onHandleDateChange : function(oEvent){
			var strArr = oEvent.oSource.sId.split("--");
			var cnt = strArr.length - 1;
			var sIdstr = strArr[cnt];

			var oDP = oEvent.oSource;
			var bValid = oEvent.getParameter("valid");

			if (bValid) {
				oDP.setValueState(sap.ui.core.ValueState.None);
			} else {
				oDP.setValueState(sap.ui.core.ValueState.Error);
			}
		},
   
	    set_model_count : function(){
	    	this.modelCount = this.modelCount + 1
	    	console.log("this.modelCount : " + this.modelCount );
	    },
		
		get_purchase_order_data : function(){
////			debugger;
//			if(!this.oArgs.Ebeln && this.modelCount === 6 ){
//				return;
//			}			
				
			var lange = this.getLanguage();

			var oView = this.getView();
			var oModel = this.getView().getModel("poMgmt", false);
			var controll = this;

			var s_mode = [];			
			var s_filter = [];

			var mode = "R";
			if(mode){
				s_mode.push(mode);
				if(s_mode){
					s_filter.push(utils.set_filter(s_mode, "Mode"));
				}		
			}				

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

			oModel.attachRequestSent( function(){ controll.oPoDetail.setBusy(true); });
			oModel.attachRequestCompleted( function(){ controll.oPoDetail.setBusy(false); });

			var path = "/HdSet(Spras='"+lange+"',Ebeln='"+this.oArgs.Ebeln+"')";

			var mParameters = {
					urlParameters : {
						"$expand" : "HdItem,HdReturn",
						"$filter" : filterStr
					},
					success : function(oData,response) {
						this.eTag = oData.Timestamp;
						this.Ebeln = oData.Ebeln;
						this.Ebelp = oData.HdItem.results[0].Ebelp;
						this.Frgzu = oData.Frgzu;						

						controll.setMateriaUnit(oData.HdItem.results[0].Matnr); // Material 에 따른 Unit, Price Unit 조회

						var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
						oODataJSONModel.setData(oData);
						oView.setModel(oODataJSONModel, "PoHeader")

						var oODataJSONModel_item =  new sap.ui.model.json.JSONModel();  
						oData.HdItem.results[0].Slfdt = oData.HdItem.results[0].Slfdt == "00000000" ? "" : oData.HdItem.results[0].Slfdt;
						oData.HdItem.results[0].Eindt = oData.HdItem.results[0].Eindt == "00000000" ? "" : oData.HdItem.results[0].Eindt;
						oData.HdItem.results[0].Zzaddi2 = oData.HdItem.results[0].Zzaddi2 == "00000000" ? "" : oData.HdItem.results[0].Zzaddi2;
						oData.HdItem.results[0].Zzaddi3 = oData.HdItem.results[0].Zzaddi3 == "00000000" ? "" : oData.HdItem.results[0].Zzaddi3;

						oData.HdItem.results[0].Zblc = oData.HdItem.results[0].Zblc == "0.000000000" ? "" : oData.HdItem.results[0].Zblc;
						oData.HdItem.results[0].Zfc4 = oData.HdItem.results[0].Zfc4 == "0.000000000" ? "" : oData.HdItem.results[0].Zfc4;
						oData.HdItem.results[0].Zbal = oData.HdItem.results[0].Zbal == "0.000000000" ? "" : oData.HdItem.results[0].Zbal;

						oODataJSONModel_item.setData(oData.HdItem.results[0]);
						oView.setModel(oODataJSONModel_item, "PoItem")

						if(oData.Zzcttxt02){
							this.getView().byId("Zzcttxt02").setSelectedIndex(1);			// Not Fixed	
						}else{
							this.getView().byId("Zzcttxt02").setSelectedIndex(0);			// Fixed
						}

						if(this.Frgzu){
							this.oPoDetail.setTitle(this.i18n.getText("DetailPo_title"));
							controll.set_displayMode("D");	
						}else{
							this.oPoDetail.setTitle(this.i18n.getText("ChangePo_title"));							
							controll.set_displayMode("U");
						}

//						areWeThereYet.resolve();
//						debugger;
						this.Ekgrp = oData.Ekgrp;
						this.Matnr = oData.HdItem.results[0].Matnr;
						this.Meins = oData.HdItem.results[0].Meins;
						this.Bprme = oData.HdItem.results[0].Bprme;
						this.Werks = oData.HdItem.results[0].Werks;
						this.Lgort = oData.HdItem.results[0].Lgort;
						this.Zzcttxt01 = oData.Zzcttxt01;
						this.Zzaddi1 = oData.HdItem.results[0].Zzaddi1;
						this.Inco1 = oData.Inco1;
						this.Mwskz = oData.HdItem.results[0].Mwskz;

					}.bind(this),
					error : function(oError) {
						if(Device.system.phone){
							MessageToast.show(this.i18n.getText("oData_conn_error"));				
						}else{
							MessageBox.show(
									this.i18n.getText("oData_conn_error"),
									MessageBox.Icon.WARNING,
									this.i18n.getText("error")
							);
						}
					}.bind(this)
			};
			oModel.read(path, mParameters);		
			
//			$.when(areWeThereYet).done(function(){
//				  //alert(oInputHelpModel);
//				});	
		},

		
		onSave : function(oEvent){
			if(!this.checkMandatory()){
				return;
			}

			if(!this.check_data()){
				return;
			}

			var oView = this.getView();
			var oModel = this.getView().getModel("poMgmt");
			var controll = this;
			var message = "";
			var v_ebelp = "";

			oModel.attachRequestSent( function(){ controll.oPoDetail.setBusy(true); });
			oModel.attachRequestCompleted( function(){ controll.oPoDetail.setBusy(false); });

			var data = {};

			if(this.Ebeln){
				data.Ebeln = this.Ebeln; 	// Read oData에서 추출	
			}else{
				data.Ebeln = "";
			}

			data.Spras = this.getLanguage();
			data.Bukrs = '5030';
			data.Bsart	= 'ZW';
			data.Lifnr	= this.getView().byId("lifnr").getValue();
			data.Zzcttxt01 = this.getView().byId("zzcttxt01").getSelectedKey();

			var v_Rdo_fixed = this.getView().byId("fixed").getSelected();
			var v_Rdo_notfixed = this.getView().byId("notfixed").getSelected();

			if(v_Rdo_fixed){
				data.Zzcttxt02 = "";   
			}			

			if(v_Rdo_notfixed){
				data.Zzcttxt02 = "AF";   
			}

			data.Ekorg = '5030';
			data.Ekgrp = this.getView().byId("ekgrp").getSelectedKey();

			data.Inco1 = this.getView().byId("inco1").getSelectedKey();
//			data.Inco2L = this.getView().byId("inco1").getSelectedItem().getProperty("text");
			data.Inco2L = this.getView().byId("inco2l").getValue();

			data.Waers = this.getView().byId("waers").getSelectedKey();
			if(this.Frgzu){
				data.Frgzu = this.Frgzu;	 // Read oData에서 추출	
			}else{
				data.Frgzu = "";
			}

			if(data.Ebeln){
				if(data.Frgzu){
					data.Mode  = "D";	// 익ㅇ우는 없을 듯				
				}else{
					data.Mode  = "U";					
				}

			}else{
				data.Mode  = "C";				
			}

			data.LongTxt = this.getView().byId("Ltext").getValue();

			data.HdItem = [];

			data.HdReturn = [];

			if(this.eTag){
				data.Timestamp = this.eTag;				
			}

			var v_menge = this.getView().byId("menge").getValue();
			if(!v_menge){
				v_menge = 0;
			}				
			var menge = v_menge.toString().replace(/,/g,"");

			var v_netpr = this.getView().byId("netpr").getValue();
			if(!v_netpr){
				v_netpr = 0;
			}				
			var netpr = v_netpr.toString().replace(/,/g,"");

			var v_zblc = this.getView().byId("zblc").getValue();
			if(!v_zblc){
				v_zblc = 0;
			}				
			var zblc = v_zblc.toString().replace(/,/g,"");			

			var v_zfc4 = this.getView().byId("zfc4").getValue();
			if(!v_zfc4){
				v_zfc4 = 0;
			}				
			var zfc4 = v_zfc4.toString().replace(/,/g,"");	

			var v_zbal = this.getView().byId("zbal").getValue();
			if(!v_zbal){
				v_zbal = 0;
			}				
			var zbal = v_zbal.toString().replace(/,/g,"");	

			if(this.Ebelp){
				v_ebelp = this.Ebelp; 
			}else{
				v_ebelp = "";
			}

			data.HdItem.push({
				"Ebelp" : v_ebelp,
				"Matnr" : this.getView().byId("matnr").getSelectedKey(),
				"Werks" : this.getView().byId("werks").getSelectedKey(),
				"Lgort" : this.getView().byId("lgort").getSelectedKey(),
				"Menge" : menge.trim(),    	//parseFloat(menge.trim()),
				"Meins" : this.getView().byId("meins").getSelectedKey(),
				"Netpr" : netpr.trim(), 	//parseFloat(netpr),
				"Peinh" : "1",
				"Bprme" : this.getView().byId("bprme").getSelectedKey(),
				"Eindt" : formatter.dateToStr(this.getView().byId("eindt").getDateValue()),
				"Mwskz" : this.getView().byId("mwskz").getSelectedKey(),
				"Slfdt" : formatter.dateToStr(this.getView().byId("slfdt").getDateValue()),
				"Zzaddi1" : this.getView().byId("zzaddi1").getSelectedKey(),
				"Zzaddi2" : formatter.dateToStr(this.getView().byId("zzaddi2").getDateValue()),
				"Zzaddi3" : formatter.dateToStr(this.getView().byId("zzaddi3").getDateValue()),
				"Zblc" : zblc.trim(),		//parseFloat(zblc),
				"ZblcWaers" : this.getView().byId("zblcWaers").getSelectedKey(),
				"Zfc4" : zfc4.trim(),		//parseFloat(zfc4),
				"Zfc4Waers" : this.getView().byId("zfc4Waers").getSelectedKey(),
				"Zbal" : zbal.trim(),		//parseFloat(zbal),
				"ZbalWaers" : this.getView().byId("zbalWaers").getSelectedKey()
			});			

			var mParameters = {
					success : function(oData,response) {
						if(oData.HdReturn){
							if(oData.HdReturn.results.length > 0){
								var message = "";
								for(var i=0; i<oData.HdReturn.results.length; i++){
									message = message + oData.HdReturn.results[i].Message + "\\n";
								}

								if(Device.system.phone){
									MessageToast.show(message);				
								}else{
									MessageBox.show(
											message,
											MessageBox.Icon.ERROR,
											controll.i18n.getText("error")
									);
								}
							}
						}else{
							this.eTag = oData.Timestamp;
							this.Ebeln = oData.Ebeln;
							this.Ebelp = oData.HdItem.results[0].Ebelp;
							this.Frgzu = oData.Frgzu;

							var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
							oODataJSONModel.setData(oData);

							oView.setModel(oODataJSONModel, "PoHeader")

							var oODataJSONModel_item =  new sap.ui.model.json.JSONModel();  
							oData.HdItem.results[0].Slfdt = oData.HdItem.results[0].Slfdt == "00000000" ? "" : oData.HdItem.results[0].Slfdt;
							oData.HdItem.results[0].Eindt = oData.HdItem.results[0].Eindt == "00000000" ? "" : oData.HdItem.results[0].Eindt;
							oData.HdItem.results[0].Zzaddi2 = oData.HdItem.results[0].Zzaddi2 == "00000000" ? "" : oData.HdItem.results[0].Zzaddi2;
							oData.HdItem.results[0].Zzaddi3 = oData.HdItem.results[0].Zzaddi3 == "00000000" ? "" : oData.HdItem.results[0].Zzaddi3;

							oData.HdItem.results[0].Zblc = oData.HdItem.results[0].Zblc == "0.000000000" ? "" : oData.HdItem.results[0].Zblc;
							oData.HdItem.results[0].Zfc4 = oData.HdItem.results[0].Zfc4 == "0.000000000" ? "" : oData.HdItem.results[0].Zfc4;
							oData.HdItem.results[0].Zbal = oData.HdItem.results[0].Zbal == "0.000000000" ? "" : oData.HdItem.results[0].Zbal;

//							this.setMateriaUnit(oData.HdItem.results[0].Matnr); // Material 에 따른 Unit, Price Unit 조회							

							oODataJSONModel_item.setData(oData.HdItem.results[0]);
							oView.setModel(oODataJSONModel_item, "PoItem")

							if(oData.Zzcttxt02){
								this.getView().byId("Zzcttxt02").setSelectedIndex(1);			// Not Fixed	
							}else{
								this.getView().byId("Zzcttxt02").setSelectedIndex(0);			// Fixed
							}

							if(this.Frgzu){
								this.oPoDetail.setTitle(this.i18n.getText("DetailPo_title"));
								controll.set_displayMode("D");	
							}else{
								this.oPoDetail.setTitle(this.i18n.getText("ChangePo_title"));							
								controll.set_displayMode("U");
							}							

							if(data.Ebeln){
								message = controll.i18n.getText("change_po", [oData.Ebeln]);	
							}else{
								message = controll.i18n.getText("create_po", [oData.Ebeln]);	
							}							

							if(Device.system.phone){
								MessageToast.show(message);				
							}else{
								MessageBox.show(
										message,
										MessageBox.Icon.SUCCESS,
										this.i18n.getText("success")
								);
							}

						}
					}.bind(this),
					error : function(oError) {
						if(Device.system.phone){
							MessageToast.show(this.i18n.getText("oData_conn_error"));				
						}else{
							MessageBox.show(
									this.i18n.getText("oData_conn_error"),
									MessageBox.Icon.WARNING,
									this.i18n.getText("error")
							);
						}
					}.bind(this)
			};		

			oModel.create("/HdSet", data, mParameters);
		},

		checkMandatory : function(){
			var bCheck = true;

			this.setSelectedKeyModi();

			//1 Buyer		
			var oEkgrp = this.getView().byId("ekgrp");
			if(!oEkgrp.getSelectedKey()){
				oEkgrp.setValueState("Error");
				bCheck = false;
			}else{
				oEkgrp.setValueState("None");
			}

			//2 Material 
			if(!this.oArgs){
				var oMatnr = this.getView().byId("matnr");
				if(!oMatnr.getSelectedKey()){
					oMatnr.setValueState("Error");
					bCheck = false;
				}else{
					oMatnr.setValueState("None");
				}				
			}

			//3 Quantity 
			var oMenge = this.getView().byId("menge");
			if(!oMenge.getValue()){
				oMenge.setValueState("Error");
				bCheck = false;
			}else{
				oMenge.setValueState("None");
			}

			//4 Unit
			var oMeins = this.getView().byId("meins");
			if(!oMeins.getSelectedKey()){
				oMeins.setValueState("Error");
				bCheck = false;
			}else{
				oMeins.setValueState("None");
			}

			//Safra
			var oSafra = this.getView().byId("zzcttxt01");
			if(!oSafra.getSelectedKey()){
				oSafra.setValueState("Error");
				bCheck = false;
			}else{
				oSafra.setValueState("None");
			}	

			// Price 
			var oNetpr = this.getView().byId("netpr");
			if(!oNetpr.getValue()){
				oNetpr.setValueState("Error");
				bCheck = false;
			}else{
				oNetpr.setValueState("None");
			}

			// Price Unit
			var oWaers = this.getView().byId("waers");
			if(!oWaers.getSelectedKey()){
				oWaers.setValueState("Error");
				bCheck = false;
			}else{
				oWaers.setValueState("None");
			}			

			// Price Unit
			var oBprme = this.getView().byId("bprme");
			if(!oBprme.getSelectedKey()){
				oBprme.setValueState("Error");
				bCheck = false;
			}else{
				oBprme.setValueState("None");
			}			

			// Fixed or Not Fixed

			// Plant
			if(!this.oArgs){
				var oWerks = this.getView().byId("werks");
				if(!oWerks.getSelectedKey()){
					oWerks.setValueState("Error");
					bCheck = false;
				}else{
					oWerks.setValueState("None");
				}				
			}			

			// Location
			var oLgort = this.getView().byId("lgort");
			if(!oLgort.getSelectedKey()){
				oLgort.setValueState("Error");
				bCheck = false;
			}else{
				oLgort.setValueState("None");
			}				

			// Exp. Delivery Date
			var oEindt = this.getView().byId("eindt");
			if(!oEindt.getValue()){
				oEindt.setValueState("Error");
				bCheck = false;
			}else{
				oEindt.setValueState("None");
			}

			// Vendor
			var oLifnr = this.getView().byId("lifnr");
			if(!oLifnr.getValue()){
				oLifnr.setValueState("Error");
				bCheck = false;
			}else{
				oLifnr.setValueState("None");
			}

			// Payment Date
			var oSlfdt = this.getView().byId("slfdt");
			if(!oSlfdt.getValue()){
				oSlfdt.setValueState("Error");
				bCheck = false;
			}else{
				oSlfdt.setValueState("None");
			}

			// Tax Code
			var oMwskz= this.getView().byId("mwskz");
			if(!oMwskz.getSelectedKey()){
				oMwskz.setValueState("Error");
				bCheck = false;
			}else{
				oMwskz.setValueState("None");
			}

			if(bCheck){
				return bCheck;   //SUCCESS
			}else{ 

				if(Device.system.phone){
					MessageToast.show(this.i18n.getText("check_mandatory"));				
				}else{
					MessageBox.show(
							this.i18n.getText("check_mandatory"),
							MessageBox.Icon.WARNING,
							this.i18n.getText("error")
					);
				}

				return bCheck;  
			}

		},		

		check_data : function(){
			var oMenge = this.getView().byId("menge");
			if(parseFloat(oMenge.getValue()) <0 || isNaN(parseFloat(oMenge.getValue()))){
				oMenge.setValueState("Error");

				if(Device.system.phone){
					MessageToast.show(this.i18n.getText("check_mandatory"));				
				}else{
					MessageBox.show(
							this.i18n.getText("check_mandatory"),
							MessageBox.Icon.WARNING,
							this.i18n.getText("error")
					);
				}


				return false;
			}else{
				oMenge.setValueState("None");
			}

			// Price 
			var oNetpr = this.getView().byId("netpr");
			if(parseFloat(oNetpr.getValue()) <0 || isNaN(parseFloat(oNetpr.getValue()))){
				oNetpr.setValueState("Error");

				if(Device.system.phone){
					MessageToast.show(this.i18n.getText("err_netpr"));				
				}else{
					MessageBox.show(
							this.i18n.getText("err_netpr"),
							MessageBox.Icon.WARNING,
							this.i18n.getText("error")
					);	
				}

				return false;
			}else{
				oNetpr.setValueState("None");
			}

			var oInco1 = this.getView().byId("inco1").getSelectedKey();
			var oInco2L = this.getView().byId("inco2l").getValue();
			if(oInco1 && oInco2L ==""){
				if(Device.system.phone){
					MessageToast.show(this.i18n.getText("err_inco2l"));				
				}else{
					MessageBox.show(
							this.i18n.getText("err_inco2l"),
							MessageBox.Icon.WARNING,
							this.i18n.getText("error")
					);	
				}

				return false;				
			}

			// Agente 
			var oZblc = this.getView().byId("zblc");
			var oZblcWaers = this.getView().byId("zblcWaers");
			if(oZblc.getValue() != ""){
				if(parseFloat(oZblc.getValue()) < 0 || isNaN(parseFloat(oZblc.getValue()))){
					oZblc.setValueState("Error");

					if(Device.system.phone){
						MessageToast.show(this.i18n.getText("err_zblc"));				
					}else{
						MessageBox.show(
								this.i18n.getText("err_zblc"),
								MessageBox.Icon.WARNING,
								this.i18n.getText("error")
						);						
					}

					return false;
				}else{
					oZblc.setValueState("None");

					if(oZblc.getValue() != "0" && !oZblcWaers.getSelectedKey()){
						oZblcWaers.setValueState("Error");

						if(Device.system.phone){
							MessageToast.show(this.i18n.getText("err_zblcwaers"));				
						}else{
							MessageBox.show(
									this.i18n.getText("err_zblcwaers"),
									MessageBox.Icon.WARNING,
									this.i18n.getText("error")
							);				
						}

						return false;					
					}else{
						oZblcWaers.setValueState("None");
					}


					if(oZblcWaers.getSelectedKey() == 'BRL'){
						if(parseFloat(oZblc.getValue()) > 2.5){
							oZblc.setValueState("Error");

							if(Device.system.phone){
								MessageToast.show(this.i18n.getText("err_zblc_brl"));				
							}else{
								MessageBox.show(
										this.i18n.getText("err_zblc_brl"),
										MessageBox.Icon.WARNING,
										this.i18n.getText("error")
								);				
							}		

							return false;
						}else{
							oZblc.setValueState("None");		
						}
					}else if(oZblcWaers.getSelectedKey() == 'PER'){
						if(parseFloat(oZblc.getValue()) > 5){
							oZblc.setValueState("Error");

							if(Device.system.phone){
								MessageToast.show(this.i18n.getText("err_zblc_percentage"));				
							}else{
								MessageBox.show(
										this.i18n.getText("err_zblc_percentage"),
										MessageBox.Icon.WARNING,
										this.i18n.getText("error")
								);			
							}

							return false;
						}else{
							oZblc.setValueState("None");						
						}				
					}
				}						
			}


			// Frete 
			var oZfc4 = this.getView().byId("zfc4");
			var oZfc4Waers = this.getView().byId("zfc4Waers");

			if(oZfc4.getValue() != ""){
				if(parseFloat(oZfc4.getValue()) < 0 || isNaN(parseFloat(oZfc4.getValue()))){
					oZfc4.setValueState("Error");

					if(Device.system.phone){
						MessageToast.show(this.i18n.getText("err_zfc4"));				
					}else{
						MessageBox.show(
								this.i18n.getText("err_zfc4"),
								MessageBox.Icon.WARNING,
								this.i18n.getText("error")
						);		
					}

					return false;
				}else{
					oZblc.setValueState("None");					

					if(oZfc4.getValue() != "0" && !oZfc4Waers.getSelectedKey()){
						oZfc4Waers.setValueState("Error");

						if(Device.system.phone){
							MessageToast.show(this.i18n.getText("err_zfc4waers"));				
						}else{
							MessageBox.show(
									this.i18n.getText("err_zfc4waers"),
									MessageBox.Icon.WARNING,
									this.i18n.getText("error")
							);		
						}

						return false;
					}else{
						oZfc4Waers.setValueState("None");
					}

				}					
			}

			// Overhead 
			var oZbal = this.getView().byId("zbal");
			var oZbalWaers = this.getView().byId("zbalWaers");

			if(oZbal.getValue() != ""){
				oZblc.setValueState("None");

				if(parseFloat(oZbal.getValue()) <0 || isNaN(parseFloat(oZbal.getValue()))){
					oZblc.setValueState("Error");

					if(Device.system.phone){
						MessageToast.show(this.i18n.getText("err_zbal"));				
					}else{
						MessageBox.show(
								this.i18n.getText("err_zbal"),
								MessageBox.Icon.WARNING,
								this.i18n.getText("error")
						);		
					}

					return false;
				}else{
					if(oZbal.getValue() != "0" && !oZbalWaers.getSelectedKey()){
						oZbalWaers.setValueState("Error");

						if(Device.system.phone){
							MessageToast.show(this.i18n.getText("err_zbalwaers"));				
						}else{
							MessageBox.show(
									this.i18n.getText("err_zbalwaers"),
									MessageBox.Icon.WARNING,
									this.i18n.getText("error")
							);	
						}

						return false;
					}else{
						oZbalWaers.setValueState("None");
					}	
				}						
			}


			return true;
		},		

		initControll : function(){
//			this.getView().byId("ekgrp").setSelectedKey("");
//			this.getView().byId("meins").setSelectedKey("");
//			this.getView().byId("waers").setSelectedKey("");
//			this.getView().byId("bprme").setSelectedKey("");
//			this.getView().byId("lgort").setSelectedKey("");
//			this.getView().byId("zzaddi1").setSelectedKey("");
//			this.getView().byId("inco1").setSelectedKey("");
//			this.getView().byId("mwskz").setSelectedKey("");
//			this.getView().byId("zblcWaers").setSelectedKey("");
//			this.getView().byId("zfc4Waers").setSelectedKey("");
//			this.getView().byId("zbalWaers").setSelectedKey("");

////			=============
//			this.getView().byId("ebeln").setValue("");
//			this.getView().byId("matnr").setSelectedKey("");
//			this.getView().byId("menge").setValue("");
//			this.getView().byId("netpr").setValue("");
//			this.getView().byId("werks").setSelectedKey("");
//			this.getView().byId("zzcttxt01").getSelectedKey("");
//			this.getView().byId("zzaddi2").setValue("");
//			this.getView().byId("zzaddi3").setValue("");
//			this.getView().byId("eindt").setValue("");
//			this.getView().byId("lifnr").setValue("");
//			this.getView().byId("lifnrT").setText("");
//			this.getView().byId("slfdt").setValue("");
//			this.getView().byId("inco2l").setValue("");
//			this.getView().byId("zblc").setValue("");
//			this.getView().byId("zfc4").setValue("");
//			this.getView().byId("zbal").setValue("");
//			this.getView().byId("Ltext").setValue("");

//			this.getView().byId("Zzcttxt02").setSelectedIndex(0);	
			
			this.oWerks.removeAllItems();			

			this.Ekgrp = "";
			this.Matnr = "";
			this.Meins = "";
			this.Zzcttxt01 = "";
			this.Bprme = "";
			this.Werks = "";
			this.Lgort = "";
			this.Zzaddi1 = "";
			this.Inco1 = "";
			this.Mwskz = "";
			
			var oEkgrp = this.getView().byId("ekgrp");
			if(oEkgrp){
				oEkgrp.setValueState("None");
			}

			var oMatnr = this.getView().byId("matnr");
			if(oMatnr){
				oMatnr.setValueState("None");
			}

			//3 Quantity 
			var oMenge = this.getView().byId("menge");
			if(oMenge){
				oMenge.setValueState("None");
			}

			//4 Unit
			var oMeins = this.getView().byId("meins");
			if(oMeins){
				oMeins.setValueState("None");
			}

			//Safra
			var oSafra = this.getView().byId("zzcttxt01");
			if(oSafra){
				oSafra.setValueState("None");
			}	

			// Price 
			var oNetpr = this.getView().byId("netpr");
			if(oNetpr){
				oNetpr.setValueState("None");
			}

			// Currency
			var oWaers = this.getView().byId("waers");
			if(oWaers){
				oWaers.setValueState("None");
			}			

			// Price Unit
			var oBprme = this.getView().byId("bprme");
			if(oBprme){
				oBprme.setValueState("None");
			}			

			// Fixed or Not Fixed

			// Plant
			var oWerks = this.getView().byId("werks");
			if(oWerks){
				oWerks.setValueState("None");
			}				

			// Location
			var oLgort = this.getView().byId("lgort");
			if(oLgort){
				oLgort.setValueState("None");
			}				

			// Exp. Delivery Date
			var oEindt = this.getView().byId("eindt");
			if(oEindt){
				oEindt.setValueState("None");
			}

			// Vendor
			var oLifnr = this.getView().byId("lifnr");
			if(oLifnr){
				oLifnr.setValueState("None");
			}

			// Payment Date
			var oSlfdt = this.getView().byId("slfdt");
			if(oSlfdt){
				oSlfdt.setValueState("None");
			}

			// Tax Code
			var oMwskz= this.getView().byId("mwskz");
			if(oMwskz){
				oMwskz.setValueState("None");
			}


			var oInco2L = this.getView().byId("inco2l");
			if(oInco2L){
				oInco2L.setValueState("None");
			}

			// Agente 
			var oZblc = this.getView().byId("zblc");
			if(oZblc){
				oZblc.setValueState("None");
			}
			var oZblcWaers = this.getView().byId("zblcWaers");			
			if(oZblcWaers){
				oZblcWaers.setValueState("None");
			}

			var oZfc4 = this.getView().byId("zfc4");
			if(oZfc4){
				oZfc4.setValueState("None");
			}
			var oZfc4Waers = this.getView().byId("zfc4Waers");			
			if(oZfc4Waers){
				oZfc4Waers.setValueState("None");
			}					

			var oZbal = this.getView().byId("zbal");
			if(oZbal){
				oZblc.setValueState("None");
			}
			var oZbalWaers = this.getView().byId("zbalWaers");			
			if(oZbalWaers){
				oZbalWaers.setValueState("None");
			}			
		},

		valueSplitKey: function(value){
			var strArr = value.split("(");
			var cnt = strArr.length - 1;
			var sIdstr = strArr[cnt];
			var endArr = sIdstr.split(")");	

			return endArr[0];
		},		

		setSelectedKeyModi : function(){
			var oEkgrp = this.getView().byId("ekgrp");
			if(this.Ekgrp && oEkgrp.getSelectedKey() == ""){
//				oEkgrp.setSelectedKey(this.valueSplitKey(oEkgrp.getValue()));	
				oEkgrp.setSelectedKey(this.Ekgrp);
				this.Ekgrp = "";
			}			

			var oMatnr = this.getView().byId("matnr");
			if(this.Matnr && oMatnr.getSelectedKey() == ""){
				oMatnr.setSelectedKey(this.Matnr);
				this.Matnr = "";
			}	

			var oMeins = this.getView().byId("meins");
			if(this.Meins && oMeins.getSelectedKey() == ""){
				oMeins.setSelectedKey(this.Meins);
				this.Meins = "";
			}		

			var oSafra = this.getView().byId("zzcttxt01");
			if(this.Zzcttxt01 && oSafra.getSelectedKey() == ""){
				oSafra.setSelectedKey(this.Zzcttxt01);
				this.Zzcttxt01 = "";
			}		
			
			var oBprme = this.getView().byId("bprme");
			if(this.Bprme && oBprme.getSelectedKey() == ""){
				oBprme.setSelectedKey(this.Bprme);
				this.Bprme = "";
			}			

			var oWerks = this.getView().byId("werks");
			if(this.Werks && oWerks.getSelectedKey() == ""){
				oWerks.setSelectedKey(this.Werks);
				this.Werks = "";
			}		

			var oLgort = this.getView().byId("lgort");
			if(this.Lgort && oLgort.getSelectedKey() == ""){
				oLgort.setSelectedKey(this.Lgort);
				this.Lgort = "";
			}	

			var oZzaddi1 = this.getView().byId("zzaddi1");
			if(this.Zzaddi1 && oZzaddi1.getSelectedKey() == ""){
				oZzaddi1.setSelectedKey(this.Zzaddi1);
				this.Zzaddi1 = "";
			}	

			var oInco1 = this.getView().byId("inco1");
			if(this.Inco1 && oInco1.getSelectedKey() == ""){
				oInco1.setSelectedKey(this.Inco1);
				this.Inco1 = "";
			}				

			var oMwskz = this.getView().byId("mwskz");
			if(this.Mwskz && oMwskz.getSelectedKey() == ""){
				oMwskz.setSelectedKey(this.Mwskz);
				this.Mwskz = "";
			}				

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
		},

		onExit : function(){
			this.onNavBack();
		}

//		onDeleteList : function(){

//		}	

	});
}
);
