sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"cj/pm0071/util/ValueHelpHelper",
	"cj/pm0071/util/utils",
	"cj/pm0071/model/formatter"
], function (Object, JSONModel, Filter, FilterOperator, Message, Toast, ValueHelpHelper, utils, formatter) {
	"use strict";

	return Object.extend("cj.pm0071.controller.EquipList", {
		formatter: formatter,

		constructor : function (oView) {
			this.oMain = oView;
		},
	
		createHandler : function(oDialog, MainParam, EquipMain){
			this.oDialog = oDialog;
			
			this.oMainParam = MainParam;
			this.EquipMain  = EquipMain;

			this.arr_swerk = MainParam.arr_swerk;
	        this.arr_kostl = MainParam.arr_kostl;
	        this.arr_kokrs = MainParam.arr_kokrs;     
	        
			this.locDate    = MainParam.locDate;
			this.locTime    = MainParam.locTime;
			this.dateFormat = MainParam.dateFormat;
			this.sep        = MainParam.sep;        

		},
		
		set_header : function(vSwerk, vEqunr, vInvnr){

			this.i18n = this.oMain.oController.getView().getModel("i18n").getResourceBundle();
			
			// Maintenance Plan UI
			var oSwerk;
			var oEqunr;
			var arr_swerk = [];
			var arr_kostl = [];
			var arr_kokrs = [];

			this.oSwerk = this.oMain.oController.getView().byId("swerk");
			this.oEqunr = this.oMain.oController.getView().byId("equnr");
			this.oInvnr = this.oMain.oController.getView().byId("invnr");

			//this.getLoginInfo();
			//this.set_userData();  		//User Auth
				
			this.oTable = this.oMain.oController.getView().byId("table_eq");	
			
	        utils.makeSerachHelpHeader(this.oMain.oController);	
	        this._set_search_field();			
			
			this.oSwerk.setSelectedKey(vSwerk);
			this.oEqunr.setValue(vEqunr);
			this.oInvnr.setValue(vInvnr);
			
//			this.oSwerk.setEnabled(false);
//			this.oEqunr.setEnabled(false);
		},

		set_data : function(){
		
			this.equipmentList();
		},
		
		onListCloselDialog : function(){
			this.oDialog.close();
			//this.wrMain.onClose_workResult();			
		},
		
		/**
		 * set default value
		 */
		_set_search_field : function(vSwerk) {
		
			this.oSwerk = this.oMain.oController.getView().byId("swerk");
	  		
	  		var default_swerk;				
	  		if(!vSwerk){
	  			
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
	  			this.oSwerk.setSelectedKey(vSwerk);
	  		}			
		},
		
		equipmentList : function(){
			
			var oModel = this.oMain.oController.getView().getModel("equipList");
			var controll = this;
			var lange  = this.oMainParam.getLanguage();

			var oSwerk = controll.oMain.oController.getView().byId("swerk");
			var oEqunr = controll.oMain.oController.getView().byId("equnr");
			var oTable =  controll.oMain.oController.getView().byId("table_eq");
			
			oModel.attachRequestSent(function(){oTable.setBusy(true);});
			oModel.attachRequestCompleted(function(){oTable.setBusy(false);});			
						
			var s_swerk;        //swerk
			var s_equnr = [];    //			
			var s_filter = [];
			
			s_swerk = this.oSwerk.getSelectedKey();
			
			//filterStr 에 값이 없는 경우 Odata 에러 발생, 하나의 filter라도 넣어주기 위함 
			s_equnr.push(oEqunr.getValue());
			s_filter.push(utils.set_filter(s_equnr, "Equnr"));
			
			var filterStr;
			for(var i=0; i<s_filter.length; i++){
				
				if(i === 0){
					filterStr = s_filter[i];
				}else{
					filterStr = filterStr + " and " + s_filter[i];
				}
			}
					
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
	
				}.bind(this),
				error : function() {
					 sap.m.MessageBox.show(
					 controll.oMainParam.i18n.getText("oData_conn_error"),
					 sap.m.MessageBox.Icon.ERROR,
					 controll.oMainParam.i18n.getText("error")
					 );
				}.bind(this)
			};
			oModel.read(path, mParameters);
		},
		onPress_Qmnum  : function(oEvent){
			var controll = this;
			var sQmnum = oEvent.getSource().getText();
			var idx = oEvent.getSource().getParent().getIndex();
			var oTable =  controll.oMain.oController.getView().byId("table_eq");
								
			if (idx != -1) {
				  var cxt = oTable.getContextByIndex(idx); 
				  var path = cxt.sPath;
				  var sObj = oTable.getModel().getProperty(path);
				  //console.log(this.obj);
		  
				if(sObj){				
					// Step 1: Get Service for app to app navigation
					var navigationService = sap.ushell.Container.getService('CrossApplicationNavigation');
					// Step 2: Navigate using your semantic object
	
					var hash = navigationService.hrefForExternal({
						  target: {semanticObject : 'ZPM_SO_0090', action: 'display'},
						  params: {param_mode: 'D',
							       param_swerk: controll.oSwerk.getSelectedKey(),
							       param_qmnum : sObj.Qmnum}
						});
	
					var url = window.location.href.split('#')[0] + hash;
					sap.m.URLHelper.redirect(url, true);	
				}
			}
						
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