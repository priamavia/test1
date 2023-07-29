sap.ui.define([
               "cj/pm_m050/controller/BaseController",
               "cj/pm_m050/util/ValueHelpHelper",
               "cj/pm_m050/util/utils",
               "cj/pm_m050/model/formatter",
               "sap/ui/Device",
               "sap/ui/core/Fragment",
               "sap/ui/model/Filter",
               "sap/ui/model/FilterOperator",
               "sap/ui/model/json/JSONModel",
               "sap/m/MessageBox",
               "sap/m/MessageToast",
               "jquery.sap.global"
               ], function (BaseController, ValueHelpHelper, utils, formatter, Device, Fragment, 
                   Filter, FilterOperator, JSONModel, MessageBox, MessageToast, jQuery) {
  "use strict";

  return BaseController.extend("cj.pm_m050.controller.Detail", {
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

		this.byId("Adm01").setFilterFunction(function (sTerm, oItem) {
			// A case-insensitive "string contains" style filter
			return oItem.getText().match(new RegExp(sTerm, "i"));
		});
		
		this.byId("Adm02").setFilterFunction(function (sTerm, oItem) {
			// A case-insensitive "string contains" style filter
			return oItem.getText().match(new RegExp(sTerm, "i"));
		});
		
//		this.byId("Kostl").setFilterFunction(function (sTerm, oItem) {
//			// A case-insensitive "string contains" style filter
//			return oItem.getText().match(new RegExp(sTerm, "i"));
//		});		
//		
//		this.byId("Inspu").setFilterFunction(function (sTerm, oItem) {
//			// A case-insensitive "string contains" style filter
//			return oItem.getText().match(new RegExp(sTerm, "i"));
//		});		
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
//      debugger;
//      this.i18n = this.getView().getModel("i18n").getResourceBundle();

//      this.getLoginInfo();
//      this.setInitData();
//      this.set_screen_mode();
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

	onSuggestionItemSelected: function (oEvent) {
		var oItem = oEvent.getParameter("selectedItem");
		var oText = oItem ? oItem.getKey() : "";
		
    	var iHeader = this.getView().getModel("header");
    	var iDept = this.getView().getModel("Dept");
    	var deptList = iDept.oData.results; 
    	var iUser = this.getView().getModel("User");
    	var userList = iUser.oData.results; 
    	
		var strArr = oEvent.oSource.sId.split("--");
		var cnt = strArr.length - 1;
		var sIdstr = strArr[cnt];
		
		var dept = ""; // Dept Code 
		var desc = ""; // Descriotion
		var user = ""; // MDG User ID(Internal)
		var sap  = ""; // SAP ID
		var port = ""; // Wise Portal ID

		dept = oEvent.getParameters().selectedItem.getProperty("additionalText");
		user = oEvent.getParameters().selectedItem.getProperty("key");

        for(var i=0; i<userList.length; i++){
        	if(userList[i].EmpId == user){
        		sap 	= userList[i].SapId;
        		port 	= userList[i].PortalId;
        	}
        }
		
        for(var i=0; i<deptList.length; i++){
        	if(deptList[i].DeptCode == dept){
        		desc 	= deptList[i].DeptText;
        	}
        }
        
		if(sIdstr == "Admin"){
	    	iHeader.oData.AdminDept 	= dept;
	    	iHeader.oData.AdminUser 	= user;
	    	iHeader.oData.AdminDesc 	= desc;
	    	iHeader.oData.AdminSapId 	= sap;
	    	iHeader.oData.AdminPortal 	= port;	    	
		}else if(sIdstr == "Adm01"){
	    	iHeader.oData.Adm01Dept 	= dept;
	    	iHeader.oData.Adm01User 	= user;
	    	iHeader.oData.Adm01Desc 	= desc;
	    	iHeader.oData.Adm01SapId 	= sap;
	    	iHeader.oData.Adm01Portal 	= port;	    	
		}else if(sIdstr == "Adm02"){
	    	iHeader.oData.Adm02Dept 	= dept;
	    	iHeader.oData.Adm02User 	= user;
	    	iHeader.oData.Adm02Desc 	= desc;
	    	iHeader.oData.Adm02SapId 	= sap;
	    	iHeader.oData.Adm02Portal 	= port;	    	
		}
		
		this.getView().setModel(iHeader, 'header');	
	},

	onOfficeItemSelected: function (oEvent) {
		var index = oEvent.getSource().getParent().getIndex();
		var oItem = oEvent.getParameter("selectedItem");
		var oText = oItem ? oItem.getKey() : "";
		
    	var iOffice = this.getView().byId("table_officerList").getModel();
    	var iDept = this.getView().getModel("Dept");
    	var deptList = iDept.oData.results; 
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
		var port = ""; // Wise Portal ID
		var kostlList = [];
		
		user = oEvent.getParameters().selectedItem.getProperty("key");

		for(var i=0; i<userList.length; i++){
        	if(userList[i].EmpId == user){
        		sap 	= userList[i].SapId;
        		port 	= userList[i].PortalId;
        		dept	= userList[i].DeptCode;
        		desc	= userList[i].DeptNameEn;
        		
    	    	var kostlData = {};
    	    	kostlData.Key = dept;
    	    	kostlData.KeyName = desc;
    	    	kostlList.push(kostlData);
        	}
        }

		if(sIdstr == "Insp"){
	    	iOffice.oData.results[index].InspuDept 		= dept;
	    	iOffice.oData.results[index].Inspm 		= user;
	    	iOffice.oData.results[index].Inspd 		= desc;
	    	iOffice.oData.results[index].Inspu 	= sap;
	    	iOffice.oData.results[index].InspuPortal 	= port;
	    	iOffice.oData.results[index].InspuKostlList = kostlList;        		

	    	if(iOffice.oData.results[index].InspuKostlList.length > 1){
	    		iOffice.oData.results[index].InspuEnable = true;
	    	}else{
	    		iOffice.oData.results[index].InspuEnable = false;
	    	}
		}else if(sIdstr == "Exam"){
	    	iOffice.oData.results[index].ExamuDept 		= dept;
	    	iOffice.oData.results[index].Examm 		= user;
	    	iOffice.oData.results[index].Examd 		= desc;
	    	iOffice.oData.results[index].Examu 	= sap;
	    	iOffice.oData.results[index].ExamuPortal 	= port;
	    	iOffice.oData.results[index].ExamuKostlList = kostlList;        		
	    	
	    	if(iOffice.oData.results[index].ExamuKostlList.length > 1){
	    		iOffice.oData.results[index].ExamuEnable = true;
	    	}else{
	    		iOffice.oData.results[index].ExamuEnable = false;
	    	}	    	
		}else if(sIdstr == "Join"){
	    	iOffice.oData.results[index].JoinuDept 		= dept;
	    	iOffice.oData.results[index].Joinm 		= user;
	    	iOffice.oData.results[index].Joind 		= desc;
	    	iOffice.oData.results[index].Joinu 	= sap;
	    	iOffice.oData.results[index].JoinuPortal 	= port;
	    	iOffice.oData.results[index].JoinuKostlList = kostlList;        		

	    	if(iOffice.oData.results[index].JoinuKostlList.length > 1){
	    		iOffice.oData.results[index].JoinuEnable = true;
	    	}else{
	    		iOffice.oData.results[index].JoinuEnable = false;
	    	}	    		    	
		}
		
		iOffice.refresh();	
	},

	onScheduleItemSelected: function (oEvent) {
		var index = oEvent.getSource().getParent().getIndex();
		var oItem = oEvent.getParameter("selectedItem");
		var oText = oItem ? oItem.getKey() : "";
		
    	var iSchedule = this.getView().byId("table_schedule").getModel();
    	var iDept = this.getView().getModel("Dept");
    	var deptList = iDept.oData.results; 
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
		var port = ""; // Wise Portal ID
		var kostlList = [];
		
		user = oEvent.getParameters().selectedItem.getProperty("key");

		for(var i=0; i<userList.length; i++){
        	if(userList[i].EmpId == user){
        		sap 	= userList[i].SapId;
        		port 	= userList[i].PortalId;
        		dept	= userList[i].DeptCode;
        		desc	= userList[i].DeptNameEn;
        	}
        }

		if(sIdstr == "SchInspu"){
	    	iSchedule.oData.results[index].InspuDept 	= dept;
	    	iSchedule.oData.results[index].InspuUser 	= user; //MDG
	    	iSchedule.oData.results[index].InspuDesc 	= desc;
	    	iSchedule.oData.results[index].InspuSapId 	= sap;
	    	iSchedule.oData.results[index].InspuPortal 	= port;

		}else if(sIdstr == "SchExamu"){
	    	iSchedule.oData.results[index].ExamuDept 	= dept;
	    	iSchedule.oData.results[index].ExamuUser 	= user; //MDG
	    	iSchedule.oData.results[index].ExamuDesc 	= desc;
	    	iSchedule.oData.results[index].ExamuSapId 	= sap;
	    	iSchedule.oData.results[index].ExamuPortal 	= port;

		}else if(sIdstr == "SchJoinu"){
	    	iSchedule.oData.results[index].JoinuDept 	= dept;
	    	iSchedule.oData.results[index].JoinuUser 	= user; //MDG
	    	iSchedule.oData.results[index].JoinuDesc 	= desc;
	    	iSchedule.oData.results[index].JoinuSapId 	= sap;
	    	iSchedule.oData.results[index].JoinuPortal 	= port;

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
    
    /*
     * Plan Date Default Setting 
     */
    setInitData : function(){
    	
    	// 1. Year Setting ----------------------------
		var oGjahr = this.getView().byId("Gjahr");
		var maxYear = this.sysDate.substr(0,4); 
		maxYear++;
		
		var minYear = maxYear;
		for(var i=0; i<10; i++){	
			var template = new sap.ui.core.Item();
		    template.setKey(minYear);
	        template.setText(minYear);
            oGjahr.addItem(template);				
			minYear--;				
		}
    	
		// 2. Master Selection ------------------------
		var iGsber = this.oArgs.iGsber;
		
        var oModel 	= this.getView().getModel();
        var path 		= "/MasterMainSet(Gsber='" + iGsber + "',NewInd=" + this.oArgs.iNew + ",Round='" + this.oArgs.iRound + "')";        
        var mParameters = {
  				urlParameters : {
  					"$expand" : "NavUser,NavDept,NavCctr,NavCctrAsset"
  				},
  				success : function(oData) {
  					if(oData.Rttyp != "E"){
						var oDept =  new sap.ui.model.json.JSONModel();
						oDept.setData(oData.NavDept);
						this.getView().setModel(oDept, 'Dept');						

						var oUser =  new sap.ui.model.json.JSONModel();
						oUser.setData(oData.NavUser);
						this.getView().setModel(oUser, 'User');

						for(var i=0; i<oData.NavCctr.results.length; i++){
							var kostlList = [];
							
							for(var j=0; j<oData.NavUser.results.length; j++){
								if(oData.NavCctr.results[i].Inspm != ""){
									if(oData.NavCctr.results[i].Inspm == oData.NavUser.results[j].EmpId){
										var kostl = {};
										kostl.Key 		= oData.NavUser.results[j].DeptCode;
										kostl.KeyName 	= oData.NavUser.results[j].DeptNameEn;										
										kostlList.push(kostl);
									}	
								}
							}
							
							oData.NavCctr.results[i].InspuKostlList = kostlList;
					    	if(kostlList.length > 1){
					    		oData.NavCctr.results[i].InspuEnable = true;
					    	}else{
					    		oData.NavCctr.results[i].InspuEnable = false;
					    	}	
							
							var kostlList = [];
							
							for(var j=0; j<oData.NavUser.results.length; j++){
								if(oData.NavCctr.results[i].Examm != ""){
									if(oData.NavCctr.results[i].Examm == oData.NavUser.results[j].EmpId){
										var kostl = {};
										kostl.Key 		= oData.NavUser.results[j].DeptCode;
										kostl.KeyName 	= oData.NavUser.results[j].DeptNameEn;										
										kostlList.push(kostl);
									}	
								}
							}
							
							oData.NavCctr.results[i].ExamuKostlList = kostlList;
					    	if(kostlList.length > 1){
					    		oData.NavCctr.results[i].ExamuEnable = true;
					    	}else{
					    		oData.NavCctr.results[i].ExamuEnable = false;
					    	}
					    	
							var kostlList = [];
							
							for(var j=0; j<oData.NavUser.results.length; j++){
								if(oData.NavCctr.results[i].Joinm != ""){
									if(oData.NavCctr.results[i].Joinm == oData.NavUser.results[j].EmpId){
										var kostl = {};
										kostl.Key 		= oData.NavUser.results[j].DeptCode;
										kostl.KeyName 	= oData.NavUser.results[j].DeptNameEn;										
										kostlList.push(kostl);
									}	
								}
							}
							
							oData.NavCctr.results[i].JoinuKostlList = kostlList;
					    	if(kostlList.length > 1){
					    		oData.NavCctr.results[i].JoinuEnable = true;
					    	}else{
					    		oData.NavCctr.results[i].JoinuEnable = false;
					    	}
						}
						
						var oCctr =  new sap.ui.model.json.JSONModel();
						oCctr.setData(oData.NavCctr);
						this.getView().setModel(oCctr, 'Cctr');
						
						var oTable = this.getView().byId("table_officerList");
						oTable.setModel(oCctr);
						oTable.bindRows("/results");
						
						var oTable = this.getView().byId("table_schedule");
						var oAsst =  new sap.ui.model.json.JSONModel();
						oAsst.setData(oData.NavCctrAsset);
						oTable.setModel(oAsst);
						oTable.bindRows("/results");
						
						// 1.1 Header Info Seting --------------------
						var oHeader = new JSONModel(
						  { 
							  Gsber 		: this.oArgs.iGsber,
							  Gjahr 		: this.oArgs.iGjahr,
							  Round 		: this.oArgs.iRound,
							  Admin 		: this.oArgs.iAdmin,
							  Adm01 		: this.oArgs.iAdm01,
							  Adm02 		: this.oArgs.iAdm02,
							  AdminSapId	: this.oArgs.iAdmin,
							  Adm01SapId	: this.oArgs.iAdm01,
							  Adm02SapId	: this.oArgs.iAdm02,							  
							  AdminDept		: this.oArgs.iAdminD,
							  Adm01Dept 	: this.oArgs.iAdm01D,
							  Adm02Dept 	: this.oArgs.iAdm02D,
							  AdminDesc 	: this.oArgs.iAdminT,
							  Adm01Desc 	: this.oArgs.iAdm01T,
							  Adm02Desc 	: this.oArgs.iAdm02T,
							  AdminPortal 	: this.oArgs.iAdminP,
							  Adm01Portal 	: this.oArgs.iAdm01P,
							  Adm02Portal 	: this.oArgs.iAdm02P,
							  AdminUser 	: this.oArgs.iAdminM,
							  Adm01User		: this.oArgs.iAdm01M,
							  Adm02User		: this.oArgs.iAdm02M,			  
							  deptSize 	: 15,
							  schSize 	: 15
						  } 
						);		
						this.getView().setModel(oHeader, 'header');							
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

    set_screen_mode : function(){
        var oView = this.getView();

        oView.setModel(new JSONModel({
      	gsber 	: false,  
          gjahr 	: true,    //  생성  : true, 변경 : false
          round 	: false,
          admin 	: true,      //  생성  : true, 변경 : true, 조회 : false
          adm01 	: true,
          adm02 	: true,
          approve 	: true,
          save 		: true,
        }), "screenMode");
    },


    set_displayMode : function(vMode){
    	var screenModel = this.getView().getModel("screenMode");
    	var screenData = screenModel.getData();

        if(vMode == "C"){ // Create Mode
          screenData.gsber 	= false;
          screenData.gjahr 	= true;
          screenData.round 	= false;
          screenData.admin 	= true;
          screenData.adm01	= true;
          screenData.adm02 	= true;
          screenData.approve 	= false;
          screenData.save 	= true;
        }else if(vMode == "D"){   // Display mode
            screenData.gsber 		= false;
            screenData.gjahr 		= false;
            screenData.round 		= false;
            screenData.admin 		= false;
            screenData.adm01		= false;
            screenData.adm02 		= false;
            screenData.approve 		= false;
            screenData.save 		= false;
        }else if(vMode == "U"){ // Change Mode
            screenData.gsber 		= false;
            screenData.gjahr 		= false;
            screenData.round 		= false;
            screenData.admin 		= true;
            screenData.adm01		= true;
            screenData.adm02 		= true;
            screenData.approve 		= true;
            screenData.save 		= true;
        }

        screenModel.refresh();
    },

    listBack: function () {
    	var oView = this.getView();
        var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
        oODataJSONModel.setData({});
        oView.setModel(oODataJSONModel, "header")
        
    	var empty = new sap.ui.model.json.JSONModel();
    	empty.setData({});
    	
		var oTable = this.getView().byId("table_officerList");
		oTable.setModel(empty);
		oTable.bindRows("/results");
		
		var oTable = this.getView().byId("table_schedule");
		oTable.setModel(empty);
		oTable.bindRows("/results");

		sap.ui.getCore().byId("refresh")

//    	      this.getOwnerComponent().onNavBack(true);
      // in some cases we could display a certain target when the back button is pressed
      if (this.oArgs && this.oArgs.fromTarget) {
    	  this._router.getTargets().display(this.oArgs.fromTarget,{
    		  	iGsber  : this.oArgs.Gsber,
    		  	iGjahr  : this.oArgs.Gjahr,
    		  	iRound 	: this.oArgs.Round
    	  	}
    	  );
      }

      delete this.oArgs;
      return;
    	      
    },    
    
    onNavBack: function (oEvent) {
/*      var oView = this.getView();

      var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
      oODataJSONModel.setData({});
      oView.setModel(oODataJSONModel, "header")

      var oODataJSONModel_item =  new sap.ui.model.json.JSONModel();  
      oODataJSONModel_item.setData({});
      oView.setModel(oODataJSONModel_item, "InputList")

      oODataJSONModel.updateBindings(true);
      oODataJSONModel.refresh(true);

      oODataJSONModel_item.updateBindings(true);
      oODataJSONModel_item.refresh(true);*/

    	var oView = this.getView();
        var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
        oODataJSONModel.setData({});
        oView.setModel(oODataJSONModel, "header")
        
    	var empty = new sap.ui.model.json.JSONModel();
    	empty.setData({});
    	
		var oTable = this.getView().byId("table_officerList");
		oTable.setModel(empty);
		oTable.bindRows("/results");
		
		var oTable = this.getView().byId("table_schedule");
		oTable.setModel(empty);
		oTable.bindRows("/results");

		sap.ui.getCore().byId("refresh")

//      this.getOwnerComponent().onNavBack(true);
      // in some cases we could display a certain target when the back button is pressed
      if (this.oArgs && this.oArgs.fromTarget) {
    	  this._router.getTargets().display(this.oArgs.fromTarget,{
    		  	iGsber  : this.oArgs.Gsber,
    		  	iGjahr  : this.oArgs.Gjahr,
    		  	iRound 	: this.oArgs.Round
    	  	}
    	  );
      }

      delete this.oArgs;
      return;
      
      // call the parent's onNavBack
//      BaseController.prototype.onNavBack(this, arguments);
    },
    
    onBtnApprove : function(){
		MessageToast.show(this.i18n.getText("underConstruction"));
    },
    
    onBtnSave : function(){
		var controll = this;

//		// 2019.12.16 if(Zbmind = BM ) -> Check Work Result & Failure Code  
//					var oModel  = this.getView().getModel("ReadOrder");
//					var vZbmind = oModel.getData().Zbmind;
//					if(vZbmind == 'BM'){
////						var vError;
////						this.checkWorkResult(vError);
////						if(!vError){
//							sap.m.MessageBox.show(
//									this.i18n.getText("fill_out_failure_code"),
//									sap.m.MessageBox.Icon.ERROR,
//									this.i18n.getText("error")
//							);
//							return false;
////						}
//					}
					
		MessageBox.confirm(this.i18n.getText("auditPlanSaveConf"), 
				{//title: "", 
			onClose : function(oAction){
				if(oAction=="OK"){
					controll.onSave("", "T");
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
		if(!this.checkMandatory()){
			return;
		}
		
//		if(!this.check_data()){
//			return;
//		}

		this.auditPlanSave(status);
	},
	
	auditPlanSave : function(iStat){
    	var data = {};

    	
    	data.NavHead 	= [];
    	data.NavDept 	= [];
    	data.NavSche 	= [];    	
    	data.NavReturn 	= [];
    	
    	var oHeader = this.getModel("header").getData();
    	var head = {};
    	head.Gsber  = oHeader.Gsber;
    	
    	if(oHeader.Round == "New"){
    		oHeader.Round = "00";
        	head.Round  = oHeader.Gjahr + oHeader.Round;
        	data.Gubun = "N";    		
    	}else{
    		data.Gubun = "A";
        	head.Round = oHeader.Round;
    	}

    	head.Admin 	= oHeader.AdminSapId; 	// SAP ID
    	head.AdminT	= oHeader.AdminDesc; 	// Dept Desc.
    	head.AdminD	= oHeader.AdminDept; 	// Dept Code
    	head.AdminP	= oHeader.AdminPortal; 	// Portal ID
    	head.AdminM	= oHeader.AdminUser; 	// MDG ID
    	head.Adm01 	= oHeader.Adm01SapId; 	// SAP ID
    	head.Adm01T	= oHeader.Adm01Desc; 	// Dept Desc.
    	head.Adm01D	= oHeader.Adm01Dept; 	// Dept Code
    	head.Adm01P	= oHeader.Adm01Portal; 	// Portal ID
    	head.Adm01M	= oHeader.Adm01User; 	// MDG ID
    	head.Adm02 	= oHeader.Adm02SapId; 	// SAP ID
    	head.Adm02T	= oHeader.Adm02Desc; 	// Dept Desc.
    	head.Adm02D	= oHeader.Adm02Dept; 	// Dept Code
    	head.Adm02P	= oHeader.Adm02Portal; 	// Portal ID
    	head.Adm02M	= oHeader.Adm02User; 	// MDG ID

    	data.NavHead.push(head);

    	
    	
    	var oOffice = this.getView().byId("table_officerList");
		if(oOffice.getModel().oData){
	    	var iDeptList = oOffice.getModel().oData.results;
		}
		
		for(var i=0; i<iDeptList.length; i++){
			var dept = {};
			dept.Kostl = iDeptList[i].Kostl;
			dept.Ktext = iDeptList[i].Ktext;
			dept.Inspd = iDeptList[i].Inspd;
			dept.Inspm = iDeptList[i].Inspm;
			dept.Inspu = iDeptList[i].Inspu;
			dept.Examd = iDeptList[i].Examd;
			dept.Examm = iDeptList[i].Examm;
			dept.Examu = iDeptList[i].Examu;
			dept.Joind = iDeptList[i].Joind;
			dept.Joinm = iDeptList[i].Joinm;
			dept.Joinu = iDeptList[i].Joinu;

			data.NavDept.push(dept);
		}
		
    	var oSchedule = this.getView().byId("table_schedule");
		if(oSchedule.getModel().oData){
	    	var iSchList = oSchedule.getModel().oData.results;
		}
		
		for(var i=0; i<iSchList.length; i++){
			var schedule = {};
			schedule.Kostl = iSchList[i].Kostl;
			schedule.Anlkl = iSchList[i].Anlkl;
			schedule.Menge = iSchList[i].Menge;
			schedule.Meins = iSchList[i].Meins;
			schedule.Inspd = iSchList[i].InspuDept;
			schedule.Inspu = iSchList[i].InspuSapId;
			schedule.Inspm = iSchList[i].InspuUser;
			schedule.Examd = iSchList[i].ExamuDept;
			schedule.Examu = iSchList[i].ExamuSapId;
			schedule.Examm = iSchList[i].ExamuUser;
			schedule.Joind = iSchList[i].JoinuDept;
			schedule.Joinu = iSchList[i].JoinuSapId;
			schedule.Joinm = iSchList[i].JoinuUser;

			data.NavSche.push(schedule);
		}		
		
    	// 3. save process
    	var oSaveModel = this.getView().getModel();
    	
		var mParameters = {
			success : function(oData) {
				var oODataJSONModel =  new sap.ui.model.json.JSONModel();
				oODataJSONModel.setData(oData);
				
				// NavReturn 의 가공 형태에 따라 알맞게 수정. 
				if(oData.NavReturn.results[0].Rttyp == "E"){
					sap.m.MessageBox.show(
							this.i18n.getText("err_plan_save"), //oData.RetMsg,
							sap.m.MessageBox.Icon.ERROR,
							this.i18n.getText("Error")
					);
				}else{
					var message = oData.NavReturn.results[0].Rtmsg;
					sap.m.MessageBox.show(message, 
							              sap.m.MessageBox.Icon.SUCCESS, 
							              this.i18n.getText("Success"));

//						this.dataSelectProcess();
//					this.listBack();

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
	
	dataSelectProcess : function(iNew){	

		var kostl = this.oKostlList.getData();

		var oODataJSONModel =  new sap.ui.model.json.JSONModel(
				{
				    Gsber 	: "3020",
				    Gjahr 	: "2022",
				    Round 	: "01",
				    Admin 	: "책임자",
				    Adm01 	: "조사책임자(정)",
				    Adm02 	: "조사책임자(부)",
				    Disp	: true, 
				    				    
 				    "officerList" : [
											{
												Kostl : "600053",
												Ktext : "KT)Refinery C2 - Crystal",
												Inspd : "",
												Inspu : "",
												Inspn : "",
												Examd : "",
												Examu : "",
												Examn : "",
												Joind : "",
												Joinu : "",
												Joinn : "",
											    "kostlItems" : kostl.ManagerByKostl,
											    "sapKostl"	 : kostl.SAPKostl
											},
											{
												Kostl : "600106",
												Ktext : "KT)Engineering Team",
												Inspd : "",
												Inspu : "",
												Inspn : "",
												Examd : "",
												Examu : "",
												Examn : "",
												Joind : "",
												Joinu : "",
												Joinn : "",
											    "kostlItems" : kostl.ManagerByKostl,
											    "sapKostl"	 : kostl.SAPKostl
											},
											{
												Kostl : "600021",
												Ktext : "KT)Fermentation Broth(OAHS)",
												Inspd : "",
												Inspu : "",
												Inspn : "",
												Examd : "",
												Examu : "",
												Examn : "",
												Joind : "",
												Joinu : "",
												Joinn : "",
											    "kostlItems" : kostl.ManagerByKostl,
											    "sapKostl"	 : kostl.SAPKostl
											},
											{
												Kostl : "600003",
												Ktext : "KT)Finance Dept",
												Inspd : "",
												Inspu : "",
												Inspn : "",
												Examd : "",
												Examu : "",
												Examn : "",
												Joind : "",
												Joinu : "",
												Joinn : "",
											    "kostlItems" : kostl.ManagerByKostl,
											    "sapKostl"	 : kostl.SAPKostl
											}
						]
					}		
		);		
		
		this.getView().setModel(oODataJSONModel, "header");
		var oTable = this.getView().byId("table_officerList");
     
//		oModel.attachRequestSent(function(){oTable.setBusy(true);});
//		oModel.attachRequestCompleted(function(){
//												oTable.setBusy(false);
//												oTable.setShowNoData(true);
//											});
		
		oTable.setModel(oODataJSONModel);
		oTable.bindRows("/officerList");
		
		/*
		var lange = this.getLanguage();
		var s_mityp =  [];   
		var s_filter = [];
		var filterStr= "";
					
        s_mityp.push("P1"); //우선은 강제설정.

        if(s_mityp){
          s_filter.push(utils.set_filter(s_mityp, "Mityp"));
        }		
		
        
		for(var i=0; i<s_filter.length; i++){
			if(i === 0){
				filterStr = s_filter[i];
			}else{
				filterStr = filterStr + " and " + s_filter[i];
			}
		}
					
		var path = "/InputSet(Spras='"+lange+"',Aufnr='"+this.oArgs.iAufnr+"',Swerk='"+this.oArgs.iWerks+"')";

		var mParameters = {
			urlParameters : {
				"$expand" : "ResultList/ListDeep",
				"$filter" : filterStr
			},
									
			success : function(oData) {
			 var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
			 oODataJSONModel.setData(oData);
			 			 
			 this.getView().setModel(oODataJSONModel, "header");
			 
			 oTable.setModel(oODataJSONModel, 'InputList');
			 
			 this.oData = oData;
			 
			 this.set_displayMode(this.oData.Zmode);
			 				 
			}.bind(this),
			error : function() {
				   sap.m.MessageBox.show(
							 this.i18n.getText("oData_conn_error"),
							 sap.m.MessageBox.Icon.ERROR,
							 this.i18n.getText("error")
						   );	
			}.bind(this)
		};
			
	     oModel.read(path, mParameters);*/
	},

	onChangeScheduleKostl : function(oEvent){
		
		var idx 	= oEvent.getSource().getParent().getIndex();
		var v_kostl = oEvent.getParameters().selectedItem.getKey();

		// 1. Check DeptList exist costcenter
		var tableModel = this.getView().byId("table_officerList").getModel();
		var err = true;
		var list = tableModel.getData().officerList;
		
		for(var i=0; i<list.length; i++){
			if(list[i].Kostl == v_kostl){
				err = false;
				break;
			}
		}
		if(err){
			sap.m.MessageBox.show(
					this.i18n.getText("dup_dept_audit"),
					sap.m.MessageBox.Icon.ERROR,
					this.i18n.getText("error")
			);
			tableModel.refresh();
			return;
		}		
		
		// 2. Set Asset Class Possible 
		var oScheduleModel = this.getView().byId("table_schedule").getModel();
		var assetList = this.oAssetList.getData().AssetListKostl;
		for(var a=0; a<assetList.length; a++){
			if(assetList[a].Kostl == v_kostl){
				oScheduleModel.getData().results[idx].Asset = assetList[a].Asset;
				break;
			}
		}

		oScheduleModel.refresh();
	},
	
	onChangeDept : function(Field, Index, Value){

		var tableModel = this.getView().byId("table_officerList").getModel();
		var err;

		// Audit 대상 부서와 Inspection Dept. 가 동일하면 오류.
		var list = tableModel.getData().officerList;
		for(var i=0; i<list.length; i++){
			if(Index == i && list[i].Kostl == Value){
				err = "X";
				break;
			}
			
			switch(Field){
				case "Inspd" :
					if(Index == i && list[i].Examd == Value){
						err = "X";
						break;
					}
					
					if(Index == i && list[i].Joind == Value){
						err = "X";
						break;
					}
					break;
					
				case "Examd" :
					if(Index == i && list[i].Inspd == Value){
						err = "X";
						break;
					}
					
					if(Index == i && list[i].Joind == Value){
						err = "X";
						break;
					}
					break;
					
				case "Joind" :
					if(Index == i && list[i].Inspd == Value){
						err = "X";
						break;
					}
					if(Index == i && list[i].Examd == Value){
						err = "X";
						break;
					}					
					break;
					
			}			
		}
		if(err){
			sap.m.MessageBox.show(
					this.i18n.getText("dup_dept_audit"),
					sap.m.MessageBox.Icon.ERROR,
					this.i18n.getText("error")
			);

			switch(Field){
				case "Inspd" :
					tableModel.getData().officerList[Index].Inspd = "";
					tableModel.getData().officerList[Index].Inspu = "";
					tableModel.getData().officerList[Index].Inspn = "";
					break;
				case "Examd" :
					tableModel.getData().officerList[Index].Examd = "";
					tableModel.getData().officerList[Index].Examu = "";
					tableModel.getData().officerList[Index].Examn = "";
					break;
				case "Joind" :
					tableModel.getData().officerList[Index].Joind = "";
					tableModel.getData().officerList[Index].Joinu = "";
					tableModel.getData().officerList[Index].Joinn = "";
					break;
			}
			
			tableModel.refresh();
			return;
		}
		

		var oKostl = tableModel.getData().officerList[Index].kostlItems;
		for(var i=0; i<oKostl.length; i++){
			if(oKostl[i].Key == Value){
				switch(Field){
					case "Inspd" :
						tableModel.getData().officerList[Index].Inspu = oKostl[i].ManagerId;
						tableModel.getData().officerList[Index].Inspn = oKostl[i].NamagerName;
						break;
					case "Examd" :
						tableModel.getData().officerList[Index].Examu = oKostl[i].ManagerId;
						tableModel.getData().officerList[Index].Examn = oKostl[i].NamagerName;
						break;
					case "Joind" :
						tableModel.getData().officerList[Index].Joinu = oKostl[i].ManagerId;
						tableModel.getData().officerList[Index].Joinn = oKostl[i].NamagerName;
						break;
				}
			}
		}
		
		tableModel.refresh();
	},
	
	onChangeInspd : function(oEvent){
		var idx = oEvent.getSource().getParent().getIndex();
		var v_val = "";
		if(oEvent.getParameter("selectedItem")){
			v_val = oEvent.getParameter("selectedItem").getKey();
		}
		
		if(v_val){
			this.onChangeDept("Inspd", idx, v_val);
//			this.changeScreen_External(v_val);
		}
	},
	
	onChangeExamd : function(oEvent){
		var idx = oEvent.getSource().getParent().getIndex();
		var v_val = "";
		if(oEvent.getParameter("selectedItem")){
			v_val = oEvent.getParameter("selectedItem").getKey();
		}
		
		if(v_val){
			this.onChangeDept("Examd", idx, v_val);
//			this.changeScreen_External(v_val);
		}
	},
	
	onChangeJoind : function(oEvent){
		var idx = oEvent.getSource().getParent().getIndex();
		var v_val = "";
		if(oEvent.getParameter("selectedItem")){
			v_val = oEvent.getParameter("selectedItem").getKey();
		}
		
		if(v_val){
			this.onChangeDept("Joind", idx, v_val);
//			this.changeScreen_External(v_val);
		}
	},
	
	onChangeKostl : function(oEvent){

		var idx = oEvent.getSource().getParent().getIndex();
		var tableModel = this.getView().byId("table_officerList").getModel();

		var v_val = "";
		var v_txt = "";
		if(oEvent.getParameter("selectedItem")){
			v_val = oEvent.getParameter("selectedItem").getKey();
			v_txt = oEvent.getParameter("selectedItem").getText();
		}

		if(v_val){
			var err;

			var list = tableModel.getData().officerList;
			for(var i=0; i<list.length; i++){
				if(idx != i && list[i].Kostl == v_val){
					err = "X";
					break;
				}
			}		
			if(err){
				var msg = "Cost Center " + v_txt + " " + this.i18n.getText("already_input");
				sap.m.MessageBox.show(
						msg,
						sap.m.MessageBox.Icon.WARNING,
						this.i18n.getText("warning")
				);

				tableModel.getData().results[idx].Kostl = "";
				tableModel.refresh();
				return;
			}


			tableModel.refresh();

//			this.changeScreen_External(v_val);
		}

	},

	onChangeAnlkl : function(oEvent){

		var idx = oEvent.getSource().getParent().getIndex();
		var tableModel = this.getView().byId("table_schedule").getModel();

		var v_val = "";
		var v_txt = "";
		if(oEvent.getParameter("selectedItem")){
			v_val = oEvent.getParameter("selectedItem").getKey();
			v_txt = oEvent.getParameter("selectedItem").getText();
		}

		if(v_val){
			var err = true;

			var list = tableModel.getData().results[idx].Asset;
			for(var i=0; i<list.length; i++){
				if(list[i].Anlkl == v_val){
					err = false;
					tableModel.getData().results[idx].Menge = list[i].Menge;					
					tableModel.getData().results[idx].Meins = list[i].Meins;					
					break;
				}
			}		
			if(err){
				var msg = v_txt + " " + this.i18n.getText("notDefined");
				sap.m.MessageBox.show(
						msg,
						sap.m.MessageBox.Icon.WARNING,
						this.i18n.getText("warning")
				);

				tableModel.getData().results[idx].Anlkl = "";
				tableModel.refresh();
				return;
			}


			tableModel.refresh();

//			this.changeScreen_External(v_val);
		}

	},	
	
	onAddDepartment : function(oEvent){
		var oTable = this.getView().byId("table_officerList");
		var tableModel = oTable.getModel();
		var odata = {};
		var list = [];

		if(tableModel.getData() != null){
			odata = tableModel.getData();
			list = odata.officerList;
		}
		
		var kostl = this.oKostlList.getData();
		
		list.push( 
				{
					"Kostl" : "",
					"Ktext" : "",
					
					"Inspd" : "",
					"Inspu" : "",
					"Inspn" : "",
					"Examd" : "",
					"Examu" : "",
					"Examn" : "",
					"Joind" : "",
					"Joinu" : "",
					"Joinn" : "",
				    "kostlItems" : kostl.ManagerByKostl,
				    "sapKostl"	 : kostl.SAPKostl
				}
		);

		odata.results = list;
		tableModel.setData(odata);
		
		// 방금 추가된 로우가 화면에 보이도록 한다. ..
		var idx = list.length-1; 
		oTable.setFirstVisibleRow(idx);
//		$("input[id*='Arbpl']").focus().trigger("click");
	},

	onDeleteDepartment : function(oEvent){
		var oTable;
		oTable = this.getView().byId("table_officerList");
		var aIndices = oTable.getSelectedIndices();
		if (aIndices.length < 1) {
			MessageToast.show("No item selected");
			return;
		}

//		debugger;
		var tableModel 	= oTable.getModel();
		var odata      	= tableModel.getData();
		var list  		= odata.officerList;
		var cnt 		= list.length - 1 ;

		var no_delete_idx;

		for(var i=cnt; i>=0; i--){
			for(var j=0; j<aIndices.length; j++){
				if(i === aIndices[j] ){
					var removed = list.splice(i, 1); 
					// Schedule 리스트에 등록되어있는 데이터들도 함께 지워야한다. 
					
//					if(operitem[i].Steus == "PM03"){
//						if(this.getView().byId("po").getValue()){ 
//							sap.m.MessageBox.show(
//									this.i18n.getText("delete_check_oper_pm03"),
//									sap.m.MessageBox.Icon.WARNING,
//									this.i18n.getText("warning")
//							);
//							continue;
//						}
//					}else if(operitem[i].Steus == "PM01"){
//						delete_pm01 = "X";
//					}
//
//					if(!operitem[i].NewLine){  //오더에 생성되어 있던 Row는 삭제 할 수 없다( 신규 Row를 저장한 후 삭제 가능)
//						if(!this.check_operDel(i)){
//							delete_pm01 = "";  //삭제 할 수 없는 상태임
//							break;
//						}else{
//							var removed = operitem.splice(i, 1);  // 한줄 이상의 데이터가 존재 하는 경우 삭제 가능 
//						}
//					}else{
//						var removed = operitem.splice(i, 1);  // 새로 생성된 Row 항상 지울 수 있음 
//					} 
				}
			}
		};
		
		odata.results = list;
		tableModel.setData(odata);
		oTable.clearSelection();
	},

	onAddSchedule : function(oEvent){
		var oTable = this.getView().byId("table_schedule");
		var tableModel = oTable.getModel();
		var odata = {};
		var list = [];
		var create_init;

		if(tableModel.getData() != null){
			odata = tableModel.getData();
			list = odata.results;
		}else{
			create_init = "X";  // create mode 시 최초 row 생성 시 
		}
		
		var kostl = this.oKostlList.getData();
		
		list.push( 
				{
					"Kostl" 	: "",
					"Ktext" 	: "",
        			"Inspd" 	: "",
        			"Inspu" 	: "",
        			"Inspn" 	: "",
        			"Examd" 	: "",
        			"Examu" 	: "",
        			"Examn" 	: "",
        			"Joind" 	: "",
        			"Joinu" 	: "",
        			"Joinn" 	: "",
        			"InspuList" : [],
        			"ExamuList" : [],
        			"JoinuList" : [],
        			"Asset" 	: [],
				    "sapKostl"	: kostl.SAPKostl
				}
		);

		odata.results = list;
		
		if(create_init === "X"){
			var oODataJSONModel = new sap.ui.model.json.JSONModel();  
			oODataJSONModel.setData(odata);
			oTable.setModel(oODataJSONModel);
			oTable.bindRows("/results");
			create_init = "";
		}else{
			tableModel.setData(odata);
		}
		
		// 방금 추가된 로우가 화면에 보이도록 한다. ..
		var idx = list.length-1; 
		oTable.setFirstVisibleRow(idx);
//		$("input[id*='Arbpl']").focus().trigger("click");
	},
	
    checkMandatory : function(){
    	var iHeader = this.getView().getModel("header");

    	var iGsber = iHeader.oData.Gsber; 
    	if(!iGsber){
    		MessageToast.show(this.i18n.getText("err_gsber"));
    		return false;
    	}
    	
    	var iGjahr = iHeader.oData.Gjahr; 
    	if(!iGjahr){
    		MessageToast.show(this.i18n.getText("err_gjahr"));
    		return false;
    	}
    	
//    	var iList = this.getView().byId("inputTable").getModel("InputList").getData().ResultList.results;
//
//    	var cnt = 0;
//    	
//		for(var i=0; i<iList.length; i++){
//			if(iList[i].Recdc && iList[i].Mdocmx){
//				cnt = cnt + 1;
//			}
//		}    	
//    	
//		if(cnt == 0){
//    		MessageToast.show(this.i18n.getText("noInput"));
//    		return false;			
//		}
		
    	return true;

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