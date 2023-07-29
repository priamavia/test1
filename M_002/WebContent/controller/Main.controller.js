sap.ui.define([
               "cj/pm_m020/controller/BaseController",
               "cj/pm_m020/util/ValueHelpHelper",
               "cj/pm_m020/util/utils",
               "cj/pm_m020/model/formatter",
           	   "cj/pm_m020/model/models",
               "sap/ui/Device",
               "sap/ui/model/Filter",
               "sap/ui/model/FilterOperator",
               "sap/ui/model/json/JSONModel",
               "sap/m/MessageBox",
               "sap/m/MessageToast",
               "jquery.sap.global"
               ], function (BaseController, ValueHelpHelper, utils, formatter, models, Device, Filter, FilterOperator, JSONModel, MessageBox, MessageToast, jQuery) {
	"use strict";

	return BaseController.extend("cj.pm_m020.controller.Main", {
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
			
			var oFrYear = this.getView().byId("frYear");
			var oToYear = this.getView().byId("toYear");
			var maxYear = this.sysDate.substr(0,4); 
			maxYear++;
			

			var minYear = maxYear;
			for(var i=0; i<10; i++){	
				var template = new sap.ui.core.Item();
			    template.setKey(minYear);
		        template.setText(minYear);
	            oFrYear.addItem(template);				

				var template = new sap.ui.core.Item();
			    template.setKey(minYear);
		        template.setText(minYear);
	            oToYear.addItem(template);				
	            
				minYear--;				
			}
			
			oToYear.setSelectedKey(maxYear);
			maxYear--;
			oFrYear.setSelectedKey(maxYear);
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

		onPressPortal_P : function(oEvent){
			debugger;

			var oSelectedItem 	= oEvent.getSource().getParent();			      
			var path 			= oSelectedItem.getBindingContext("ResList").getPath();
			var oListModel 		= this.getView().byId("listTable").getModel("ResList");
			var obj 			= oListModel.getProperty(path);
			
			if(obj.PlanDoc.substr(0, 2) == "AP"){
				this.openWin(obj.PlanUrl);
				//control.openWin(obj.PlanUrl);					
			}
		},
		
		onPressPortal_R : function(oEvent){
			debugger;

			var oSelectedItem 	= oEvent.getSource().getParent();			      
			var path 			= oSelectedItem.getBindingContext("ResList").getPath();
			var oListModel 		= this.getView().byId("listTable").getModel("ResList");
			var obj 			= oListModel.getProperty(path);
			
			if(obj.ResultDoc.substr(0, 2) == "AR"){
				this.openWin(obj.ResultUrl);					
			}
		},		
		
		openWin : function(sPath){
			var html = new sap.ui.core.HTML();

			$(document).ready(function(){
				window.open(sPath);
			});
		},
		
		iconLink : function(oEvent){
			debugger;
			
			var iGubun = oEvent.oSource.getProperty("text");
			
			if( iGubun == "Create" ){
				var gsber = this.getView().byId("gsber").getSelectedKey();
				var today = new Date();
		        var mm = today.getMonth()+1; //January is 0!
		        var year = today.getFullYear();
	            if(mm < 10){
	            	mm = "0" + mm;
	            }		        
				
				//Display a Target Without Changing the Hash
				this._router.getTargets().display("detail", {
					fromTarget 	: "main",
					iGsber  	: gsber,
					iPerde  	: mm,
					iRound  	: "New",
					iGjahr 		: year,
					iAdmin  	: "",
					iAdm01  	: "",
					iAdm02  	: "",
					iNew		: true,
					iApprove 	: false
				});
			}else if( iGubun == "Delete" ){

				debugger;
				
				var data = {};
				data.Gubun = "D"; //Delete
				data.Gsber = this.getView().byId("gsber").getSelectedKey();				
				
				data.PlanDelList = [];
				data.NavReturn   = [];
				
				var oTable = this.getView().byId("listTable");
				//var oResult = oTable.getModel("ResList").oData.results;
				var oSelItems = oTable.getSelectedItems();
				
				if(oSelItems.length < 1){
					MessageBox.show(
							this.i18n.getText("noItemSelected"),
							MessageBox.Icon.ERROR,
							this.i18n.getText("error")
					);
					return 0;
				}
				
				for (var i = 0; i < oSelItems.length; i++) {
				    var item = oSelItems[i];
				    var context = item.oBindingContexts.valueOf().ResList.getObject();
					var sel = {};
					if(context.PlanDoc == "" || context.PlanDoc == null){
						
					}else{
						MessageBox.show(
								this.i18n.getText("noDelete"),
								MessageBox.Icon.ERROR,
								this.i18n.getText("error")
						);
						return 0;						
					}
					
					sel.Gsber = context.Gsber;
					if( data.Gsber != sel.Gsber ){ //조회 후, 검색 플랜트 변경 후 삭제하는경우 방지
						MessageBox.show(
								this.i18n.getText("noDeldiff"),
								MessageBox.Icon.ERROR,
								this.i18n.getText("error")
						);
						return 0;						
					}

					sel.Spmon = context.Spmon.replaceAll('.', ''); 
					sel.Round = context.Round;
										
					data.PlanDelList.push(sel); 
				} 

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

				oSaveModel.create("/ListMainSet", data, mParameters);
				
			}else{
				var oSelectedItem 	= oEvent.getSource().getParent();			      
				var path 			= oSelectedItem.getBindingContext("ResList").getPath();
				var oListModel 		= this.getView().byId("listTable").getModel("ResList");
				var obj 			= oListModel.getProperty(path);
				
				var approve;
				if(obj.PlanDoc == ""){
					approve = true;
				}else{
					approve = false;
				}
								
//				this._router.navTo("detail", {Ebeln : obj.Ebeln}, true);
				//Display a Target Without Changing the Hash
				this._router.getTargets().display("detail", {
					fromTarget 	: "main",
					iGsber  	: obj.Gsber,
					iRound  	: obj.Round,
					iGjahr 		: obj.Spmon.substring(0,4),
					iPerde		: obj.Spmon.substring(5,7),
					iAdmin  	: obj.Admin,
					iAdm01  	: obj.Adm01,
					iAdm02  	: obj.Adm02,
					iAdminD  	: obj.AdminD,
					iAdm01D  	: obj.Adm01D,
					iAdm02D  	: obj.Adm02D,
					iAdminT  	: obj.AdminT,
					iAdm01T  	: obj.Adm01T,
					iAdm02T  	: obj.Adm02T,
					iAdminP  	: obj.AdminP,
					iAdm01P  	: obj.Adm01P,
					iAdm02P  	: obj.Adm02P,
					iAdminM  	: obj.AdminM,
					iAdm01M  	: obj.Adm01M,
					iAdm02M  	: obj.Adm02M,
					iFdate  	: obj.Fdate,
					iTdate  	: obj.Tdate,
					
					iNew		: false,
					iApprove 	: approve
				});				
			}
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
			var oGsber = this.getView().byId("gsber").getSelectedKey();
			if(!oGsber){
				return false;
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

//			oModel.setDefaultCountMode(sap.ui.model.odata.CountMode.None);

			// Set Range Condition ---------------------------------
//			var s_filter 	= [];
			var s_gsber 	= [];
			var s_fyear 	= [];
			var s_tyear 	= [];

			var iGsber = this.getView().byId("gsber").getSelectedKey();
			var iFrYear = this.getView().byId("frYear").getSelectedKey();
			var iToYear = this.getView().byId("toYear").getSelectedKey();
			
			var filterStr;
			filterStr = "Gsber eq '"+iGsber+"' and Fyear eq '"+iFrYear+"' and Tyear eq '"+iToYear+"'";
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
									if(oData.results[i].PlanDoc){
										oData.results[i].Pstat = "sap-icon://sys-enter-2";
										if (oData.results[i].ApproveOn == "") {
											oData.results[i].Pcolor = "gold";
										}else{
											oData.results[i].Pcolor = "green";
										}
									}
									
									if(oData.results[i].ResultDoc){
										oData.results[i].Rstat = "sap-icon://sys-enter-2";
										if (oData.results[i].ApproveOnR == "") {
											oData.results[i].Rcolor = "gold";
										}else{
											oData.results[i].Rcolor = "green";
										}										
									}
								}
								
								var oODataJSONModel =  new sap.ui.model.json.JSONModel();
								oODataJSONModel.setData(oData);
								oTable.setModel(oODataJSONModel, 'ResList');

//								this.set_screen_mode();
//								this.set_displayMode(" ");
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
				window.location.replace("/sap/bc/ui5_ui5/sap/zpm_ui_m020/index.html");}, 100);
		}


	});
}
);