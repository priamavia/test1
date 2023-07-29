sap.ui.define([
               "cj/pm_m020/controller/BaseController",
               "cj/pm_m020/util/ValueHelpHelper",
               "cj/pm_m020/util/utils",
               "cj/pm_m020/model/formatter",
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

  return BaseController.extend("cj.pm_m020.controller.Detail", {
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

		// oView.byId("table_officerList").getColumns()[1].setFilterFunction(function (sTerm, oItem) {
		// 	// A case-insensitive "string contains" style filter
		// 	return oItem.getText().match(new RegExp(sTerm, "i"));
		// });

		// oView.byId("Insp").setFilterFunction(function (sTerm, oItem) {
		// 	// A case-insensitive "string contains" style filter
		// 	return oItem.getText().match(new RegExp(sTerm, "i"));
		// });
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
	    	iOffice.oData.results[index].Inspm 		= user;
	    	iOffice.oData.results[index].Inspd 		= dept;
	    	iOffice.oData.results[index].Inspu 	= sap;
	    	iOffice.oData.results[index].InspuPortal 	= port;
	    	iOffice.oData.results[index].InspuKostlList = kostlList;        		

	    	if(iOffice.oData.results[index].InspuKostlList.length > 1){
	    		iOffice.oData.results[index].InspuEnable = true;
	    	}else{
	    		iOffice.oData.results[index].InspuEnable = false;
	    	}
		}else if(sIdstr == "Exam"){
	    	iOffice.oData.results[index].Examm 		= user;
	    	iOffice.oData.results[index].Examd 		= dept;
	    	iOffice.oData.results[index].Examu 	= sap;
	    	iOffice.oData.results[index].ExamuPortal 	= port;
	    	iOffice.oData.results[index].ExamuKostlList = kostlList;        		
	    	
	    	if(iOffice.oData.results[index].ExamuKostlList.length > 1){
	    		iOffice.oData.results[index].ExamuEnable = true;
	    	}else{
	    		iOffice.oData.results[index].ExamuEnable = false;
	    	}	    	
		}else if(sIdstr == "Join"){
	    	iOffice.oData.results[index].Joinm 		= user;
	    	iOffice.oData.results[index].Joind 		= dept;
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
	    	iSchedule.oData.results[index].Inspd 	= dept;
	    	iSchedule.oData.results[index].Inspm 	= user; //MDG
	    	iSchedule.oData.results[index].InspuDesc 	= desc;
	    	iSchedule.oData.results[index].Inspu 	= sap;
	    	iSchedule.oData.results[index].InspuPortal 	= port;

		}else if(sIdstr == "SchExamu"){
	    	iSchedule.oData.results[index].Examd 	= dept;
	    	iSchedule.oData.results[index].Examm 	= user; //MDG
	    	iSchedule.oData.results[index].ExamuDesc 	= desc;
	    	iSchedule.oData.results[index].Examu 	= sap;
	    	iSchedule.oData.results[index].ExamuPortal 	= port;

		}else if(sIdstr == "SchJoinu"){
	    	iSchedule.oData.results[index].Joind 	= dept;
	    	iSchedule.oData.results[index].Joinm 	= user; //MDG
	    	iSchedule.oData.results[index].JoinuDesc 	= desc;
	    	iSchedule.oData.results[index].Joinu 	= sap;
	    	iSchedule.oData.results[index].JoinuPortal 	= port;

		}
		
		iSchedule.refresh();	
	},

	handleSuggestEmpId: function (oEvent) {
		var sTerm = oEvent.getParameter("suggestValue");
		oEvent.getSource().setFilterFunction(function (sTerm, oItem) {
			// A case-insensitive 'string contains' style filter
			return oItem.getText().match(new RegExp(sTerm, "i"));

		});
	},
	  
    /**
     * get User Default Value 
     */
    set_userData : function() {
    	debugger;
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
    	debugger;
		var Fdate = this.getView().byId("Fdate");
		var Tdate = this.getView().byId("Tdate");

		Fdate.setDisplayFormat(this.dateFormat);
		Fdate.setValueFormat("yyyyMMdd");
		Tdate.setDisplayFormat(this.dateFormat);
		Tdate.setValueFormat("yyyyMMdd");
		
    	// 1. Year Setting ----------------------------
		var oGjahr = this.getView().byId("Gjahr");
		var maxYear = this.sysDate.substr(0,4); 
		maxYear++;
		
		if(oGjahr.getItems().length < 1){
			var minYear = maxYear;
			for(var i=0; i<10; i++){	
				var template = new sap.ui.core.Item();
			    template.setKey(minYear);
		        template.setText(minYear);
	            oGjahr.addItem(template);				
				minYear--;				
			}
		}
    	// 2. Month Setting ----------------------------
		var oPerde = this.getView().byId("Perde");
		var currMonth = this.sysDate.substr(4,2);
		currMonth--;
		if(oPerde.getItems().length < 1){
			var month = "01";		
			for(var i=0; i<12; i++){	
				var template = new sap.ui.core.Item();
			    template.setKey(month);
		        template.setText(month);
	            oPerde.addItem(template);				
	            month++;
	            if(month < 10){
	            	month = "0" + month;
	            }
			}
		}
		
    	
		// 2. Master Selection ------------------------
		var iGsber = this.oArgs.iGsber;
		var iSpmon = this.oArgs.iGjahr.toString() + this.oArgs.iPerde.toString();
		
        var oModel 	= this.getView().getModel();

		var controll = this;
		// oModel.attachRequestSent( function(){ controll.setBusy(true);});
		// oModel.attachRequestCompleted( function(){ controll.setBusy(false);});
		
        var path 		= "/MasterMainSet(Gsber='" + iGsber + "',Spmon='" + iSpmon + "',NewInd=" + this.oArgs.iNew + ",Round='" + this.oArgs.iRound + "')";        
        var mParameters = {
  				urlParameters : {
  					"$expand" : "NavUser,NavDept,NavCctr,NavCctrAsset,Nav2060"
  				},
  				success : function(oData) {
  					if(oData.Rttyp != "E"){
						var oDept =  new JSONModel();
						oDept.setData(oData.NavDept);
						this.getView().setModel(oDept, 'Dept');						

						this.Nav2060 = [];
						this.Nav2060 = oData.Nav2060;
						
						var oUser =  new JSONModel();
						oUser.setData(oData.NavUser);
						oUser.setSizeLimit(oData.NavUser.results.length);
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
						// oTable.bindRows("/results");

						oTable.bindRows({ path: "/results",
										    parameters: {
												sumOnTop: true
											}
										});
						
						// 1.1 Header Info Seting --------------------
						var oHeader = new JSONModel(
						  { 
							  Gsber 		: this.oArgs.iGsber,
							  Gjahr 		: this.oArgs.iGjahr,
							  Perde			: this.oArgs.iPerde,
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
							  Fdate		    : this.oArgs.iFdate,
							  Tdate		    : this.oArgs.iTdate, 
							  deptSize 	: 10,
							  schSize 	: 10
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
	      	gsber 	     : false,  
	        gjahr 	     : true,    //  생성  : true, 변경 : false
	        round 	     : false,
	        perde		 : true,
	        admin 	     : true,      //  생성  : true, 변경 : true, 조회 : false
	        adm01 	     : true,
	        adm02 	     : true,
	        approve 	 : true,
	        save 		 : true,
			fdate        : true,
			tdate        : true,
			deptList     : true,
			scheduleList : true,
			actQty       : false
        }), "screenMode");
    },


    set_displayMode : function(vMode){
    	var screenModel = this.getView().getModel("screenMode");
    	var screenData = screenModel.getData();

        if(vMode == "C"){ // Create Mode
        	screenData.gsber 	= false;
          	screenData.gjahr 	= true;
          	screenData.perde 	= true;
          	screenData.round 	= false;
          	screenData.admin 	= true;
          	screenData.adm01	= true;
          	screenData.adm02	= true;
          	screenData.fdate	= true;
          	screenData.tdate	= true;
          	screenData.approve 	= false;
          	screenData.save 	= true;
			screenData.deptList     = true;
			screenData.scheduleList = true;
			screenData.actQty   = false;
        }else if(vMode == "D"){   // Display mode
            screenData.gsber 	= false;
            screenData.perde 	= false;
            screenData.gjahr 	= false;
            screenData.round 	= false;
            screenData.admin 	= false;
            screenData.adm01	= false;
            screenData.adm02 	= false;
          	screenData.fdate	= false;
          	screenData.tdate	= false;
            screenData.approve	= false;
            screenData.save 	= false;
			screenData.deptList     = false;
			screenData.scheduleList = false;
			screenData.actQty   = true;
        }else if(vMode == "U"){ // Change Mode
            screenData.gsber	= false;
            screenData.gjahr	= false;
            screenData.perde	= false;
            screenData.round	= false;
            screenData.admin	= true;
            screenData.adm01	= true;
            screenData.adm02 	= true;
          	screenData.fdate	= true;
          	screenData.tdate	= true;			
            screenData.approve 	= true;
            screenData.save 	= true;
			screenData.deptList     = true;
			screenData.scheduleList = true;			
			screenData.actQty   = false;
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
    		  	iPerde 	: this.oArgs.Perde,
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
    		  	iPerde 	: this.oArgs.Perde,
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
		if(!this.checkMandatory()){
			return;
		}
		
		this.auditPlanSave(status);

	},
	
	auditPlanSave : function(iStat){
    	var data = {};
    	
    	data.NavHead 	= [];
    	data.NavDept 	= [];
    	data.NavSche 	= [];
    	data.Nav2060 	= [];    	
    	data.NavReturn 	= [];
    	
    	var oHeader = this.getModel("header").getData();
    	var head = {};
    	
    	if(oHeader.Round == "New"){
    		oHeader.Round = "00";
        	data.Gubun = "N";    		
    	}else{
			if (iStat == "A") { // Draft
				data.Gubun = "A";
			}else{ // just save.
				data.Gubun = "S";	
			}
    	}

    	head.Gsber  = oHeader.Gsber;
    	head.Round 	= oHeader.Round;
    	head.Spmon  = oHeader.Gjahr + oHeader.Perde;
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
		head.Fdate	= oHeader.Fdate; 	// From Date
		head.Tdate	= oHeader.Tdate; 	// To Date
		

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
			schedule.Inspd = iSchList[i].Inspd;
			schedule.Inspu = iSchList[i].Inspu;
			schedule.Inspm = iSchList[i].Inspm;
			schedule.Examd = iSchList[i].Examd;
			schedule.Examu = iSchList[i].Examu;
			schedule.Examm = iSchList[i].Examm;
			schedule.Joind = iSchList[i].Joind;
			schedule.Joinu = iSchList[i].Joinu;
			schedule.Joinm = iSchList[i].Joinm;

			data.NavSche.push(schedule);
		}		

		for(var j=0;j<this.Nav2060.results.length;j++){
			data.Nav2060.push(this.Nav2060.results[j]);
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
							oData.NavReturn.results[0].Rtmsg, //oData.RetMsg,
							sap.m.MessageBox.Icon.ERROR,
							this.i18n.getText("Error")
					);
				}else{
					var message = oData.NavReturn.results[0].Rtmsg;
					var appr_url = oData.NavReturn.results[0].Zpturl;
					
					sap.m.MessageBox.show(message, 
							              sap.m.MessageBox.Icon.SUCCESS, 
							              this.i18n.getText("Success"));

			    	var oHeader = this.getModel("header").getData();

					oHeader.Gsber = oData.NavReturn.results[0].Gsber;
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
    	
    	return true;

    },

	onDownloadExcel : function(oEvent){
		var oModel, oTable, sFilename, v_gsber;
		
		
		v_gsber = this.getView().byId("Gsber").getValue();
		oTable = this.getView().byId("table_schedule");
		oModel = oTable.getModel();
		sFilename = "File";
		
		utils.makeExcel(oModel, oTable, sFilename, v_gsber);
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