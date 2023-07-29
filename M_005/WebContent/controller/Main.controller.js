sap.ui.define([
               "cj/pm_m050/controller/BaseController",
               "cj/pm_m050/util/ValueHelpHelper",
               "cj/pm_m050/util/utils",
               "cj/pm_m050/util/Comment",
               "cj/pm_m050/model/formatter",
           	   "cj/pm_m050/model/models",
               "sap/ui/Device",
               "sap/ui/model/Filter",
               "sap/ui/model/FilterOperator",
               "sap/ui/model/json/JSONModel",
               "sap/m/MessageBox",
               "sap/m/MessageToast",
               "sap/m/Dialog",
               "sap/m/Button",  
               "cj/pm_m050/util/xlsx",
               "sap/ui/core/mvc/Controller",             
               "sap/ui/unified/FileUploader",   
               "sap/ui/core/Popup",
               'sap/ui/core/Fragment',
               "jquery.sap.global"
               ], function (BaseController, ValueHelpHelper, utils, Comment, formatter, models, Device, 
            		        Filter, FilterOperator, JSONModel, MessageBox, MessageToast, 
            		        Popup, Fragment, jQuery) {
	"use strict";

	return BaseController.extend("cj.pm_m050.controller.Main", {
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

			
			this.oGsber = this.getView().byId("Gsber");
			
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

		    var v_gsber = this.oGsber.getSelectedKey();

			this.oSpmon = this.getView().byId("Spmon");
			
			if(this.oSpmon){
				this.oSpmon.removeAllItems();
				this.oSpmon.setSelectedKey("");
				utils.set_search_field(v_gsber, this.oSpmon, "aud", "C", v_gsber, "");
			}

			this.oKostl = this.getView().byId("Kostl");
			
			if(this.oKostl){
				this.oKostl.removeAllItems();
				this.oKostl.setSelectedKey("");
			}
			

			this.oAnlkl = this.getView().byId("Anlkl");
			
			if(this.oAnlkl){
				this.oAnlkl.removeAllItems();
				this.oAnlkl.setSelectedKey("");
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
		
		onBtnSave : function(ind){
			var cnt = this.checkMandatorySave(ind);
			var control = this;
			var text = "";
			
			if(ind == "I"){
				text = "confirmConfirm";
			}else if(ind == "E"){
				text = "confirmConfirm";
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

				if(arg == "I" || arg == "E"){
					if(iData.Cdate == "" && arg != ""){
						lv_message = "Unsaved data cannot be confirmed.";
						lv_err = true;
					}else{
						if(iData.Menge != iData.MengeChk && iData.Reason == ""){
							lv_err = true;
	  						lv_message = "Reason must be entered.(Diff.Qty)";
						}else if(iData.Menge != iData.MengeChk && iData.Measure == ""){
							lv_err = true;
	  						lv_message = "Measure must be entered.(Diff.Qty)";
						}else{
							if(iData.UsageChk == "N"){
								if(iData.StatuChk == "1"){
									if(iData.Reason == ""){
				  						lv_message = "Reason must be entered.";
										lv_err = true;
									}						
								}else if(iData.StatuChk == "2" || iData.StatuChk == "3" || iData.StatuChk == "4" || iData.StatuChk == "5"){
									if(iData.Reason == ""){
				  						lv_message = "Reason must be entered.";
										lv_err = true;
									}
									if(iData.Measure == ""){
				  						lv_message = "Measure must be entered.";
										lv_err = true;
									}
									if(iData.Measure == "" && iData.Reason == ""){
				  						lv_message = "Reason & Measure must be entered.";
										lv_err = true;
									}											
//								}else if(iData.StatuChk == "4" || iData.StatuChk == "5"){

								}else{
									lv_message = "Status must be entered.";
									lv_err = true;
								}
							}
						}
					}					
				}else{
					if(iData.UsageChk == "N"){
						if(iData.StatuChk == "1"){
							if(iData.Reason == ""){
								lv_message = "Reason must be entered.";
								lv_err = true;
							}						
						}else if(iData.StatuChk == "2" || iData.StatuChk == "3"){
							if(iData.Reason == ""){
								lv_message = "Reason must be entered.";
								lv_err = true;
							}
							if(iData.Measure == ""){
								lv_message = "Measure must be entered.";
								lv_err = true;
							}
							if(iData.Measure == "" && iData.Reason == ""){
								lv_message = "Reason & Measure must be entered.";
								lv_err = true;
							}											
						}else if(iData.StatuChk == "4" || iData.StatuChk == "5"){

						}else{
							lv_message = "Status must be entered.";
							lv_err = true;
						}
					}
					if(iData.MengeChk > "0"){ //20230721
						if(iData.UsageChk == "" || iData.UsageChk == null){ 
							lv_message = "Usage must be entered.";
							lv_err = true;
						}
						if(iData.StatuChk == "4"){ 
							lv_message = "Status must be entered. not Without";
							lv_err = true;
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
						"Check error status",
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
	    		wa.Kostl	= iData.Kostl;
	    		wa.Anln1    = iData.Anln1;
	    		wa.Anln2    = iData.Anln2;
	    		wa.Equnr    = iData.Equnr;
	    		wa.Anlkl    = iData.Anlkl;
	    		wa.Aktiv    = iData.Aktiv;
	    		wa.Deakt    = iData.Deakt;
	    		wa.Adchk    = iData.AuditChk;
	    		wa.SapQty   = iData.Menge.toString();
	    		wa.RealQty  = iData.MengeChk.toString();
	    		wa.Meins    = iData.Meins;
	    		wa.UseFlag  = iData.UsageChk;
	    		wa.Status   = iData.StatuChk;
	    		wa.Reason   = iData.Reason;
	    		wa.Measure  = iData.Measure;
	    		wa.Amtad    = iData.Amtad.toString();
	    		wa.Amtga    = iData.Amtga.toString();
	    		wa.PcDokar  = iData.PcDokar;
	    		wa.PcDoknr  = iData.PcDoknr;
	    		wa.PcDokvr  = iData.PcDokvr;
	    		wa.PcDoktl  = iData.PcDoktl;

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
				}else{
					wa.Staf1Cf = iData.Staf1Cf;
					wa.Staf1Dt = iData.Staf1Dt;
					wa.Staf2Cf = iData.Staf2Cf;
					wa.Staf2Dt = iData.Staf2Dt;	
				}

				wa.Staf3Cf  = iData.Staf3Cf;
	    		wa.Staf3Dt  = iData.Staf3Dt;
				wa.Cuser  = iData.Cuser;
				wa.Cdate  = iData.Cdate;
	    		wa.Ctime  = iData.Ctime;
				wa.CdateL = iData.CdateL;
	    		wa.CtimeL = iData.CtimeL;
	    		wa.Mobile = iData.Mobile;

	    		data.NavSaveList.push(wa);
	    	}
	    	
	    	data.Gsber = iData.Gsber;
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
			var cnt = 0;
			var oGsber = this.getView().byId("Gsber").getSelectedKey();
			if(!oGsber){
				return false;
			}
			// var oKostl = this.getView().byId("Kostl").getSelectedKey();
			// if(!oKostl){
			// 	return false;
			// }
			var oSpmon = this.getView().byId("Spmon").getSelectedKey();
			if(!oSpmon){
				return false;
			}
			// var oAnlkl = this.getView().byId("Anlkl").getSelectedKey();
			// if(!oAnlkl){
			// 	return false;
			// }
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
			var iGsber = this.getView().byId("Gsber").getSelectedKey();
			var iKostl = this.getView().byId("Kostl").getSelectedKey();
			var iSpmon = this.getView().byId("Spmon").getSelectedKey();

			var text   = this.getView().byId("Spmon").getSelectedItem().getProperty("text");
			var rndArr = text.split("(");
			
			var iRound = "";
			if(rndArr.length == 1){
				iRound = rndArr.length;
			}else{
				iRound = rndArr[1].substring(0,1);
			}
			
			var iAnlkl = this.getView().byId("Anlkl").getSelectedKey();
			var iAnln1 = this.getView().byId("Anln1").getValue();
			var iEqunr = this.getView().byId("Equnr").getValue();
			
			var filterStr;
			filterStr = "Gsber eq '"+iGsber+"' and Kostl eq '"+iKostl+"' and Spmon eq '"+iSpmon+"' and Round eq '"+iRound+"'";
			filterStr = filterStr + " and Anlkl eq '"+iAnlkl+"' and Anln1 eq '"+iAnln1+"' and Equnr eq '"+iEqunr+"'";
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
									var oMengeChk = parseFloat(oData.results[i].MengeChk);
									var oAmtma = parseFloat(oData.results[i].Amtma);
									var oAmtsa = parseFloat(oData.results[i].Amtsa);
									var oAmtot = parseFloat(oData.results[i].Amtot);
									var oAmtad = parseFloat(oData.results[i].Amtad);
									var oAmtga = parseFloat(oData.results[i].Amtga);

									oData.results[i].Menge = oMenge;
									oData.results[i].MengeChk = oMengeChk;
									oData.results[i].Amtma = oAmtma;
									oData.results[i].Amtsa = oAmtsa;
									oData.results[i].Amtot = oAmtot;
									oData.results[i].Amtad = oAmtad;
									oData.results[i].Amtga = oAmtga;
									
									/* abap에서 처리하고 보내주므로 필요없음.
				        			// ZCM_ASSET_AUDIT_CALC01 펑션로직과 동일하게 유지해야함. 20230704
			        				if(oData.results[i].Menge > 0){
			        					if(oData.results[i].Menge == oData.results[i].MengeChk){
			        						oData.results[i].Amtad = oData.results[i].Amtot;
			        					}else{
			        						try{
			        							var lv_singleamt = oData.results[i].Amtot / oData.results[i].Menge; 
			        						}catch(e){
			        							consol.log("Catch-Error");
			        							consol.log(e.name);
			        							consol.log(e.message);
			        						}
			        						oData.results[i].Amtad = lv_singleamt * oData.results[i].MengeChk;
			        				        if(oData.results[i].Amtad > oData.results[i].Amtot){
			        				        	oData.results[i].Amtad = oData.results[i].Amtot;
			        				        }				
			        					}
			        				}else{
			        					if(oData.results[i].MengeChk > 0){
			        						oData.results[i].Amtad = oData.results[i].Amtot;
			        					}else{
			        						oData.results[i].Amtad = 0;
			        					}
			        				}        				
			        				oData.results[i].Amtga = oData.results[i].Amtad - oData.results[i].Amtot; */									
									
									
									if(oData.results[i].Inspc == "X" && 
									   oData.results[i].Examc == "X" && 
									   oData.results[i].Joinc == "X"){
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

									if(oData.results[i].UsageChk == "N" && oData.results[i].AuditSuper){
										oData.results[i].StatusEnable = true;
									}else{
										oData.results[i].StatusEnable = false;
									}

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
		
		onChangeGsber : function(oEvent){
		    var v_gsber = oEvent.oSource.getSelectedKey();
		    			
			this.oSpmon = this.getView().byId("Spmon");
			
			if(this.oSpmon){
				this.oSpmon.removeAllItems();
				this.oSpmon.setSelectedKey("");
				utils.set_search_field(v_gsber, this.oSpmon, "aud", "C", v_gsber, "");
			}

			
			this.oKostl = this.getView().byId("Kostl");
			
			if(this.oKostl){
				this.oKostl.removeAllItems();
				this.oKostl.setSelectedKey("");
			}
			
			this.oAnlkl = this.getView().byId("Anlkl");
			
			if(this.oAnlkl){
				this.oAnlkl.removeAllItems();
				this.oAnlkl.setSelectedKey("");
			}
		},

		onQtyChange : function(oEvent){
			debugger;
			// ZCM_ASSET_AUDIT_CALC01 펑션로직과 동일하게 유지해야함. 20230704			
			var oSelectedItem 	= oEvent.getSource().getParent();
			var path 			= oSelectedItem.getBindingContext().getPath();
			var oTable			= this.getView().byId("detailList");
			var oListModel 		= oTable.getModel();
			var obj 			= oListModel.getProperty(path);

			//obj.Amtad = "559";
			if(obj.Menge > 0){
				if(obj.Menge == obj.MengeChk){
					obj.Amtad = obj.Amtot;
				}else{
					try{
						var lv_singleamt = obj.Amtot / obj.Menge; 
					}catch(e){
						consol.log("Catch-Error");
						consol.log(e.name);
						consol.log(e.message);
					}
					obj.Amtad = lv_singleamt * obj.MengeChk;
			        if(obj.Amtad > obj.Amtot){
			        	obj.Amtad = obj.Amtot;
			        }				
				}
			}else{
				if(obj.MengeChk > 0){
					obj.Amtad = obj.Amtot;
				}else{
					obj.Amtad = 0;
				}
			}
			
			obj.Amtga = obj.Amtad - obj.Amtot;
									
			// var oQty = this.getView().byId("inputTable").getModel("QtyList");
			// var iQty = oQty.getData();
			// iQty.results[0].DiffChk = iQty.results[0].Labst - iQty.results[0].Menge;
			
			if(obj.MengeChk > "0" && obj.AuditChk == "N"){
				if(obj.UsageChk == "Y"){
					obj.StatuChk = "";
					obj.Reason = "";
					obj.Measure = "";	
					obj.ExConf = false;
				}else{
					obj.StatusEnable = true;
					obj.ExConf = true;
				}
				obj.AuditChk = "Y";				
			}else if(obj.MengeChk == "0" || obj.MengeChk == null){
				obj.AuditChk = "N";
				obj.UsageChk = "N";
				obj.StatuChk = "4";
				obj.StatusEnable = true;
				obj.ExConf = true;
			}
			
		},
		
		onChangeSpmon : function(oEvent){
		    var v_spmon = oEvent.oSource.getSelectedKey();
			var v_text  = oEvent.oSource.getProperty("value");

			var rndArr = v_text.split("(");
			var v_round = "";
			if(rndArr.length == 1){
				v_round = rndArr.length;
			}else{
				v_round = rndArr[1].substring(0,1);
			}
			
			var v_gsber = this.getView().byId("Gsber").getSelectedKey();

			
			var oModel = this.getView().getModel();
			var path = "/MasterListSet";

			var controll = this;

			var mParameters = {
					urlParameters : {
						"$filter" : "Gsber eq '"+ v_gsber + "' and Spmon eq '"+v_spmon+"' and Round eq '"+v_round+"'"	
					},
					success : function(oData) {

						this.MasterList = oData.results;

						this.setKostlList();
						this.setAnlklList();
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
		onChangeKostl : function(oEvent){
			this.setAnlklList();
			this.setButtonVisible();
		},
		onChangeAnlkl : function(){
			this.setButtonVisible();
		},
		setKostlList : function(){
			var oKostl = this.getView().byId("Kostl");
			var iKostl = oKostl.getSelectedKey();
			var exist = false;
			
			oKostl.removeAllItems();
			oKostl.setSelectedKey("");

			var kostl = "tmp";
			
			for(var i=0; i<this.MasterList.length; i++){
				if(kostl != this.MasterList[i].Kostl){

					if(this.MasterList[i].Super != "X" && 
					   this.MasterList[i].Staf1 != loginId &&
					   this.MasterList[i].Staf2 != loginId &&
					   this.MasterList[i].Staf3 != loginId &&
					   this.MasterList[i].Mng1  != loginId &&
					   this.MasterList[i].Mng2  != loginId &&
					   this.MasterList[i].Mng3  != loginId ){
						// Skip ---
					}else{
						kostl = this.MasterList[i].Kostl;

						if(kostl == iKostl){
							exist = true;
						}
						var template = new sap.ui.core.Item();
						template.setKey(this.MasterList[i].Kostl);
						if(this.MasterList[i].Kostl == ""){
	  						var keyName = this.MasterList[i].Ktext;
						}else{
							var keyName = this.MasterList[i].Ktext + " (" + this.MasterList[i].Kostl + ")";
						}
						template.setText(keyName);
						oKostl.addItem(template);
					}
				}
			}

			if(exist){
	  			oKostl.setSelectedKey(iKostl);
			}else{
				oKostl.setSelectedKey("");
			}
		},
		setAnlklList : function(){
			var v_kostl = this.getView().byId("Kostl").getSelectedKey();
			var oAnlkl = this.getView().byId("Anlkl");
			var iAnlkl = oAnlkl.getSelectedKey();
			var exist = false;
			oAnlkl.removeAllItems();
			oAnlkl.setSelectedKey("");

			var anlkl = "tmp";
			
			for(var i=0; i<this.MasterList.length; i++){
				if(anlkl != this.MasterList[i].Anlkl && v_kostl == this.MasterList[i].Kostl){

					if(this.MasterList[i].Anlkl != "" && 
					   this.MasterList[i].Staf1 != loginId &&
					   this.MasterList[i].Staf2 != loginId &&
					   this.MasterList[i].Staf3 != loginId ){
						// Skip ---
					}else{
						anlkl = this.MasterList[i].Anlkl;

						if(anlkl == iAnlkl){
							exist = true;
						}
						var template = new sap.ui.core.Item();
						template.setKey(this.MasterList[i].Anlkl);
						if(this.MasterList[i].Anlkl == ""){
	  						var keyName = this.MasterList[i].Txk20;
						}else{
							var keyName = this.MasterList[i].Txk20 + " (" + this.MasterList[i].Anlkl + ")";
						}
						template.setText(keyName);
						oAnlkl.addItem(template);											
					}
				}
			}

			if(exist){
	  			oAnlkl.setSelectedKey(iAnlkl);
			}else{
				oAnlkl.setSelectedKey("");
			}
		},
		setButtonVisible : function(){			
			var v_kostl = this.getView().byId("Kostl").getSelectedKey();
			// var v_anlkl = this.getView().byId("Anlkl").getSelectedKey();

			var btnSave = this.getView().byId("btnSave");
			var btnExam = this.getView().byId("btnExam");
			var btnInsp = this.getView().byId("btnInsp");
			var btnJoin = this.getView().byId("btnJoin");
			var btnPdf  = this.getView().byId("btnPdf");
			var btnUpload  = this.getView().byId("btnUpload");

			var oHeader = this.getView().getModel("header").getData();
			
			btnInsp.setVisible(false)
			btnExam.setVisible(false);
			btnSave.setVisible(false);
			btnJoin.setVisible(false);
			btnPdf.setVisible(false);
			btnUpload.setVisible(false);
			
			for(var i=0; i<this.MasterList.length; i++){
				if(v_kostl == this.MasterList[i].Kostl 
				   // && v_anlkl == this.MasterList[i].Anlkl
				  ){
						
					if(this.MasterList[i].Staf1 == loginId){
						btnInsp.setVisible(true);
					}

					if(this.MasterList[i].Staf2 == loginId){
						btnExam.setVisible(true);
						btnSave.setVisible(true);
					}
					
					if(this.MasterList[i].Staf3 == loginId){
						btnJoin.setVisible(true);
					}

					if(this.MasterList[i].Super == "X"){
						btnSave.setVisible(true);
						btnPdf.setVisible(true);
						btnUpload.setVisible(true);
					}
				}
			}
			
		},
		onBtnPdf : function(oEvent){
			var controll = this;
			var iGsber = this.getView().byId("Gsber").getSelectedKey();
			var iSpmon = this.getView().byId("Spmon").getSelectedKey();
			var iRound = "";
			
			var len = this.getView().byId("Spmon").getProperty("value").length;
			if(len == 7){
				iRound = "1";
			}else{
				iRound = this.getView().byId("Spmon").getProperty("value").substr(8,1);
			}
									
			var filterStr = "?$filter=Param1 eq '"+iGsber+"' and Param2 eq '"+iSpmon+"' and Param3 eq '"+iRound+"'";
			var fname = "ZPM_AUDIT_COMMENT";
			
			var sPath;

			if (window.location.hostname == "localhost") {
				sPath = "http://gerpapd.cjwise.net:8020/sap/opu/odata/SAP/ZPM_GW_M051_SRV/PdfSet(FName='"+fname+"')/$value"+filterStr;
			} else {	
				sPath = "/sap/opu/odata/sap/ZPM_GW_M051_SRV/PdfSet(FName='"+fname+"')/$value"+filterStr;
			} 
						
			var html = new sap.ui.core.HTML();
			
			$(document).ready(function(){
				window.open(sPath);
			});
			
		},
		onBtnConfirm : function(oEvent){
			var strArr = oEvent.getSource().sId.split("--");
			var ind = strArr.length - 1;
			var type = "";
			
			if(strArr[ind] == "btnInsp"){
				type = "I";
			}else if(strArr[ind] == "btnExam"){
				type = "E";
			}else{
				MessageBox.show(
						"Confirm function error, Contact system admin.",
						MessageBox.Icon.ERROR,
						this.i18n.getText("warning")
				);
			}
			
			// var text	= oEvent.oSource.getProperty("text");
   //  		var type 	= text.substring(0,1);
     		this.onBtnSave(type); // I - Inspector, E - Examinee
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

				this._oDialog_Comment = sap.ui.xmlfragment("cj.pm_m050.view.Comment", this);
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

		onChangeUsage : function(oEvent){
			var oSelectedItem 	= oEvent.getSource().getParent();
			var path 			= oSelectedItem.getBindingContext().getPath();
			var oTable			= this.getView().byId("detailList");
			var oListModel 		= oTable.getModel();
			var obj 			= oListModel.getProperty(path);

			if(oEvent.oSource.getProperty("selectedKey") == "Y"){
				obj.StatuChk = "";
				obj.StatusEnable = false;
				obj.ExConf = false;	
			}else{
				obj.ExConf = true;	
				if(obj.AuditSuper){
	  				obj.StatusEnable = true;
				}
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
			
			
			v_gsber = this.getView().byId("Gsber").getSelectedKey();
			oTable = this.getView().byId("detailList");
			oModel = oTable.getModel();
			sFilename = "File";
			
			utils.makeExcel(oModel, oTable, sFilename, v_gsber);
		},


	    handleFileUpload: function(oEvent) {
	    	
	    	debugger;

	    	var oModel, oTable;
			oTable = this.getView().byId("detailList");
			oModel = oTable.getModel();	    	
	    	
	        var oFileUploader = oEvent.getSource();
	        var oFile = oEvent.getParameter("files")[0];
	        var reader = new FileReader();

	        reader.onload = function(e) {
	          var data = e.target.result;
	          
	          //var decoder = new TextDecoder("UTF-8");
	          //var decodedData = decoder.decode(data);
	          
	          //var workbook = XLSX.read(data, { type: "binary", encoding: "UTF-8" });
	          var workbook = XLSX.read(data, { type: "string", encoding: "EUC-KR" });
	          //var workbook = XLSX.read(decodedData, { type: "string" });
	          
	          var sheetName = workbook.SheetNames[0];
	          var sheet = workbook.Sheets[sheetName];
	          var jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

	          // 업로드 데이터 화면에 매핑
	          var listData = oModel.getData();
	          for(var i = 0; i < listData.results.length; i++) {
	        	  for(var j = 1; j < jsonData.length; j++) {
	        		  if(listData.results[i].Anln1 == jsonData[j][1]){
	        			  
	        			  //Validation check	        			  
  						  try{
  							  //var number01 = parseInt(listData.results[i].MengeChk, 10);  							  
  							  //var isNum01 = Number.isInteger(listData.results[i].MengeChk);
  							  var isNum01 = Number.isInteger(jsonData[j][10]); 
						  }catch(e){
							  consol.log("Catch-Error");
							  consol.log(e.name);
							  consol.log(e.message);
						  }	        			  
	        			  if(isNum01 = false){ // 숫자가 아니면 에러처리
	        				  //MessageToast.show(listData.results[i].Anln1 + "_" + listData.results[i].MengeChk+" is not number!");
	        					MessageBox.show(
	        							this.i18n.getText(listData.results[i].Anln1 + "_" + jsonData[j][10]+" is not number!"),
	        							MessageBox.Icon.ERROR,
	        							this.i18n.getText("error")
	        					);
	        					return 0;
	        			  };
	        			  listData.results[i].MengeChk = jsonData[j][10]; //실사 수량
	        			  if(listData.results[i].MengeChk > 0){
	        				  listData.results[i].AuditChk = "Y";
	        			  }else{
	        				  listData.results[i].AuditChk = "N";
	        			  }
	        			  
	        			  //var isYN = ['Y', 'N', 'y', 'n'].includes(listData.results[i].UsageChk);
	        			  var isYN = ['Y', 'N', 'y', 'n'].includes(jsonData[j][11]);
	        			  if(isYN = false){ // Y,N이 아니면
	        				  //MessageToast.show(listData.results[i].Anln1 + "_" + listData.results[i].UsageChk+" is not Y or N!");
	        					MessageBox.show(
	        							this.i18n.getText(listData.results[i].Anln1 + "_" + jsonData[j][11]+" is not Y or N!"),
	        							MessageBox.Icon.ERROR,
	        							this.i18n.getText("error")
	        					);
	        					return 0;
	        			  };	        			  
	        			  	        			  	        			 
	        			  listData.results[i].UsageChk = jsonData[j][11];	        			  
	        			  listData.results[i].UsageChk.toUpperCase();
	        			  
	        			  
	        			  if(listData.results[i].UsageChk == "N"){
	        				  if(jsonData[j][12] == null){
		        					MessageBox.show(
		        							this.i18n.getText(listData.results[i].Anln1 + "_" + jsonData[j][12]+" is not 1~5"),
		        							MessageBox.Icon.ERROR,
		        							this.i18n.getText("error")
		        					);	        					  
	        				  }
		        			  var isNum02 = ["1", "2", "3", "4", "5"].includes(jsonData[j][12].toString());
		        			  if(isNum02 == false){ //1~5가 아니면
		        				  //MessageToast.show(listData.results[i].Anln1 + "_" + listData.results[i].StatuChk+" is not number!");
		        					MessageBox.show(
		        							this.i18n.getText(listData.results[i].Anln1 + "_" + jsonData[j][12]+" is not 1~5"),
		        							MessageBox.Icon.ERROR,
		        							this.i18n.getText("error")
		        					);
		        					return 0;
		        			  }else{	        				  
			        			  //listData.results[i].StatuChk = jsonData[j][12].toString();
		        				  listData.results[i].StatuChk = jsonData[j][12].toString();
			        			  listData.results[i].Reason   = jsonData[j][13];
			        			  listData.results[i].Measure  = jsonData[j][14];
		        			  }
	        			  }else{ //usage = Y
	        				  listData.results[i].StatuChk = "";
		        			  listData.results[i].Reason   = "";
		        			  listData.results[i].Measure  = "";
	        			  } 
	        			  
						if(listData.results[i].UsageChk == "N"){
							listData.results[i].StatusEnable = true;
							listData.results[i].ExConf = true;
						}else{
							//수량 다를때
							if(listData.results[i].Menge != listData.results[i].MengeChk){
								listData.results[i].StatusEnable = true;
								listData.results[i].ExConf = true;								
							}else{
								listData.results[i].StatusEnable = false;
								listData.results[i].StatuChk = "";
								listData.results[i].ExConf = false;
							}
						}

	        			  
	        			  // ZCM_ASSET_AUDIT_CALC01 펑션로직과 동일하게 유지해야함. 20230704
        				if(listData.results[i].Menge > 0){
        					if(listData.results[i].Menge == listData.results[i].MengeChk){
        						listData.results[i].Amtad = listData.results[i].Amtot;
        					}else{
        						try{
        							var lv_singleamt = listData.results[i].Amtot / listData.results[i].Menge; 
        						}catch(e){
        							consol.log("Catch-Error");
        							consol.log(e.name);
        							consol.log(e.message);
        						}
        						listData.results[i].Amtad = lv_singleamt * listData.results[i].MengeChk;
        				        if(listData.results[i].Amtad > listData.results[i].Amtot){
        				        	listData.results[i].Amtad = listData.results[i].Amtot;
        				        }				
        					}
        				}else{
        					if(listData.results[i].MengeChk > 0){
        						listData.results[i].Amtad = listData.results[i].Amtot;
        					}else{
        						listData.results[i].Amtad = 0;
        					}
        				}        				
        				listData.results[i].Amtga = listData.results[i].Amtad - listData.results[i].Amtot;	        			  
	        			  
	        			  
	        		  }
	        	  }
	          }
	          
	          
	          oModel.refresh();
	          oFileUploader.setValue(""); //초기화
	          

	          
	          MessageToast.show("File uploaded successfully!");
	        }.bind(this);
	    	        
	        //reader.readAsBinaryString(oFile);
	        reader.readAsText(oFile, "EUC-KR");
	        //reader.readAsArrayBuffer(oFile);
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
				window.location.replace("/sap/bc/ui5_ui5/sap/zpm_ui_m050/index.html");}, 100);
		}


	});
}
);