sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"cj/pm0010/util/ValueHelpHelper",
	"cj/pm0010/util/utils",
	"sap/m/MessageToast"
], function (Object, JSONModel, Filter, FilterOperator, ValueHelpHelper, utils, Toast ) {
	"use strict";

	return Object.extend("cj.pm0010.controller.SearchMaterialStock", {

		constructor : function (oView) {
			this.oMain = oView;
		},

		createHandler : function(oDialog, MainParam,  shMain, selMode){
			this.oDialog = oDialog;
			
			this.oMainParam = MainParam;
			this.shMain = shMain;
			this.selMode = selMode;
			 
			this.selMode = "None";

			this.arr_swerk = MainParam.arr_swerk;
	        this.arr_kostl = MainParam.arr_kostl;
	        this.arr_kokrs = MainParam.arr_kokrs;
	          
	        this._set_search_field();
		},
		
		set_plant : function(sel_plant){
	        this.oSwerk = this.oMain.oController.getView().byId("swerk_mat");
			if(this.oSwerk){
				for(var j=0; j<this.arr_swerk.length; j++){
					var template = new sap.ui.core.Item();
		            template.setKey(this.arr_swerk[j].Value);
		            template.setText(this.arr_swerk[j].KeyName);
		            this.oSwerk.addItem(template);
				}
			}			
			
			this.sel_swerk = sel_plant;
			this.old_swerk = this.oSwerk.getSelectedKey();
			this.oSwerk.setSelectedKey(this.sel_swerk);

			this.oTable = this.oMain.oController.getView().byId("material_table");
			this.oTable.setSelectionMode(this.selMode);		
			
			if(this.sel_swerk.substr(0,1) == 5){
				sap.ui.getCore().getConfiguration().setFormatLocale("pt_BR");
			}else{
				sap.ui.getCore().getConfiguration().setFormatLocale("en_US");
			}
			 
		},
		
		
		onConfirmDialog_Mat : function(oEvent){
			var aTokens = new Array();
			var aObj    = new Array();
			
			var errcnt = 0;
											
			//var oTableModel = this.oMain.oController.getView().byId("material_table").getModel();
			var oTableModel = this.oTable.getModel();
			var oData = oTableModel.getData().results;
			
			for(var i=0; i<oData.length; i++){
				if( parseInt(oData[i].Reqty) > 0){
					//제고 보다 더 많으 수를 넣어도 되도록 수정 됨 
/*					if( parseInt(oData[i].TotQty) <  parseInt(oData[i].Reqty)){
						oData[i].QtyErr = "Error";
						errcnt = errcnt + 1;
					}else{*/

					// 2018-12-01, 사용자가 재고가 없는 항목을 선택하면 Error Message처리 Error Message “You can’t assign material, no available stock exist”
					// 2019-01-19, Plant에 무관하에 수량이 0인 경우에도 선택 될 수 있도록 함
//					if( parseInt(oData[i].TotQty) === 0 && this.sel_swerk.substr(0,1) != 5){
//											oData[i].QtyErr = "Error";
//											errcnt = errcnt + 1;
//					}else{					
						var strText = oData[i].Maktx +" (" + oData[i].Matnr + ")"
						var token = new sap.m.Token({
							key : oData[i].Matnr,
							text :  strText
						});
						aTokens.push(token);
						aObj.push(oData[i]);	
//					}
				}
			}
			
			if(errcnt > 0){
				sap.m.MessageBox.show(
				  this.oMainParam.i18n.getText("qtyzeroerr"),
				  sap.m.MessageBox.Icon.WARNING,
				  this.oMainParam.i18n.getText("warning")
				);
				oTableModel.refresh();	
				return;
			}
			
			if(aObj.length == 0){
				sap.m.MessageBox.show(
				  this.oMainParam.i18n.getText("isnotselected"),
				  sap.m.MessageBox.Icon.WARNING,
				  this.oMainParam.i18n.getText("warning")
		       );
			}else{
				
				oData.result = [];
				oTableModel.setData(oData);
				this.oTable.setShowNoData(false);
				
				this.oDialog.close();
				this.shMain.onClose_searchMaterialStock(aTokens, aObj);
			}		
		},
		
//		onConfirmDialog_Mat : function(oEvent){
//			var aTokens = new Array();
//			var aObj    = new Array();
//						
//			var selectIdx = this.oTable.getSelectedIndices();
//					
//			var oTableModel = this.oTable.getModel().getData();
//			if(selectIdx.length != 0){
//				var oTableData = oTableModel.results;
//				
//				for(var i=0; i<selectIdx.length; i++){
//					var strText = oTableData[selectIdx[i]].Maktx +" (" + oTableData[selectIdx[i]].Matnr + ")"
//					var token = new sap.m.Token({
//						key : oTableData[selectIdx[i]].Matnr,
//						text :  strText
//					});
//					aTokens.push(token);
//					aObj.push(oTableData[selectIdx[i]]);					
//				}
//
//				this.oDialog.close();
//				this.shMain.onClose_searchMaterial(aTokens, aObj);
//				
//			}else{
//			   sap.m.MessageBox.show(
//				 this.oMainParam.i18n.getText("isnotselected"),
//				 sap.m.MessageBox.Icon.WARNING,
//				 this.oMainParam.i18n.getText("warning")
//		       );
//			}			
//		},
		
		
		onRowSelected : function(oEvent){
		  //Table 선택이 Single일 경우 Row 선택시 화면을 닫는다. 
			var selectIdx = this.oTable.getSelectedIndices();
			
			if(this.selMode == "Single" && selectIdx.length >0 ){
				this.onConfirmDialog_Mat(oEvent);
				
				for(var i=0; i<selectIdx.length; i++){
					this.oTable.removeSelectionInterval(selectIdx[i]);					
				}				
			}
		},
			
		onCloseDialog_Mat : function(oEvnet){
			this.oDialog.close();
		},
		
		onSelChange_swerk : function(oEvent){
			
		     this.oMain.oController.getView().byId("mtart_mat").setSelectedKey("");
			 this.oMain.oController.getView().byId("matkl_mat").setSelectedKey("");  
			 this.oMain.oController.getView().byId("maktx_mat").setValue("");
			 
			// this._clearTable();
		},
		
		
		checkMandatory : function(oEvent){
			var cnt = 0;
			var vMtart = this.oMain.oController.getView().byId("mtart_mat").getSelectedKey();
			if(vMtart){
				cnt = 1;
			}else{
				cnt = 0;
			}
			
			var vMatkl = this.oMain.oController.getView().byId("matkl_mat").getSelectedKey();
			var vDesc = this.oMain.oController.getView().byId("maktx_mat").getValue();
			var vMatnr = this.oMain.oController.getView().byId("matnr_mat").getValue();
			
			if(vMatkl || vDesc || vMatnr){
				cnt = cnt + 1;
			}else{
				cnt = cnt - 1;
			}
			
			if(cnt == 2){
				return true;
			}else{
			   sap.m.MessageBox.show(
			      this.oMainParam.i18n.getText("err_check_materil_stock"),
				  sap.m.MessageBox.Icon.WARNING,
				  this.oMainParam.i18n.getText("warning")
			    );
				return false;
			}
		},
		
		
		onSearch_material : function(oEvent){
			if(!this.checkMandatory()){
				return;
			} 
			
			var oModel =  this.oMain.oController.getView().getModel("materialStock");
			
			var lange = this.oMainParam.getLanguage();
			var swerk =  this.oMain.oController.getView().byId("swerk_mat").getSelectedKey();
			
			var oTable =  this.oMain.oController.getView().byId("material_table");
			
			oModel.attachRequestSent(function(){oTable.setBusy(true);});
			oModel.attachRequestCompleted(function(){
												oTable.setBusy(false);
												oTable.setShowNoData(true);
											});
			var mtart_arr = [];
			var matkl_arr = [];
			var maktx_arr = [];
			var matnr_arr = [];
			
			var s_filter = [];
			
			var mtart = this.oMain.oController.getView().byId("mtart_mat").getSelectedKey();
			if(mtart){
				mtart_arr.push(mtart);
				s_filter.push(this._set_filter(mtart_arr, "Mtart"));
			}
			
			var matkl = this.oMain.oController.getView().byId("matkl_mat").getSelectedKey();
			if(matkl){
				matkl_arr.push(matkl);
				s_filter.push(this._set_filter(matkl_arr, "Matkl"));
			}
			
			var maktx = this.oMain.oController.getView().byId("maktx_mat").getValue();  //Maktx
			if(maktx){
				maktx_arr.push(maktx);
				s_filter.push(this._set_filter(maktx_arr, "Maktx"));
			}
			
			var matnr = this.oMain.oController.getView().byId("matnr_mat").getValue();
			if(matnr){
				matnr_arr.push(matnr);
				s_filter.push(this._set_filter(matnr_arr, "Matnr"));
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
			
			var path = "/InputSet(Spras='"+lange+"',Swerk='"+swerk+"')";
			
			var mParameters = {
				urlParameters : {
					"$expand" : "ResultList",
					"$filter" : filterStr
				},
				success : function(oData) {

					 for(var i=0; i<oData.ResultList.results.length; i++){
						 if(oData.ResultList.results[i].Menge == 0 ){
							 oData.ResultList.results[i].Menge = "";
						 }
					 }
					 var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
					 
					
					 oODataJSONModel.setData(oData.ResultList);
					 oTable.setModel(oODataJSONModel);
					 oTable.bindRows("/results");
				 						 
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
		
		
		onChange : function(oEvent){
			this.material_rowIdx = oEvent.getSource().getParent().getIndex();
			var val = oEvent.getParameters().newValue;
			
			if(val){
				var oTable =  this.oMain.oController.getView().byId("material_table");
				
				var matModel = this.oMain.oController.getView().byId("material_table").getModel();
				var oData = matModel.getData().results;
				if(!$.isNumeric(val)){
					oData[this.material_rowIdx].QtyErr = "Error";
				}else{
					oData[this.material_rowIdx].QtyErr = "None";
					oData[this.material_rowIdx].Reqty = val;
				}
				matModel.refresh();
				this.material_rowIdx = "";
			}

		},
		
	/*************************************************************************
	 *  Local function
	 **************************************************************************/
        _set_search_field : function() {
//			var oMag = this.oMain.oController.getView().byId("mtart_mat");  // "Material Type"
//			this._set_ComboMTP(oMag); 
			 
        	var oMtp = this.oMain.oController.getView().byId("matkl_mat");  // "Material Group"
        	this._set_ComboMAG(oMtp); 
		},
			
		_set_ComboMAG : function(obj){
			var lange = this.oMainParam.getLanguage();

			var urlParameters = {
					"$expand" : "Result" ,
				    "$filter" : "Spras eq '"+ lange + "'"
				}
			this._get_search_Model(obj, "MAG", urlParameters, "C", "Material Group", "");
		},
		
//		_set_ComboMTP : function(obj){
//			var lange = this.oMainParam.getLanguage();
//
//			var urlParameters = {
//					"$expand" : "Result" ,
//				    "$filter" : "Spras eq '"+ lange + "'"
//				}
//			this._get_search_Model(obj, "MTP", urlParameters, "C", "Material Type", "");
//		},
		

	    _get_search_Model : function(Obj, key, urlParameters, objType, title, field) {

	    	var oModel = this.oMain.getModel("possible");
			var path = "/ImportSet('" + key + "')" ;
			
			var controll = this;
			
			var mParameters = {
			  urlParameters : urlParameters,
			  success : function(oData) {
				  
				  if(Obj.getItems()){
					if(Obj.getItems().length > 0){
						Obj.removeAllItems();
					}
				  }
					
				  if(objType === "C"){
		              for(var i=0; i<oData.Result.results.length; i++){
		          	   var template = new sap.ui.core.Item();
		                 template.setKey(oData.Result.results[i].Key);
		                 template.setText(oData.Result.results[i].KeyName);
		                 Obj.addItem(template);
		              }
				  }else if(objType === "H"){

					var sh_Model = new sap.ui.model.json.JSONModel();
					sh_Model.setData(oData.Result);
				  }
			  }.bind(this),
			  error : function(oError){
				   sap.m.MessageBox.show(
					 this.oMainParam.i18n.getText("oData_conn_error"),
					 sap.m.MessageBox.Icon.ERROR,
					 this.oMainParam.i18n.getText("error")
				   );					
			  }
			}
			oModel.read(path, mParameters);
		},
		
				
		// Obj : filter Value Array , Val : Filter 변수 명 
		_set_filter : function(Obj, Val){  

			var str = Val;
			
			for(var i=0; i<Obj.length; i++){
				if(i === 0){
					str = "(";
				}else{
					str = str + " or "
				}
				str = str + Val + " eq '" + Obj[i] + "'";
				
				if(i === Obj.length-1){
					str = str + ")";
				}
			}
		  return str;
		},
		
		
		_clearTable : function(){
			var tableModel = this.oStockTable.getModel();
			var odata = tableModel.getData();
			
			odata = [];
			tableModel.setData(odata);
		}
		
	});

});