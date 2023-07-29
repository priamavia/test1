sap.ui.define([
               "cj/pm_m230/controller/BaseController",
               "cj/pm_m230/util/ValueHelpHelper",
               "cj/pm_m230/util/utils",
               "cj/pm_m230/model/formatter",
               "sap/ui/Device",
               "sap/ui/model/Filter",
               "sap/ui/model/FilterOperator",
			"sap/ui/model/Sorter",
               "sap/ui/model/json/JSONModel",
               "sap/m/MessageBox",
               "sap/m/MessageToast",
               "jquery.sap.global"
               ], function (BaseController, ValueHelpHelper, utils, formatter, Device, 
                   Filter, FilterOperator, Sorter, JSONModel, MessageBox, MessageToast, jQuery) {
  "use strict";

  return BaseController.extend("cj.pm_m230.controller.History", {
    formatter: formatter,
    /**
     * Boardled when a controller is instantiated and its View controls (if available) are already created.
     * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     * @public
     */
    onInit : function () {
		var oComponent = this.getOwnerComponent();
		this.getView().addStyleClass(oComponent.getContentDensityClass());

		this._router = oComponent.getRouter();
//      this._router.getRoute("detail").attachMatched(this._onRouteMatched, this);

		var oTarget = this._router.getTarget("history");
	    oTarget.attachDisplay(this._onRouteMatched, this);
	},

    _onRouteMatched : function (oEvent) {
		var controll = this;

		this.oArgs = oEvent.getParameter("data");   // //store the data

		this.i18n = this.getView().getModel("i18n").getResourceBundle();
		this.getLoginInfo();
		this.set_userData();  //"User Auth"		
		
	},

    /**
     * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
     * (NOT before the first rendering! onInit() is used for that one!).
     */
    onBeforeRendering: function() {
//      debugger;

    },

    onAfterRendering: function() {

    },

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
							"Default" : oData.results[i].Default
						}
					);
				}
					   
				controll.set_UserInfo(userDefault);
				
				this.i18n = this.getView().getModel("i18n").getResourceBundle();				
				// utils.makeSerachHelpHeader(this);	
				
				controll.set_auth();
				controll.setInitData();					   
				// set default value 
			   // controll._set_search_field();  // set Search Help
			   
			}.bind(this),
			error : function(oError) {
				sap.m.MessageBox.show(
						this.i18n.getText("oData_conn_error"),
						sap.m.MessageBox.Icon.ERROR,
						this.i18n.getText("error")
					);
			}.bind(this)
		};
		oModel.read(path, mParameters);			
	},			
		/*
		 * User Default Setting 
		 */
	set_auth : function(){
		this.arr_swerk  = this.get_Auth("SWERK");
		this.arr_kostl  = this.get_Auth("KOSTL");
		this.arr_kokrs  = this.get_Auth("KOKRS");
		this.locDate    = this.get_Auth("LOCDAT")[0].Value;
		this.locTime    = this.get_Auth("LOCTIM")[0].Value;
		this.dateFormat = this.get_Auth("DATFORMAT")[0].Value;
		this.sep        = this.get_Auth("SEP")[0].Value;
	},
  
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
      }else if(vMode == "R"){   // Display mode
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
	


	dataSelectProcess : function(){	
		
		var oModel = this.getView().getModel();
		var controll = this;
		
		var oTable =  controll.getView().byId("Table");
		
		oModel.attachRequestSent(function(){oTable.setBusy(true);});
		oModel.attachRequestCompleted(function(){
											oTable.setBusy(false);
											oTable.setShowNoData(true);
										});
									
		var s_swerk;        // swerk
		var s_equnr = [];
		var s_auart = [];   // Order Type
		var s_arbpl = [];   // Work Center
		var s_gstrp = [];   // Basic Date

		var s_assign = [];	// assign
		var s_notass = [];  // not assign				
		var s_filter = [];
						
		/*
		 * Key
		 */				
		var lange = this.getLanguage();
		// Maint. Plant
		s_swerk = this.oArgs.iWerks;
		
		// Order Type
		s_auart.push("PM01");
		s_auart.push("PM03");
		// s_auart.push("PM04"); History 볼때는 뺀다. 

		s_filter.push(utils.set_filter(s_auart, "Auart"));
			

		// // Basic Date
		// var startDate = this.getView().byId("nplda_from").getDateValue();
		// var gstrp = this.formatter.dateToStr(startDate);
		// if(gstrp != "00000000"){
		// 	s_gstrp.push(gstrp);
		// 	s_filter.push(utils.set_filter(s_gstrp, "Gstrp"));
		// }
		
		// Equipment
		s_equnr.push(this.oArgs.iEqunr);
		if(s_equnr.length>0){
			s_filter.push(utils.set_filter(s_equnr, "Equnr"));
		}
		
		var s_stat  = [];  

		s_stat.push("A"); // Outstanding		
		s_stat.push("B"); // In Approval
		s_stat.push("C"); // In-porcess
		s_stat.push("D"); // Confirmed
		s_stat.push("E"); // Completed
		
		if(s_stat.length>0){
			s_filter.push(utils.set_filter(s_stat, "Stat"));
		}

		s_assign.push("X");
			
		if(s_assign){
			s_filter.push(utils.set_filter(s_assign, "Assign"));
		}	    
		
		s_notass.push("X");
			
		if(s_notass){
			s_filter.push(utils.set_filter(s_notass, "Nassign"));
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
		
		
		var path = "/InputSet(Spras='"+lange+"',Werks='"+s_swerk+"')";

		var mParameters = {
			urlParameters : {
				"$expand" : "ResultList",
				"$filter" : filterStr
			},
			success : function(oData) {
				// 1.1 Header Info Seting --------------------
				var oHeader = new JSONModel(
					{ 
						Equnr 	: this.oArgs.iEqunr,
						Eqktx 	: this.oArgs.iEqktx
					} 
				);	

				this.getView().setModel(oHeader, 'header');
				
				var oList  = this.getView().byId("Table");
				var oModel =  new JSONModel();
				oModel.setData(oData);
				oList.setModel(oModel, 'HistoryList');

				var aSorters = [];
				aSorters.push(new Sorter("Gstrp", true));
				var oBinding = oList.getBinding("items");
				oBinding.sort(aSorters);
				
			 // this.clearAllFilters();
			}.bind(this),
			error : function() {
			   sap.m.MessageBox.show(
				 controll.i18n.getText("oData_conn_error"),
				 sap.m.MessageBox.Icon.ERROR,
				 controll.i18n.getText("error")
			   );

			}.bind(this)
		};
			
		 oModel.read(path, mParameters);
	},

	onHistoryPress: function(oEvent){
		var path  = oEvent.getParameter("listItem").getBindingContext("HistoryList").getPath()
		var oList = this.getView().byId("Table");
		var obj   = oList.getModel("HistoryList").getProperty(path);

		obj.HistoryCalled = true;
		
		// var sObj = this.getView().getModel("ReadOrder").getData();	
		this.getOwnerComponent().openWorkResult_Dialog(this, 'D', obj);  //1)
	},

	// Work Result 닫을 때 재조회 기능 부여 여부 
	onClose_workResult : function (oEvent){
		// if(this.refresh){
		// 	this.onSearch();	
		// }
		
		this.refresh = false;
	},	
	  
    onNavBack: function (oEvent) {
      var oView = this.getView();

      var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
      oODataJSONModel.setData({});
      oView.setModel(oODataJSONModel, "header")

      var oODataJSONModel_item =  new sap.ui.model.json.JSONModel();  
      oODataJSONModel_item.setData({});
      oView.setModel(oODataJSONModel_item, "HistoryList")

      oODataJSONModel.updateBindings(true);
      oODataJSONModel.refresh(true);

      oODataJSONModel_item.updateBindings(true);
      oODataJSONModel_item.refresh(true);

//      this.getOwnerComponent().onNavBack(true);
      // in some cases we could display a certain target when the back button is pressed
      if (this.oArgs && this.oArgs.fromTarget) {
    	  this._router.getTargets().display(this.oArgs.fromTarget,{
    		  	iWerks   : this.oArgs.Werks,
    		  	iEqunr   : this.oArgs.Equnr,
    		  	iEqktx   : this.oArgs.Eqktx,
			    iNavBack : true
    	  	}
    	  );
      }

      delete this.oArgs;
      return;
      
      // call the parent's onNavBack
//      BaseController.prototype.onNavBack(this, arguments);
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
        window.location.replace("/sap/bc/ui5_ui5/sap/zpm_ui_m230/index.html");}, 100);
    }

  });
}
);