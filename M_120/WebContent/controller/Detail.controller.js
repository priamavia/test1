sap.ui.define([
               "cj/pm_m120/controller/BaseController",
               "cj/pm_m120/util/ValueHelpHelper",
               "cj/pm_m120/util/utils",
               "cj/pm_m120/model/formatter",
               "sap/ui/Device",
               "sap/ui/core/Fragment",
               "sap/ui/model/Filter",
               "sap/ui/model/FilterOperator",
               "sap/ui/model/json/JSONModel",
               "sap/m/MessageBox",
               "sap/m/MessageToast",
			   "sap/m/Tokenizer",
               "jquery.sap.global"
               ], function (BaseController, ValueHelpHelper, utils, formatter, Device, Fragment, 
                   Filter, FilterOperator, JSONModel, MessageBox, MessageToast, Tokenizer, jQuery) {
  "use strict";

  return BaseController.extend("cj.pm_m120.controller.Detail", {
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
//      this._router.getRoute("detail").attachMatched(this._onRouteMatched, this);

      	var oTarget = this._router.getTarget("detail");
      	oTarget.attachDisplay(this._onRouteMatched, this);

      	this.getView().setModel(new JSONModel(Device), "device");

      	this.modelCount = 0;   

		this.byId("Admin").setFilterFunction(function (sTerm, oItem) {
			// A case-insensitive "string contains" style filter
			return oItem.getText().match(new RegExp(sTerm, "i"));
		});
	
    },

    _onRouteMatched : function (oEvent) {
      var controll = this;
      this.oArgs = oEvent.getParameter("data");   // //store the data

      this.i18n = this.getView().getModel("i18n").getResourceBundle();

      this.getLoginInfo();
      this.set_userData();
      this.set_screen_mode();

      if(this.oArgs.iNew){  // Release Statue : Frgzu is space Change 
        this.set_displayMode("C");
      }else{
    	if(this.oArgs.iApprove){
            this.set_displayMode("U");
    	}else{
            this.set_displayMode("D");    		
    	}
      }
    },

    /**
     * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
     * (NOT before the first rendering! onInit() is used for that one!).
     */
    onBeforeRendering: function() {

    },

    onAfterRendering: function() {

    },

	onValueHelpRequest: function (oEvent) {
		var sInputValue = oEvent.getSource().getValue(),
			oView = this.getView();

		if (!this._pValueHelpDialog) {
			this._pValueHelpDialog = Fragment.load({
				id: oView.getId(),
				name: "sap.m.sample.InputKeyValue.ValueHelpUserInfo",
				controller: this
			}).then(function (oDialog) {
				oView.addDependent(oDialog);
				return oDialog;
			});
		}
		this._pValueHelpDialog.then(function (oDialog) {
			// Create a filter for the binding
			oDialog.getBinding("items").filter([new Filter("Name", FilterOperator.Contains, sInputValue)]);
			// Open ValueHelpDialog filtered by the input's value
			oDialog.open(sInputValue);
		});
	},

	handleSuggestEmpId: function (oEvent) {
		var sTerm = oEvent.getParameter("suggestValue");
		oEvent.getSource().setFilterFunction(function (sTerm, oItem) {
			// A case-insensitive 'string contains' style filter
			return oItem.getText().match(new RegExp(sTerm, "i"));

		});
	},
	  
	onSuggestionItemSelected: function (oEvent) {
		var oItem = oEvent.getParameter("selectedItem");
		var oText = oItem ? oItem.getKey() : "";
		
    	var iHeader = this.getView().getModel("header");
    	var iUser = this.getView().getModel("User");
    	var userList = iUser.oData.results; 
    	
		var strArr = oEvent.oSource.sId.split("--");
		var cnt = strArr.length - 1;
		var sIdstr = strArr[cnt];
		
		var user = ""; // MDG User ID(Internal)
		var sap  = ""; // SAP ID
		var port = ""; // Wise Portal ID

		user = oEvent.getParameters().selectedItem.getProperty("key");

        for(var i=0; i<userList.length; i++){
        	if(userList[i].EmpId == user){
        		sap 	= userList[i].SapId;
        		port 	= userList[i].PortalId;
        	}
        }
		
		if(sIdstr == "Admin"){
	    	iHeader.oData.AdminUser 	= user;
	    	iHeader.oData.AdminSapId 	= sap;
	    	iHeader.oData.AdminPortal 	= port;	    	
		}else if(sIdstr == "Adm01"){
	    	iHeader.oData.Adm01User 	= user;
	    	iHeader.oData.Adm01SapId 	= sap;
	    	iHeader.oData.Adm01Portal 	= port;	    	
		}else if(sIdstr == "Adm02"){
	    	iHeader.oData.Adm02User 	= user;
	    	iHeader.oData.Adm02SapId 	= sap;
	    	iHeader.oData.Adm02Portal 	= port;	    	
		}
		
		this.getView().setModel(iHeader, 'header');	
	},	  
	onScheduleItemSelected: function (oEvent) {
		var strIndex = oEvent.getSource().getBindingContext().getPath().split("/");
		var index = strIndex[2];
		
		
		// var index = oEvent.getSource().getParent().getIndex();
		var oItem = oEvent.getParameter("selectedItem");
		var oText = oItem ? oItem.getKey() : "";
		
    	var iSchedule = this.getView().byId("table_schedule").getModel();
    	var iUser = this.getView().getModel("User");
    	var userList = iUser.oData.results; 
    	
		var strArrTmp 	= oEvent.oSource.sId.split("--");
		var cnt 		= strArrTmp.length - 1;
		var sIdstrTmp 	= strArrTmp[cnt];
		var strArr 		= sIdstrTmp.split("-");
		var sIdstr 		= strArr[0];
		
		var dept = ""; // Dept Code 
		var desc = ""; // Descriotion
		var user = ""; // MDG User ID(Internal)
		var sap  = ""; // SAP ID
		
		user = oEvent.getParameters().selectedItem.getProperty("key");

		for(var i=0; i<userList.length; i++){
        	if(userList[i].EmpId == user){
        		sap 	= userList[i].SapId;
        		dept	= userList[i].DeptCode;
        	}
        }

		if(sIdstr == "SchExamu"){
	    	iSchedule.oData.results[index].Examd 	= dept;
	    	iSchedule.oData.results[index].Examm 	= user; //MDG
	    	iSchedule.oData.results[index].Examu 	= sap;
		}else if(sIdstr == "SchInsp01u"){
	    	iSchedule.oData.results[index].Insp01d 	= dept;
	    	iSchedule.oData.results[index].Insp01m 	= user; //MDG
	    	iSchedule.oData.results[index].Insp01u 	= sap;
		}else if(sIdstr == "SchInsp02u"){
	    	iSchedule.oData.results[index].Insp02d 	= dept;
	    	iSchedule.oData.results[index].Insp02m 	= user; //MDG
	    	iSchedule.oData.results[index].Insp02u 	= sap;
		}else if(sIdstr == "SchInsp03u"){
	    	iSchedule.oData.results[index].Insp03d 	= dept;
	    	iSchedule.oData.results[index].Insp03m 	= user; //MDG
	    	iSchedule.oData.results[index].Insp03u 	= sap;
		}else if(sIdstr == "SchInsp04u"){
	    	iSchedule.oData.results[index].Insp04d 	= dept;
	    	iSchedule.oData.results[index].Insp04m 	= user; //MDG
	    	iSchedule.oData.results[index].Insp04u 	= sap;
		}else if(sIdstr == "SchInsp05u"){
	    	iSchedule.oData.results[index].Insp05d 	= dept;
	    	iSchedule.oData.results[index].Insp05m 	= user; //MDG
	    	iSchedule.oData.results[index].Insp05u 	= sap;
		}else if(sIdstr == "SchExam01u"){
	    	iSchedule.oData.results[index].Exam01d 	= dept;
	    	iSchedule.oData.results[index].Exam01m 	= user; //MDG
	    	iSchedule.oData.results[index].Exam01u 	= sap;
		}else if(sIdstr == "SchExam02u"){
	    	iSchedule.oData.results[index].Exam02d 	= dept;
	    	iSchedule.oData.results[index].Exam02m 	= user; //MDG
	    	iSchedule.oData.results[index].Exam02u 	= sap;
		}else if(sIdstr == "SchExam03u"){
	    	iSchedule.oData.results[index].Exam03d 	= dept;
	    	iSchedule.oData.results[index].Exam03m 	= user; //MDG
	    	iSchedule.oData.results[index].Exam03u 	= sap;
		}else if(sIdstr == "SchExam04u"){
	    	iSchedule.oData.results[index].Exam04d 	= dept;
	    	iSchedule.oData.results[index].Exam04m 	= user; //MDG
	    	iSchedule.oData.results[index].Exam04u 	= sap;
		}else if(sIdstr == "SchExam05u"){
	    	iSchedule.oData.results[index].Exam05d 	= dept;
	    	iSchedule.oData.results[index].Exam05m 	= user; //MDG
	    	iSchedule.oData.results[index].Exam05u 	= sap;
		}

		iSchedule.refresh();	
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
//                    "Add4" : oData.results[i].Add4,
//                    "Add5" : oData.results[i].Add5
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
//      ""  1.234.567,89
//      X  1,234,567.89
//      Y  1 234 567,89
      this.decimalFormat = this.get_Auth("DECFOR")[0].Value;
      this.sep        = this.get_Auth("SEP")[0].Value;
    },
    
    setInitData : function(){
		
		var Pdate = this.getView().byId("PlanDate");
		Pdate.setDisplayFormat(this.dateFormat);
		Pdate.setValueFormat("yyyyMMdd");
		
		// 2. Master Selection ------------------------
		var iWerks = this.oArgs.iWerks;
		var iSpmon = this.oArgs.iGjahr + this.oArgs.iPerde;
		
        var oModel 	= this.getView().getModel();

		var controll = this;
		
        var path 		= "/MasterMainSet(Werks='" + iWerks + "',Spmon='" + iSpmon + "',NewInd=" + this.oArgs.iNew + ",Round='" + this.oArgs.iRound + "')";        
        var mParameters = {
  				urlParameters : {
  					"$expand" : "NavUser,NavSloc,Nav2160"
  				},
  				success : function(oData) {
  					if(oData.Rttyp != "E"){

						var oUser =  new sap.ui.model.json.JSONModel();
						oUser.setData(oData.NavUser);
						oUser.setSizeLimit(oData.NavUser.results.length);
						this.getView().setModel(oUser, 'User');
												
						// 1.1 Header Info Seting --------------------
						var oHeader = new JSONModel(
						  { 
							  Werks 	: this.oArgs.iWerks,
							  Gjahr 	: this.oArgs.iGjahr,
							  Perde		: this.oArgs.iPerde,
							  Round 	: this.oArgs.iRound,
							  Pdate     : this.oArgs.iPlanDate,
							  Admin 		: this.oArgs.iAdmin,
							  AdminSapId	: this.oArgs.iAdmin,
							  AdminDept		: this.oArgs.iAdminD,
							  AdminDesc 	: this.oArgs.iAdminT,
							  AdminPortal 	: this.oArgs.iAdminP,
							  AdminUser 	: this.oArgs.iAdminM,
							  DeptCrg   : oData.DeptCrg,
							  Creator   : oData.Creator,
							  Agrade : oData.Agrade,
							  Bgrade : oData.Bgrade,
							  Cgrade : oData.Cgrade,
							  NotAss : oData.NotAss,
							  TotalInfo : oData.TotalInfo,
							  TotalCnt  : Math.ceil(parseFloat(oData.TotalCnt)),
							  AuditCnt  : Math.ceil(parseFloat(oData.AuditCnt)),
							  StockDateS : oData.StockDate,
							  StockTimeS : oData.StockTime,
							  StockDateL : oData.StockDateL,
							  StockTimeL : oData.StockTimeL,
							  StockInfo  : oData.StockInfo,
							  Status : oData.Status,
							  deptSize 	: 10,
							  schSize 	: 10
						  } 
						);	

						this.getView().setModel(oHeader, 'header');

						// Table List Bind.
						this.NavSloc = [];
						this.NavSloc = oData.NavSloc;
						this.Nav2160 = [];
						this.Nav2160 = oData.Nav2160;
						this.CalcMengeList();						

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
  		oModel.read(path, mParameters);
    },


	getTodayStr : function () {
		var today = new Date();
		var year = today.getFullYear();
		var month = ('0' + (today.getMonth() + 1)).slice(-2);
		var day   = ('0' + today.getDate()).slice(-2);
		var Pdate = year + month + day;

		return Pdate;
	},

	onBtnCopy : function(){
		var controll = this;

		MessageBox.confirm("Do you want to create a copy of a new plan based on this plan?", 
			{ 
				onClose : function(oAction){
					if(oAction=="OK"){
						controll.copyPlanData();
					}else{
						return false;
					}
				},
				styleClass: "",
				initialFocus: MessageBox.Action.OK,
				textDirection : sap.ui.core.TextDirection.Inherit 
			}
		);
    },
	  
    copyPlanData : function(){
		
		var oHead = this.getModel("header").getData();
		
		var iWerks = oHead.Werks;
		var iSpmon = oHead.Gjahr + oHead.Perde;
		var iRound = oHead.Round;
		var iNew   = true;
		// Round 값이 있는데 New=true 인 경우는 복사생성으로 게이트웨이에서 인식하도록 해놓음. 
		
        var oModel 	= this.getView().getModel();
		
        var path 		= "/MasterMainSet(Werks='" + iWerks + "',Spmon='" + iSpmon + "',NewInd=" + iNew + ",Round='" + iRound + "')";
        var mParameters = {
  				urlParameters : {
  					"$expand" : "NavSloc,Nav2160"
  				},
  				success : function(oData) {
  					if(oData.Rttyp != "E"){


						var today = this.getTodayStr();
						
						// 1.1 Header Info Seting --------------------
						var oHeader = new JSONModel(
						  { 
							  Werks 	: oData.Werks,
							  Gjahr 	: today.substr(0,4),
							  Perde		: today.substr(4,2),
							  Round 	: "0",
							  Pdate     : today,
							  AdminSapId	: oData.AdminS,
							  AdminPortal 	: oData.AdminP,
							  AdminUser 	: oData.AdminM,
							  DeptCrg   : oData.DeptCrg,
							  Creator   : oData.Creator,
							  Agrade : oData.Agrade,
							  Bgrade : oData.Bgrade,
							  Cgrade : oData.Cgrade,
							  NotAss : oData.NotAss,
							  TotalInfo : oData.TotalInfo,
							  TotalCnt  : Math.ceil(parseFloat(oData.TotalCnt)),
							  AuditCnt  : Math.ceil(parseFloat(oData.AuditCnt)),
							  TargetCnt : Math.ceil(parseFloat(oData.TargetCnt)),
							  StockDateS : oData.StockDate,
							  StockTimeS : oData.StockTime,
							  StockDateL : oData.StockDateL,
							  StockTimeL : oData.StockTimeL,
							  StockInfo  : oData.StockInfo,
							  Status : oData.Status,
							  deptSize 	: 10,
							  schSize 	: 10
						  } 
						);	

						this.getView().setModel(oHeader, 'header');

						// Table List Bind.
						this.NavSloc = [];
						this.NavSloc = oData.NavSloc;
						this.Nav2160 = [];
						this.Nav2160 = oData.Nav2160;
						this.CalcMengeList();

						this.set_displayMode("C");	

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
  		oModel.read(path, mParameters);
    },

	CalcMengeList : function () {
		var oHeader = this.getModel("header").getData();
		var countAudit = 0;

		for (let i = 0; i < this.NavSloc.results.length; i++) {

			if (oHeader.Status == "") { // Live Stock Adjust.
				this.NavSloc.results[i].Menge = 0;

				if (oHeader.Agrade) {
					this.NavSloc.results[i].Menge = 
						this.NavSloc.results[i].Menge + parseFloat(this.NavSloc.results[i].MengeA);
				}
	
				if (oHeader.Bgrade) {
					this.NavSloc.results[i].Menge = 
						this.NavSloc.results[i].Menge + parseFloat(this.NavSloc.results[i].MengeB);
				}
	
				if (oHeader.Cgrade) {
					this.NavSloc.results[i].Menge = 
						this.NavSloc.results[i].Menge + parseFloat(this.NavSloc.results[i].MengeC);
				}
	
				if (oHeader.NotAss) {
					this.NavSloc.results[i].Menge = 
						this.NavSloc.results[i].Menge + parseFloat(this.NavSloc.results[i].MengeN);
				}
			}else{
				this.NavSloc.results[i].Menge = parseFloat(this.NavSloc.results[i].Menge);
			}

			if (this.NavSloc.results[i].AdtFlag) {
				countAudit = countAudit + this.NavSloc.results[i].Menge;
			}
		}

		
		if (oHeader.Status == "P") {
			oHeader.MessageStrip = "Target : " + countAudit + " / Result : " + oHeader.AuditCnt;
		}else{
			oHeader.MessageStrip = "Total : " + oHeader.TotalCnt + " / Target : "+ countAudit + " ";	
		}

		oHeader.TargetCnt = countAudit;
		
		var oTotal = this.getView().byId("MsgStrip");
		if (oTotal) {
			oTotal.setText(oHeader.MessageStrip);
		}
		
		var oTable = this.getView().byId("table_schedule");
		
		var oSloc =  new JSONModel;
		oSloc.setData(this.NavSloc);

		oTable.setModel(oSloc);
		oTable.bindRows("/results");

		// this.onRefresh();
		
	},
	  
	  
	onRefresh : function(oEvent){
		var oTable = this.getView().byId("table_schedule");
		
		var oSloc =  new JSONModel;
		oSloc.setData(this.NavSloc);

		oTable.setModel(oSloc);
		oTable.bindRows("/results");
		
	},
	  
	set_screen_mode : function(){
		var oView = this.getView();
			oView.setModel(new JSONModel({
				// werks 	     : false,  
				// gjahr 	     : true,
				// round 	     : false,
				// perde		 : true,
				admin 	     : true,
		        deptCrg      : true,
		        creator	     : true,
		        approve 	 : true,
		        save 		 : true,
				slocList     : true,
				actQty       : false,
				copy         : false
	        }), "screenMode");
	    },


    set_displayMode : function(vMode){
    	var screenModel = this.getView().getModel("screenMode");
    	var screenData = screenModel.getData();

        if(vMode == "C"){ // Create Mode
          	screenData.admin 	= true;
          	screenData.deptCrg 	= true;
          	screenData.creator	= true;
          	screenData.approve 	= false;
          	screenData.save 	= true;
			screenData.slocList = true;
			screenData.actQty   = false;
			screenData.copy     = false;
        }else if(vMode == "D"){   // Display mode
          	screenData.admin 	= false;
            screenData.deptCrg 	= false;
            screenData.creator	= false;
            screenData.approve	= false;
            screenData.save 	= false;
			screenData.slocList = false;
			screenData.actQty   = true;
			screenData.copy     = true;
        }else if(vMode == "U"){ // Change Mode
          	screenData.admin 	= true;
            screenData.deptCrg	= true;
            screenData.creator	= true;
            screenData.approve 	= true;
            screenData.save 	= true;
			screenData.slocList = true;			
			screenData.actQty   = false;
			screenData.copy     = false;
        }

        screenModel.refresh();
    },

    onNavBack: function (oEvent) {

    	var empty = new sap.ui.model.json.JSONModel();
    	empty.setData({});
		
		var oView = this.getView();
        oView.setModel(empty, "header")
        oView.setModel(empty, "User")
        
		var oTable = this.getView().byId("table_schedule");
		oTable.setModel(empty);
		oTable.bindRows("/results");

		sap.ui.getCore().byId("refresh")

//      this.getOwnerComponent().onNavBack(true);
      // in some cases we could display a certain target when the back button is pressed
      if (this.oArgs && this.oArgs.fromTarget) {
    	  this._router.getTargets().display(this.oArgs.fromTarget,{
    		  	iRefresh : true
    	  	}
    	  );
      }

      // delete this.oArgs;
      return;
      
      // call the parent's onNavBack
//      BaseController.prototype.onNavBack(this, arguments);
    },
    
    onBtnApprove : function(){
		var controll = this;

		MessageBox.confirm(this.i18n.getText("draftConfirm"), 
				{//title: "", 
			onClose : function(oAction){
				if(oAction=="OK"){
					controll.onSave("", "A");
				}else{
					return false;
				}
			},
			styleClass: "",
			initialFocus: MessageBox.Action.OK,
			textDirection : sap.ui.core.TextDirection.Inherit }
		);
    },
    
    onBtnSave : function(){
		var controll = this;

		MessageBox.confirm(this.i18n.getText("auditPlanSaveConf"), 
				{//title: "", 
			onClose : function(oAction){
				if(oAction=="OK"){
					controll.onSave("", "S");
				}else{
					return false;
				}
			},
			styleClass: "",
			initialFocus: MessageBox.Action.OK,
			textDirection : sap.ui.core.TextDirection.Inherit }
		);
    },

	onSave : function(oEvent, status){
		if(!this.checkMandatory(status)){
			return;
		}
		
		this.auditPlanSave(status);

	},

	auditPlanSave : function(iStat){
		
		debugger;
		
    	var data = {};
    	
    	data.NavHead 	= [];
    	data.NavSche 	= [];    	
		data.Nav2160 	= [];
    	data.NavReturn 	= [];
    	
    	var oHeader = this.getModel("header").getData();
    	var head = {};
    	
    	if(oHeader.Round == "0"){
        	data.Gubun = "N";
			oHeader.Gjahr = oHeader.Pdate.substr(0, 4);
			oHeader.Perde = oHeader.Pdate.substr(4, 2);
    	}else{
			if (iStat == "A") { // Draft
				data.Gubun = "A";
			}else{ // just save.
				data.Gubun = "S";	
			}

		}

    	head.Werks   = oHeader.Werks;
    	head.Round 	 = oHeader.Round;
		head.Spmon   = oHeader.Gjahr + oHeader.Perde;
    	head.DeptCrg = this.getView().byId("DeptCrg").getValue();	
    	head.Admin 	 = oHeader.AdminSapId; 	// SAP ID
    	head.AdminP	 = oHeader.AdminPortal; 	// Portal ID
    	head.AdminM	 = oHeader.AdminUser; 	// MDG ID

		head.Agrade = oHeader.Agrade;
		head.Bgrade = oHeader.Bgrade;
		head.Cgrade = oHeader.Cgrade;
		head.NotAss = oHeader.NotAss;

		head.PlanDate   = oHeader.Pdate;
		head.StockDate  = oHeader.StockDateS;
		head.StockTime  = oHeader.StockTimeS;
		head.StockDateL = oHeader.StockDateL;
		head.StockTimeL = oHeader.StockTimeL;

		head.TargetCnt  = oHeader.TargetCnt.toString();
		head.TotalCnt   = oHeader.TotalCnt.toString();
		
    	data.NavHead.push(head);

    	var oSchedule = this.getView().byId("table_schedule");
		if(oSchedule.getModel().oData){
	    	var iSchList = oSchedule.getModel().oData.results;
		}
		
		for(var i=0; i<iSchList.length; i++){
			if(iSchList[i].AdtFlag && iSchList[i].Lgort != ""){
				var schedule = {};
				
				schedule.Lgort = iSchList[i].Lgort;
				schedule.Menge = iSchList[i].Menge.toString();
				schedule.Meins = iSchList[i].Meins;

				schedule.Insp01d = iSchList[i].Insp01d;
				schedule.Insp01u = iSchList[i].Insp01u;
				schedule.Insp01m = iSchList[i].Insp01m;
				schedule.Insp02d = iSchList[i].Insp02d;
				schedule.Insp02u = iSchList[i].Insp02u;
				schedule.Insp02m = iSchList[i].Insp02m;
				schedule.Insp03d = iSchList[i].Insp03d;
				schedule.Insp03u = iSchList[i].Insp03u;
				schedule.Insp03m = iSchList[i].Insp03m;
				schedule.Insp04d = iSchList[i].Insp04d;
				schedule.Insp04u = iSchList[i].Insp04u;
				schedule.Insp04m = iSchList[i].Insp04m;
				schedule.Insp05d = iSchList[i].Insp05d;
				schedule.Insp05u = iSchList[i].Insp05u;
				schedule.Insp05m = iSchList[i].Insp05m;

				schedule.Exam01d = iSchList[i].Exam01d;
				schedule.Exam01u = iSchList[i].Exam01u;
				schedule.Exam01m = iSchList[i].Exam01m;
				schedule.Exam02d = iSchList[i].Exam02d;
				schedule.Exam02u = iSchList[i].Exam02u;
				schedule.Exam02m = iSchList[i].Exam02m;
				schedule.Exam03d = iSchList[i].Exam03d;
				schedule.Exam03u = iSchList[i].Exam03u;
				schedule.Exam03m = iSchList[i].Exam03m;
				schedule.Exam04d = iSchList[i].Exam04d;
				schedule.Exam04u = iSchList[i].Exam04u;
				schedule.Exam04m = iSchList[i].Exam04m;
				schedule.Exam05d = iSchList[i].Exam05d;
				schedule.Exam05u = iSchList[i].Exam05u;
				schedule.Exam05m = iSchList[i].Exam05m;
				
				schedule.Chiefd = iSchList[i].Chiefd;
				schedule.Chiefu = iSchList[i].Chiefu;
				schedule.Chiefm = iSchList[i].Chiefm;			
	
				data.NavSche.push(schedule);				
			}
		}		

		for(var j=0;j<this.Nav2160.results.length;j++){

			data.Nav2160.push(this.Nav2160.results[j]);
			
			// if (oHeader.Agrade) {
			// 	if (this.Nav2160.results[j].Maabc == "A") {
			// 		data.Nav2160.push(this.Nav2160.results[j]);
			// 	}
			// }

			// if (oHeader.Bgrade) {
			// 	if (this.Nav2160.results[j].Maabc == "B") {
			// 		data.Nav2160.push(this.Nav2160.results[j]);
			// 	}
			// }

			// if (oHeader.Cgrade) {
			// 	if (this.Nav2160.results[j].Maabc == "C") {
			// 		data.Nav2160.push(this.Nav2160.results[j]);
			// 	}
			// }

			// if (oHeader.NotAss) {
			// 	if (this.Nav2160.results[j].Maabc == "") {
			// 		data.Nav2160.push(this.Nav2160.results[j]);
			// 	}
			// }
		}
			
			// 3. save process
    	var oSaveModel = this.getView().getModel();
    	
		var mParameters = {
			success : function(oData) {
				
				debugger;
				var message  = oData.NavReturn.results[0].Rtmsg;
				var appr_url = oData.NavReturn.results[0].Zpturl;

				// NavReturn 의 가공 형태에 따라 알맞게 수정. 
				if(oData.NavReturn.results[0].Rttyp == "E"){
					sap.m.MessageBox.show(  message,
											sap.m.MessageBox.Icon.ERROR,
											this.i18n.getText("Error") );
				}else{
					sap.m.MessageBox.show(  message, 
								            sap.m.MessageBox.Icon.SUCCESS, 
								            this.i18n.getText("Success") );

			    	var oHeader = this.getModel("header").getData();

					oHeader.Werks = oData.NavReturn.results[0].Werks;
					oHeader.Spmon = oData.NavReturn.results[0].Spmon;
					oHeader.Round = oData.NavReturn.results[0].Round;

					if (oData.Gubun == 'A') {
						this.set_displayMode("D");	
						if(appr_url){     // 전자결재 URL 리턴 시 새창
							this.openWin(appr_url);
						}						
					}else{
						this.set_displayMode("U");	
					}
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

		oSaveModel.create("/PlanMainSet", data, mParameters);	
	},
		
	openWin : function(sPath){
		var html = new sap.ui.core.HTML();

		$(document).ready(function(){
			window.open(sPath);
		});
	},	
	
    checkMandatory : function(status){
    	var iHeader = this.getView().getModel("header");

    	var iWerks = iHeader.oData.Werks; 
    	if(!iWerks){
    		MessageToast.show(this.i18n.getText("err_werks"));
    		return false;
    	}
    	
    	var iGjahr = iHeader.oData.Gjahr; 
    	if(!iGjahr){
    		MessageToast.show(this.i18n.getText("err_gjahr"));
    		return false;
    	}

		var err = false;
		var msg = "";
		
		if (status == "A") {
	    	var oSchedule = this.getView().byId("table_schedule");
			if(oSchedule.getModel().oData){
	
				var iSchList = oSchedule.getModel().oData.results;
	
				for(var i=0; i<iSchList.length; i++){
					if(iSchList[i].AdtFlag){
						if (iSchList[i].Chiefm == "") {
							msg = iSchList[i].Lgort + " - Chief is missing."
				    		MessageBox.show( msg, MessageBox.Icon.ERROR, "Error" );
							err = true;
							break;
						}

						if (iSchList[i].Menge == 0) {
							msg = iSchList[i].Lgort + " - Count is zero."
				    		MessageBox.show( msg, MessageBox.Icon.ERROR, "Error" );
							err = true;
							break;
						}

						if (iSchList[i].Exam01m != "" || iSchList[i].Insp01m != "") {
							if (iSchList[i].Exam01m == "" || iSchList[i].Insp01m == "") {
								msg = iSchList[i].Lgort + " - Audited and Auditor must be entered together."
					    		MessageBox.show( msg, MessageBox.Icon.ERROR, "Error" );
								err = true;
								break;								
							}
						}
						if (iSchList[i].Exam02m != "" || iSchList[i].Insp02m != "") {
							if (iSchList[i].Exam02m == "" || iSchList[i].Insp02m == "") {
								msg = iSchList[i].Lgort + " - Audited and Auditor must be entered together."
					    		MessageBox.show( msg, MessageBox.Icon.ERROR, "Error" );
								err = true;
								break;								
							}
						}
						if (iSchList[i].Exam03m != "" || iSchList[i].Insp03m != "") {
							if (iSchList[i].Exam03m == "" || iSchList[i].Insp03m == "") {
								msg = iSchList[i].Lgort + " - Audited and Auditor must be entered together."
					    		MessageBox.show( msg, MessageBox.Icon.ERROR, "Error" );
								err = true;
								break;								
							}
						}
						if (iSchList[i].Exam04m != "" || iSchList[i].Insp04m != "") {
							if (iSchList[i].Exam04m == "" || iSchList[i].Insp04m == "") {
								msg = iSchList[i].Lgort + " - Audited and Auditor must be entered together."
					    		MessageBox.show( msg, MessageBox.Icon.ERROR, "Error" );
								err = true;
								break;								
							}
						}
						if (iSchList[i].Exam05m != "" || iSchList[i].Insp05m != "") {
							if (iSchList[i].Exam05m == "" || iSchList[i].Insp05m == "") {
								msg = iSchList[i].Lgort + " - Audited and Auditor must be entered together."
					    		MessageBox.show( msg, MessageBox.Icon.ERROR, "Error" );
								err = true;
								break;								
							}
						}
					}
				}
			}			
		}

		
		if (err) {
			return false;
		}else{
	    	return true;			
		}
    },

	onDownloadExcel : function(oEvent){
		var oModel, oTable, sFilename, v_werks;
		
		
		v_werks = this.getView().byId("Werks").getValue();
		oTable = this.getView().byId("table_schedule");
		oModel = oTable.getModel();
		sFilename = "File";
		
		utils.makeExcel(oModel, oTable, sFilename, v_werks);
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
        window.location.replace("/sap/bc/ui5_ui5/sap/ypm_ui_m002/index.html");}, 100);
    }

  });
}
);