sap.ui.define([
	"cj/pm0070/controller/BaseController",
	"cj/pm0070/util/ValueHelpHelper",
	"cj/pm0070/util/utils",
	"sap/ui/comp/navpopover/SemanticObjectController",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"jquery.sap.global"
], function (BaseController, ValueHelpHelper, utils, SemanticObjectController, Filter, FilterOperator, JSONModel, Message, Toast, jQuery ) {
	"use strict";

	return BaseController.extend("cj.pm0070.controller.Main", {
		
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @public
		 */
		onInit : function () {
		
			var oView = this.getView();
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 */
		onBeforeRendering: function() {
//			sap.ushell.Container.getService("CrossApplicationNavigation")

//			this.i18n = this.getView().getModel("i18n").getResourceBundle();

			// Maintenance Plan UI
			var oSwerk;
			var arr_swerk = [];
			var arr_kostl = [];
			var arr_kokrs = [];

//			utils.makeSerachHelpHeader(this);

			this.oSwerk = this.getView().byId("swerk");

			this.getLoginInfo();
			this.set_userData();  		//User Auth
				
			this.oTable = this.getView().byId("table");
				
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
					 		
/*					 //**************************************Test			   
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
*/					 
					 controll.set_UserInfo(userDefault);
					 debugger;
					 this.i18n = this.getView().getModel("i18n").getResourceBundle();				
					 utils.makeSerachHelpHeader(this);	
					 
					 controll.set_auth();
					   
					 // set default value 
					 controll._set_search_field();

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
		_set_search_field : function() {
		
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

			this.oLoc = this.getView().byId("loc");		    // Process
			if(this.oLoc){
				utils.set_search_field(v_swerk, this.oLoc, "loc", "H", "", "");
			}				

			this.oEqc = this.getView().byId("eqc");			// EQ Category
			if(this.oEqc){
				utils.set_search_field("", this.oEqc, "eqc", "C", "", "");
			}				

			this.oTot = this.getView().byId("tot");			// Object Type
			if(this.oTot){
				utils.set_search_field("", this.oTot, "tot", "H", "", "");
			}				
	
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
							
			this.oWoc = this.getView().byId("woc");
			if(this.oWoc){
				utils.set_search_field(v_swerk, this.oWoc, "woc", "C", "", "");
			}
		},

		onSelChange : function(oEvent){
			this.oLoc.removeAllTokens();
			//this.oEqc.removeAllTokens();
			this.oTot.removeAllTokens();
			this.oCoc.removeAllTokens();
			//this.oWoc.removeAllTokens();
			
			this.oEqc.setSelectedKey("");
			this.oEqc.removeAllItems();			
			//this.oWoc.setSelectedKey("");

	    	this.getView().byId("tag").setValue("");
	    	this.getView().byId("desc").setValue("");
	    	this.getView().byId("woc").setSelectedKey("");
	    	
	    	this._set_search_field();
		},	

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 */
//        	onAfterRendering: function() {

//      	},

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
			oModel.attachRequestCompleted(function(){
													oTable.setBusy(false);
													oTable.setShowNoData(true);
												});
	
			var s_swerk;        //swerk
			var s_loc = [];     //process
			var s_tag = [];     //tag
			var s_eqc = [];     //EQ Category 
			var s_tot = [];     //Object type 
			var s_coc = [];     //Cost Center
			var s_woc = [];     //Work Center 
			var s_desc = [];    //Desc
			
			var s_filter = [];
			
			s_swerk = this.oSwerk.getSelectedKey();
			
			var vLoc = this.oLoc.getTokens();
			for(var j=0; j<vLoc.length; j++){
						s_loc.push(vLoc[j].getProperty("key"));
					}
					if(s_loc.length>0){
						s_filter.push(utils.set_filter(s_loc, "Stand"));
			}
					
			var vTag = this.getView().byId("tag").getValue();
			//filterStr 에 값이 없는 경우 Odata 에러 발생, 하나의 filter라도 넣어주기 위함 
			s_tag.push(vTag);
			if(s_tag.length>0){
				s_filter.push(utils.set_filter(s_tag, "Invnr"));
			}
			
//			var vEqc = this.oEqc.getTokens();
//			for(var j=0; j<vEqc.length; j++){
//				s_eqc.push(vEqc[j].getProperty("key"));
//			}
//			if(s_eqc.length>0){
//				s_filter.push(utils.set_filter(s_eqc, "Eqtyp"));
//			}
			
	    	var vEqc = this.getView().byId("eqc").getSelectedKey();
	    	if(vEqc){
	    		s_eqc.push(vEqc);
				
		    	if(s_eqc){
		    		s_filter.push(utils.set_filter(s_eqc, "Eqtyp"));
			    }		
	    	}	
	    	
			var vTot = this.oTot.getTokens();
			for(var j=0; j<vTot.length; j++){
				s_tot.push(vTot[j].getProperty("key"));
			}
			if(s_tot.length>0){
				s_filter.push(utils.set_filter(s_tot, "Eqart"));
			}
		
			var vCoc = this.oCoc.getTokens();
			for(var j=0; j<vCoc.length; j++){
				s_coc.push(vCoc[j].getProperty("key"));
			}
			if(s_coc.length>0){
				s_filter.push(utils.set_filter(s_coc, "Kostl"));
			}
			
/*			var vWoc = this.oWoc.getTokens();    //work center(OBJID)
			for(var j=0; j<vWoc.length; j++){
				s_woc.push(vWoc[j].mAggregations.customData[0].getProperty("value").Add2);
			}*/
	    	var vWoc = this.oWoc.getSelectedKey();    //work center(OBJID) 
	    	var wocData = this.oWoc.getModel().getData().results;
	    	for(var j=0; j<wocData.length; j++){
    			if(wocData[j].Key === vWoc){
    				s_woc.push(wocData[j].Add2);
    				break;
    			}
	    	}
			if(s_woc.length>0){
				s_filter.push(utils.set_filter(s_woc, "Objid"));
			}    	
	    	
			var vDesc = this.getView().byId("desc").getValue();
			if(vDesc){
				s_desc.push(vDesc);
				if(s_desc.length>0){
					s_filter.push(utils.set_filter(s_desc, "Eqktx"));
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
	
			var path = "/KeyListSet(Type='P',Spras='"+lange+"',Swerk='"+s_swerk+"')";
			var mParameters = {
				urlParameters : {
					"$expand" : "KeyEqList",
					"$filter" : filterStr
				},
				success : function(oData) {
					
					var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
					oODataJSONModel.setData(oData);
					oTable.setModel(oODataJSONModel);
					oTable.bindRows("/KeyEqList/results");
 
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
					 controll.i18n.getText("oData_conn_error"),
					 sap.m.MessageBox.Icon.ERROR,
					 controll.i18n.getText("error")
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
		 * - Notification List 페이지로 이동
		 */
		onRowSelect : function(oEvent) {
			var idx = oEvent.getParameter('rowIndex');
			var oTable =  this.getView().byId("table");
			var controll = this;
			
			if (oTable.isIndexSelected(idx)) {
				var cxt = oTable.getContextByIndex(idx);
				var path = cxt.sPath;
				var obj = oTable.getModel().getProperty(path);
				
				//var equnr = obj.EQUNR;	//Equipment
	
//				//Fiori Navigation
//				var href_For_Product_display = ( sap.ushell && sap.ushell.Container &&
//					sap.ushell.Container.getService("CrossApplicationNavigation").hrefForExternal({
////				    sap.ushell.Container.getService("ShellNavigation").toExternal({						
//						target : { semanticObject : "ZPM_SO_0071", action : "display" },
////						target : { shellHash : "#ZPM_SO_0071-display" },						
//						params : { param1 : swerk, param2 : equnr  }
//	
//				})) || "";
//	 
//				sap.ushell.Container.getService("CrossApplicationNavigation").toExternal({
////		        sap.ushell.Container.getService("ShellNavigation").toExternal({
//					target : { semanticObject : "ZPM_SO_0071", action : "display" },
////					target : { shellHash : "#ZPM_SO_0071-display" },						
//					params : { param1 : swerk, param2 : equnr  }
//				 });
//				
				this.onNotiSearch(obj.EQUNR, obj.INVNR);
				
			}
		}, 
		
		
		onPress_equnr : function(oEvent){
			debugger;
			var sEqunr = oEvent.getSource().getText();
			var idx = oEvent.getSource().getParent().getIndex();
			var oTable =  this.getView().byId("table");
								
			if (idx != -1) {
				  var cxt = oTable.getContextByIndex(idx); 
				  var path = cxt.sPath;
				  var sObj = oTable.getModel().getProperty(path);
				  //console.log(this.obj);
		  
				if(sObj){
					var sSwerk = this.oSwerk.getSelectedKey();
					var sEqunr = sObj.EQUNR;
					var sInvnr = sObj.INVNR;
					
					this.getOwnerComponent().openEquipDetail_Dialog(this, sSwerk, sEqunr);								
				}
			}
		},	
		
		
		onNotiSearch : function(vEqunr, vInvnr) {
			var oModel = this.getView().getModel("equipList");
			var controll = this;
			var lange = this.getLanguage();
			var swerk = this.oSwerk.getSelectedKey();
						
			var s_swerk;        //swerk
			var s_equnr = [];    //
			var s_coc = [];     //Cost Center
			
			var s_filter = [];
			
			s_swerk = this.oSwerk.getSelectedKey();
			
			s_equnr.push(vEqunr);
			s_filter.push(utils.set_filter(s_equnr, "Equnr"));
			
			if(this.oCoc){
				var vCoc = this.oCoc.getTokens();
				for(var j=0; j<vCoc.length; j++){
					s_coc.push(vCoc[j].getProperty("key"));
				}
				if(s_coc.length>0){
					s_filter.push(utils.set_filter(s_coc, "Kostl"));
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
	
			//var path = "/KeyListSet(Type='P',Spras='"+lange+"',Swerk='"+s_swerk+"')";
			var path = "/InputSet(Spras='"+lange+"',Swerk='"+s_swerk+"')";
			var mParameters = {
				urlParameters : {
					"$expand" : "ResultList",
					"$filter" : filterStr
				},
				success : function(oData) {
					
					if(oData.RetMsg == 0 || oData.RetType == "E" ) {
					 sap.m.MessageBox.show(
							 		 controll.i18n.getText("err_notification"),
									 sap.m.MessageBox.Icon.ERROR,
									 controll.i18n.getText("error"));					
					} else {
						controll.getOwnerComponent().openEquipList_Dialog(controll, s_swerk, vEqunr, vInvnr );  //1)
					
//						if (sap.ushell && sap.ushell.Container && sap.ushell.Container.getService){
//						  var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
//		
//						   oCrossAppNavigator.toExternal({
//						                      target: { semanticObject : "ZPM_SO_0071", action: "display" },   //the app you're navigating to 
//						                      params : { param1 : swerk, param2 : vEqunr  }
//						                     }); 
//						}else{			     
//							 sap.m.MessageBox.show(
//							 "Cannot Navigate - Application Running Standalone",
//									 sap.m.MessageBox.Icon.ERROR,
//									 controll.i18n.getText("error"));				     
//						}
					}					
	
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