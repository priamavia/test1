sap.ui.define([
	"cj/pm0071/controller/BaseController",
	"cj/pm0071/util/ValueHelpHelper",
	"cj/pm0071/util/utils",
	"sap/ui/comp/navpopover/SemanticObjectController",
	"sap/ui/core/routing/History",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"jquery.sap.global"

], function (BaseController, ValueHelpHelper, utils, SemanticObjectController, History, Filter, FilterOperator, JSONModel, Message, Toast, jQuery ) {
	"use strict";

	return BaseController.extend("cj.pm0071.controller.Main", {
		
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @public
		 */
		onInit : function () {

		},
		
		onNavBack: function () {
//			var oHistory = History.getInstance();
//			var sPreviousHash = oHistory.getPreviousHash();
//
//			if (sPreviousHash !== undefined) {
//				window.history.go(-1);
////				window.history.back();
//			} else {
//				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
//				oRouter.navTo("overview", {}, true);
//			}
			
//			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
//		    oRouter.detachRouteMatched(this.handleNavTo, this, this);
//		    sap.ushell.Container.getService("CrossApplicationNavigation").toExternal({
//		        target: {
//		            shellHash: "ZPM_SO_0070-display"
//		        }
//		    });
			

			sap.ushell.Container.getService("CrossApplicationNavigation").backToPreviousApp();
//			sap.ushell.Container.getService("CrossApplicationNavigation").historyBack();

//			window.history.go(-1);
//			window.history.back();			
		},
		
//		handleNavButtonPress: function() {
		handleBackBtnPress: function() {
			  var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); 
			  oCrossAppNavigator.toExternal({ 
			                       target: { semanticObject : "#"} 
			                      });

        },		
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 */
		onBeforeRendering: function() {
//			this.i18n = this.getView().getModel("i18n").getResourceBundle();
			
			// Maintenance Plan UI
			var oSwerk;
			var oEqunr;
			var arr_swerk = [];
			var arr_kostl = [];
			var arr_kokrs = [];

//			utils.makeSerachHelpHeader(this);

			this.oSwerk = this.getView().byId("swerk");
			this.oEqunr = this.getView().byId("equnr");

			this.getLoginInfo();
			this.set_userData();  		//User Auth
				
			this.oTable = this.getView().byId("table");	
			
			//Component.js의 param1,2 참조 - this.getOwnerComponent().param1,2			
			this.oSwerk.setSelectedKey(this.getOwnerComponent().param1);
			this.oEqunr.setValue(this.getOwnerComponent().param2);
			
			this.oSwerk.setEnabled(false);
			this.oEqunr.setEnabled(false);
			
			//Notification 조회
			this.onSearch();
			
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
					
					 for(var i=0; i<oData.results.length; i++) {
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
					 		
					 //**************************************Test			   
					 userDefault.push(
							 {
									"Auth" : "SWERK",
									"Value" : "3011",
									"Name"  : "Test",
									"KeyName" : "Test (3011)",
									"Default" : ""
								}
							 );
					 //*******************************************
					 
					 controll.set_UserInfo(userDefault);
					 
					 debugger;
					 this.i18n = this.getView().getModel("i18n").getResourceBundle();				
					 utils.makeSerachHelpHeader(this);	
					 
					 controll.set_auth();
					 
					 // set default value 
					 controll.set_search_field();

				}.bind(this),
				error : function(oError) {
					sap.m.MessageBox.show(
							this.i18n.getText("oData_conn_error"),
							sap.m.MessageBox.Icon.ERROR,
							this.i18n.getText("error")
						);							
//					jQuery.sap.log.info("Odata Error occured");
//					Toast.show("Error");
				}.bind(this)
			};
			oModel.read(path, mParameters);			
		},		


		/**
		 * User Default Setting
		 */
		set_auth : function(){
			this.arr_swerk = this.get_Auth("SWERK");
			this.arr_kostl = this.get_Auth("KOSTL");
			this.arr_kokrs = this.get_Auth("KOKRS");
			
			this.locDate    = this.get_Auth("LOCDAT")[0].Value;
			this.locTime    = this.get_Auth("LOCTIM")[0].Value;
			this.dateFormat = this.get_Auth("DATFORMAT")[0].Value;
			this.sep        = this.get_Auth("SEP")[0].Value; 			
		},

		/**
		 * set default value
		 */
		set_search_field : function() {
			this.oSwerk = this.getView().byId("swerk");
	  		
	  		var default_swerk;				
	  		if(!this.oSwerk.getSelectedItem()){
	  			
	  			for(var j=0; j<this.arr_swerk.length; j++){
	  				var template = new sap.ui.core.Item();
	  			    template.setKey(this.arr_swerk[j].Value);
	  		        template.setText(this.arr_swerk[j].KeyName);
	  	            this.oSwerk.addItem(template);
	  	            
	  	            if(this.arr_swerk[j].Default === "X"){
	  	            	default_swerk = j;
	  	            }
	  			}

	  			this.oSwerk.setSelectedKey(this.arr_swerk[default_swerk].Value); //Default Value Setting
	  		
	  		}else{
	  			this.oSwerk.setSelectedKey(this.oSwerk.getSelectedItem().getProperty("key"));
	  		}			
			 
			var v_swerk = this.oSwerk.getSelectedKey();			
	
			this.oCoc = this.getView().byId("coc");
//			for(var i=0; i<this.arr_kokrs.length; i++){
//				if(this.arr_kokrs[i].Default === "X"){
//					var kokrs = this.arr_kokrs[i].Value;
//					break;
//				}
//			}
			if(this.oCoc){
				utils.set_search_field(v_swerk, this.oCoc, "coc", "H", "", "");
			}
							
		},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 */
      	onAfterRendering: function() {
//      	    var backBtn = sap.ui.getCore().byId("backBtn").getDomRef();
//
//      	    $($(backBtn).find("a")).on("click", function(event) {
//      	        // do this if user do not want to navigate to launchpad
//      	    	colsole.log(event);
//      	        event.preventDefault();
//      	    });
      	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 */
//        	onExit: function() {
//        	}

		
		/****************************************************************
		 *  Event Handler
		 ****************************************************************/	

		/**
		 * Value Help 클릭 시
		 */
		onValueHelpRequest : function(oEvent) {
			var strArr = oEvent.oSource.sId.split("--");
			var cnt = strArr.length - 1;
			var sIdstr = strArr[cnt];
					
			var s_swerk = this.oSwerk.getSelectedKey();
			
			utils.openValueHelp(sIdstr);
		},
		
		/**
		 * Search 클릭 시
		 */
		onSearch : function() {
			var oModel = this.getView().getModel();
			var controll = this;
			var lange = this.getLanguage();
			
			var oTable =  controll.getView().byId("table");
			
			oModel.attachRequestSent(function(){oTable.setBusy(true);});
			oModel.attachRequestCompleted(function(){oTable.setBusy(false);});
			
			var s_swerk;        //swerk
			var s_equnr = [];    //
			var s_loc = [];     //process
			var s_tag = [];     //tag
			var s_eqc = [];     //EQ Category 
			var s_tot = [];     //Object type 
			var s_coc = [];     //Cost Center
			var s_woc = [];     //Work Center 
			var s_desc = [];    //Desc
			
			var s_filter = [];
			
			s_swerk = this.oSwerk.getSelectedKey();
			

			var vEqunr = this.getView().byId("equnr").getValue();
			//filterStr 에 값이 없는 경우 Odata 에러 발생, 하나의 filter라도 넣어주기 위함 
			s_equnr.push(vEqunr);
			s_filter.push(utils.set_filter(s_equnr, "Equnr"));
			
//			var vLoc = this.oLoc.getTokens();
//			for(var j=0; j<vLoc.length; j++) {
//				s_loc.push(vLoc[j].getProperty("key"));
//			}
//					if(s_loc.length>0){
//						s_filter.push(utils.set_filter(s_loc, "Stand"));
//			}
			
			
//			var vEqc = this.oEqc.getTokens();
//			for(var j=0; j<vEqc.length; j++){
//				s_eqc.push(vEqc[j].getProperty("key"));
//			}
//			if(s_eqc.length>0){
//				s_filter.push(utils.set_filter(s_eqc, "Eqtyp"));
//			}
			
//			var vTot = this.oTot.getTokens();
//			for(var j=0; j<vTot.length; j++){
//				s_tot.push(vTot[j].getProperty("key"));
//			}
//			if(s_tot.length>0){
//				s_filter.push(utils.set_filter(s_tot, "Eqart"));
//			}
		
			if(this.oCoc){
				var vCoc = this.oCoc.getTokens();
				for(var j=0; j<vCoc.length; j++){
					s_coc.push(vCoc[j].getProperty("key"));
				}
				if(s_coc.length>0){
					s_filter.push(utils.set_filter(s_coc, "Kostl"));
				}
			}
			
//			var vWoc = this.oWoc.getTokens();    //work center(OBJID)
//			for(var j=0; j<vWoc.length; j++){
//				s_woc.push(vWoc[j].mAggregations.customData[0].getProperty("value").Add2);
//			}
//			if(s_woc.length>0){
//				s_filter.push(utils.set_filter(s_woc, "Objid"));
//			}
//			
//			var vDesc = this.getView().byId("desc").getValue();
//			if(vDesc){
//				s_desc.push(vDesc);
//				if(s_desc.length>0){
//					s_filter.push(utils.set_filter(s_desc, "Eqktx"));
//				}
//			}
			
			var filterStr;
			for(var i=0; i<s_filter.length; i++){
				
				if(i === 0){
					filterStr = s_filter[i];
				}else{
					filterStr = filterStr + " and " + s_filter[i];
				}
			}
	
			//var path = "/KeyListSet(Type='P',Spras='"+lange+"',Swerk='"+s_swerk+"')";
			var path = "/InputSet(Spras='"+lange+"',Swerk='"+s_swerk+"')";
			var mParameters = {
				urlParameters : {
					"$expand" : "ResultList",
					"$filter" : filterStr
				},
				success : function(oData) {
					
					var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
					oODataJSONModel.setData(oData);
					oTable.setModel(oODataJSONModel);
					oTable.bindRows("/ResultList/results");
 
					/*						 
 					sap.m.MessageBox.show(
					controll.i18n.getText("Success"),
					sap.m.MessageBox.Icon.SUCCESS,
					controll.i18n.getText("Success")
					);
					*/
	
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
		
		/**
		 * Excel download 클릭 시
		 */
		downloadExcel : function(oEvent){
						var oModel, oTable, sFilename;
			
			oModel = this.oTable.getModel();
			sFilename = "File";
			
			utils.makeExcel(oModel, this.oTable, sFilename);
		},
		
		/**
		 *  clear All Sortings 클릭 시
		 */
		clearAllSortings : function(oEvent){
			this.oTable.getBinding("rows").sort(null);
			this._resetSortingState();
		},
		
		/**
		 * clear All Filters 클릭 시
		 */
		clearAllFilters : function(oEvent){
			var aColumns = this.oTable.getColumns();
			for (var i = 0; i < aColumns.length; i++) {
				this.oTable.filter(aColumns[i], null);
			}
		},
		
		/**
		 * Row 선택 시
		 * - 
		 */
		onRowSelect : function(oEvent) {

		}, 
	
		/****************************************************************
		 *  Local function
		 ****************************************************************/

		/**
		 * reset Sorting
		 */
		_resetSortingState : function() {
			var aColumns = this.oTable.getColumns();
			for (var i = 0; i < aColumns.length; i++) {
				aColumns[i].setSorted(false);
			}
		}
		
	});
		
});