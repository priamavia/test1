sap.ui.define([
		"cj/pm_m020/util/ValueHelpHelper",
       	"sap/m/MessageBox",
		"sap/m/MessageToast",
		"jquery.sap.global"
	] , function(ValueHelpHelper, Message, Toast, jQuery) {
		"use strict";
		return {
			/**
			 * Table data export to Excel
			 */
			makeExcel: function(oModel, oTable, sFilename) {
				var aColumns = oTable.getColumns();  
				var oTemplate;
				var aExportColumns = [];
				var oExportExcel;
				
				for (var i = 0; i < aColumns.length; i++) {
					oTemplate = aColumns[i].getTemplate();

					var oExportColumn = {
						name: aColumns[i].getLabel().getText(),
						template: {
							content: null
						}
					};					
					if (oTemplate instanceof sap.m.Text || oTemplate instanceof sap.m.Link) {
						oExportColumn.template.content = "{" + oTemplate.mBindingInfos.text.parts[0].path + "}";
						aExportColumns.push(oExportColumn);
					} else if (oTemplate instanceof sap.m.Input) {
						if(oTemplate.mBindingInfos.selectedKey){
							oExportColumn.template.content = "{" + oTemplate.mBindingInfos.selectedKey.parts[0].path + "}";
							aExportColumns.push(oExportColumn);
						}else{
							oExportColumn.template.content = "{" + oTemplate.mBindingInfos.value.parts[0].path + "}";
							aExportColumns.push(oExportColumn);
						}						
							//	" {" + oTemplate.mBindingInfos.description.parts[0].path + "}";
					} else if (oTemplate instanceof sap.m.DatePicker) {
						oExportColumn.template.content = "{" + oTemplate.mBindingInfos.value.parts[0].path + "}";
						aExportColumns.push(oExportColumn);
					}else if (oTemplate instanceof sap.m.Select) {
						oExportColumn.template.content = "{" + oTemplate.mBindingInfos.selectedKey.parts[0].path + "}";
						aExportColumns.push(oExportColumn);
					}
				}
				
				jQuery.sap.require("sap.ui.core.util.Export");
		        jQuery.sap.require("sap.ui.core.util.ExportTypeCSV");
		        
		        oExportExcel = new sap.ui.core.util.Export({
		        	exportType: new sap.ui.core.util.ExportTypeCSV({
						separatorChar: ",",
						charset: "utf-8"
					}),
					models: oModel,
					rows: {
						path: oTable.getBinding("rows").sPath
					},
					columns: aExportColumns
				});
		        oExportExcel.saveFile(sFilename).always(function() {
					this.destroy();
				});
			},
			
			getCurrentDate : function(){
				var today = new Date();

				var yy = today.getFullYear();
				var mm = today.getMonth() + 1;
				var dd = today.getDate();
				
				if(dd<10){
					dd = "0"+dd;
				}

				if(mm<10){
					mm = "0"+mm;
				}			
				
				var currentDate = yy + mm + dd;
				return currentDate;
			},
			
			setInitInput : function(obj){
				if (obj instanceof sap.m.ComboBox) {
					obj.removeAllItems();
				}				
				
				obj.setValueState("None");
			},
			
			/*
			 * make search help header
			 */
			makeSerachHelpHeader : function(oMain){
				this.oMain = oMain;
				//LFA
				this.lfa_fields = [
                    {label: this.oMain.i18n.getText("lblVendor"), key: "Key", searchable:true, iskey:true, search:true },
				    {label: this.oMain.i18n.getText("lblName"),   key: "Name", searchable:true, iskey:true, search:true },
				    {label: this.oMain.i18n.getText("lblStcd1"),  key: "Add3", searchable:false, iskey:true, search:true },
				    {label: this.oMain.i18n.getText("lblStcd2"),  key: "Add4", searchable:false, iskey:true, search:true },
				    {label: this.oMain.i18n.getText("lblStcd3"),  key: "Add5", searchable:false, iskey:true, search:true }
                ];
				
//				//PM Sort Field
//				this.psf_fields = [
//                    {label: this.oMain.i18n.getText("lblSortField"),      key: "Key", searchable:true, iskey:true, search:true },
//				    {label: this.oMain.i18n.getText("lblDescription"),    key: "Name", searchable:true, iskey:true, search:true }                        
//                ];
				
				this.aTokens = null;
			},		

			
			set_search_field : function(oWerks, Obj, ObjName, mode, param1, param2){
				var lange = this.oMain.getLanguage();
				var plant = oWerks;

				if( mode === "H"){
					if(Obj instanceof sap.m.MultiInput){
						//Validation check 
						Obj.addValidator(function(args){
							if (args.suggestedToken){
								var key = args.suggestedToken.getKey();
								var text = args.suggestedToken.getText();
								return new sap.m.Token({key: key, text: text});
							}
						});
					}
				}
				
				if(ObjName === "pug"){	// WHEN 'PUG'. 
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Spras eq '"+ lange + "' and Input1 eq '" + plant +"'"							
					}
					this._get_search_Model(Obj, "PUG", urlParameters, mode, this.oMain.i18n.getText("lblPurchasingGroup"), this.pug_fields);							
				
				}else if(ObjName === "lfa"){    // WHEN 'LFA"
					var ekorg1 = param1;
					var ekorg2 = param2;
					var urlParameters = {
							"$expand" : "Result" ,
							"$filter" : "Input1 eq '"+ ekorg1 + "' and Input2 eq '"+ ekorg2 +"'"	
					}
					this._get_search_Model(Obj, "LFA", urlParameters, mode, this.oMain.i18n.getText("lblVendor"), this.lfa_fields);	
				
				}else if(ObjName === "mat"){	// WHEN 'MAT'. 
					var matnr = param1;
					var urlParameters = {
							"$expand" : "Result" ,
							"$filter" : "Spras eq '"+ lange + "' and Input1 eq '" + plant + "' and Input2 eq '"+ matnr +"'"	
					}
					this._get_search_Model(Obj, "MAT", urlParameters, mode, this.oMain.i18n.getText("lblMaterial"), this.mat_fields);	
				
				}else if(ObjName === "stl"){	// WHEN 'STL'.
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Spras eq '"+ lange + "' and Input1 eq '" + plant +"'"							
					}
					this._get_search_Model(Obj, "STL", urlParameters, mode, this.oMain.i18n.getText("lblLocation"), this.slt_fields);
					
				}else if(ObjName === "uom"){	// WHEN 'UOM'.
					var matnr = param1;
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Spras eq '"+ lange + "' and Input1 eq '" + plant + "' and Input2 eq '"+ matnr +"'"				
					}
					this._get_search_Model(Obj, "UOM", urlParameters, mode, this.oMain.i18n.getText("lblUnit"), this.uom_fields);

				}else if(ObjName === "inc"){	// WHEN 'INC'.
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Spras eq '"+ lange  +"'"				
					}
					this._get_search_Model(Obj, "INC", urlParameters, mode, this.oMain.i18n.getText("lblIncoterm"), this.inc_fields);

				}else if(ObjName === "reg"){	// WHEN 'REG'.
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Spras eq '"+ lange  +"'"				
					}
					this._get_search_Model(Obj, "REG", urlParameters, mode, this.oMain.i18n.getText("lblRegion"), this.reg_fields);
					
				}else if(ObjName === "tax"){	// WHEN 'TAX'.
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Spras eq '"+ lange  +"'"				
					}
					this._get_search_Model(Obj, "TAX", urlParameters, mode, this.oMain.i18n.getText("lblTaxCode"), this.tax_fields);					
				}else if(ObjName === "sfr"){	// WHEN 'SFR'. SAFRA
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Spras eq '"+ lange  +"'"				
					}
					this._get_search_Model(Obj, "SFR", urlParameters, mode, this.oMain.i18n.getText("lblSafra"), this.tax_fields);					
				}
												
			},
			
			/*
			 * Search help Event
			 */
					
			openValueHelp : function(ObjName){
				
				if(ObjName === "lfa" || ObjName === "lifnr"){
					this._oLfa_sh.openValueHelp(
							"/results", 
							function(selection,ctx){
//								if(selection){
//									this.oMain.set_search_selected_data(ObjName, selection);
//								}
								if(selection){
									if(!selection.length){
										this.oMain.set_search_selected_data(ObjName, selection);	
									}
								}
						    },
						    function(ctx){
							    console.log("Lfa_Error");
						    },
						    this
					);	
				}else if(ObjName === "mat" || ObjName === "matnr"){
					this._oMat_sh.openValueHelp(
							"/results", 
							function(selection,ctx){
						    },
						    function(ctx){
							    console.log("Mat_Error");
						    },
						    this
					);	
				}
									
			},
			
			set_token : function(Obj, oEvent){
				var g_token = [];
				g_token = Obj.getTokens();
				    
			    var val = oEvent.getParameters().newValue.toUpperCase();
//				if(val){
//				    var data = oEvent.getSource().getModel().getData().results;
//					for(var i=0; i<data.length; i++){
//						if(val === data[i].Key){
//							g_token.push(new sap.m.Token({key: data[i].Key, text: data[i].KeyName}));
//							Obj.setValue("");
//							Obj.setTokens(g_token);
//						}
//					}
//				}
			    if(val){
			    	if(Obj.getModel().getData()){
			    		var data = Obj.getModel().getData().results;
			    	}else{
			    		var sh_help = this.get_sh_help(sIdstr);
			    		if(sh_help){
			    			var data = sh_help.model.getData().results;
			    		}
			    	}
					for(var i=0; i<data.length; i++){
						if(val === data[i].Key){
							g_token.push(new sap.m.Token({key: data[i].Key, text: data[i].KeyName}));
							Obj.setValue("");
							
						    if( Obj instanceof sap.m.MultiInput ){
						    	Obj.setTokens(g_token);
						    }else{
						    	this.oMain.set_search_selected_data(sIdstr, g_token[0], data[i]);
						    }
						   return;
						}
					}
//					this.oMain.set_search_selected_data(sIdstr, g_token[0], data[i], "X");
//					return "X";
				}				
				
				
			},
			
			/*
			 * Filter 의  파라미터 정리 
			 */
			set_filter : function(Obj, Val){
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
						
			/*
			 * Filter 에 Between 속성 주기 (ex. 날짜 from ~ to )
			 */
			set_bt_filter : function(ObjNm, Val1, Val2){
				var str;
				var str1 = Val1;
				var str2 = Val2;
				
				if(str1 != "" && str2 != ""){
					str = "(" + ObjNm + " ge '" + str1  + "' and " + ObjNm + " le '" + str2 + "')";
				}else if(str1 != ""){
					str = "(" + ObjNm + " ge '" + str1  + "' and " + ObjNm + " le '" + str1 + "')";
				}else if(str2 != ""){
					str = "(" + ObjNm + " ge '" + str2  + "' and " + ObjNm + " le '" + str2 + "')";
				}
				
			  return str;
			},
							
			
			getDataSource : function(sModel) {
				if (sModel == "")
					return sModel;
				if (window.location.hostname == "localhost") {
					return sModel + "Local";
				} else {
					return sModel;
				}
		    },
		    			
			checkMandatory : function(oMain, pageName){
				var oView = oMain.getView();
				var oPage = oView.byId(pageName);
				var page_child_cnt = oPage.getContent().length;
				
			    this.required = [];
			    var _check;
			    
			    var controll = this;
				
				for(var i=0; i<page_child_cnt; i++){
					try{
					  if(oPage.getContent()[i] instanceof sap.m.Table ){   // Table의 경우 다르게 체크해야 함,  sap.ui.table.Table 
						  controll._checkTable(oPage.getContent()[i], controll);
					  }else{
						  var parent = oPage.getContent()[i]._aElements;
						  if(!parent){
							  throw new Error(err);
						  }
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
					if ("Error" == input.getValueState()) {
						canContinue = false;
						return false;
					}
				});
	 
				// output result
				if (canContinue) {
					//Toast.show("The input is correct. You could now continue to the next screen.");
					_check = true;
				} else {
					//Toast.show("Complete your input first.");
					_check = false;
				}
				return _check;
			},
			
			
			resetSortingState : function(oTable) {
				var aColumns = oTable.getColumns();
				for (var i = 0; i < aColumns.length; i++) {
					aColumns[i].setSorted(false);
				}
			},
			
			 /****************************************************************
			  *  Local Function
			  ****************************************************************/	
	         _checkItem : function(parent, controll) {
				
				var item_cnt = parent.length;
				
				  for(var j=0; j<item_cnt; j++){
					 try{
						 var sub_Elements = parent[j]._aElements;
						 
						 if(!sub_Elements){
							 throw new Error(err);
						 }
						 controll._checkItem(sub_Elements, controll);
						 
					 }catch(err){
						 try{
							 if(parent[j] instanceof sap.m.ComboBox){
								 throw new Error(err);
							 }else{
								 var sub_parent = parent[j].getItems();
								 controll._checkItem(sub_parent, controll); 
							 }
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
			/*	var cols = oTable.getColumns();
				
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
				}*/
				
				
			},

			  /*
		       * Search Help Odata 호출 
		       */ 
		    _get_search_Model : function(Obj, key, urlParameters, objType, title, field) {
		    	var oModel = this.oMain.getView().getModel("possible", false);
//		    	var oModel = this.oMain.getView().getModel("possible");
		    	oModel.setDefaultCountMode(sap.ui.model.odata.CountMode.None);
		    	
////		    	debugger;
//				oModel.attachRequestSent(this.oMain.set_model_count());
//	    		oModel.attachRequestCompleted(this.oMain.get_purchase_order_data());	

				var path = "/ImportSet('" + key + "')" ;
							
				var controll = this;
				
				var mParameters = {
				  urlParameters : urlParameters,
//				  async:false,
				  success : function(oData) {
					  if(objType === "C"){
						  if(Obj.getItems().length > 0){
							  Obj.removeAllItems();
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
					
						if(key === "LFA"){	// WHEN 'LFA'.
//							debugger;
							controll._oLfa_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, false);  //Model, UI Object, SearchHelp table, title, MultiSelect
						}else if(key === "MAT"){	// WHEN 'MAT'.  
							controll._oMat_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, false);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key === "PLG"){	// WHEN 'PLG'. 
							controll._oPlg_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect
						}else if(key == "STL"){		//	WHEN 'STL'.
							controll._oStl_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key == "UOM"){		//	WHEN 'UOM'.
							controll._oUom_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key == "INC"){		//	WHEN 'INC'.
							controll._oInc_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key == "REG"){		//	WHEN 'REG'.
							controll._oReg_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key == "TAX"){		//	WHEN 'TAX'.
							controll._oTax_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key == "SFR"){		//	WHEN 'SFR'.
							controll._oSfr_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}
															
						Obj.setModel(sh_Model);
						var template = new sap.ui.core.Item({text:"{KeyName}", key:"{Key}"});
						Obj.bindAggregation("suggestionItems", "/results" , template);
						
					  }
				  }.bind(this),
				  error : function(oError){
					  Toast.show( key + this.oMain.i18n.getText("SH_Error"));
				  }
				}
				oModel.read(path, mParameters);
			}			
		   			
		    						  
		};
	}
);