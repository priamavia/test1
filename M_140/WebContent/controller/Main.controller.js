sap.ui.define([
               "cj/pm_m140/controller/BaseController",
               "cj/pm_m140/util/ValueHelpHelper",
               "cj/pm_m140/util/utils",
               "cj/pm_m140/model/formatter",
           	   "cj/pm_m140/model/models",
               "sap/ui/Device",
               "sap/ui/model/Filter",
               "sap/ui/model/FilterOperator",
               "sap/ui/model/json/JSONModel",
               "sap/m/MessageBox",
               "sap/m/MessageToast",
               "jquery.sap.global"
               ], function (BaseController, ValueHelpHelper, utils, formatter, models, Device, Filter, FilterOperator, JSONModel, MessageBox, MessageToast, jQuery) {
	"use strict";

	return BaseController.extend("cj.pm_m140.controller.Main", {
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
			
			// Get Asset Number from URL
			this.getMaterialNumberHref();
			
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

			if(oEvent.getParameter("data").iNavBack){
				this.oArgs.iWerks = oEvent.getParameter("data").iWerks;
				this.oArgs.iLgort = oEvent.getParameter("data").iLgort;
				this.oArgs.iMatnr = oEvent.getParameter("data").iMatnr;				
				this.oArgs.iNavBack = oEvent.getParameter("data").iNavBack;
				this.oArgs.iLink = oEvent.getParameter("data").iLink;
			}

			if(this.oArgs.iWerks != null && this.oArgs.iMatnr != null){
				this.call_next_screen();
			}else{
				var controll = this;
				
				this.i18n = this.getView().getModel("i18n").getResourceBundle();
	
				this.getLoginInfo();
				this.set_userData();  //"User Auth"		
			}
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
						// controll.byId("mainpage").scrollTo(0);

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
		 * Initialization 
		 */
		setInitData : function(){

			if(!this.oArgs.iNavBack || !this.oArgs.iLink){
				var oWerks = this.getView().byId("Werks");
				var iWerks = "";
	
				for (var i=0; i<this.arr_werks.length; i++){
					var template = new sap.ui.core.Item();
					template.setKey(this.arr_werks[i].Value);
					template.setText(this.arr_werks[i].KeyName);
					oWerks.addItem(template);
	
					if(this.arr_werks[i].Value == "3020"){
						iWerks = this.arr_werks[i].Value;
					}
				}
	
				if(iWerks == ""){
					iWerks = this.arr_werks[i].Value;
				}
	
				if(iWerks != ""){
					oWerks.setSelectedKey(iWerks);
					this.onChangeWerks();
				}
	
	
				var oLgort = this.getView().byId("Lgort");
				if(oLgort){
					oLgort.removeAllItems();
					oLgort.setSelectedKey("");
				}
				
				var oMatkl = this.getView().byId("Matkl");
				if(oMatkl){
					oMatkl.removeAllItems();
					oMatkl.setSelectedKey("");
				}
	
				var oSpmon = this.getView().byId("Spmon");
				if(oSpmon){
					oSpmon.removeAllItems();
					oSpmon.setSelectedKey("");
				}
			}			
		},

		onChangeWerks : function(){
			
			var oModel = this.getView().getModel();
			var oWerks = this.getView().byId("Werks");
	        var iWerks = oWerks.getSelectedKey(); 
	        	
	        var path 		= "/HeadSet(Mode='M',Werks='"+iWerks+"',Lgort='',Matnr='')";
	        var mParameters = {
	  				urlParameters : {
	  					"$expand" : "NavList,NavLgort,NavMatkl,NavSpmon,NavSubtyp"
	  				},
	  				success : function(oData) {
	  					if(oData.Rttyp != "E"){
							var oLgort = this.getView().byId("Lgort");
							if(oLgort){
								oLgort.removeAllItems();
								oLgort.setSelectedKey("");
							}
				
							var oMatkl = this.getView().byId("Matkl");
							if(oMatkl){
								oMatkl.removeAllItems();
								oMatkl.setSelectedKey("");
							}
				
							var oSpmon = this.getView().byId("Spmon");
							if(oSpmon){
								oSpmon.removeAllItems();
								oSpmon.setSelectedKey("");
							}

							var oSubtyp = this.getView().byId("Subtyp");
							if(oSubtyp){
								oSubtyp.removeAllItems();
								oSubtyp.setSelectedKey("");
							}

							for(var i=0; i<oData.NavLgort.results.length; i++) {
								var template = new sap.ui.core.Item();
								template.setKey(oData.NavLgort.results[i].Lgort);
								template.setText(oData.NavLgort.results[i].KeyName);
								oLgort.addItem(template);								
							}

							for(var i=0; i<oData.NavMatkl.results.length; i++) {
								var template = new sap.ui.core.Item();
								template.setKey(oData.NavMatkl.results[i].Matkl);
								template.setText(oData.NavMatkl.results[i].KeyName);
								oMatkl.addItem(template);								
							}

							for(var i=0; i<oData.NavSpmon.results.length; i++) {
								var template = new sap.ui.core.Item();
								template.setKey(oData.NavSpmon.results[i].Spmon + "-" + oData.NavSpmon.results[i].Round);
								template.setText(oData.NavSpmon.results[i].KeyName);
								oSpmon.addItem(template);
							}

							for(var i=0; i<oData.NavSubtyp.results.length; i++) {
								var template = new sap.ui.core.Item();
								template.setKey(oData.NavSubtyp.results[i].Subtyp);
								template.setText(oData.NavSubtyp.results[i].KeyName);
								oSubtyp.addItem(template);
							}							
	  					}else{
	  						MessageToast.show(this.i18n.getText("noAuditPlan"));						
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
	  		oModel.read(path, mParameters);	
		},
		
		onPressSearch : function(oEvent){
	        var oModel = this.getView().getModel();
			var oTable = this.getView().byId("listTable");
			
			oModel.attachRequestSent(function(){oTable.setBusy(true);});
			oModel.attachRequestCompleted(function(){
				oTable.setBusy(false);
				oTable.setShowNoData(true);
			});

			var iWerks = this.getView().byId("Werks").getSelectedKey();
			var iLgort = this.getView().byId("Lgort").getSelectedKey();

			var s_filter = [];
			var s_spmon  = [];
			var s_round  = [];
			var s_subtyp = [];
			var s_matkl  = [];
			var s_rackno = [];
			var s_maabc  = [];

			var iKey    = this.getView().byId("Spmon").getSelectedKey();
			var rndArr  = iKey.split("-");
			
			var iSpmon = iRound = rndArr[0];
			var iRound = iRound = rndArr[1];

			var iSubtyp = this.getView().byId("Subtyp").getSelectedKey();
			var iMatkl  = this.getView().byId("Matkl").getSelectedKey();
			var iRackNo = this.getView().byId("RackNo").getValue();
			var iMaabc  = this.getView().byId("Maabc").getSelectedKey();

			if(iSpmon){
				s_spmon.push(iSpmon);
				
				if(s_spmon.length>0){
		            s_filter.push(utils.set_filter(s_spmon, "Spmon"))
	            }
			}

			if(iRound){
				s_round.push(iRound);
				
				if(s_round.length>0){
		            s_filter.push(utils.set_filter(s_round, "Round"))
	            }
			}
			
			if(iSubtyp){
				s_subtyp.push(iSubtyp);
				
				if(s_subtyp.length>0){
		            s_filter.push(utils.set_filter(s_subtyp, "Subtype"))
	            }
			}

			if(iMatkl){
				s_matkl.push(iMatkl);
				
				if(s_matkl.length>0){
		            s_filter.push(utils.set_filter(s_matkl, "Matkl"))
	            }
			}

			if(iRackNo){
				s_rackno.push(iRackNo);
				
				if(s_rackno.length>0){
		            s_filter.push(utils.set_filter(s_rackno, "RackNo"))
	            }
			}

			if(iMaabc){
				s_maabc.push(iMaabc);
				
				if(s_maabc.length>0){
		            s_filter.push(utils.set_filter(s_maabc, "Maabc"))
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
	        	
	        var path 		= "/HeadSet(Mode='L',Werks='"+iWerks+"',Lgort='"+iLgort+"',Matnr='')";
	        var mParameters = {
	  				urlParameters : {
	  					"$expand" : "NavList,NavLgort,NavMatkl,NavSpmon,NavSubtyp",
						"$filter" : filterStr
	  				},
	  				success : function(oData) {
	  					if(oData.RtTyp != "E"){

							// List ---------------------------------------------
							for( var i = 0 ; i < oData.NavList.results.length ; i++ ) {
								if(oData.NavList.results[i].Adchk == "Y"){
									oData.NavList.results[i].Light = "sap-icon://sys-enter-2";
								}else{
									oData.NavList.results[i].Light = "sap-icon://sys-cancel";
								}
							}
							
							this.oList = oData.NavList;
							this.onFilterPress(); // at this point - binding 
							
							this.byId("mainpage").scrollTo(0);
							
	  					}else{
	  						MessageToast.show(this.i18n.getText("noAuditPlan"));						
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
	  		oModel.read(path, mParameters);
			
		},
		
		onFilterPress : function(){
			var b = this.getView().byId("filterO").getPressed();
			var c = this.getView().byId("filterX").getPressed();
			this.filterList(b, c);
		},

		filterList : function(b, c){
			var oTable = this.getView().byId("listTable");
			var oData = {};
			oData.results = [];
			
			for(var i=0; i<this.oList.results.length; i++){
				oData.results.push(this.oList.results[i]);
			}
			
			var oList = oData.results;
			var oFilter = [];
			
			for(var i=0; i<oList.length; i++){
				var ok_b = true;
				var ok_c = true;
							
				if(!b && oList[i].Light == "sap-icon://sys-enter-2"){
					ok_b = false;
				}

				if(!c && oList[i].Light == "sap-icon://sys-cancel"){
					ok_c = false;
				}

				if(ok_b && ok_c){
					oFilter.push(oList[i]);
				}
			}
				
			oData.results = oFilter;
						
			var oODataJSONModel =  new sap.ui.model.json.JSONModel();
			oODataJSONModel.setData(oData);
			oTable.setModel(oODataJSONModel, 'MainList');

			MessageToast.show(this.i18n.getText("selected", oData.results.length));
			
		},
		
		onPressRefresh : function(){
			this.setInitData();
		},
		onPressTop : function(){
			this.byId("mainpage").scrollTo(0);
		},
		
		iconLink : function(oEvent){
			
			var path = oEvent.getParameter("listItem").getBindingContext("MainList").getPath()

			var oPmList =  this.getView().byId("listTable");
			var obj = oPmList.getModel("MainList").getProperty(path);
						
//			this._router.navTo("detail", {Ebeln : obj.Ebeln}, true);
			//Display a Target Without Changing the Hash
			this._router.getTargets().display("input", {
				fromTarget : "main",
				iWerks  : obj.Werks,
				iLgort  : obj.Lgort,
				iMatnr  : obj.Matnr,
				iLink   : true    // true 일때는 조회모드만 가능.
			});
			
		},	
		
						
		checkMandatory : function(){

//			var oWerks = this.getView().byId("Werks").getSelectedKey();
//			if(!oWerks){
//				return false;
//			}else {
//				var w = Number(oWerks);
//				this.getView().byId("Werks").setValue(w);				
//			}
			return true;
		},

		getMaterialNumberHref : function(){
			// 없으면 null 들어온다. 
			this.oArgs = {};
			this.oArgs.iWerks = jQuery.sap.getUriParameters().get("werks");
			this.oArgs.iLgort = jQuery.sap.getUriParameters().get("lgort");
			this.oArgs.iMatnr = jQuery.sap.getUriParameters().get("matnr"); 

			if(this.oArgs.iWerks == null){
				this.oArgs.iDirect = false;
			}else{
	  			this.oArgs.iDirect = true;
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
		onPress_otherAsset: function(){
			var result = this.checkMandatory();

			if(result){
				this.scanCode();
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
		
		scanCode: function() {
			this.codeScanned = false;
			var container = new sap.m.VBox({
				"width": "512px",
				"height": "384px"
			});
			var button = new sap.m.Button("", {
				text: "Cancel",
				type: "Reject",
				press: function() {
					dialog.close();
				}
			});
			var dialog = new sap.m.Dialog({
				title: "Scan Window",
				content: [
					container,
					button
				]
			});
			dialog.open();
			var video = document.createElement("video");
			video.autoplay = true;
			var that = this;
			qrcode.callback = function(data) {
				if (data !== "error decoding QR Code") {
					this.codeScanned = true;
					that._oScannedInspLot = data;
					dialog.close();
					window.location.replace(data);
				}
			}.bind(this);

			var canvas = document.createElement("canvas");
			canvas.width = 512;
			canvas.height = 384;
			navigator.mediaDevices.getUserMedia({
					audio: false,
					video: {
						facingMode: "environment",
						width: {
							ideal: 512
						},
						height: {
							ideal: 384
						}
					}
				})
				.then(function(stream) {
					video.srcObject = stream;
					var ctx = canvas.getContext('2d');
					var loop = (function() {
						if (this.codeScanned) {
							//video.stop();
							return;
						} else {
							ctx.drawImage(video, 0, 0);
							setTimeout(loop, 1000 / 30); // drawing at 30fps
							qrcode.decode(canvas.toDataURL());
						}
					}.bind(this));
					loop();
				}.bind(this));
//				.catch(function(error){
//					sap.m.MessageBox.error("Unable to get Video Stream");
//				});

			container.getDomRef().appendChild(canvas);
		},

		checkBeforeAudit : function(){
			return true;
		},
				
		call_next_screen : function(iView){
			//Display a Target Without Changing the Hash
			this._router.getTargets().display("input", {
				fromTarget : "main",
				iWerks   : this.oArgs.iWerks,
				iLgort   : this.oArgs.iLgort,
				iMatnr   : this.oArgs.iMatnr,
				iLink    : false
			});	
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