sap.ui.define([
               "cj/pm_m150/controller/BaseController",
               "cj/pm_m150/util/ValueHelpHelper",
               "cj/pm_m150/util/utils",
               "cj/pm_m150/util/Comment",
               "cj/pm_m150/model/formatter",
           	   "cj/pm_m150/model/models",
               "sap/ui/Device",
               "sap/ui/model/Filter",
               "sap/ui/model/FilterOperator",
               "sap/ui/model/json/JSONModel",
               "sap/m/MessageBox",
               "sap/m/MessageToast",
               "sap/ui/core/Popup",
               'sap/ui/core/Fragment',
               "jquery.sap.global"
               ], function (BaseController, ValueHelpHelper, utils, Comment, formatter, models, Device, 
            		        Filter, FilterOperator, JSONModel, MessageBox, MessageToast, 
            		        Popup, Fragment, jQuery) {
	"use strict";

	return BaseController.extend("cj.pm_m150.controller.Main", {
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
			this.sysDate    = this.get_Auth("SYSDAT")[0].Value;
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
			var oView = this.getView();

			oView.setModel(new JSONModel({
				ExConf 		: false,
				InConf 		: false,
				JoConf		: false,
				SaveId 		: false,
				AuditSuper  : false,
				Progress    : false
			}), "header");				

			
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

		    var v_werks = this.oWerks.getSelectedKey();

			this.oSpmon = this.getView().byId("Spmon");
			
			if(this.oSpmon){
				this.oSpmon.removeAllItems();
				this.oSpmon.setSelectedKey("");
				utils.set_search_field(v_werks, this.oSpmon, "aud", "C", v_werks, "M");
			}

			this.oLgort = this.getView().byId("Lgort");
			
			if(this.oLgort){
				this.oLgort.removeAllItems();
				this.oLgort.setSelectedKey("");
				utils.set_search_field(v_werks, this.oLgort, "slo", "C", v_werks, "M");
			}

			this.oSubtype = this.getView().byId("Subtype");
			
			if(this.oSubtype){
				this.oSubtype.removeAllItems();
				this.oSubtype.setSelectedKey("");
				utils.set_search_field(v_werks, this.oSubtype, "sbg", "C", "ERSA", "");
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
		
		onQtyChange : function(oEvent){
			var oSelectedItem 	= oEvent.getSource().getParent();
			var path 			= oSelectedItem.getBindingContext().getPath();
			var oTable			= this.getView().byId("detailList");
			var oListModel 		= oTable.getModel();
			var obj 			= oListModel.getProperty(path);

			obj.GapQty = obj.Labst - obj.Menge;
			// var oQty = this.getView().byId("inputTable").getModel("QtyList");
			// var iQty = oQty.getData();
			// iQty.results[0].DiffChk = iQty.results[0].Labst - iQty.results[0].Menge;
		},
		
		onBtnSave : function(ind){
			var cnt = this.checkMandatorySave(ind);
			var control = this;
			var text = "";
			
			if(ind == "I" || ind == "E"){
				text = "confirmConfirm";
			}else if(ind == "1" || ind == "2"){
				text = "confirmCancel";
			}else{
				text = "saveConfirm";				
			}
			
			if(cnt > 0){
				MessageBox.confirm(this.i18n.getText(text, [cnt]), 
						{//title: "", 
			             onClose : function(oAction){
						   	if(oAction=="OK"){
						   		control.onSave(ind);
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
		
		checkMandatorySave : function(arg){
			
			var oTable = this.getView().byId("detailList");
			var aIndices = oTable.getSelectedIndices();
			if (aIndices.length < 1) {
				MessageBox.show(
						this.i18n.getText("noItemSelected"),
						MessageBox.Icon.ERROR,
						this.i18n.getText("error")
				);
				return 0;
			}			

			var err = false;

			for (var i=0; i<aIndices.length; i++){

				var lv_err = false;
				var lv_message = "";
				
				var ind = aIndices[i];

				var iData = oTable.getContextByIndex(ind).getObject();

				if (iData.Menge != iData.MengeB && iData.Reason == "") { // 값이 변경되었을 경우 사유 필수입력.
					lv_message = "A reason for changing the quantity is required.";
					lv_err = true;					
				}else{
					if(arg == "I" || arg == "E"){
						if(iData.Cdate == "" && arg != ""){
							lv_message = "Unsaved data cannot be confirmed.";
							lv_err = true;
						}else{
							if(iData.Menge != iData.Labst && iData.Reason == ""){
								lv_err = true;
		  						lv_message = "Reason must be entered.(Diff.Qty)";
							}else if( parseFloat(iData.Menge) < parseFloat(iData.BadMenge) ){
								lv_err = true;
		  						lv_message = "Defect Qty is included in Audit Qty.(cannot be exceeded)";
							}else{
								
							}
						}
	
						if (arg == "I" && !lv_err) {
							if (loginId != iData.Cuser) {
								lv_err = true;
		  						lv_message = "You can confirm only the data you have audit.";
							}						
						}
					}else if(arg == "1"){
						if (iData.Inspc != "X") {
							lv_err = true;
							lv_message = "There is no data to cancel.";
						}
					}else if(arg == "2"){
						if (iData.Examc != "X") {
							lv_err = true;
							lv_message = "There is no data to cancel.";
						}
					}else{
						// if( parseFloat(iData.Menge) < parseFloat(iData.BadMenge) ){
						// 	lv_err = true;
						// 	lv_message = "Defect Qty is included in Audit Qty.(cannot be exceeded)";
						// }
						if(iData.Menge != iData.Labst && iData.Reason == ""){
							lv_err = true;
							lv_message = "Reason must be entered.(Diff.Qty)";
						}else if( parseFloat(iData.Menge) < parseFloat(iData.BadMenge) ){
							lv_err = true;
							lv_message = "Defect Qty is included in Audit Qty.(cannot be exceeded)";
						}else{
							
						}
					}
				}

				if(lv_err){
					iData.Light = "sap-icon://error";
					iData.Color = "red";
					iData.Tooltip = lv_message;
					err = true;
				}				
			}

			oTable.getModel().refresh();

			if(err){
				MessageBox.show(
						lv_message,
						MessageBox.Icon.ERROR,
						this.i18n.getText("error")
				);
				return 0;
			}else{
				return aIndices.length;	
			}
			
		},

		onSave : function(arg){
	    	var data = {};
	    	
	    	data.NavSaveList	= [];
	    	data.NavReturn 		= [];
	    	
	    	var oList = this.getView().byId("detailList");
			var aIndices = oList.getSelectedIndices();
			var list = [];
			
	    	for(var i=0; i<aIndices.length; i++){
	    		
	    		var wa = {};
	    		var j = aIndices[i];
	    		var iData = oList.getContextByIndex(j).getObject();

		    	wa.Lgort    = iData.Lgort;
	    		wa.Matnr    = iData.Matnr;
	    		wa.Adchk    = iData.AuditChk;
	    		wa.SapQty   = iData.Labst.toString();
	    		wa.RealQty  = iData.Menge.toString();
	    		wa.BadMenge = iData.BadMenge.toString();
	    		wa.Meins    = iData.Meins;
	    		wa.Status   = iData.StatuChk;
	    		wa.Reason   = iData.Reason;
	    		wa.Measure  = iData.Measure;
				
				if(arg == "I"){
					wa.Staf1Cf = loginId;
					wa.Staf1Dt = this.sysDate;
					wa.Staf2Cf = iData.Staf2Cf;
					wa.Staf2Dt = iData.Staf2Dt;	
				}else if(arg == "E"){
					wa.Staf1Cf = iData.Staf1Cf;
					wa.Staf1Dt = iData.Staf1Dt;
					wa.Staf2Cf = loginId;
					wa.Staf2Dt = this.sysDate;
				}else if(arg == "1"){
					wa.Staf1Cf = "";
					wa.Staf1Dt = "";
					wa.Staf2Cf = iData.Staf2Cf;
					wa.Staf2Dt = iData.Staf2Dt;	
				}else if(arg == "2"){
					wa.Staf1Cf = iData.Staf1Cf;
					wa.Staf1Dt = iData.Staf1Dt;
					wa.Staf2Cf = "";
					wa.Staf2Dt = "";
				}else{
					wa.Staf1Cf = iData.Staf1Cf;
					wa.Staf1Dt = iData.Staf1Dt;
					wa.Staf2Cf = iData.Staf2Cf;
					wa.Staf2Dt = iData.Staf2Dt;	
				}

				wa.Staf3Cf  = iData.Staf3Cf;
	    		wa.Staf3Dt  = iData.Staf3Dt;

				data.NavSaveList.push(wa);
	    	}
	    	
	    	data.Werks = iData.Werks;
	    	data.Spmon = iData.Spmon;
	    	data.Round = iData.Round;

	    	// 3. save process
	    	var oSaveModel = this.getView().getModel();
	    	
			var mParameters = {
				success : function(oData) {					
					// NavReturn 의 가공 형태에 따라 알맞게 수정. 
					if(oData.NavReturn.results[0].Rttyp == "E"){
						MessageBox.show( 	this.i18n.getText("err_plan_save"), //oData.RetMsg,
     										sap.m.MessageBox.Icon.ERROR,
     										this.i18n.getText("Error"));
					}else{
						
						this.onSearch();
						
						var message = oData.NavReturn.results[0].Rtmsg;
						MessageBox.show(	message, 
								            sap.m.MessageBox.Icon.SUCCESS, 
								            this.i18n.getText("Success"));
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

			oSaveModel.create("/SaveMainSet", data, mParameters);				
		},

		checkMandatory : function(){
			
			var oWerks = this.getView().byId("Werks").getSelectedKey();
			if(!oWerks){
				return false;
			}
			var oLgort = this.getView().byId("Lgort").getSelectedKey();
			if(!oLgort){
				return false;
			}
			var oSpmon = this.getView().byId("Spmon").getSelectedKey();
			if(!oSpmon){
				return false;
			}

			return true;
		},
		
		onSearch : function(){

			var oModel = this.getView().getModel();
			var oTable = this.getView().byId("detailList");
			var controll = this;
			
			oModel.attachRequestSent(function(){oTable.setBusy(true);});
			oModel.attachRequestCompleted(function(){
				oTable.setBusy(false);
				oTable.setShowNoData(true);
			});

			oModel.setDefaultCountMode(sap.ui.model.odata.CountMode.None);

			// Set Range Condition ---------------------------------
			var iWerks = this.getView().byId("Werks").getSelectedKey();
			var iLgort = this.getView().byId("Lgort").getSelectedKey();

			var text   = this.getView().byId("Spmon").getSelectedKey();
			var rndArr = text.split("-");
			
			
			var iSpmon = rndArr[0];
			var iRound = rndArr[1];

			var iMaabc = this.getView().byId("Maabc").getSelectedKey();
			var iSubtype = this.getView().byId("Subtype").getSelectedKey();
			var iMatkl = this.getView().byId("Matkl").getValue();
			var iMatnr = this.getView().byId("Matnr").getValue();
			var iRackNo = this.getView().byId("RackNo").getValue();
			
			var filterStr;
			filterStr = "Werks eq '"+iWerks+"' and Lgort eq '"+iLgort+"' and Spmon eq '"+iSpmon+"' and Round eq '"+iRound+"'";
			filterStr = filterStr + "and Maabc eq '"+iMaabc+"' and Matkl eq '"+iMatkl+"' and Subtyp eq '"+iSubtype+"' and RackNo eq '"+iRackNo+"'";
			filterStr = filterStr + "and Matnr eq '"+iMatnr+"'";
			var path = "/ListMainSet";
			
			var mParameters = {
					urlParameters : {
						"$filter" : filterStr
					},
					success : function(oData) {
						if(oData.results){
							if(oData.results.length < 1){
								MessageToast.show(this.i18n.getText("noResult"));
							}else{
								for(var i=0; i<oData.results.length; i++){
									var oMenge = parseFloat(oData.results[i].Menge);
									var oBadMenge = parseFloat(oData.results[i].BadMenge);
									var oLabst = parseFloat(oData.results[i].Labst);
									var oLabst_N = parseFloat(oData.results[i].Labst_N);
									var oLabst_O = parseFloat(oData.results[i].Labst_O);
									var oEisbe = parseFloat(oData.results[i].Eisbe);
									var oVerpr = parseFloat(oData.results[i].Verpr);
									var oLastPrice = parseFloat(oData.results[i].LastPrice);

									oData.results[i].Menge = oMenge;
									oData.results[i].MengeB = oMenge; // Old Value for Change Check.
									oData.results[i].BadMenge = oBadMenge;
									oData.results[i].Labst = oLabst;
									oData.results[i].Labst_N = oLabst_N;
									oData.results[i].Labst_O = oLabst_O;
									oData.results[i].Eisbe = oEisbe;
									oData.results[i].Verpr = oVerpr;
									oData.results[i].LastPrice = oLastPrice;

									// oData.results[i].ExConf = false;
									
									if(oData.results[i].Inspc == "X" && 
									   oData.results[i].Examc == "X"){
									   
									   // && 
									   // oData.results[i].Joinc == "X"){
										oData.results[i].Light = "sap-icon://sys-enter-2";
										oData.results[i].Color = "green";
									}
									
									if(oData.results[i].Inspc){
										oData.results[i].InspcIcon = "sap-icon://sys-enter-2";
									}else{
										oData.results[i].InspcIcon = "";
									}
									if(oData.results[i].Examc){
										oData.results[i].ExamcIcon = "sap-icon://sys-enter-2";
									}else{
										oData.results[i].ExamcIcon = "";
									}
									if(oData.results[i].Joinc){
										oData.results[i].JoincIcon = "sap-icon://sys-enter-2";
									}else{
										oData.results[i].JoincIcon = "";
									}

									oData.results[i].GapQty = oData.results[i].Menge - oData.results[i].Labst;
									var oGapQty = parseFloat(oData.results[i].GapQty);
									oData.results[i].GapQty = oGapQty;

									
									if(oData.results[i].Mobile == "X"){
										oData.results[i].Device = "M";
									}else{
										if(oData.results[i].Cuser != ""){
		  									oData.results[i].Device = "P";
										}
									}
								}
							}
							
							var oODataJSONModel =  new sap.ui.model.json.JSONModel();
							oODataJSONModel.setData(oData);
							oTable.setModel(oODataJSONModel);
							oTable.bindRows("/results");

							var oProgress = this.getView().byId("progress");
							if(oData.results.length > 0){
								oProgress.setVisible(true);
								oProgress.setPercentValue(parseFloat(oData.results[0].Progress1));
								oProgress.setDisplayValue(oData.results[0].Progress2);
							}else{
								oProgress.setVisible(false);
							}


							MessageToast.show(this.i18n.getText("resultCount", oData.results.length));

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
		
		onChangeWerks : function(oEvent){
		    var v_werks = oEvent.oSource.getSelectedKey();
		    			
			var oSpmon = this.getView().byId("Spmon");
			
			if(oSpmon){
				oSpmon.removeAllItems();
				oSpmon.setSelectedKey("");
				utils.set_search_field(v_werks, oSpmon, "aud", "C", v_werks, "M");
			}
			
			var oLgort = this.getView().byId("Lgort");
			
			if(oLgort){
				oLgort.removeAllItems();
				oLgort.setSelectedKey("");
				utils.set_search_field(v_werks, oLgort, "slo", "C", v_werks, "M");
			}
			
		},

		onChangeSpmon : function(oEvent){
		    var v_spmon = oEvent.oSource.getSelectedKey();
			// var v_text  = oEvent.oSource.getProperty("value");

			var rndArr = v_spmon.split("-");
			var v_round = "";
			v_round = rndArr[1];
			
			var v_werks = this.getView().byId("Werks").getSelectedKey();

			
			var oModel = this.getView().getModel();
			var path = "/MasterListSet";

			var controll = this;

			var mParameters = {
					urlParameters : {
						"$filter" : "Werks eq '"+ v_werks + "' and Spmon eq '"+v_spmon+"' and Round eq '"+v_round+"'"
					},
					success : function(oData) {

						this.MasterList = oData.results;
						this.setButtonVisible();
						
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
		onChangeLgort : function(oEvent){
			this.setButtonVisible();
		},
		setButtonVisible : function(){			
			var v_lgort = this.getView().byId("Lgort").getSelectedKey();

			var btnSave = this.getView().byId("btnSave");
			var btnExam = this.getView().byId("btnExam");
			var btnInsp = this.getView().byId("btnInsp");
			var btnExamC = this.getView().byId("btnExamCancel");
			var btnInspC = this.getView().byId("btnInspCancel");
			// var btnJoin = this.getView().byId("btnJoin");
			
			btnInsp.setVisible(false);
			btnExam.setVisible(false);
			btnSave.setVisible(false);
			btnInspC.setVisible(false);
			btnExamC.setVisible(false);
			// btnJoin.setVisible(false);
			
			for(var i=0; i<this.MasterList.length; i++){
				if(v_lgort == this.MasterList[i].Lgort){
					if(this.MasterList[i].Insp01u == loginId || 
					   this.MasterList[i].Insp02u == loginId ||
					   this.MasterList[i].Insp03u == loginId ||
					   this.MasterList[i].Insp04u == loginId ||
					   this.MasterList[i].Insp05u == loginId ){
						btnInsp.setVisible(true);
					}

					if(this.MasterList[i].Exam01u == loginId || 
					   this.MasterList[i].Exam02u == loginId ||
					   this.MasterList[i].Exam03u == loginId ||
					   this.MasterList[i].Exam04u == loginId ||
					   this.MasterList[i].Exam05u == loginId ){
						btnExam.setVisible(true);
						btnSave.setVisible(true);
					}

					// if(this.MasterList[i].Staf2 == loginId){
					// 	btnExam.setVisible(true);
					// 	btnSave.setVisible(true);
					// }
					
					if(this.MasterList[i].Staf3 == loginId){
						// btnJoin.setVisible(true);
					}

					if(this.MasterList[i].Super == "X"){
						btnSave.setVisible(true);
						btnExamC.setVisible(true);
						btnInspC.setVisible(true);
					}
				}
			}
		},
		onSelectionChange: function(oEvent) {
			var oPlugin = oEvent.getSource();
			var bLimitReached = oEvent.getParameters().limitReached;
			var iIndices = oPlugin.getSelectedIndices();
			var sMessage = "";

			if (iIndices.length > 0) {
				sMessage = iIndices.length + " row(s) selected.";
				if (bLimitReached) {
					sMessage = sMessage + " The recently selected range was limited to " + oPlugin.getLimit() + " rows!";
				}
			} else {
				sMessage = "Selection cleared.";
			}

			MessageToast.show(sMessage);
		},
		
		onBtnConfirm : function(oEvent){
			var strArr = oEvent.getSource().sId.split("--");
			var ind = strArr.length - 1;
			var type = "";
			
			if(strArr[ind] == "btnInsp"){
				type = "I";
			}else if(strArr[ind] == "btnExam"){
				type = "E";
			}else if(strArr[ind] == "btnInspCancel"){
				type = "1";
			}else if(strArr[ind] == "btnExamCancel"){
				type = "2";
			}else{
				MessageBox.show(
						"Confirm function error, Contact system admin.",
						MessageBox.Icon.ERROR,
						this.i18n.getText("warning")
				);
			}
			
     		this.onBtnSave(type); // I - Inspector, E - Examinee, 1 - Insp Cancel, 2 - Exam Cancel
		},
		
		onBtnComment : function(oEvent){

			var oGsber = this.getView().byId("Gsber").getSelectedKey();
			if(!oGsber){
				MessageBox.show(
						this.i18n.getText("check_mandatory"),
						MessageBox.Icon.ERROR,
						this.i18n.getText("warning")
				);	

				return;
			}
			var oKostl = this.getView().byId("Kostl").getSelectedKey();
			if(!oKostl){
				MessageBox.show(
						this.i18n.getText("check_mandatory"),
						MessageBox.Icon.ERROR,
						this.i18n.getText("warning")
				);	

				return;
			}			
			var oSpmon = this.getView().byId("Spmon").getSelectedKey();
			if(!oSpmon){
				MessageBox.show(
						this.i18n.getText("check_mandatory"),
						MessageBox.Icon.ERROR,
						this.i18n.getText("warning")
				);	

				return;
			}
			
			var sObj = {};			
	    	sObj.Gsber = oGsber;
	    	sObj.Spmon = oSpmon;
			sObj.Kostl = oKostl;

			var len = this.getView().byId("Spmon").getProperty("value").length;
			if(len == 7){
				sObj.Round = "1";
			}else{
				sObj.Round = this.getView().byId("Spmon").getProperty("value").substr(8,1);
			}
			
			
			this._getDialog_Comment(sObj).open();
		},
		
		_getDialog_Comment : function (sObj) {
			if (!this._oDialog_Comment) {

				this._oDialog_Comment = sap.ui.xmlfragment("cj.pm_m150.view.Comment", this);
				this._Comment_Dialog_handler = new Comment(this._oDialog_Comment, this);
				this.getView().addDependent(this._oDialog_Comment);           
			}

			if(sObj!=undefined){
				this._Comment_Dialog_handler.commentList(sObj);
			}
			return this._oDialog_Comment;          
		},

		onCommentCancelDialog : function(oEvent){
			this._oDialog_Comment.close();
		},

		onCommentSaveDialog : function(oEvent){
			
			var result = this._Comment_Dialog_handler.onCheckBeforeSave();
			var controll = this;
			if(result){
				MessageBox.confirm(this.i18n.getText("confirmCommentSave"), 
						{//title: "", 
					onClose : function(oAction){
						if(oAction=="OK"){
							controll._Comment_Dialog_handler.onCommentSave("S");
							controll.onCommentCancelDialog();  // Pop-Up Close
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

		onCommentSubmitDialog : function(oEvent){
			
			var result = this._Comment_Dialog_handler.onCheckBeforeSubmit();
			var controll = this;
			if(result){
				MessageBox.confirm(this.i18n.getText("confirmCommentSubmit"), 
						{//title: "", 
					onClose : function(oAction){
						if(oAction=="OK"){
							controll._Comment_Dialog_handler.onCommentSave("B");
							controll.onCommentCancelDialog();  // Pop-Up Close
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

		onPressImage : function(oEvent){

			var oSelectedItem 	= oEvent.getSource().getParent();
			var path 			= oSelectedItem.getBindingContext().getPath();
			var oTable			= this.getView().byId("detailList");
			var oListModel 		= oTable.getModel();
			var obj 			= oListModel.getProperty(path);
			
			var Bukrs = obj.Bukrs;
			var Anln1 = obj.Anln1;
			var Anln2 = obj.Anln2;

			var Dokar = obj.PcDokar;
			var Doknr = obj.PcDoknr;
			var Dokvr = obj.PcDokvr;
			var Doktl = obj.PcDoktl;
			var Gos = "";

			var oModel = this.getView().getModel("fileUpload");
			var controll = this;

			var sPath;

			if(Dokar == ""){ // From GOS
				Gos = "A";
			}else{          // From DMS
				Gos = "E";
			}

			if (window.location.hostname == "localhost") {
				sPath = "http://gerpapd.cjwise.net:8020/sap/opu/odata/SAP/ZPM_GW_MGOS_SRV/InputSet(Gos='"+Gos+"',Bukrs='"+Bukrs+"',Anln1='"+Anln1+"',Anln2='"+Anln2+"',Dokar='"+Dokar+"',Doknr='"+Doknr+"',Dokvr='"+Dokvr+"',Doktl='"+Doktl+"')/$value";
			} else {
				sPath = "/sap/opu/odata/sap/ZPM_GW_MGOS_SRV/InputSet(Gos='"+Gos+"',Bukrs='"+Bukrs+"',Anln1='"+Anln1+"',Anln2='"+Anln2+"',Dokar='"+Dokar+"',Doknr='"+Doknr+"',Dokvr='"+Dokvr+"',Doktl='"+Doktl+"')/$value";
			}
			
			this.sPath = sPath;

			if (!this.oDefaultDialog) {
				this.oDefaultDialog = new sap.m.Dialog({
					title: obj.Txt50,
					content: new sap.m.Image({
						src: sPath 
					}),
//					beginButton: new sap.m.Button({
//						type: sap.m.ButtonType.Emphasized,
//						text: "OK",
//						press: function () {
//							this.oDefaultDialog.close();
//						}.bind(this)
//					}),
					endButton: new sap.m.Button({
						text: "Close",
						press: function () {
							this.oDefaultDialog.close();
							this.oDefaultDialog = false;
						}.bind(this)
					})
				});

				// to get access to the controller's model
				this.getView().addDependent(this.oDefaultDialog);
			}

			this.oDefaultDialog.open();

		},
		
		onDownloadExcel : function(oEvent){
			var oModel, oTable, sFilename, v_gsber;
			
			
			v_gsber = "3020";
			oTable = this.getView().byId("detailList");
			oModel = oTable.getModel();
			sFilename = "File";
			
			utils.makeExcel(oModel, oTable, sFilename, v_gsber);
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
				window.location.replace("/sap/bc/ui5_ui5/sap/zpm_ui_m150/index.html");}, 100);
		}


	});
}
);