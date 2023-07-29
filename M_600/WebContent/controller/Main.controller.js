sap.ui.define([
		"cj/pdf/controller/BaseController",
		"cj/pdf/util/ValueHelpHelper",
		"cj/pdf/util/utils",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/model/json/JSONModel",
		"sap/m/MessageBox",
		"sap/m/MessageToast",
		"jquery.sap.global"		
	], function (BaseController, ValueHelpHelper, utils, Filter, FilterOperator, JSONModel, Message, Toast, jQuery ) {
		"use strict";
		
		return BaseController.extend("cj.pdf.controller.Main", {
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @public
		 */
			onInit : function () {
		//		this.aTokens = new Array();
				
				var oView = this.getView();
				
		        // Make download
		        var filedownload = this.getView().byId("download");		
			},
		
		/**
		* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		* (NOT before the first rendering! onInit() is used for that one!).
		*/
			onBeforeRendering: function() {
//				this.i18n = this.getView().getModel("i18n").getResourceBundle();

				// Maintenance Plan UI
				var oSwerk;
				var arr_swerk = [];
				var arr_kostl = [];
				var arr_kokrs = [];
												
				this.getLoginInfo();
				this.set_userData();  //"User Auth"		
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
					   
					   controll.set_auth();
					   
					    // set default value 
					   controll.set_search_field();
					   controll.setInitData();					   
					   					   
					}.bind(this),
					error : function(oError) {
						jQuery.sap.log.info("Odata Error occured");
						Toast.show("Error");
					}.bind(this)
				};
				oModel.read(path, mParameters);			
			},			
			/*
			 * User Default Setting 
			 */
			set_auth : function(){
				this.arr_swerk = this.get_Auth("SWERK");
				this.arr_kostl = this.get_Auth("KOSTL");
				this.arr_kokrs = this.get_Auth("KOKRS");
			},
			/*
			 * Parameter Setting 
			 */
			setInitData : function(){

			},
			

			/* 
			 * PM Possible Entry Odata Set 
			 */	
			set_search_field : function() {
				
				this.oSwerk = this.getView().byId("swerk");
				
				var default_swerk;
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
				 
			},
			
			/**
			* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
			* This hook is the same one that SAPUI5 controls get after being rendered.
			*/
//		    onAfterRendering: function() {
				
//			},

			/**
			* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
			*/
//				onExit: function() {
//				}
			
			dataRequiredCheck : function(){
	            var view = this.getView();
	            
	            var page = view.byId("Main");
	            var inputs = [
	                  view.byId("period") 
	             ];
	                     
				jQuery.each(inputs, function (i, input) {
					if (!input.getValue()) {
						input.setValueState("Error");
					}else{
						input.setValueState("None");
					}
				});
	 
				// check states of inputs
				var canContinue = true;
				jQuery.each(inputs, function (i, input) {
					if ("Error" === input.getValueState()) {
						canContinue = false;
						return false;
					}
				});
	 
				// output result
				if (canContinue) {
					Toast.show("The input is correct. You could now continue to the next screen.");
				} else {		
					Toast.show("Complete your input first.");
				}
				return false;
			},
			
			/*
			 * Mandatory Check 
			 */
			checkMandatory : function(){
				var oView = this.getView();
				var oPage = oView.byId("main");
				var page_child_cnt = oPage.getContent().length;
				
			    this.required = [];
			    var _check;
			    
			    var controll = this;
				
				for(var i=0; i<page_child_cnt; i++){
					try{
					  if(oPage.getContent()[i] instanceof sap.ui.table.Table ){   // Table의 경우 다르게 체크해야 함 
						  controll._checkTable(oPage.getContent()[i], controll);
					  }else{
						  var parent = oPage.getContent()[i].getItems();
						  controll._checkItem(parent, controll);
					  }
					}catch(err){
						if(oPage.getContent()[i].mProperties.required && !(oPage.getContent()[i] instanceof sap.m.Label)){
							 var sId = parent[i].mProperties.getId();
							 controll.required.push(
							    {
							    	"sId" : sId
								}
						     );
					    }
					}
				}
				var inputs = [];
				
				for(var j=0; j<this.required.length; j++){
	                var obj = oView.byId(this.required[j].sId);
					inputs.push(
	   			        obj
					);
				}
				
				if(inputs.length > 0){
					jQuery.each(inputs, function (i, input) {
						if (!input.getValue()) {
							input.setValueState("Error");
						}else{
							input.setValueState("None");
						}
					});
		 
					// check states of inputs
					var canContinue = true;
					jQuery.each(inputs, function (i, input) {
						if ("Error" === input.getValueState()) {
							canContinue = false;
							return false;
						}
					});
				}
	 
				// output result
				if (canContinue) {
					//Toast.show("The input is correct. You could now continue to the next screen.");
					_check = true;
				} else {
					Toast.show("Complete your input first.");
					_check = false;
				}
				return _check;
			},	
			
			_checkItem : function(parent, controll) {
				
				var item_cnt = parent.length;
				
				  for(var j=0; j<item_cnt; j++){
					 try{
						 var sub_Elements = parent[j]._aElements;
						 if(!sub_Elements){ throw new Error(err);}
					 
						 
						 controll._checkItem(sub_Elements, controll);
						 
					 }catch(err){
						 try{
							 var sub_parent = parent[j].getItems();
							 controll._checkItem(sub_parent, controll); 
						 }catch(err){
							 if(parent[j].mProperties.required && !(parent[j] instanceof sap.m.Label) ){
								 var sId = parent[j].getId();
								 controll.required.push(
								    {
								    	"sId" : sId
									}
							     );
							  }							 
						 }
					 }
				  }
				 return controll.required;
			},
			
			_checkTable : function(oTable, controll){
				var cols = oTable.getColumns();
				
				var tableModel = oTable.getModel();
				var rowCnt = tableModel.oData.HeaderItem.results.length;
				
				var headeritem = tableModel.oData.HeaderItem.results;
				
				for(var i=0; i<rowCnt; i++){
					for(var j=0; j<cols.length; j++){
						var oTemplate = cols[i].getTemplate();
						if(oTemplate.mProperties.required){
							if(!headeritem[i].PrdNm){
								headeritem[i].chkError = "Error"
							}else{
								headeritem[i].chkError = "None"
							}
						}
					}
				}
			},
									
			onValueHelpRequest : function(oEvent){
				var strArr = oEvent.oSource.sId.split("--");
				
				var i = strArr.length - 1;
				var sIdstr = strArr[i];
				
				if(sIdstr === "loc"){
					this._oLoc_sh.openValueHelp(
						"/results", 
						function(selection,ctx){
					    },
					    function(ctx){
						    console.log("Error");
					    },
					    this
					 );
			    }else if(sIdstr === "tplnr"){

	
				}else if(sIdstr === "equnr"){
					this.getOwnerComponent().openSearchEqui_Dialog(this, "MultiToggle"); 
	
			    }else if(sIdstr === "psort"){
					this._oSrt_sh.openValueHelp(
						"/results", 
						function(selection,ctx){
					    },
					    function(ctx){
						    console.log("Error");
					    },
					    this
					 );					
						
				}else if(sIdstr === "woc"){
					this._oWoc_sh.openValueHelp(
						"/results", 
						function(selection,ctx){
				        },
				        function(ctx){
					     console.log("Error");
				        },
				        this
				    );
				}
			
			},

			/****************************************************************
			 *  Event Handler
			 ****************************************************************/				

			/*
			 * ComboBox select
			 */
			onSwerkSelect : function(oEvent) {	
				var controll = this;

			    // set default value 
			   controll.set_search_field();			   
			},
						
									
			/*
			 * Search by search Button
			 */
			onBtnSearch: function(oEvent){
				this.onSearch(oEvent);
			},
			
			onSearch : function(oEvent){
				 
				var oModel = this.getView().getModel();
				var controll = this;
				
				var s_swerk;        // swerk
				var s_equnr;        // equnr
				var s_lifnt;        // lifnr
				var s_equnr = [];   // Equipment

				var s_filter = [];
								
				/*
				 * Key
				 */				
				var lange = this.getLanguage();
				// Maint. Plant
				s_swerk = this.oSwerk.getSelectedKey();
				//임시 Test*************************************************
				if (window.location.hostname == "localhost") {
					var s_swerk = "2010";
				}				
				//******************************************************
				
			    var s_lifnr = this.getView().byId("lifnr").getValue();

			    var sPath;

			    	
				if (window.location.hostname == "localhost") {
					sPath = "http://gerpapd.cjwise.net:8020/sap/opu/odata/SAP/ZPM_GW_PDF_SRV/PdfSet(customer='"+s_lifnr+"')/$value";
				} else {	
					sPath = "/ZPM_GW_PDF_SRV/PdfSet(customer='"+s_lifnr+"')/$value";
			    } 
				
			    //var context = oEvent.getSource().getBindingContext();
  			    var html = new sap.ui.core.HTML();
  			    
                $(document).ready(function(){
	  				window.open(sPath);
	  			});

			},


	/****************************************************************
	 *  SearchEqui_pop Event
	 ****************************************************************/			
			onClose_searchEquip : function(aTokens){
				var oEqunr = this.getView().byId("equnr");
				oEqunr.setTokens(aTokens);
			},			
			
	/****************************************************************
	 *  Local function
	 ****************************************************************/
			/*
			 * call popup fragment 
			 */ 
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

			
			// call popup fragment 
			_getDialog : function () {
		        
				if (!this._oDialog) {
		            this._oDialog = sap.ui.xmlfragment("cj.pdf.view.SearchEqui_pop", this);
		            this.getView().addDependent(this._oDialog);           
		         }

		         return this._oDialog;
		      },


//			
		      // ComboBox 공통 Odata 상용 시 
		     _get_comboModel : function(Obj, key, urlParameters) {
				var oModel = this.getView().getModel("possible");
				var path = "/ImportSet('" + key + "')" ;
				
				var mParameters = {
				  urlParameters : urlParameters,
				  success : function(oData) {
						
		              for(var i=0; i<oData.Result.results.length; i++){
		          	   var template = new sap.ui.core.Item();
		                 template.setKey(oData.Result.results[i].Key);
		                 template.setText(oData.Result.results[i].Name);
		                 Obj.addItem(template);
		              }
					  
				  }.bind(this),
				  error : function(oError){
					  Toast.show("Error");
				  }
				}
				oModel.read(path, mParameters);
			},
			
			
		});
	}
);