sap.ui.define([
		"cj/pm0030/controller/BaseController",
		"cj/pm0030/util/ValueHelpHelper",
		"cj/pm0030/util/utils",
		"cj/pm0030/model/formatter",		
		"sap/ui/model/json/JSONModel",
		"sap/m/MessageBox",
		"jquery.sap.global"
	], function (BaseController, ValueHelpHelper, utils, formatter, JSONModel, Message, jQuery) {
		"use strict";

		return BaseController.extend("cj.pm0030.controller.Main", {
			formatter : formatter,

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
				
				var oView = this.getView();
			    // Table Filter set 
			  	var oTable = oView.byId("table");
					oView.setModel(new JSONModel({
						globalFilter: "",
						availabilityFilterOn: false,
						cellFilterOn: false
					}), "ui");
			},

		/**
		* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		* (NOT before the first rendering! onInit() is used for that one!).
		*/
 			onBeforeRendering: function() {
// 				this.i18n = this.getView().getModel("i18n").getResourceBundle();
 				
 				this.getLoginInfo();
 				this.set_userData();  //"User Auth"		
 				
// 				utils.makeSerachHelpHeader(this);	
 			},
 			
 			setInitDate : function(){
			    var default_swerk ;
				this.oSwerk = this.getView().byId("swerk");
				//Main.Plant Search
				if(this.oSwerk && this.oSwerk.getItems().length == 0 ){
					for(var j=0; j<this.arr_swerk.length; j++){
						var template = new sap.ui.core.Item();
			            template.setKey(this.arr_swerk[j].Value);
			            template.setText(this.arr_swerk[j].KeyName);
			            this.oSwerk.addItem(template);
			            
			            if(this.arr_swerk[j].Default ===  'X'){
			            	default_swerk = j;
			            }
				     }
			        this.oSwerk.setSelectedKey(this.arr_swerk[default_swerk].Value);
				}
				
// 				// Fromdate = 현재일 기준 - 30
// 				//ToDate = 현재딜 
// 				var fromDate = new Date();
//				var fromday = fromDate.getDate() - 30 ;
//				fromDate.setDate( fromday );
//			    this.getView().byId("nplda_from").setDateValue( fromDate );				
//			    this.getView().byId("nplda_to").setDateValue( new Date() );		
			    var nplda_from = this.getView().byId("nplda_from");				
			    var nplda_to   = this.getView().byId("nplda_to");
			    
			    nplda_from.setDisplayFormat(this.dateFormat);
			    nplda_from.setValueFormat("yyyyMMdd");
			    
			    nplda_to.setDisplayFormat(this.dateFormat);
			    nplda_to.setValueFormat("yyyyMMdd");
			    
			    var fromDate = this.formatter.strToDate(this.locDate);
			    var toDate = new Date();
				var toDay =  fromDate.getDate() + 30;
				toDate.setDate( toDay );
				
				nplda_from.setDateValue( fromDate );				
				nplda_to.setDateValue( toDate );	
				
			    // Readby Input field에 현재 Login사용자 ID Default 로 출력 
			    var Readby = "";
			    Readby = this.getLoginId();
//				if(window.location.hostname != "localhost"){
//					Readby = this.getLoginInfo().getFullName();
//     			}else{
//     				Readby = this.getLoginId();
//     			}			    
			    this.getView().byId("readby").setValue( Readby );			
			    
			    this.getView().byId("table").setShowNoData(false);
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
						    	"Default" : oData.results[i].Default
							  }
						   );
					   }				   				   
					   controll.set_UserInfo(userDefault);						
					   debugger;
		         	   this.i18n = this.getView().getModel("i18n").getResourceBundle();				
					   utils.makeSerachHelpHeader(this);	
					   
					   controll.set_auth();
					   controll.setInitDate();
					   controll._set_search_field();  // set Search Help
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
			
			
			set_auth : function(){
				this.arr_swerk  = this.get_Auth("SWERK");
				this.arr_kostl  = this.get_Auth("KOSTL");
				this.arr_kokrs  = this.get_Auth("KOKRS");
				this.locDate    = this.get_Auth("LOCDAT")[0].Value;
				this.locTime    = this.get_Auth("LOCTIM")[0].Value;
				this.dateFormat = this.get_Auth("DATFORMAT")[0].Value;
				this.sep        = this.get_Auth("SEP")[0].Value;				 
			},

			
	 /****************************************************************
	  *  Search hdlp, Combo Box Setting
	  ****************************************************************/				
		_set_search_field : function(){
			var v_swerk = this.oSwerk.getSelectedKey();
			
			// Measuring Point Search 
			this.oMep = this.getView().byId("mep");
			if(this.oMep){
				utils.set_search_field(v_swerk, this.oMep, "mep", "H", "", "");
			}
			
            // Valuation Class Search 
			this.oCac = this.getView().byId("cac");
			if(this.oCac){
				utils.set_search_field(v_swerk, this.oCac, "val", "C", "6", "");
			}	
			 
	      },
			 	
			
      /****************************************************************
	  *  Eqipment Search Help   : Open Event Handler
	  ****************************************************************/	
		// Equipment 의 Combo박스를 클릭했을때 Event 발생 -> Dialog box로 Search Help 생성 
            onValueHelpRequest : function(oEvent){
				
				var strArr = oEvent.oSource.sId.split("--");
				var cnt = strArr.length - 1;
				var sIdstr = strArr[cnt];
								
				var s_swerk = this.getView().byId("swerk").getSelectedKey();
				
				if(sIdstr === "equnr"){
                	this.getOwnerComponent().openSearchEqui_Dialog(this, "MultiToggle", s_swerk);
				}else{
					utils.openValueHelp(sIdstr);
				}
				
			},
	
	
		   /****************************************************************
		    *   Eqipment Search Help   : Close Open Event Handler
		   ****************************************************************/				
			onClose_searchEquip : function(aTokens){
				var oEqunr = this.getView().byId("equnr");
				oEqunr.setTokens(aTokens);
			},
					
	
			/****************************************************************
			  * Maint. Plant를 변경 했을때   Equipment 에 선택된 값 삭제 
			  * : Equipment 의 값은 Maint.Plant 값이 의해 변경되므로 
			****************************************************************/
			on_swerk_Select : function(){
	            // Valuation Class Search 			
				this.oCac.setSelectedKey("");
				this.oCac.removeAllItems();

				// Measuring Point Search 
				this.oMep.removeAllTokens();	

				this.getView().byId("equnr").removeAllTokens();	
				
				this._set_search_field();
			},
			
			
		   /****************************************************************
		   *   검색 버튼 실행 :oData호출 
		   ****************************************************************/						
			
			onSearch : function(){
				var oModel = this.getView().getModel();
				var controll = this;
			
				var s_filter = [];    //Date Filter
				var s_equnr = [];   // Equipment
				var s_point = [];   // Measuring Point
				
  	            var oTable = this.getView().byId("table");
  	            
				oModel.attachRequestSent(function(){oTable.setBusy(true);});
				oModel.attachRequestCompleted(function(){
															oTable.setBusy(false);
															oTable.setShowNoData(true);
														});
					
			    // Get Language
				var lange = this.getLanguage();
				s_filter.push(utils.set_eq_filter("Spras", lange));
				
				// Plan Date				
			    var startDate = this.getView().byId("nplda_from").getDateValue();
				var endDate = this.getView().byId("nplda_to").getDateValue();
				var from = this.formatter.dateToStr(startDate);
				var to = this.formatter.dateToStr(endDate);
				
				if(from != "00000000"){
		    		s_filter.push(utils.set_eq_filter("From", from));
				}						

				if(to != "00000000"){
					s_filter.push(utils.set_eq_filter("To", to));
				}					
	    		
	    		
	    		// Maint. Plant
				var s_swerk = this.oSwerk.getSelectedKey();
				if (s_swerk!= ""){
				s_filter.push(utils.set_eq_filter("Swerk", s_swerk)); 
				}	
				
	    		// Equipment
		    	var oEqunr = this.getView().byId("equnr").getTokens();
		    	for(var  j=0; j< oEqunr.length; j++){
		    		s_equnr.push(oEqunr[j].getProperty("key"));
		    	}
		    	if(s_equnr.length>0){
		    		s_filter.push(utils.set_filter(s_equnr, "Equnnr"));
			    }	
		    	 
		    	// Measuring Point
		    	var oPoint = this.getView().byId("mep").getTokens();
		    	for(var  j=0; j< oPoint.length; j++){
		    		s_point.push(oPoint[j].getProperty("key"));
		    	}
		    	if(oPoint.length>0){
		    		s_filter.push(utils.set_filter(s_point, "Point"));
			    }	
		    	
		    	//Valuation
				var s_vacls = this.getView().byId("cac").getSelectedKey();
				if (s_vacls!= ""){
				s_filter.push(utils.set_eq_filter("Vlcod", s_vacls)); 
				}	
				
			 	//Read by
				var s_readby = this.getView().byId("readby").getValue();
				if (s_readby!= ""){
				s_filter.push(utils.set_eq_filter("Readr", s_readby)); 
				}	 
				
		    	var filterStr;
				for(var i=0; i<s_filter.length; i++){
					
					if(i === 0){
						filterStr = s_filter[i];
					}else{
						filterStr = filterStr + " and " + s_filter[i];
					}
				} 
				
		    	var path = "/SELECTSet('ALL')";
		  
		    	var mParameters = {
					urlParameters : {
						"$expand" : "NP_SELECT_LIST" ,
						"$filter" : filterStr
					},
					success : function(oData) {
						  
						 var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
						 oODataJSONModel.setData(oData);
						 oTable.setModel(oODataJSONModel);
						 oTable.bindRows("/NP_SELECT_LIST/results");	
						 
/*						 if (oData.Type == 'E') {
							 sap.m.MessageBox.show(
								 oData.Message,   // No data
								 sap.m.MessageBox.Icon.ERROR,
								 controll.i18n.getText("Error")  
							);
						 }*/
 
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

				
			// Download Excel 
				// download excel
				downloadExcel : function(oEvent) {
					var oModel, oTable, sFilename;
					
					oTable = this.getView().byId("table");
					oModel = oTable.getModel();
					sFilename = "File";
					
					utils.makeExcel(oModel, oTable, sFilename);
				},
						
				// clear Sort 	
				clearAllSortings : function(oEvent) {
					var oTable = this.getView().byId("table");
					oTable.getBinding("rows").sort(null);
					this._resetSortingState();
				},

				// clear filter
				clearAllFilters : function(oEvent) {
					var oTable = this.getView().byId("table");

					var oUiModel = this.getView().getModel("ui");
					oUiModel.setProperty("/globalFilter", "");
					oUiModel.setProperty("/availabilityFilterOn", false);

					this._oGlobalFilter = null;

					var aColumns = oTable.getColumns();
					for (var i = 0; i < aColumns.length; i++) {
						oTable.filter(aColumns[i], null);
					}
				},

				// Search filter set
				filterGlobally : function(oEvent) {
					var sQuery = oEvent.getParameter("query");
					this._oGlobalFilter = null;
					if (sQuery) {
						this._oGlobalFilter = new Filter(
						[
							new Filter("MitypCt", FilterOperator.Contains,sQuery),
							new Filter("WarplCt", FilterOperator.Contains,sQuery),
							new Filter("PlanSortT", FilterOperator.Contains,sQuery) 			
					    ], 
					    false)
					}
					this._filter();
				},
				
				_resetSortingState : function() {
					var oTable = this.getView().byId("table");
					var aColumns = oTable.getColumns();
					for (var i = 0; i < aColumns.length; i++) {
						aColumns[i].setSorted(false);
					}
				},
	
				_filter : function() {
					var oFilter = null;
	
					if (this._oGlobalFilter) {
						oFilter = this._oGlobalFilter;
					}
	
					this.getView().byId("table").getBinding("rows").filter(oFilter,
							"Application");
				},	
			
			// Show chart
			show_chart : function(){
				this.getOwnerComponent().ChartDialog.open(this.getView());
			},
				
			onRowSelect : function(oEvent) {
				var controll = this;
				
				var idx = oEvent.getParameter('rowIndex');
				var oTable =  this.getView().byId("table");
				
				if (oTable.isIndexSelected(idx)) {
				  var cxt = oTable.getContextByIndex(idx);
				  var path = cxt.sPath;
				  var obj = oTable.getModel().getProperty(path);
				  //console.log(obj);
				  this.getOwnerComponent().ChartDialog.open(this.getView());

				}
			},
			
		/**
		* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		* This hook is the same one that SAPUI5 controls get after being rendered.
		*/
//			onAfterRendering: function() {

//			},

		/**
		* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		*/
//			onExit: function() {
//			}

			

		});
	}
);