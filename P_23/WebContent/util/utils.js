sap.ui.define([
        "cj/pm0140/util/ValueHelpHelper",
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
					if (oTemplate instanceof sap.m.Text || oTemplate instanceof sap.m.Link ) {
						oExportColumn.template.content = "{" + oTemplate.mBindingInfos.text.parts[0].path + "}";
					} else if (oTemplate instanceof sap.m.Input) {
						oExportColumn.template.content = "{" + oTemplate.mBindingInfos.value.parts[0].path + "}";
							//	" {" + oTemplate.mBindingInfos.description.parts[0].path + "}";
					} else if (oTemplate instanceof sap.m.DatePicker) {
						oExportColumn.template.content = "{" + oTemplate.mBindingInfos.value.parts[0].path + "}";
					}
					aExportColumns.push(oExportColumn);
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
			
			
			/*
			 * make search help header
			 */
			makeSerachHelpHeader : function(oMain){
				this.oMain = oMain;
				
				//Notification Type (NOT)
				this.not_fields = [
                   {label: this.oMain.i18n.getText("lblNotiType"),     key: "Key", searchable:true, iskey:true, search:true },
				   {label: this.oMain.i18n.getText("lblNotiTypeText"), key: "Name", searchable:true, iskey:true, search:true }              
				];
				
				//Severity (CAC)
				this.cac_fields = [
                   {label: this.oMain.i18n.getText("lblCode"),      key: "Key", searchable:true, iskey:true, search:true },
				   {label: this.oMain.i18n.getText("lblCodeTexts"), key: "Name", searchable:true, iskey:true, search:true }  
				];

				//Process line (LOC)
				this.loc_fields = [
	               {label: this.oMain.i18n.getText("lblLocation"),     key: "Key", searchable:true, iskey:true, search:true },
				   {label: this.oMain.i18n.getText("lblLocationName"), key: "Name", searchable:true, iskey:true, search:true }              
				];
					
				//Cost Center (COC)
				this.coc_fields = [
				    {label: this.oMain.i18n.getText("lblCostCenter"),     key: "Key", searchable:true, iskey:true, search:true },
				    {label: this.oMain.i18n.getText("lblCostCenterName"), key: "Name", searchable:true, iskey:true, search:true }
		     	];
				
				//Work Center (WOC)
				this.woc_fields = [
				    {label: this.oMain.i18n.getText("lblWorkCenter"),     key: "Key", searchable:true, iskey:true, search:true },
				    {label: this.oMain.i18n.getText("lblWorkCenterName"), key: "Name", searchable:true, iskey:true, search:true },
				    {label: this.oMain.i18n.getText("lblObjectTypes"),    key: "Add1", searchable:true, iskey:false, search:true },
				    {label: this.oMain.i18n.getText("lblObjectID"),       key: "Add2", searchable:true, iskey:false, search:true }
		     	];				
								
				//EQ Category (EQC)
				this.eqc_fields = [
	                {label: this.oMain.i18n.getText("lblEquipCategory"),     key: "Key", searchable:true, iskey:true, search:true },
				    {label: this.oMain.i18n.getText("lblEquipCategoryName"), key: "Name", searchable:true, iskey:true, search:true }
				];
				
				//Object Type (TOT)
				this.tot_fields = [
				    {label: this.oMain.i18n.getText("lblTechnicalObject"),     key: "Key", searchable:true, iskey:true, search:true },
				    {label: this.oMain.i18n.getText("lblTechnicalObjectName"), key: "Name", searchable:true, iskey:true, search:true }
		     	];
				
			 	//Measuring Point (MEP)
				this.mep_fields = [
                   {label: this.oMain.i18n.getText("lblMeasuringPoint"),      key: "Key", searchable:true, iskey:true, search:true },
				   {label: this.oMain.i18n.getText("lblName"),                key: "Name", searchable:true, iskey:true, search:true } ,
				   {label: this.oMain.i18n.getText("lblDescription"),         key: "Add1", searchable:true, iskey:true, search:true }   
				];

				//PM Sort Field
				this.psf_fields = [
                    {label: this.oMain.i18n.getText("lblSortField"),      key: "Key", searchable:true, iskey:true, search:true },
				    {label: this.oMain.i18n.getText("lblDescription"),    key: "Name", searchable:true, iskey:true, search:true }                        
                ];
				
				
				this.aTokens = null;
			},
			
			
			set_search_field : function(oSwerk, Obj, ObjName, mode, param1, param2){
				var lange = this.oMain.getLanguage();
				var plant = oSwerk;

				if( mode === "H"){
					//Validation check 
					Obj.addValidator(function(args){
						if (args.suggestedToken){
							var key = args.suggestedToken.getKey();
							var text = args.suggestedToken.getText();
							return new sap.m.Token({key: key, text: text});
						}
					});
				}
				
				if(ObjName === "not"){
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Spras eq '"+ lange + "'"
					}
					this._get_search_Model(Obj, "NOT", urlParameters, mode, this.oMain.i18n.getText("lblNotificationType"), this.not_fields);
					//this._get_search_Model(Obj, "NOT", urlParameters, mode, this.oMain.i18n.getText("lblNotificationType"), "");

				}else if(ObjName === "cac"){
					var type = param1;   // D
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Spras eq '"+ lange + "' and Input1 eq '"+ type +"' and Input2 eq 'PM'" 
					}
					this._get_search_Model(Obj, "CAC", urlParameters, mode, this.oMain.i18n.getText("lblSeverity"), this.cac_fields); 
					
				}else if(ObjName === "loc"){
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Input1 eq '" + plant + "'"
					}
					this._get_search_Model(Obj, "LOC", urlParameters, mode, this.oMain.i18n.getText("lblProcess"), this.loc_fields);
					
				}else if(ObjName === "coc"){
					//var kokrs = param1;
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Spras eq '"+ lange + "' and Input1 eq '" + plant + "'"
				    }
					this._get_search_Model(Obj, "COC", urlParameters, mode, this.oMain.i18n.getText("lblCostCenter"), this.coc_fields);
					
				}else if(ObjName === "woc"){
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Spras eq '"+ lange + "' and Input1 eq '" + plant +"'"
					}
					this._get_search_Model(Obj, "WOC", urlParameters, mode, this.oMain.i18n.getText("lblWorkCenter"), this.woc_fields);
					
				}else if(ObjName === "eqc"){
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Spras eq '"+ lange + "'"
					}
					this._get_search_Model(Obj, "EQC", urlParameters, mode, this.oMain.i18n.getText("lblEQCategory"), this.eqc_fields);
					
				}else if(ObjName === "tot"){
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Spras eq '"+ lange + "'"
					}
					this._get_search_Model(Obj, "TOT", urlParameters, mode, this.oMain.i18n.getText("lblTechnicalObjectType"), this.tot_fields);
					
				}else if(ObjName === "mep"){
					var equnr = param1;   // 화면에 입력된 값을 가져와야 함 
					var urlParameters = {
							"$expand" : "Result" ,
							"$filter" : "Spras eq '"+ lange + "' and Input1 eq '" + equnr + "'"	
					}
					this._get_search_Model(Obj, "MEP", urlParameters,  mode, this.oMain.i18n.getText("lblMeasuringPoint"), this.mep_fields);	
				}else if(ObjName === "pls"){	// WHEN 'PLS'. "6
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Spras eq '"+ lange + "' and Input1 eq '" + plant +"'"							
					}
					this._get_search_Model(Obj, "PLS", urlParameters, mode, this.oMain.i18n.getText("lblPlantSection"), this.pls_fields);
				
				}else if(ObjName === "abi"){	// WHEN 'ABI'. "7
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Spras eq '"+ lange + "' and Input1 eq '" + plant +"'"							
					}
					this._get_search_Model(Obj, "ABI", urlParameters, mode, this.oMain.i18n.getText("lblABCIndicator"), this.abi_fields);
																
				}
			},
			

			/*
			 * Search help Event
			 */
			openValueHelp : function(ObjName){
				
/*				if(ObjName === "not"){
					this._oNot_sh.openValueHelp(
						"/results", 
						function(selection,ctx){
				        },
				        function(ctx){
					       console.log("Not_Error");
				        },
				        this
				   );
				}else */
					if(ObjName === "cac"){
					this._oCac_sh.openValueHelp(
						"/results", 
						function(selection,ctx){
				        },
				        function(ctx){
					       console.log("Cac_Error");
				        },
				        this
    				 );
                }else if(ObjName === "loc"){
                	this._oLoc_sh.openValueHelp(
						"/results", 
						function(selection,ctx){
				        },
				        function(ctx){
					       console.log("Loc_Error");
				        },
				        this
    				 );
                }else if(ObjName === "coc"){
					this._oCoc_sh.openValueHelp(
						"/results", 
						function(selection,ctx){
				        },
				        function(ctx){
					       console.log("Coc_Error");
				        },
				        this
					 );
				}else if(ObjName === "woc"){
					this._oWoc_sh.openValueHelp(
						"/results", 
						function(selection,ctx){
				        },
				        function(ctx){
					       console.log("Woc_Error");
				        },
				        this
				    );
				}else if(ObjName === "eqc"){
					this._oEqc_sh.openValueHelp(
						"/results", 
						function(selection,ctx){
				        },
				        function(ctx){
					       console.log("Eqc_Error");
				        },
				        this
				   );
				}else if(ObjName === "tot"){
					this._oTot_sh.openValueHelp(
							"/results", 
							function(selection,ctx){
					        },
					        function(ctx){
						       console.log("Tot_Error");
					        },
					        this
					   );
				}else if(ObjName === "mep"){
					this._oMep_sh.openValueHelp(
							"/results", 
							function(selection,ctx){
					        },
					        function(ctx){
						       console.log("Mep_Error");
					        },
					        this
					 );
				}
			},
			
			
			set_token : function(Obj, oEvent){
				var g_token = [];
				g_token = Obj.getTokens();
				    
			    var val = oEvent.getParameters().newValue;
				if(val){
				    var data = oEvent.getSource().getModel().getData().results;
					for(var i=0; i<data.length; i++){
						if(val === data[i].Key){
							g_token.push(new sap.m.Token({key: data[i].Key, text: data[i].KeyName}));
							Obj.setValue("");
							Obj.setTokens(g_token);
						}
					}
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
				
				if(Val1 != "" && Val2 != ""){
					str = "(" + ObjNm + " ge '" + str1  + "' and " + ObjNm + " le '" + str2 + "')";
				}
								
			  return str;
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
					  if(oPage.getContent()[i] instanceof sap.ui.table.Table ){   // Table의 경우 다르게 체크해야 함 
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
					if ("Error" === input.getValueState()) {
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
			
			
			set_year : function(Obj, year){
			    var listyear = 0;
			    var c_year = 0;
			    
				var i = -10;
				
				c_year = parseInt(year);
				
				do{
				   listyear = c_year + i;
				   
				   var template = new sap.ui.core.Item();
                   template.setKey(listyear);
                   template.setText(listyear);
                   Obj.addItem(template);
                   
				   i++;
				}while(i < 10);
				
			},
			
			
			set_month : function(Obj){
				var i = 1;
				var mon;
				
				do{
				   var template = new sap.ui.core.Item();
				   
				   if(i < 10){
					   mon = "0" + i;
				   }else{
					   mon = i;
				   }
                   template.setKey(mon);
                   template.setText(mon);
                   Obj.addItem(template);
                   
                   i++;
				}while(i<13);

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
	
		    	var oModel = this.oMain.getView().getModel("possible");
		    	oModel.setDefaultCountMode(sap.ui.model.odata.CountMode.None);
		    	
				var path = "/ImportSet('" + key + "')" ;
							
				var controll = this;
				
				var mParameters = {
				  urlParameters : urlParameters,
				  success : function(oData) {
					  if(objType === "C"){
						 
						 var sh_Model = new sap.ui.model.json.JSONModel();
						 sh_Model.setData(oData.Result);
						 
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
			              
			              Obj.setModel(sh_Model);
			              
					  }else if(objType === "H"){
							
						var sh_Model = new sap.ui.model.json.JSONModel();
						sh_Model.setData(oData.Result);

						if(key === "NOT"){
							controll._oNot_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key === "CAC"){
							controll._oCac_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key === "LOC"){
							controll._oLoc_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
					    }else if(key === "COC"){
							controll._oCoc_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key === "WOC"){
							controll._oWoc_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key === "EQC"){
							controll._oEqc_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key === "TOT"){
							controll._oTot_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key === "MEP"){
							controll._oMep_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}
						
						Obj.setModel(sh_Model);
						var template = new sap.ui.core.Item({text:"{KeyName}", key:"{Key}"});
						Obj.bindAggregation("suggestionItems", "/results" , template);
						
					  }
				  }.bind(this),
				  error : function(oError){
					  Toast.show( key + "_SearchHelp_Error" );
				  }
				}
				oModel.read(path, mParameters);
			},
		};
	}
);