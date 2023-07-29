sap.ui.define([
               "cj/pm_m230/controller/BaseController",
               "cj/pm_m230/util/ValueHelpHelper",
               "cj/pm_m230/util/utils",
               "cj/pm_m230/model/formatter",
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

  return BaseController.extend("cj.pm_m230.controller.Bom", {
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

		var oTarget = this._router.getTarget("bom");
	    oTarget.attachDisplay(this._onRouteMatched, this);
	},

    _onRouteMatched : function (oEvent) {
		var controll = this;

		this.oArgs = oEvent.getParameter("data");   // //store the data

		this.i18n = this.getView().getModel("i18n").getResourceBundle();
		this.setInitData();
		
	},

    /**
     * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
     * (NOT before the first rendering! onInit() is used for that one!).
     */
    onBeforeRendering: function() {
//      debugger;
		
//      this.getLoginInfo();		
//      this.set_screen_mode();
    },

    onAfterRendering: function() {

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
		var oModel = this.getView().getModel("equip");
		var controll = this;
	    var oTable = this.getView().byId("TreeTableBasic");
     
		oModel.attachRequestSent(function(){oTable.setBusy(true);});
		oModel.attachRequestCompleted(function(){
												oTable.setBusy(false);
												oTable.setShowNoData(true);
											});
			
		var s_equnr  = [];
		var s_werks  = [];
		var s_filter = [];
		var filterStr= "";

		var iEqunr = this.oArgs.iEqunr;
		if(iEqunr){
			s_equnr.push(iEqunr);
			s_filter.push(utils.set_filter(s_equnr, "Equnr"));
		}
		var iWerks = this.oArgs.iWerks;
		if(iWerks){
			s_werks.push(iWerks);
			s_filter.push(utils.set_filter(s_werks, "Werks"));
		}
		
		for(var i=0; i<s_filter.length; i++){
			if(i === 0){
				filterStr = s_filter[i];
			}else{
				filterStr = filterStr + " and " + s_filter[i];
			}
		}

		var path = "/BomListSet";

		var mParameters = {
			urlParameters : {
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

				var old = {}; 
				old.Matnr = "";
				
				var data = [];
				var items = [];
				var j = 0;
				
				for(i=0;i<oData.results.length;i++){
					j++;
					
					var value = {};
					
					if(old.Matnr != "" && old.Matnr != oData.results[i].Matnr){
						value.Matnr      = old.Matnr;
						value.Maktx      = old.Maktx;
						value.MeinsB     = old.MeinsB;
						value.Mngko      = old.Mngko;
						value.Content    = value.Matnr + " " + value.Maktx;
						value.categories = items;
						data.push(value);
						items = [];
					}
					
					var item = {};
					item.Lgort  = oData.results[i].Lgort;
					item.Lgobe  = oData.results[i].Lgobe;
					item.Labst  = oData.results[i].Labst;
					item.MeinsM = oData.results[i].MeinsM;
					item.Content = item.Lgobe;
					if (item.Lgort != "") {
	  					items.push(item);
					}

					old.Matnr  = oData.results[i].Matnr;
					old.Maktx  = oData.results[i].Maktx;
					old.MeinsB = oData.results[i].MeinsB;
					old.Mngko  = oData.results[i].Mngko;

					if(j == oData.results.length){
						var last = {};
						last.Matnr      = old.Matnr;
						last.Maktx      = old.Maktx;
						last.MeinsB     = old.MeinsB;
						last.Mngko      = old.Mngko;
						last.Content    = last.Matnr + " " + last.Maktx;
						last.categories = items;
						data.push(last);
					}
				}

				var oODataJSONModel =  new JSONModel();
				oODataJSONModel.setData(data);
				oTable.setModel(oODataJSONModel, 'BomList');
				oTable.expandToLevel(1);
				
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

    onNavBack: function (oEvent) {
      var oView = this.getView();

      var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
      oODataJSONModel.setData({});
      oView.setModel(oODataJSONModel, "header")

      var oODataJSONModel_item =  new sap.ui.model.json.JSONModel();  
      oODataJSONModel_item.setData({});
      oView.setModel(oODataJSONModel_item, "BomList")

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