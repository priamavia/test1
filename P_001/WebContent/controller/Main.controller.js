sap.ui.define([
		"cj/pm0010/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/m/MessageBox",
		"sap/m/MessageToast",
		"jquery.sap.global",
		"cj/pm0010/util/ValueHelpHelper",
		"cj/pm0010/util/utils",
		"cj/pm0010/util/SearchEqui",
		"cj/pm0010/util/EquipmentBOM",
		"cj/pm0010/util/SearchEquipStock",
		"cj/pm0010/util/EquipmentDetail",
		"cj/pm0010/model/formatter"
	], function (BaseController, JSONModel, Filter, FilterOperator, Message, Toast, jQuery, ValueHelpHelper, utils, 
			    SearchEqui, EquipmentBOM, EquipStock, EquipmentDetail, formatter) {
		"use strict";

		return BaseController.extend("cj.pm0010.controller.Main", {
			formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @public
		 */
			onInit : function () {
				
			},

		/**
		* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		* (NOT before the first rendering! onInit() is used for that one!).
		*/
			onBeforeRendering: function() {			
     			var arr_swerk = [];
				var arr_kostl = [];
				var arr_kokrs = [];
				
				this.getLoginInfo();
				this.set_userData();  //"User Auth"
				
			//	this.chkBom = [];   // BOM Check 

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

	        /*
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
						this.i18n = this.getView().getModel("i18n").getResourceBundle();
					   
					   controll.set_auth();
					}.bind(this),
					error : function(oError) {
						   sap.m.MessageBox.show(
									 this.oMainParam.i18n.getText("oData_conn_error"),
									 sap.m.MessageBox.Icon.ERROR,
									 this.oMainParam.i18n.getText("error")
								   );							
//						jQuery.sap.log.info("Odata Error occured");
//						Toast.show("Error");
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
			
	/****************************************************************
	 *  Event Handler
	 ****************************************************************/	
			onPress : function(oEvent){
				this._getDialog_searchEqui("MultiToggle").open();   //MultiToggle, Single 
			},
			
			onPress_BOM : function(oEvent){
				this._getDialog_BOM().open();  
			},
			
			onPress_equipMaterial : function(oEvent){
				this._getDialog_equipStock().open();  
			},
			
			onPress_equipDetail : function(oEvent){
				this._getDialog_equipDetail().open();
			},
			
	/****************************************************************
	 *  SearchEqui_pop Event
	 ****************************************************************/			
			//cancel
			onCloseDialog : function(oEvent){
				this._oDialog_searchEqui.close();
			},
			
			//confirm
			onConfirmDialog : function(oEvent){
				var message;
				
				if(sap.ui.getCore().byId("tab").getSelectedKey() === "tab1"){
					var selectIdx = this._search_equi_Dialog_handler.oTable.getSelectedIndices();
				}else if(sap.ui.getCore().byId("tab").getSelectedKey() === "tab2"){
					var selectIdx = this._search_equi_Dialog_handler.oTree.getSelectedIndices();
				
					//var path = this._search_equi_Dialog_handler.oTree.getModel().oData;
					for(var i=0; i<selectIdx.length; i++){
						var path = this._search_equi_Dialog_handler.oTree.getContextByIndex(selectIdx[i]).getPath().replace("/","");
						var isEqui = this._search_equi_Dialog_handler.oTree.getContextByIndex(selectIdx[i]).getModel().oData[path].isEqui;
						if(isEqui === "X"){
							this._search_equi_Dialog_handler.oTree.getContextByIndex(selectIdx[i]).getModel().oData[path].Id;
						}
					}
				}
				
				if(this._search_equi_Dialog_handler.oTable){
					this._search_equi_Dialog_handler.oTable.clearSelection();
				}
				if(this._search_equi_Dialog_handler.oTree){
					this._search_equi_Dialog_handler.oTree.clearSelection();
				}
				
				 sap.m.MessageBox.show(
						 selectIdx,
						 sap.m.MessageBox.Icon.SUCCESS,
						 selectIdx
			     );
				 this._oDialog_searchEqui.close();
			},
			/*
			 * Tab 선택 시  (Search by F/L)
			 */
			onSelectTab : function(oEvent){
				this._search_equi_Dialog_handler.selectTab(oEvent);
			},
			
			onValueHelpRequest_eq : function(oEvent){
				this._search_equi_Dialog_handler.onValueHelpRequest(oEvent);
			},
			
			onEqSearch : function(){
			  this._search_equi_Dialog_handler.search();
			},
			
			onSelectEqTree : function(oEvent){
				this._search_equi_Dialog_handler.selectEqTree(oEvent);
			},
			
			downloadExcel_Eq : function(oEvent){
				this._search_equi_Dialog_handler.downloadExcel();
			},
			
			clearAllSortings_Eq : function(oEvent){
				this._search_equi_Dialog_handler.clearAllSortings();
			},
			
			clearAllFilters_Eq : function(oEvent){
				this._search_equi_Dialog_handler.clearAllFilters();
			},
			
	/****************************************************************
	 *  EquipmentBOM_pop Event
	 ****************************************************************/			
			//cancel
			onCloseDialog_bom : function(oEvent){
				this._oDialog_BOM.close();
			},
			
			//confirm(select)
			onConfirmDialog_bom : function(oEvent){
				this._BOM_Dialog_handler.confirmDialog(oEvent);
			},
			
			//CBO check 시 Event 
			onChKSelect : function(oEvent){
							
/*				var path = oEvent.getSource().getBindingContext().getPath();
				
				if(oEvent.getParameter("selected") === true){
					//this.chkBom.push(path);
					oEvent.getSource().getModel().getProperty(path).Chk = true;
				}else{
					oEvent.getSource().getModel().getProperty(path).Chk = false;
//					for(var i=0; i<this.chkBom.length; i++){
//						if(path === this.chkBom[i]){
//							this.chkBom.splice(i, 1);
//						}
//					}
				}
				
				var ch_model = oEvent.getSource().getModel();
				this.oTree_bom.getModel().setData();*/
				
				//this.oTree_bom.getModel().refresh();
				//this.oTree_bom.rerender();
				
				var oItemNavigation = this.oTree_bom._getItemNavigation();
				var oItemRef = oItemNavigation.getItemDomRefs(); 
				
				// $("div[id*='rowsel']").class;
				 
				//$("[aria-level='1']").addClass("sapUiTableSelAllDisabled")
				
				/*var oRowSel = [];
				oRowSel = $("div[id*='rowsel']");
				for(var i=0; i< oRowSel.length ; i++){
					var aClass = oRowSel[i].attributes;
					var object = aClass[2];
					//var oDomRef = oItemRef[i].cells[0];
					//var oCheckBoxId = oDomRef.childNodes[0].childNodes[0].id;
					//var oTextMatch =  oTable.getAggregation("items")[i-1].getCells()[1].getText();

			    }*/
				


			},
			
		
			//Table check filed check 시 Event 
			onSelectTree_bom : function(oEvent){
                
				/*var path = oEvent.getParameter("rowContext").getPath().replace("/","");
				var lv_postp = oEvent.getParameter("rowContext").getModel().oData[path].Postp;
				var idx = oEvent.getParameter("rowIndex");
				
				if(this.oTree_bom.isIndexSelected(idx) === true){
					if(lv_postp != "L"){
						sap.m.MessageBox.show(
						  this.i18n.getText("selectErr") ,  //comment
						  sap.m.MessageBox.Icon.ERROR,
						  this.i18n.getText("error")  //title
					    );
					}
				}*/
			},
			
///////////// EquipmentBOM_ShMaterial_pop event ( BOM Select Material) ///////
			
			onCloseDialog_bom_sub : function(oEvent){
				this._BOM_Dialog_handler.cancelDialog_sub();
			},
			
			//confirm(select)
			onConfirmDialog_bom_sub : function(oEvent){
				var selRow = [];
				selRow = this._BOM_Dialog_handler.confirmDialog_sub(oEvent);
			},
			
			onQtyChange_BomSub : function(oEvent){
				var errChk = this._BOM_Dialog_handler.qtyChange(oEvent);
			},

	/****************************************************************
	 *  SearchEquipStock_pop Event
	 ****************************************************************/	
			//cancel
			onCloseDialog_Equip : function(oEvent){
				this._oDialog_EqiupStock.close();
			},
			
			onConfirmDialog_Equip: function(oEvent){
				var chkErr = this._equipStock_Dialog_handler.stock_check_data();
						
				if(!chkErr){
					this._equipStock_Dialog_handler.changeRow_stock;
					this._oDialog_EqiupStock.close();
				}
			},
			
			onSearch_equipStock : function(){
				this._equipStock_Dialog_handler.search();
			},
			
			onQtyChange_stock : function(oEvent){
				this._equipStock_Dialog_handler.qtyChange(oEvent);
			},
			
	/****************************************************************
	 *  EquipmentDetail_pop Event
	 ****************************************************************/	
			//cancel
			onCloseDialog_EquipDetail : function(oEvent){
				this._oDialog_EqiupDetail.close();
			},
			

	/****************************************************************
	 *  Local function
	 ****************************************************************/	
			/*
			 * call popup fragment 
			 */ 
			_getDialog_searchEqui : function (selMode) {
		        
				if (!this._oDialog_searchEqui) {
		            this._oDialog_searchEqui = sap.ui.xmlfragment("cj.pm0010.view.SearchEqui_pop", this);
		            this._search_equi_Dialog_handler = new SearchEqui(this._oDialog_searchEqui, this, selMode);

		            this._search_equi_Dialog_handler.set_tab1();
		            
		            this.getView().addDependent(this._oDialog_searchEqui);    
		         }	
		         return this._oDialog_searchEqui;
		      },
			
			
			_getDialog_BOM : function(){
			
				if (!this._oDialog_BOM) {
		            this._oDialog_BOM = sap.ui.xmlfragment("cj.pm0010.view.EquipmentBOM_pop", this);
		           
		            this.oTree_bom = sap.ui.getCore().byId("BOM_tree");
		            this._BOM_Dialog_handler = new EquipmentBOM(this._oDialog_BOM, this);
		          
		            this.getView().addDependent(this._oDialog_BOM);      		         
		         }
				// 선택된 Equipment No. 를 넣는다.
				 this._BOM_Dialog_handler.get_bom_data("3011", "10000023", "Material desc.");
				
				
		         return this._oDialog_BOM;
			},
			
			_getDialog_equipStock : function(){
				
				if (!this._oDialog_EqiupStock) {
		            this._oDialog_EqiupStock = sap.ui.xmlfragment("cj.pm0010.view.SearchEquipStock_pop", this);
		           
		            this._equipStock_Dialog_handler = new EquipStock(this._oDialog_EqiupStock, this);
		          
		            this.getView().addDependent(this._oDialog_EqiupStock);      		         
		         }
		         return this._oDialog_EqiupStock;
			},
			
			_getDialog_equipDetail : function(){
				
				if (!this._oDialog_EqiupDetail) {
		            this._oDialog_EqiupDetail = sap.ui.xmlfragment("cj.pm0010.view.EquipmentDetail_pop", this);
		           
		            this._eqiupDetail_Dialog_handler = new EquipmentDetail(this._oDialog_EqiupDetail, this);
		          
		            this.getView().addDependent(this._oDialog_EqiupDetail);      		         
		         }
				 //선택된 Equipment No. 를 넣는다.
				 this._eqiupDetail_Dialog_handler.get_equip_data("10000010"); 
				 
		         return this._oDialog_EqiupDetail;
			}
		      
		      
		});
	}
);