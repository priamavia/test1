sap.ui.define([
		"cj/pm_m240/util/ValueHelpHelper",
		"cj/pm_m240/model/formatter",
       	"sap/m/MessageBox",
		"sap/m/MessageToast",
		"jquery.sap.global"
		
	] , function(ValueHelpHelper, formatter, Message, Toast, jQuery) {
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
				
				//Planner Group
				this.plg_fields = [
                    {label: this.oMain.i18n.getText("lblPlannerGroup"),      key: "Key", searchable:true, iskey:true, search:true },
				    {label: this.oMain.i18n.getText("lblPlannerGroupName"), key: "Name", searchable:true, iskey:true, search:true }                        
                ];

				//Order Type
				this.ort_fields = [
                    {label: this.oMain.i18n.getText("lblOrderType"),      key: "Key", searchable:true, iskey:true, search:true },
				    {label: this.oMain.i18n.getText("lblDescription"), key: "Name", searchable:true, iskey:true, search:true }                        
                ];
										
				this.aTokens = null;
			},		

			
			set_search_field : function(oSwerk, Obj, ObjName, mode, param1, param2){
				var lange = this.oMain.getLanguage();
				var plant = oSwerk;

				if( mode == "H"){
					//Validation check 
					Obj.addValidator(function(args){
						if (args.suggestedToken){
							var key = args.suggestedToken.getKey();
							var text = args.suggestedToken.getText();
							return new sap.m.Token({key: key, text: text});
						}
					});
				}
				
				if(ObjName == "not"){			// WHEN 'NOT'. "1
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Spras eq '"+ lange + "'"
					}
					this._get_search_Model(Obj, "NOT", urlParameters, mode, this.oMain.i18n.getText("lblNotificationType"), this.not_fields);
				
				}else if(ObjName == "plg"){	// WHEN 'PLG'. "2
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Input1 eq '" + plant + "'"
					}
					this._get_search_Model(Obj, "PLG", urlParameters, mode, this.oMain.i18n.getText("lblPlannerGroup"), this.plg_fields);
					
									
				}else if(ObjName == "woc" || ObjName == "vaplz"){	// WHEN 'WOC'. "3
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Spras eq '"+ lange + "' and Input1 eq '" + plant +"'"
					}
					this._get_search_Model(Obj, "WOC", urlParameters, mode, this.oMain.i18n.getText("lblWorkCenter"), this.woc_fields);
					
				}else if(ObjName == "plt"){	// WHEN 'PLT'. "4
					var urlParameters = {
							"$expand" : "Result" 
					}
					this._get_search_Model(Obj, "PLT", urlParameters, mode, this.oMain.i18n.getText("lblPlant"), this.plt_fields);
					
				}else if(ObjName == "loc"){	// WHEN 'LOC'. "5
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Input1 eq '" + plant + "'"
					}
					this._get_search_Model(Obj, "LOC", urlParameters, mode, this.oMain.i18n.getText("lblProcess"), this.loc_fields);

				}else if(ObjName == "pls"){	// WHEN 'PLS'. "6
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Spras eq '"+ lange + "' and Input1 eq '" + plant +"'"							
					}
					this._get_search_Model(Obj, "PLS", urlParameters, mode, this.oMain.i18n.getText("lblPlantSection"), this.pls_fields);
				
				}else if(ObjName == "abi"){	// WHEN 'ABI'. "7
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Spras eq '"+ lange + "' and Input1 eq '" + plant +"'"							
					}
					this._get_search_Model(Obj, "ABI", urlParameters, mode, this.oMain.i18n.getText("lblABCIndicator"), this.abi_fields);
																
				}else if(ObjName == "coc"){	// WHEN 'COC'. "8
//					var kokrs = param1;
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Spras eq '"+ lange + "' and Input1 eq '" + plant + "'"
				    }
					this._get_search_Model(Obj, "COC", urlParameters, mode, this.oMain.i18n.getText("lblCostCenter"), this.coc_fields);
										
				}else if(ObjName == "ort"){	// WHEN 'ORT'. "9
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Spras eq '"+ lange + "'"	
				    }
					this._get_search_Model(Obj, "ORT", urlParameters, mode, this.oMain.i18n.getText("lblOrderType"), this.ort_fields);
										
				}else if(ObjName === "act"){	// WHEN 'ACT'.  "10
					var auart = param1;
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Spras eq '"+ lange + "' and Input1 eq '" + auart + "'"
				    }
					this._get_search_Model(Obj, "ACT", urlParameters, mode, this.oMain.i18n.getText("lblActivityType"), this.ort_fields);

				}else if(ObjName === "ac2"){	// WHEN 'ACT'.  "10
					var auart = param1;
					
					if(auart === "PM01" && param2 == false){
						var urlParameters = {
								"$expand" : "Result" ,
							    "$filter" : "Spras eq '"+ lange + "' and Input1 eq '" + auart + "' and Input2 eq 'X'"
					    }						
					}else {
						var urlParameters = {
								"$expand" : "Result" ,
							    "$filter" : "Spras eq '"+ lange + "' and Input1 eq '" + auart + "'"
					    }						
					}
					
					this._get_search_Model(Obj, "AC2", urlParameters, mode, this.oMain.i18n.getText("lblActivityType"), this.ort_fields);

				}else if(ObjName === "pri"){	// WHEN 'PRI'.  "11
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Spras eq '"+ lange + "'"	
				    }
					this._get_search_Model(Obj, "PRI", urlParameters, mode, this.oMain.i18n.getText("lblPriority"), this.pri_fields);
					
				}else if(ObjName === "rev"){	// WHEN 'REV'.  "12
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Spras eq '"+ lange + "' and Input1 eq '" + plant +"'"							
					}
					this._get_search_Model(Obj, "REV", urlParameters, mode, this.oMain.i18n.getText("lblRevision"), this.rev_fields);
					
				}else if(ObjName === "cok"){	// WHEN 'COK'.  "13
					var urlParameters = {
							"$expand" : "Result" 
					}
					this._get_search_Model(Obj, "COK", urlParameters, mode, this.oMain.i18n.getText("lblControlKey"), this.cok_fields);
															
				}else if(ObjName === "slt"){	// WHEN 'STL'.  "15
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Spras eq '"+ lange + "' and Input1 eq '" + plant +"'"							
					}
					this._get_search_Model(Obj, "STL", urlParameters, mode, this.oMain.i18n.getText("lblStorageLocation"), this.slt_fields);
											
				}else if(ObjName === "psf" || ObjName === "psort"){	// WHEN 'PSF'.  "16
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Spras eq '"+ lange + "' and Input1 eq '" + plant +"'"							
					}
					this._get_search_Model(Obj, "PSF", urlParameters, mode, this.oMain.i18n.getText("lblPMSortField"), this.psf_fields);			
					
				}else if(ObjName === "eqc"){	// WHEN 'EQC'.  "17
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Spras eq '"+ lange + "'"
					}
					this._get_search_Model(Obj, "EQC", urlParameters, mode, this.oMain.i18n.getText("lblEQCategory"), this.eqc_fields);
					
				}else if(ObjName === "tot"){	// WHEN 'TOT'.  "18
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Spras eq '"+ lange + "'"
					}
					this._get_search_Model(Obj, "TOT", urlParameters, mode, this.oMain.i18n.getText("lblTechnicalObjectType"), this.tot_fields);

				}else if(ObjName === "com"){	// WHEN 'COM'.  "19
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Spras eq '"+ lange + "'"
					}
					this._get_search_Model(Obj, "COM", urlParameters, mode, this.oMain.i18n.getText("lblCountryofManufacture"), this.com_fields);
										
				}else if(ObjName === "mag"){	// WHEN 'MAG'.  "20
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Spras eq '"+ lange + "'"
					}
					this._get_search_Model(Obj, "MAG", urlParameters, mode, this.oMain.i18n.getText("lblMaterialGroup"), this.mag_fields);

				}else if(ObjName === "mrc"){	// WHEN 'MRC'.  "21
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Spras eq '"+ lange + "' and Input1 eq '" + plant +"'"							
					}
					this._get_search_Model(Obj, "MRC", urlParameters, mode, this.oMain.i18n.getText("lblMRPController"), this.mrc_fields);			

				}else if(ObjName === "pug"){	// WHEN 'PUG'.  "22
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Spras eq '"+ lange + "' and Input1 eq '" + plant +"'"							
					}
					this._get_search_Model(Obj, "PUG", urlParameters, mode, this.oMain.i18n.getText("lblPurchasingGroup"), this.pug_fields);							
					
				}else if(ObjName === "gla"){	// WHEN 'GLA'.  "23
//					var kokrs = param1;
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Spras eq '"+ lange + "' and Input1 eq '" + plant + "'"
				    }
					this._get_search_Model(Obj, "GLA", urlParameters, mode, this.oMain.i18n.getText("lblGLAccount"), this.gla_fields);
						
				}else if(ObjName === "mep"){	// WHEN 'MEP'.  "24
					var equnr = param1;   // 화면에 입력된 값을 가져와야 함 
					var urlParameters = {
							"$expand" : "Result" ,
							"$filter" : "Spras eq '"+ lange + "' and Input1 eq '" + equnr + "'"	
					}
					this._get_search_Model(Obj, "MEP", urlParameters,  mode, this.oMain.i18n.getText("lblMeasuringPoint"), this.mep_fields);	

				}else if(ObjName === "cag"){	// WHEN 'CAG'.  "25
					var type = param1;   // D
					var equnr = param2;   // 화면에 입력된 값을 가져와야 함 

					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Spras eq '"+ lange + "' and Input1 eq '"+ type +"' and Input2 eq '" + equnr + "'"	
					}
					this._get_search_Model(Obj, "CAG", urlParameters,  mode, this.oMain.i18n.getText("lblCatalogGroup"), this.cag_fields);	

				}else if(ObjName === "cac"){	// WHEN 'CAC'.  "26
					var type = param1;   // D
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Spras eq '"+ lange + "' and Input1 eq '"+ type +"' and Input2 eq 'PM'" 
					}
					this._get_search_Model(Obj, "CAC", urlParameters, mode, this.oMain.i18n.getText("Severity"), this.cac_fields); 				
				}else if(ObjName === "mpc"){	// WHEN 'MPC'.  "27"
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Spras eq '"+ lange  + "'"	
					}
					this._get_search_Model(Obj, "MPC", urlParameters, mode, this.oMain.i18n.getText("lblMaintPalnCategory"), this.mpc_fields); 

				}else if(ObjName == "pic"){	// WHEN 'PIC'.  "28
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Input1 eq '" + plant +"'"							
					}
					this._get_search_Model(Obj, "PIC", urlParameters, mode, this.oMain.i18n.getText("lblPic"), this.pic_fields);
										
				}else if(ObjName == "grd"){	// WHEN 'GRD'.  "30
 
					var urlParameters = {
							"$expand" : "Result" ,
							"$filter" : "Spras eq '"+ lange + "' and Input1 eq '" + plant + "'"	
					}
					this._get_search_Model(Obj, "GRD", urlParameters,  mode, this.oMain.i18n.getText("lblReason"), this.grd_fields);	
										
				}								
			},
			
			/*
			 * Search help Event
			 */
					
			openValueHelp : function(ObjName){
				
				if(ObjName == "not"){
					this._oNot_sh.openValueHelp(
						"/results", 
						function(selection,ctx){
				        },
				        function(ctx){
					       console.log("Not_Error");
				        },
				        this
				   );
				}else if(ObjName == "cac"){
					this._oCac_sh.openValueHelp(
						"/results", 
						function(selection,ctx){
				        },
				        function(ctx){
					       console.log("Cac_Error");
				        },
				        this
    				 );
                }else if(ObjName == "loc"){
                	this._oLoc_sh.openValueHelp(
						"/results", 
						function(selection,ctx){
				        },
				        function(ctx){
					       console.log("Loc_Error");
				        },
				        this
    				 );
                }else if(ObjName == "coc"){
					this._oCoc_sh.openValueHelp(
						"/results", 
						function(selection,ctx){
				        },
				        function(ctx){
					       console.log("Coc_Error");
				        },
				        this
					 );
				}else if(ObjName == "woc" || ObjName == "vaplz"){
					this._oWoc_sh.openValueHelp(
						"/results", 
						function(selection,ctx){
				        },
				        function(ctx){
					       console.log("Woc_Error");
				        },
				        this
				    );
				}else if(ObjName == "eqc"){
					this._oEqc_sh.openValueHelp(
						"/results", 
						function(selection,ctx){
				        },
				        function(ctx){
					       console.log("Eqc_Error");
				        },
				        this
				   );
				}else if(ObjName == "tot"){
					this._oTot_sh.openValueHelp(
							"/results", 
							function(selection,ctx){
					        },
					        function(ctx){
						       console.log("Tot_Error");
					        },
					        this
					   );
				}else if(ObjName == "mep"){
					this._oMep_sh.openValueHelp(
							"/results", 
							function(selection,ctx){
					        },
					        function(ctx){
						       console.log("Mep_Error");
					        },
					        this
					 );
				}else if(ObjName == "psf" || ObjName == "psort" ){
					this._oPsf_sh.openValueHelp(
							"/results", 
							function(selection,ctx){
						    },
						    function(ctx){
							    console.log("Psf_Error");
						    },
						    this
					);					
				}else if(ObjName == "plg" || ObjName == "ingrp" ){
					this._oPlg_sh.openValueHelp(
							"/results", 
							function(selection,ctx){
						    },
						    function(ctx){
							    console.log("Plg_Error");
						    },
						    this
					);					
				}else if(ObjName == "ort" || ObjName == "auart" ){
					this._oOrt_sh.openValueHelp(
							"/results", 
							function(selection,ctx){
						    },
						    function(ctx){
							    console.log("Ort_Error");
						    },
						    this
					);					
				}	
					
			},
			
			set_token : function(Obj, oEvent){
				var g_token = [];
				g_token = Obj.getTokens();
				    
			    var val = oEvent.getParameters().newValue.toUpperCase();
				if(val){
				    var data = oEvent.getSource().getModel().getData().results;
					for(var i=0; i<data.length; i++){
						if(val == data[i].Key){
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
					if(i == 0){
						str = "(";
					}else{
						str = str + " or "
					}
					str = str + Val + " eq '" + Obj[i] + "'";
					
					if(i == Obj.length-1){
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
	
		    	var oModel = this.oMain.getView().getModel("possible");
		    	oModel.setDefaultCountMode(sap.ui.model.odata.CountMode.None);
		    	
				var path = "/ImportSet('" + key + "')" ;
							
				var controll = this;
				
				var mParameters = {
				  urlParameters : urlParameters,
				  success : function(oData) {
					  if(objType == "C"){
						  if(Obj.getItems().length > 0){
							  Obj.removeAllItems();
						  }
						  
			              for(var i=0; i<oData.Result.results.length; i++){
			          	   var template = new sap.ui.core.Item();
			                 template.setKey(oData.Result.results[i].Key);
			                 template.setText(oData.Result.results[i].KeyName);
			                 Obj.addItem(template);
			                 //console.log(key);
			              }
					  }else if(objType == "A"){

			              for(var i=0; i<oData.Result.results.length; i++){
			                 Obj.push({Key: oData.Result.results[i].Key, KeyName: oData.Result.results[i].KeyName});
			              }
					  }else if(objType == "H"){
							
						var sh_Model = new sap.ui.model.json.JSONModel();
						sh_Model.setData(oData.Result);
					
						if(key == "NOT"){			// WHEN 'NOT'. "1
							controll._oNot_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
							
						}else if(key == "PLG"){	// WHEN 'PLG'. "2
							controll._oPlg_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect								
						}else if(key == "WOC"){	// WHEN 'WOC'. "3
							controll._oWoc_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key == "PLT"){	// WHEN 'PLT'. "4
							controll._oPlt_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key == "LOC"){	// WHEN 'LOC'. "5
							controll._oLoc_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key == "PLS"){	// WHEN 'PLS'. "6
							controll._oPls_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key == "ABI"){	// WHEN 'ABI'. "7
							controll._oAbi_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key == "COC"){	// WHEN 'COC'. "8
							controll._oCoc_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key == "ORT"){	// WHEN 'ORT'. "9
							controll._oOrt_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key == "ACT"){	// WHEN 'ACT'.  "10
							controll._oAct_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key == "PRI"){	// WHEN 'PRI'.  "11
							controll._oPri_sh = new ValueHelpHelper(	
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key == "REV"){	// WHEN 'REV'.  "12
							controll._oRev_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key == "COK"){	// WHEN 'COK'.  "13
							controll._oCok_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key == "STL"){	// WHEN 'STL'.  "15
							controll._oStl_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key == "PSF"){	// WHEN 'PSF'.  "16
							controll._oPsf_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key == "EQC"){	// WHEN 'EQC'.  "17
							controll._oEqc_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key == "TOT"){	// WHEN 'TOT'.  "18
							controll._oTot_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key == "COM"){	// WHEN 'COM'.  "19
							controll._oCom_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key == "MAG"){	// WHEN 'MAG'.  "20
							controll._oMag_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key == "MRC"){	// WHEN 'MRC'.  "21
							controll._oMrc_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key == "PUG"){	// WHEN 'PUG'.  "22
							controll._oPug_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key == "GLA"){	// WHEN 'GLA'.  "23
							controll._oGla_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key == "MEP"){	// WHEN 'MEP'.  "24
							controll._oMep_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key == "CAG"){	// WHEN 'CAG'.  "25
							controll._oCag_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key == "CAC"){	// WHEN 'CAC'.  "26
							controll._oCac_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key == "MPC"){	// WHEN 'MPC'.  "27"
							controll._oMpc_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key == "PIC"){	// WHEN 'PIC'.  "28"
							controll._oPic_sh = new ValueHelpHelper(
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
			
			cal_duration : function(startDate, startTime, endDate, endTime){
				var differ;
				var daysDiff;
				var diffferInseconds;
				var truncated;
				
				// check input values // L_TO_TIME_DIFF
				if(startDate == "" || startTime == "" || endDate == "" || endTime == "" ){
//					RAISE INPUT_DATA_EMPTY.
					truncated = "";
					return truncated ;
				}else{
					
//					debugger;
				    var sDate = formatter.strToDate(startDate)
				    var eDate = formatter.strToDate(endDate)
				    
					var diff = Math.abs(sDate.getTime() - eDate.getTime());
				    daysDiff = diff / (24*3600*1000);
				    if(startDate > endDate){
				    	daysDiff = daysDiff * -1;
				    }
			        
					diffferInseconds = (parseInt(daysDiff) * 86400) 
										+ 
										( 
												parseInt(endTime.substr(0, 2)) * 3600 + 
												parseInt(endTime.substr(2, 2)) * 60 + 
												parseInt(endTime.substr(4, 2)) 
												
										) 
										- 
										( 
												parseInt(startTime.substr(0, 2)) * 3600 + 
												parseInt(startTime.substr(2, 2)) * 60 + 
												parseInt(startTime.substr(4, 2)) 
										);

				
					differ = ( diffferInseconds / 3600 );
					truncated = this._truncateDecimals(differ * 100) / 100;
					
					return truncated;	
				}
			},
			
			_truncateDecimals : function (number) {
			    return Math[number < 0 ? 'ceil' : 'floor'](number);
			},					
		   			
		};
	}
);