sap.ui.define([
               "cj/pm_m140/controller/BaseController",
               "cj/pm_m140/util/ValueHelpHelper",
               "cj/pm_m140/util/utils",
               "cj/pm_m140/model/formatter",
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
 
  return BaseController.extend("cj.pm_m140.controller.Detail", {
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
    },

    _onRouteMatched : function (oEvent) {
      var controll = this;
      this.oArgs = oEvent.getParameter("data");   // //store the data

      this.i18n = this.getView().getModel("i18n").getResourceBundle();

      this.getLoginInfo();
      this.set_userData();
      this.set_screen_mode();

//      if(this.oArgs.Ebeln){  // Release Statue : Frgzu is space Change 
//        this.set_displayMode("U");
//        this.get_purchase_order_data();
//      }else{
//        this.set_displayMode("C");
//      }
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
      this.arr_werks  = this.get_Auth("WERKS");
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
    	
//        var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
//        oODataJSONModel.setData(oData);
//        oView.setModel(oODataJSONModel, "header")
    	this.dataSelectProcess();

    },

    set_screen_mode : function(){
      var oView = this.getView();
      var decSep = '';
      var grpSep = '';

      oView.setModel(new JSONModel({
        isvisible : false,    // ebeln : Visible
        dispMode : true,    //  생성  : true, 변경 : false
        editMode : true,    //  생성  : true, 변경 : true
        visiMode : true,      //  생성  : true, 변경 : true, 조회 : false
        deciamlSep : decSep,
        groupingSep : grpSep
      }), "screenMode");
    },


    set_displayMode : function(vMode){
      var screenModel = this.getView().getModel("screenMode");
      var screenData = screenModel.getData();

      if(vMode == "C"){ // Create Mode
        screenData.isvisible = false;
        screenData.dispMode = true;
        screenData.editMode = true;
        screenData.visiMode = true;
        screenData.Record	= true;
        screenData.Cancel 	= false;
      }else if(vMode == "D"){   // Display mode
        screenData.isvisible = true;
        screenData.dispMode = false;
        screenData.editMode = false;
        screenData.visiMode = false;
        screenData.Record	= false;
        screenData.Cancel 	= false;
      }else if(vMode == "U"){ // Change Mode
        screenData.isvisible = true;
        screenData.dispMode = false;
        screenData.editMode = true;
        screenData.visiMode = true;
        screenData.Record	= true;
        screenData.Cancel 	= true;        
      }

      screenModel.refresh();
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

//      sap.ui.getCore().byId("refresh")

//      this.getOwnerComponent().onNavBack(true);
      // in some cases we could display a certain target when the back button is pressed
      if (this.oArgs && this.oArgs.fromTarget) {
    	  this._router.getTargets().display(this.oArgs.fromTarget,{
    		  	iAufnr  : this.oArgs.Aufnr,
    		  	iAuart  : this.oArgs.Auart,
    		  	iAufnrT : this.oArgs.AufnrT,
    		  	iEqunr  : this.oArgs.Equnr,
    		  	iEqunrT : this.oArgs.EqunrT,
    		  	iWerks  : this.oArgs.Werks
    	  	}
    	  );
      }

      delete this.oArgs;
      return;
      
      // call the parent's onNavBack
//      BaseController.prototype.onNavBack(this, arguments);
    },

	dataSelectProcess : function(){	

		var oODataJSONModel =  new sap.ui.model.json.JSONModel(
				{
				    Bukrs : "3010",
				    Butxt : "PT.Cheil Jedang Indonesia",
				    Werks : "3011",
				    Wname : "[P]PSR BIO",
				    Admin : "Kim Dae Seong",
				    Adhoi : "Ryu Myeong Sun",
				    Addoi : "Lee Jung Hun",
				    
					  "officerList" : [
											{
												Kostl	  : "0000100430",
												Ktext	  : "JKT) B2C",
												Ddnam   : "Myeong Seon Ryu",
												Ddchk   : "msryu52",
												Ddent	  : "Lee Mr."
											},
											{
												Kostl	  : "0000110001",
												Ktext	  : "PSR)Project Jombang",
												Ddnam   : "Myeong Seon Ryu",
												Ddchk   : "msryu52",
												Ddent	  : "Lee Mr."
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
		
		oTable.setModel(oODataJSONModel, 'ResultList1');
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
	
    checkMandatory : function(){
    	var iHeader = this.getView().getModel("header");
    	var iDate = iHeader.oData.Idate; 
    	if(!iDate){
    		MessageToast.show(this.i18n.getText("date_mandatory"));
    		return false;
    	}
    	
    	var iList = this.getView().byId("inputTable").getModel("InputList").getData().ResultList.results;

    	var cnt = 0;
    	
		for(var i=0; i<iList.length; i++){
			if(iList[i].Recdc && iList[i].Mdocmx){
				cnt = cnt + 1;
			}
		}    	
    	
		if(cnt == 0){
    		MessageToast.show(this.i18n.getText("noInput"));
    		return false;			
		}
		
    	return true;

    },
    
    OnRecdvChange_rm : function(oEvent){
		var oTable	=	this.getView().byId("inputTable");
		var idx 	= 	oEvent.getSource().getParent().getBindingContextPath().substr(20);
		var index   = 	parseFloat(idx);
		var rows 	= 	oTable.getModel("InputList").oData.ResultList.results[index];
		var msg;
		
    	if(jQuery.isNumeric( oEvent.getParameters().value )){
    		
			var min = parseFloat(rows.Mrmic);
			var max = parseFloat(rows.Mrmac);
			var val = parseFloat(oEvent.getParameters().value);
			
			if(val < min){
				msg = this.i18n.getText("valueLower");
			}
			
			if(val > max){
				msg = this.i18n.getText("valueUpper");				
			}
			
			if(msg){
				rows.RecdcValSt = "Error";
				rows.Vlcod = '02';
				
				MessageToast.show(msg);
			}else{
				rows.RecdcValSt = "None";
				rows.Vlcod = '01';				
			}			
			
    	}else{
			rows.RecdcValSt = "Error";
			rows.Recdc = "";
			msg = this.i18n.getText("noNumber");
			MessageToast.show(msg);
    	}			

    	oTable.getModel("InputList").refresh();
			
    },
    
    onBtnRecord : function(oEvent){
    	// 1. check
    	if(!this.checkMandatory()){
    		return;
    	}

    	// 2. make data
    	var data = {};

    	var oHeader = this.getModel("header").getData();
		data.Aufnr  = oHeader.Aufnr;
		data.Spras  = oHeader.Spras;
		data.Mityp  = oHeader.Mityp;
		data.Okcode = "S";
		data.Idate  = oHeader.Idate;
		data.Itime  = oHeader.Itime;
		data.Ernam  = this.getLoginId();
		
    	var iList = oHeader.ResultList.results;
  	
    	data.ResultList = [];
    	
		for(var i=0; i<iList.length; i++){
			if(iList[i].Recdc && iList[i].Mdocmx){
				var item = {};
				
				item.Point  	= iList[i].Point;
				item.Psort  	= iList[i].Psort;
				item.Pttxt  	= iList[i].Pttxt;
				item.Atinn  	= iList[i].Atinn;
				item.Mrmax  	= iList[i].Mrmax;
				item.Mrmaxi 	= iList[i].Mrmaxi;
				item.Desir  	= iList[i].Desir;
				item.Desiri 	= iList[i].Desiri;
				item.Mrmin  	= iList[i].Mrmin;
				item.Mrmini 	= iList[i].Mrmini;
				item.Mrmac  	= iList[i].Mrmac;
				item.Desic  	= iList[i].Desic;
				item.Mrmic  	= iList[i].Mrmic;
				item.Expon  	= iList[i].Expon;
				item.Decim  	= iList[i].Decim;
				item.Recdv  	= iList[i].Recdv;
				item.Recdvi 	= iList[i].Recdvi;
				item.Recdu  	= iList[i].Recdu;
				item.Recdc  	= iList[i].Recdc;
				item.Mrngu  	= iList[i].Mrngu;
				item.Mseh6  	= iList[i].Mseh6;
				item.Codct  	= iList[i].Codct;
				item.Codgr  	= iList[i].Codgr;
				item.Vlcod  	= iList[i].Vlcod;
				item.Kurztext 	= iList[i].Kurztext;
				item.Ernam  	= this.getLoginId();
				item.Idate  	= iList[i].Idate;
				item.Itime  	= iList[i].Itime;
				item.Vlcodx 	= iList[i].Vlcodx;
				item.Atinnx 	= iList[i].Atinnx;
				item.Mdocm  	= iList[i].Mdocm;
				item.Mdocmx  	= iList[i].Mdocmx;
				item.Pdaflg  	= "X"; // PDA Flag
				item.ListDeep 	= [];
				
				data.ResultList.push(item);
			}
		}
		
    	// 3. save process
    	var oModel = this.getView().getModel("recodeMeasure");
    	
      
    	
		var mParameters = {
				success : function(oData) {
					var oODataJSONModel =  new sap.ui.model.json.JSONModel();
					oODataJSONModel.setData(oData);
					 
					if(oData.RetType == "E"){
						sap.m.MessageBox.show(
								this.i18n.getText("measurementDocSaveError"), //oData.RetMsg,
								sap.m.MessageBox.Icon.ERROR,
								this.i18n.getText("Error")
						);
					}else{
						sap.m.MessageBox.show(
								this.i18n.getText("measurementDocSaveSuccess"), //oData.RetMsg,
								sap.m.MessageBox.Icon.SUCCESS,
								this.i18n.getText("Success")
						);

						this.dataSelectProcess();

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

		oModel.create("/InputSet", data, mParameters);	
    },

    onBtnCancel : function(oEvent){
    	
    	var oTable	= this.getView().byId("inputTable");
		var idx 	= oTable.getSelectedContextPaths();
		var msg;
		
		if(idx.length > 0){
			var num 	= idx[0].substr(20);
			var index   = parseFloat(num);
			var rows 	= oTable.getModel("InputList").oData.ResultList.results[index];
			
			if(rows.Mdocm == ""){
				msg = this.i18n.getText("noDocument");
				MessageToast.show(msg);
				return;				
			}
		}else{
			msg = this.i18n.getText("noSelected");
			MessageToast.show(msg);
			return;
		}
		
		
//		var idx 	= 	oEvent.getSource().getParent().getBindingContextPath().substr(20);
    	
    	// 1. check
    	// Measure Document 없으면  Cancel 불가.

    	// 2. make data
    	var data = {};

    	var oHeader = this.getModel("header").getData();
		data.Aufnr  = oHeader.Aufnr;
		data.Spras  = oHeader.Spras;
		data.Mityp  = oHeader.Mityp;
		data.Okcode = "R";
		data.Idate  = oHeader.Idate;
		data.Itime  = oHeader.Itime;
		data.Ernam  = this.getLoginId();
		
    	data.ResultList = [];
    	
		var item = {};
		
		item.Point  	= rows.Point;
		item.Psort  	= rows.Psort;
		item.Pttxt  	= rows.Pttxt;
		item.Atinn  	= rows.Atinn;
		item.Mrmax  	= rows.Mrmax;
		item.Mrmaxi 	= rows.Mrmaxi;
		item.Desir  	= rows.Desir;
		item.Desiri 	= rows.Desiri;
		item.Mrmin  	= rows.Mrmin;
		item.Mrmini 	= rows.Mrmini;
		item.Mrmac  	= rows.Mrmac;
		item.Desic  	= rows.Desic;
		item.Mrmic  	= rows.Mrmic;
		item.Expon  	= rows.Expon;
		item.Decim  	= rows.Decim;
		item.Recdv  	= rows.Recdv;
		item.Recdvi 	= rows.Recdvi;
		item.Recdu  	= rows.Recdu;
		item.Recdc  	= rows.Recdc;
		item.Mrngu  	= rows.Mrngu;
		item.Mseh6  	= rows.Mseh6;
		item.Codct  	= rows.Codct;
		item.Codgr  	= rows.Codgr;
		item.Vlcod  	= rows.Vlcod;
		item.Kurztext 	= rows.Kurztext;
		item.Ernam  	= this.getLoginId();
		item.Idate  	= rows.Idate;
		item.Itime  	= rows.Itime;
		item.Vlcodx 	= rows.Vlcodx;
		item.Atinnx 	= rows.Atinnx;
		item.Mdocm  	= rows.Mdocm;
		item.Mdocmx  	= rows.Mdocmx;
		item.Pdaflg  	= "X"; // PDA Flag
		item.ListDeep 	= [];
		
		data.ResultList.push(item);
		
    	// 3. save process
    	var oModel = this.getView().getModel("recodeMeasure");
    	
      
    	
		var mParameters = {
				success : function(oData) {
					var oODataJSONModel =  new sap.ui.model.json.JSONModel();
					oODataJSONModel.setData(oData);
					 
					if(oData.RetType == "E"){
						sap.m.MessageBox.show(
								this.i18n.getText("measurementDocSaveError"), //oData.RetMsg,
								sap.m.MessageBox.Icon.ERROR,
								this.i18n.getText("Error")
						);
					}else{
						sap.m.MessageBox.show(
								this.i18n.getText("measurementDocSaveSuccess"), //oData.RetMsg,
								sap.m.MessageBox.Icon.SUCCESS,
								this.i18n.getText("Success")
						);

						this.dataSelectProcess();

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

		oModel.create("/InputSet", data, mParameters);	
    },

	onComplete : function(){
		debugger;
		
		var oModel = this.getView().getModel("orderService");
		
//		this.oInput = this.getView().byId("inputTable");
//		oModel.attachRequestSent(function(){oInput.setBusy(true);});
//		oModel.attachRequestCompleted(function(){oInput.setBusy(false);});
		
		var data = {};
		data.Aufnr 		= this.getView().byId("Aufnr").getValue();
		data.UserStatus = "T";
		data.Mode 		= "U";
		
		data.Vaplz = this.oData.Arbpl;
		data.Ilart = this.oData.Ilart;
		data.Equnr = this.oData.Equnr;
		
		data.HdMaterial = [];
		data.HdOperation = [];
		data.HdAprv = [];
		data.HdCost = [];
		data.HdReturn = [];
		
		var mParameters = {
				success : function(oData) {
					if(oData.HdReturn){
						if(oData.HdReturn.results.length > 0){
							var message = "";
							for(var i=0; i<oData.HdReturn.results.length; i++){
								message = message + oData.HdReturn.results[i].Message + "\\n";
							}
							sap.m.MessageBox.show(
									message,
									sap.m.MessageBox.Icon.ERROR,
									this.i18n.getText("error")
							);
						}
					}else{
						
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
		oModel.create("/HdSet", data, mParameters);			
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