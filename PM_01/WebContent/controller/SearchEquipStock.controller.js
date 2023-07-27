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

	return Object.extend("cj.pm0010.controller.SearchEquipStock", {

		constructor : function (oView) {
			this.oMain = oView;
		},

		createHandler : function(oDialog, MainParam, shMain){
			this.oDialog = oDialog;
			
			this.oMainParam = MainParam;
			this.shMain = shMain;

			this.arr_swerk = MainParam.arr_swerk;
	        this.arr_kostl = MainParam.arr_kostl;
	        this.arr_kokrs = MainParam.arr_kokrs;
	          
	        this._set_search_field();
		},
		
		
		onConfirmDialog_Equip : function(oEvent){
			var chkErr = this.stock_check_data();
			
			if(!chkErr){
				this.oDialog.close();
				this.shMain.onClose_equipStock(this.changeRow_stock);
			}
		},
		
		
		onCloseDialog_Equip : function(oEvnet){
			this.oDialog.close();
		},
		
		
		onSelChange_Tab1 : function(oEvent){
			
		     this.oMain.oController.getView().byId("matkl").setValue("");
			 this.oMain.oController.getView().byId("name").setValue("");  
			 this.oMain.oController.getView().byId("mrp").setValue("");//Dispo
			 this.oMain.oController.getView().byId("spec_stock").setValue(""); //Groes
			 this.oMain.oController.getView().byId("desc_stock").setValue("");  //Maktx
			 this.oMain.oController.getView().byId("maker").setValue("");
			 
			// this._clearTable();
		},
		
		
		onSearch_equipStock : function(oEvent){
			var lange = this.oMainParam.getLanguage();
			var swerk =  this.oMain.oController.getView().byId("swerk_stock").getSelectedKey();
			//임시 
			//swerk = "3011";
			
			//debugger;
			
			var chk = 0;
			
			var matnr_arr = [];
			var matkl_arr = [];
			var name_arr = [];
			var mrp_arr = [];
			var spec_arr = [];
			var desc_arr = [];
			var maker_arr = [];
			
			var s_filter = [];
			
			var matnr = this.oMain.oController.getView().byId("matnr_stock").getValue();
			if(matnr){
				matnr_arr.push(matnr);
				s_filter.push(this._set_filter(matnr_arr, "Matnr"));
			}
			var matkl = this.oMain.oController.getView().byId("matkl").getSelectedKey();
			if(matkl){
				matkl_arr.push(matkl);
				s_filter.push(this._set_filter(matkl_arr, "Matkl"));
			}
			var name = this.oMain.oController.getView().byId("name").getValue();  
			if(name){
				name_arr.push(name);
				s_filter.push(this._set_filter(name_arr, "Name"));
				chk = chk + 1;
			}
			var mrp = this.oMain.oController.getView().byId("mrp").getSelectedKey();  //Dispo
			if(mrp){
				mrp_arr.push(mrp);
				s_filter.push(this._set_filter(mrp_arr, "Dispo"));
			}
			var spec = this.oMain.oController.getView().byId("spec_stock").getValue(); //Groes
			if(spec){
				spec_arr.push(spec);
				s_filter.push(this._set_filter(spec_arr, "Groes"));	
				chk = chk + 1;
			}
			var desc = this.oMain.oController.getView().byId("desc_stock").getValue();  //Maktx
			if(desc){
				desc_arr.push(desc);
				s_filter.push(this._set_filter(desc_arr, "Maktx"));
			}
			var maker = this.oMain.oController.getView().byId("maker").getValue();
			if(maker){
				maker_arr.push(maker)
				s_filter.push(this._set_filter(maker_arr, "Maker"));
				chk = chk + 1;
			}
			
			//Test 데이터가 존재 하지 않음 
/*			if(chk === 0){
				sap.m.MessageBox.show(
					 this.oMainParam.i18n.getText("searchErr"),
					 sap.m.MessageBox.Icon.ERROR,
					 this.oMainParam.i18n.getText("error")
			    );
			}else{*/
				
				var chk_mfrgr ;
				var chk_local = this.oMain.oController.getView().byId("local").getSelected();
				
				var chk_import = this.oMain.oController.getView().byId("import").getSelected();
				if(chk_local===true && chk_import===true){
					
				}else if(chk_local === true && chk_import===false){
					chk_mfrgr = "Mfrgr eq '01'"
				}else if(chk_local === true && chk_import===false){
					chk_mfrgr = "Mfrgr eq '02'"
				}
			   
				var filterStr = "Swerk eq '"+ swerk + "' and Spras eq '"+ lange + "' and Popup eq true";
				
				if(chk_mfrgr){
					filterStr = filterStr + " and " + chk_mfrgr;
				}
				
	            for(var i=0; i<s_filter.length; i++){
	              filterStr = filterStr + " and " + s_filter[i];
	            }
	            
	            this.get_data(filterStr);
	//		}       
		},
	
		
		get_data : function(filterStr){

			var oModel =  this.oMain.oController.getView().getModel("equipBOM");
		    var path = "/EquipStockSet";
		    
			var controll = this;
			
			this.oStockTable = this.oMain.oController.getView().byId("stock_table");
			
			oModel.attachRequestSent(function(){controll.oStockTable.setBusy(true);});
			oModel.attachRequestCompleted(function(){controll.oStockTable.setBusy(false);});
			
			var mParameters = {
			    urlParameters : {
					"$filter" : filterStr
				},
				success : function(oData) {
				 				 
				 var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
				 oODataJSONModel.setData(oData);
				 
				 controll.oStockTable.setModel(oODataJSONModel);
				 controll.oStockTable.bindRows("/results");
			
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
		
		
		qtyChange : function(oEvent){
			var idx = oEvent.getSource().oParent.getIndex();
			var rows = this.oStockTable.getModel().oData.results[idx];
			
			//if(rows.Charg === "O"){
				if(parseInt(rows.StockO) < parseInt(rows.Menge)){
				   sap.m.MessageBox.show(
						 this.oMainParam.i18n.getText("qtyerr"),
						 sap.m.MessageBox.Icon.ERROR,
						 this.oMainParam.i18n.getText("error")
					);
				}
			 //}
		 },
		  
		  
		stock_check_data : function(){
           var errChk;
           var odata = this.oStockTable.getModel().getData().results;
		   var cnt_zero = 0;
		   this.changeRow_stock = [];
		   
		   for(var i=0; i<odata.length; i++){
			 if(parseInt(odata[i].Menge) === 0){
				 cnt_zero = cnt_zero + 1;
			 }else{
			    if(odata[i].StockO > 0){
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
			    this.changeRow_stock.push(odata[i]);
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
	    
		
	/*************************************************************************
	 *  Local function
	 **************************************************************************/
        _set_search_field : function() {
			
			this.oSwerk = this.oMain.oController.getView().byId("swerk_stock");

			var default_swerk;
			 for(var i=0; i<this.arr_swerk.length; i++){
				var template = new sap.ui.core.Item();
	            template.setKey(this.arr_swerk[i].Value);
	            template.setText(this.arr_swerk[i].KeyName);
	            this.oSwerk.addItem(template);
	            
		        if(this.arr_swerk[i].Default === "X"){
		        	default_swerk = i;
		        }  
		     }
			 this.oSwerk.setSelectedKey(this.arr_swerk[default_swerk].Value);
			 
			 var oMag = this.oMain.oController.getView().byId("matkl");  // "Material Group"
			 this._set_ComboMAG(oMag);
			 
			 var oMrc = this.oMain.oController.getView().byId("mrp");   // MRP Controller
			 this._set_ComboMRC(oMrc);
			
		},
		
		_set_ComboMAG : function(obj){
			var lange = this.oMainParam.getLanguage();

			var urlParameters = {
					"$expand" : "Result" ,
				    "$filter" : "Spras eq '"+ lange + "'"
				}
			this._get_search_Model(obj, "MAG", urlParameters, "C", "Material Group", "");  //this.woc_fields
		},
		
		_set_ComboMRC : function(obj){
			var plant;
			if(!this.oSwerk.getSelectedItem()){
				plant = this.arr_swerk[0].Value;
			}else{
				plant = this.oSwerk.getSelectedItem().getProperty("key");
			}

			var  urlParameters = {
				"$expand" : "Result" ,
			    "$filter" : "Input1 eq '" + plant + "'"
			}	
			this._get_search_Model(obj, "MRC", urlParameters, "C", "MRP Controller", "");  //this.loc_fields
		},
		

	    _get_search_Model : function(Obj, key, urlParameters, objType, title, field) {

	    	var oModel = this.oMain.getModel("possible");
			var path = "/ImportSet('" + key + "')" ;
			
			var controll = this;
			
			var mParameters = {
			  urlParameters : urlParameters,
			  success : function(oData) {
					
				  if(objType === "C"){
					  if(Obj.getItems()){
							if(Obj.getItems().length > 0){
								Obj.removeAllItems();
							}
					   }
					  
		              for(var i=0; i<oData.Result.results.length; i++){
		          	   var template = new sap.ui.core.Item();
		                 template.setKey(oData.Result.results[i].Key);
		                 template.setText(oData.Result.results[i].KeyName);
		                 Obj.addItem(template);
		              }
				  }else if(objType === "H"){

					var sh_Model = new sap.ui.model.json.JSONModel();
					sh_Model.setData(oData.Result);

//						if(key === "MAG"){
//							controll._oMag_sh = new ValueHelpHelper(
//			                		sh_Model, Obj, field, title, false);  //Model, UI Object, SearchHelp table, title, MultiSelect 
//					    }else if(key === "MRC"){
//							controll._oMrc_sh = new ValueHelpHelper(
//			                		sh_Model, Obj, field, title, false);  //Model, UI Object, SearchHelp table, title, MultiSelect 
//						}
				  }
			  }.bind(this),
			  error : function(oError){
				   sap.m.MessageBox.show(
							 this.oMainParam.i18n.getText("oData_conn_error"),
							 sap.m.MessageBox.Icon.ERROR,
							 this.oMainParam.i18n.getText("error")
						   );					
					//jQuery.sap.log.info("Odata Error occured");
					//Toast.show("Error");
				  
//				  Toast.show("Error");
			  }
			}
			oModel.read(path, mParameters);
		},
		
		
		/*
		 * make search help
		 */
		_makeSerachHelp : function(){
          
			//Material Group
			this.loc_fields = [
               {label: this.oMainParam.i18n.getText("lblMaterialGroup"),     key: "Key", searchable:true, iskey:true, search:true },
			   {label: this.oMainParam.i18n.getText("lblMaterialGroupDesc"),  key: "Name", searchable:true, iskey:true, search:true }              
			];
			//MRP Controller
			this.eqc_fields = [
                {label: this.oMainParam.i18n.getText("lblMRPcontroller"),      key: "Key", searchable:true, iskey:true, search:true },
			    {label: this.oMainParam.i18n.getText("lblMRPcontrollerName"), key: "Name", searchable:true, iskey:true, search:true }
			];
			
			this.aTokens = null;
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