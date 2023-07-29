sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"cj/pm0010/util/ValueHelpHelper"
], function(Object, JSONModel, Filter, FilterOperator, Message, Toast, ValueHelpHelper) {
	"use strict";
	
	return Object.extend("cj.pm0010.util.EquipmentBOM", { 
		Dailog : [],
		arr_swerk : [],
		arr_kostl : [],
		arr_korks : [],
		
		constructor: function(oDailog, Main) {
		  this.Dailog = oDailog;
          
          this.oMain = Main;
          
          this.arr_swerk = this.oMain.arr_swerk;
          this.arr_kostl = this.oMain.arr_kostl;
          this.arr_kokrs = this.oMain.arr_kokrs;
          
          this.oMatTable ;
		},
		
		
		get_bom_data : function(swerk, equnr, equnr_name) {
			var lange = this.oMain.getLanguage();
			this.lv_swerk = swerk;
			
			this.oTree_bom = sap.ui.getCore().byId("BOM_tree");
			
			sap.ui.getCore().byId("equiNo").setValue(equnr);
			sap.ui.getCore().byId("equiTxt").setText(equnr_name);
			
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
		
		
		// Bom Stock 
		get_bom_material : function(swerk, equnr){
			var lange = this.oMain.getLanguage();
			
			var oModel = this.oMain.getView().getModel("equipBOM");
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
				 				 
				 var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
				// oODataJSONModel.setData(controll.bom_material_list(oData));//자재를 재배열 한다 .
				 oODataJSONModel.setData(oData);
				 
				 controll.oMatTable = this._oDialog_BOM_sub.mAggregations.content[0];
				 controll.oMatTable.setModel(oODataJSONModel);
				 controll.oMatTable.bindRows("/results");
			
				}.bind(this),
				error : function(oError) {
					jQuery.sap.log.info("Odata Error occured");
					Toast.show("Error");
				}.bind(this)
			};
			oModel.read(path, mParameters);			
		},
		
        //expand_entityset 을 통해 가져온 데이터 재배열
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
				
		//BOM Tree 에서  sub 화면 호출 
		confirmDialog : function(oEvent){
			
			var errChk = this.selectMaterial();
			
			if(!errChk){
				// Select Material Popup Open
				this._getDialog_BOM_sub().open();  
			}
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
	    		  this.oMain.i18n.getText("isselectedRow"),  
				  sap.m.MessageBox.Icon.ERROR,
				  this.oMain.i18n.getText("error")  //title
			  );
			}else{
				this.get_bom_material(this.lv_swerk, s_material);
			}
			return errChk;
		},
		
		// CBO CheckBox (사용안함)
		selectMaterial_cbo : function(){
            var s_material = [];
			var odata = this.oTree_bom.getModel().oData;
			
			var cnt = this.oMain.chkBom.length;

			for(var i=0; i<cnt; i++){
				var path = this.oMain.chkBom[i].replace("/","");
				s_material.push(this.oTree_bom.getModel().oData[path].Id);
			}
			this.get_bom_material(this.lv_swerk, s_material)
		},
		
		// Select Material
		confirmDialog_sub : function(oEvent){ 
			
			var errChk = this.stock_check_data();
			if(!errChk){
				this.oMain.chkBom = []; 
				this.cancelDialog_sub();  
				this.oMain._oDialog_BOM.close();
			}else{
				this.changeRow = [];
			}
			return this.changeRow;
		},
		
		
		cancelDialog_sub : function(oEvent){
            
			this._oDialog_BOM_sub.close();  
		},
		
        stock_check_data : function(){
           var errChk;
           var odata = this.oMatTable.getModel().getData().results;
		   var cnt_zero = 0;
		   this.changeRow = [];
		   
		   for(var i=0; i<odata.length; i++){
			 if(parseInt(odata[i].Menge) === 0){
				 cnt_zero = cnt_zero + 1;
			 }else{
			    if(odata[i].Charg === "O"){
			      if( parseFloat(odata[i].Menge) > parseFloat(odata[i].StockO) ){	
			    	  var message = "No." + odata[i].Idx + " " +"Material : " + odata[i].Matnr + " " + this.oMain.i18n.getText("qtyerr");
			    	   sap.m.MessageBox.show(
			    		  message,  
						  sap.m.MessageBox.Icon.ERROR,
						  this.oMain.i18n.getText("error")  //title
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
				  this.oMain.i18n.getText("qtyrequirerr"),  //comment
				  sap.m.MessageBox.Icon.ERROR,
				  this.oMain.i18n.getText("error")  //title
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
						 this.oMain.i18n.getText("qtyerr"),
						 sap.m.MessageBox.Icon.ERROR,
						 this.oMain.i18n.getText("error")
					);
				}
			 }
		  },
		
/*************************************************************************
 *  Local function
 **************************************************************************/				
		_getDialog_BOM_sub : function(){
			
			if (!this._oDialog_BOM_sub) {
	            this._oDialog_BOM_sub = sap.ui.xmlfragment("cj.pm0010.view.EquipmentBOM_ShMaterial_pop", this.oMain);
	            this.oMain.getView().addDependent(this._oDialog_BOM_sub);      		         
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
		}
	});
});