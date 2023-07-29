sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"cj/pm0010/util/ValueHelpHelper",
	"cj/pm0010/util/utils",
	"cj/pm0010/model/formatter"
], function (Object, JSONModel, Filter, FilterOperator, ValueHelpHelper, utils, formatter ) {
	"use strict";

	return Object.extend("cj.pm0010.controller.EquipmentBOM", {
				
		constructor : function (oView) {
			this.oMain = oView;
		},

		createHandler : function(oDialog, MainParam, shMain, selMode){
			this.oDialog = oDialog;
			
			this.oMainParam = MainParam;
			this.shMain = shMain;
			this.selMode = selMode;

			this.arr_swerk = MainParam.arr_swerk;
	        this.arr_kostl = MainParam.arr_kostl;
	        this.arr_kokrs = MainParam.arr_kokrs;
	        
	        this.oMatTable ;
	        
	        this.selectedRow = [];
	 
	        
	        var oModel = this.oMain.oController.getView().getModel("equipBOM");
	        
	        this.oTree_bom = this.oMain.oController.getView().byId("BOM_tree"); 
	        
	        if(this.selMode == "None"){
	        	this.oTree_bom.setSelectionMode(this.selMode);
	        	this.oDialog.getBeginButton().setVisible(false);
	        	//bomBtn.setVisible(false);
        	}else{
        		//bomBtn.setVisible(true);
        		this.oDialog.getBeginButton().setVisible(true);
        	}

	        
	        this.oTree_bom.setModel(oModel);
	        
/*	        this.oTree_bom.addEventDelegate({
	        	"onBeforeRendering": function(){ 
	        		//this.oTree_bom.getSelectedIndices();
	        	},
	        	"onAfterRendering": function(){ 
	        		//console.log("view rendered");  
	        		
	        		
	        		for(var i=0; i<this.oTree_bom.getSelectedIndices().length; i++){
	        			this.oTree_bom.setSelectedIndex(this.oTree_bom.getSelectedIndices()[i]);
	        		}
	        		
	        		//var oScrollBar = $("div[id*='__xmlview0--BOM_tree-vsb']");
	        		//var oScrollBar = sap.ui.getCore().byId("__xmlview0--BOM_tree-vsb");
	        		oScrollBar.attachScroll(function(oEvent){
	        			this.oTree_bom.rerender();         
	        		});
	             }
	         },this);*/
	        
		},
		
		get_bom_data : function(swerk, equnr, equnr_name) {
//			debugger;
			var oModel = this.oMain.oController.getView().getModel("equipBOM");
			var lange = this.oMainParam.getLanguage();
			this.lv_swerk = swerk;
			
			var equipNo = this.oMain.oController.getView().byId("equiNo");
			equipNo.setValue(equnr);
			
			var equipTxt = this.oMain.oController.getView().byId("equiTxt");
			equipTxt.setText(equnr_name);
			
		    var s_path = "/BomSet";
		    var rows = {
	              path : s_path, 
	              filters: [
	            	  new sap.ui.model.Filter("Swerk", sap.ui.model.FilterOperator.EQ, swerk),
	            	  new sap.ui.model.Filter("Spras", sap.ui.model.FilterOperator.EQ, lange),
	            	  new sap.ui.model.Filter("Equnr", sap.ui.model.FilterOperator.EQ, equnr)
	              ],
	              parameters : {
	                 numberOfExpandedLevels : 1,
	              	 treeAnnotationProperties : {
	                     hierarchyLevelFor : 'Level',
	                     hierarchyNodeFor : 'Id',
	                     hierarchyParentNodeFor : 'ParentId',
	                     hierarchyDrillStateFor : 'DrilldownState'
	                 }
	              }
	          };
			 this.oTree_bom.bindRows(rows);
		},
		
		//cancel
		onCloseDialog_bom : function(oEvent){
			this.shMain.EquipBom_oDialog.destroy();
			this.shMain.EquipBom_oDialog = "";
			this.shMain.EquipBom_oDialog_Controller.destroy();
			this.shMain.EquipBom_oDialog_Controller = "";
			
			if(this._oDialog_BOM_sub){
			 this._oDialog_BOM_sub.destroy();
			 this._oDialog_BOM_sub = "";
			}
//			this.oDialog.close();
		},
		
		//confirm(select)
		onConfirmDialog_bom : function(oEvent){		
			var errChk = this.selectMaterial();		
			if(!errChk){
				// Select Material Popup Open
				this._getDialog_BOM_sub().open();  
				//this.get_bom_material(this.lv_swerk, s_material);
			}
		},
		
		//Sub popup select 
		onConfirmDialog_bom_sub : function(oEvent){
			var errChk = this.stock_check_data();
			if(!errChk){
				//this.oMain.chkBom = []; 
				this._oDialog_BOM_sub.close();  
				this.oDialog.close();
				this.shMain.onClose_equipBom(this.changeRow);
			}else{
				this.changeRow = [];
			}
		 },
		 
		//Sub popup close
		 onCloseDialog_bom_sub : function(oEvent){
			 this._oDialog_BOM_sub.close();  
		 },
		 
/*		 onSelectTree_bom : function(oEvent){
			 var path = oEvent.getParameters().rowContext.getPath().replace("/","");

			 
			 this.oMain.oController.getView().getModel().oData[path].Chk = "X";
			
			 this.selectedRow.push(oEvent.getParameters().rowIndex);
			// this.oTree_bom.rerender();
		 },*/
		 
		 onCollapse : function(oEvent){
			this.oTree_bom.collapseAll();
		 },
		
		 onExpand : function(oEvent){
			this.oTree_bom.expandToLevel("1");
		 },
		 
		 onToggleOpenState : function(oEvent){
			 
			 //this.oTree_bom.fireToggleOpenState(oEvent)
			 
			 
/*			 if(oEvent.getParameters().expanded){
				 oEvent.getParameters().expanded = false;
			 }*/
			// this.oTree_bom.rerender();
		 },
		
		// Bom Stock 
		get_bom_material : function(swerk, equnr){
			var lange = this.oMainParam.getLanguage();
			
			var oModel = this.oMain.oController.getView().getModel("equipBOM");
			//oModel.setDefaultCountMode(sap.ui.model.odata.CountMode.None);
			
		    var path = "/StockSet";
		    
			var controll = this;
			
			var filterStr = "Swerk eq '"+ swerk + "' and Spras eq '"+ lange +"' and ";
			var s_filter = [];
			s_filter.push(this._set_filter(equnr, "Matnr"));
			
			for(var i=0; i<s_filter.length; i++){
				if(i === 0){
					filterStr = filterStr + s_filter[i];
				}else{
					filterStr = filterStr + " and " + s_filter[i];
				}
			}

			var mParameters = {
			    urlParameters : {
			    	//"$expand" : "BomStock",
					"$filter" : filterStr
				},
				success : function(oData) {
					
				 for(var i=0; i<oData.results.length; i++){
					 if(parseInt(oData.results[i].Menge) == 0 ){
						 oData.results[i].Menge = "";
					 }
				 }
				 				 
				 var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
				// oODataJSONModel.setData(controll.bom_material_list(oData));//자재를 재배열 한다 .
				 oODataJSONModel.setData(oData);
				 
				 controll.oMatTable = this._oDialog_BOM_sub.mAggregations.content[0];
				 controll.oMatTable.setModel(oODataJSONModel);
				 controll.oMatTable.bindRows("/results");
			
				}.bind(this),
				error : function(oError) {
				   sap.m.MessageBox.show(
							 this.oMainParam.i18n.getText("oData_conn_error"),
							 sap.m.MessageBox.Icon.ERROR,
							 this.oMainParam.i18n.getText("error")
						   );					
					//jQuery.sap.log.info("Odata Error occured");
					//Toast.show("Error");
				}.bind(this)
			};
			oModel.read(path, mParameters);			
		},
		
        //expand_entityset 을 통해 가져온 데이터 재배열  (사용안함)
		bom_material_list : function(oData){
			this.s_sub_list = [];
			var idx = 0;
			
			for(var i=0; i<oData.results.length; i++){
				var sub_list = [];
				sub_list = oData.results[i].BomStock.results;
				
				for(var j=0; j<sub_list.length; j++){
					var data = {};
					
					idx = idx + 1;
					
					data.Idx = idx ;
					data.Lgort  = sub_list[j].Lgort;
					data.LgortT = sub_list[j].LgortT;
					data.Maktx  = sub_list[j].Maktx;
					data.Matnr  = sub_list[j].Matnr;
					data.Meins  = sub_list[j].Meins;
					data.Menge  = sub_list[j].Menge;
					data.StockN = sub_list[j].StockN;
					data.StockO = sub_list[j].StockO;
					
					this.s_sub_list.push(data); 
				}
			}
			return this.s_sub_list;		
		},
		
		
		selectMaterial : function(){
            var s_material = [];
            var errChk;
			var odata = this.oTree_bom.getModel().oData;
			
			var selectedIdx = this.oTree_bom.getSelectedIndices();
			var cnt = selectedIdx.length;
		//	var cnt = this.oMain.chkBom.length;

			for(var i=0; i<cnt; i++){
				var path = this.oTree_bom.getContextByIndex(selectedIdx[i]).getPath().replace("/","");
				var lv_postp = this.oTree_bom.getModel().oData[path].Postp;
				if(lv_postp === "L"){
					s_material.push(this.oTree_bom.getModel().oData[path].Id);
				}
			}
			
			if(s_material.length === 0){
			  errChk = true;
			  sap.m.MessageBox.show(
	    		  this.oMainParam.i18n.getText("isselectedRow"),  
				  sap.m.MessageBox.Icon.ERROR,
				  this.oMainParam.i18n.getText("error")  //title
			  );
			}else{
				this.get_bom_material(this.lv_swerk, s_material);
			}
			return errChk;c
		},

		
        stock_check_data : function(){
           var errChk;
           var odata = this.oMatTable.getModel().getData().results;
		   var cnt_zero = 0;
		   this.changeRow = [];
		   
		   for(var i=0; i<odata.length; i++){
			 if(parseInt(odata[i].Menge) === 0 || !parseInt(odata[i].Menge)){
				 cnt_zero = cnt_zero + 1;
			 }else{
			    if(odata[i].Charg === "O"){
			      if( parseFloat(odata[i].Menge) > parseFloat(odata[i].StockO) ){	
			    	  var message = "No." + odata[i].Idx + " " +"Material : " + odata[i].Matnr + " " + this.oMainParam.i18n.getText("qtyerr");
			    	   sap.m.MessageBox.show(
			    		  message,  
						  sap.m.MessageBox.Icon.ERROR,
						  this.oMainParam.i18n.getText("error")  //title
					   );
			    	  errChk = true;
				   }
			     }
			    this.changeRow.push(odata[i]);
			 }
			 if(errChk){
		    	 break;
		     }  
		   }
		   
		   if(odata.length === cnt_zero){
			   errChk = true;
			   sap.m.MessageBox.show(
				  this.oMainParam.i18n.getText("qtyrequirerr"),  //comment
				  sap.m.MessageBox.Icon.ERROR,
				  this.oMainParam.i18n.getText("error")  //title
			   );
		   }
		   return errChk;
        },
        
        
        qtyChange : function(oEvent){
			var idx = oEvent.getSource().oParent.getIndex();
			var rows = this.oMatTable.getModel().oData.results[idx];
			
			if(rows.Charg === "O"){
				if(parseInt(rows.StockO) < parseInt(rows.Menge)){
				   sap.m.MessageBox.show(
						 this.oMainParam.i18n.getText("qtyerr"),
						 sap.m.MessageBox.Icon.ERROR,
						 this.oMainParam.i18n.getText("error")
					);
				}
			 }
		  },
		  
		 
/*************************************************************************
 *  Local function
 **************************************************************************/				
		_getDialog_BOM_sub : function(){
			
			if (!this._oDialog_BOM_sub) {
	            this._oDialog_BOM_sub = sap.ui.xmlfragment("cj.pm0010.view.EquipmentBOM_ShMaterial_pop", this);
	            this.oMain.oController.getView().addDependent(this._oDialog_BOM_sub);    
	         }
	         return this._oDialog_BOM_sub;
		},
		
		
		_set_filter : function(Obj, Val){
			//(Eqart eq 'M01' or Eqart eq 'M16')
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
		
		onEquipmentBomAfterClose : function(){
			debugger;
		}
		
	});
});