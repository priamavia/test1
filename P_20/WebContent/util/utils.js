sap.ui.define([
		"cj/pm0110/util/ValueHelpHelper",
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
					if (oTemplate instanceof sap.m.Text) {
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
							
			
				//Planner Group
				this.plg_fields = [
                    {label: this.oMain.i18n.getText("lblPlannerGroup"),      key: "Key", searchable:true, iskey:true, search:true },
				    {label: this.oMain.i18n.getText("lblPlannerGroupName"), key: "Name", searchable:true, iskey:true, search:true }                        
                ];
				
				//WBS
				this.wbs_fields = [
                    {label: this.oMain.i18n.getText("lblWBSElement"),      key: "Key", searchable:true, iskey:true, search:true },
				    {label: this.oMain.i18n.getText("lblWBSElementName"), key: "Name", searchable:true, iskey:true, search:true }                        
                ];
				
				//LFA
				this.lfa_fields = [
                    {label: this.oMain.i18n.getText("lblVendor"),  key: "Key", searchable:true, iskey:true, search:true },
				    {label: this.oMain.i18n.getText("lblName"), key: "Name", searchable:true, iskey:true, search:true },
				    {label: this.oMain.i18n.getText("lblCity"), key: "Add2", searchable:false, iskey:true, search:true },
				    {label: this.oMain.i18n.getText("lblCountryKey"), key: "Add1", searchable:false, iskey:true, search:true }	      
                ];
				
				//Storage Location
				this.stl_fields = [
                    {label: this.oMain.i18n.getText("lblStorageLocation"), key: "Key", searchable:true, iskey:true, search:true },
				    {label: this.oMain.i18n.getText("lblStorageLocationName"),  key: "Name", searchable:true, iskey:true, search:true }
                ];
				
				
				//Material 
				this.mat_fields = [
                    {label: this.oMain.i18n.getText("lblMaterial"), key: "Key", searchable:true, iskey:true, search:true },
				    {label: this.oMain.i18n.getText("lblMaterialDescription"),  key: "Name", searchable:true, iskey:true, search:true },
                    {label: this.oMain.i18n.getText("lblMaterialType"),  key: "Add1", searchable:true, iskey:true, search:true }
                ];
				
				
				//Revision REV
				this.rev_fields = [
                    {label: this.oMain.i18n.getText("lblRevision"), key: "Key", searchable:true, iskey:true, search:true },
				    {label: this.oMain.i18n.getText("lblDescription"),  key: "Name", searchable:true, iskey:true, search:true }
				];
				
				//Currency
				this.cur_fields = [
                    {label: this.oMain.i18n.getText("lblCurrency"), key: "Key", searchable:true, iskey:true, search:true },
				    {label: this.oMain.i18n.getText("lblDescription"),  key: "Name", searchable:true, iskey:true, search:true }
				];
				
				//Assmbley 
				this.ams_fields = [
                    {label: this.oMain.i18n.getText("lblAssembly"), key: "Key", searchable:true, iskey:true, search:true },
				    {label: this.oMain.i18n.getText("lblDescription"),  key: "Name", searchable:true, iskey:true, search:true }               
				]
								
				this.aTokens = null;
			},		

			  // openMode = 'X' 초기에 데이터를 가져오지 않고 help를 누를때 가져오도록 설정   
			set_search_field : function(oSwerk, Obj, ObjName, mode, param1, param2, openMode, oPageObj, oEvent){  
				var lange = this.oMain.getLanguage();
				var plant = oSwerk;

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
				
				if(ObjName === "not"){			// WHEN 'NOT'. "1
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Spras eq '"+ lange + "'"
					}
					this._get_search_Model(Obj, "NOT", urlParameters, mode, this.oMain.i18n.getText("lblNotificationType"), this.not_fields);
				
				}else if(ObjName === "plg"){	// WHEN 'PLG'. "2
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Input1 eq '" + plant + "'"
					}
					this._get_search_Model(Obj, "PLG", urlParameters, mode, this.oMain.i18n.getText("lblPlannerGroup"), this.plg_fields);
						
				}else if(ObjName === "woc"){	// WHEN 'WOC'. "3
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Spras eq '"+ lange + "' and Input1 eq '" + plant +"'"
					}
					this._get_search_Model(Obj, "WOC", urlParameters, mode,  this.oMain.i18n.getText("lblWorkCenter"), this.woc_fields);
					
				}else if(ObjName === "plt"){	// WHEN 'PLT'. "4
					var urlParameters = {
							"$expand" : "Result" 
					}
					this._get_search_Model(Obj, "PLT", urlParameters, mode, this.oMain.i18n.getText("lblPlant"), this.plt_fields);
					
				}else if(ObjName === "loc"){	// WHEN 'LOC'. "5
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Input1 eq '" + plant + "'"
					}
					this._get_search_Model(Obj, "LOC", urlParameters, mode, this.oMain.i18n.getText("lblProcess"), this.loc_fields);

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
																
				}else if(ObjName === "coc"){	// WHEN 'COC'. "8
					//var kokrs = param1;
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Spras eq '"+ lange + "' and Input1 eq '" + plant + "'"
				    }
					this._get_search_Model(Obj, "COC", urlParameters, mode, this.oMain.i18n.getText("lblCostCenter"), this.coc_fields);
										
				}else if(ObjName === "ort"){	// WHEN 'ORT'. "9
					var str_filter = "";
					if(param1){
						str_filter = "and Input1 eq '"+param1+"'";
					}
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Spras eq '"+ lange + "'" + str_filter// and Input1 eq 'X'"	  //PM02는 뺴고 선택
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
															
				}else if(ObjName === "stl"){	// WHEN 'STL'.  "15
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Spras eq '"+ lange + "' and Input1 eq '" + plant +"'"							
					}
					this._get_search_Model(Obj, "STL", urlParameters, mode, this.oMain.i18n.getText("lblStorageLocation"), this.stl_fields);
										
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
					
				}else if(ObjName === "puo"){	// WHEN 'PUO'.  "22
					var urlParameters = {
							"$expand" : "Result",
							"$filter" : "Input1 eq '" + plant +"'"	
					}
					this._get_search_Model(Obj, "PUO", urlParameters, mode, this.oMain.i18n.getText("lblPurchasingOrganization"), this.puo_fields);							
					
				}else if(ObjName === "gla"){	// WHEN 'GLA'.  "23
					//var kokrs = param1;
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
					this._get_search_Model(Obj, "CAC", urlParameters, mode, this.oMain.i18n.getText("lblSeverity"), this.cac_fields); 
					
				}else if(ObjName === "mpc"){	// WHEN 'MPC'.  "27"
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Spras eq '"+ lange  + "'"	
					}
					this._get_search_Model(Obj, "MPC", urlParameters, mode, this.oMain.i18n.getText("lblMaintPalnCategory"), this.mpc_fields); 
					
				}else if(ObjName === "pic"){	// WHEN 'PIC'.  "28
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Input1 eq '" + plant +"'"							
					}
					this._get_search_Model(Obj, "PIC", urlParameters, mode, this.oMain.i18n.getText("lblPic"), this.pic_fields);
										
				}else if(ObjName === "wbs"){	// WHEN 'WBS'.  "28
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Input1 eq '" + plant +"'"							
					}
					this._get_search_Model(Obj, "WBS", urlParameters, mode, this.oMain.i18n.getText("lblWbs"), this.wbs_fields, openMode, oPageObj);	
					
				}else if(ObjName === "mat"){	// WHEN 'MAT'. 
					var urlParameters = {
							"$expand" : "Result" ,
							"$filter" : "Spras eq '"+ lange + "' and Input1 eq '" + plant +"'"
					}
					this._get_search_Model(Obj, "MAT", urlParameters, mode, this.oMain.i18n.getText("lblMaterial"), this.mat_fields, openMode, oPageObj, oEvent);	
					
				}else if(ObjName === "lfa"){    // WHEN 'LFA"
					var ekorg = param1;
					var urlParameters = {
							"$expand" : "Result",
							"$filter" : "Input1 eq '" + ekorg +"'"
					}
					this._get_search_Model(Obj, "LFA", urlParameters, mode, this.oMain.i18n.getText("lblVendor"), this.lfa_fields, openMode, oPageObj, oEvent);	
				
				}else if(ObjName === "cur"){
					var urlParameters = {
							"$expand" : "Result",
							"$filter" : "Spras eq '"+ lange  + "'"	
					}
					this._get_search_Model(Obj, "CUR", urlParameters, mode, this.oMain.i18n.getText("lblCurrency"), this.cur_fields, openMode, oPageObj);	
				
				}else if(ObjName === "asm" || ObjName === "asm_init"){
					var matnr = param2;   // 화면에 입력된 값을 가져와야 함 

					var urlParameters = {
							"$expand" : "Result" ,
							"$filter" : "Spras eq '"+ lange + "' and Input1 eq '" + plant +"' and Input2 eq '" + matnr + "'"	
					}
					
//					var urlParameters = {
//							"$expand" : "Result",
//							"$filter" : "Spras eq '"+ lange  + "'"	
//					}
					this._get_search_Model(Obj, "ASM", urlParameters, mode, this.oMain.i18n.getText("lblAssembly"), this.ams_fields, openMode, oPageObj, oEvent);	
				}
			},
			
			/*
			 * Search help Event
			 */
			openValueHelp : function(ObjName){
				
				if(ObjName === "not"){
					this._oNot_sh.openValueHelp(
						"/results", 
						function(selection,ctx){
				        },
				        function(ctx){
					       console.log("Not_Error");
				        },
				        this
				   );
				}else if(ObjName === "cac"){
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
							if(selection){
								this.oMain.set_search_selected_data(ObjName, selection);
							}
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
							if(selection){
								this.oMain.set_search_selected_data(ObjName, selection);
							}
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
				}else if(ObjName === "psf" || ObjName === "psort" ){
					this._oPsf_sh.openValueHelp(
						"/results", 
						function(selection,ctx){
					    },
					    function(ctx){
						    console.log("Psf_Error");
					    },
					    this
					);					
				}else if(ObjName === "plg" || ObjName === "ingrp" ){
					this._oPlg_sh.openValueHelp(
						"/results", 
						function(selection,ctx){
					    },
					    function(ctx){
						    console.log("Plg_Error");
					    },
					    this
					);					
				}else if(ObjName === "pug"){
					this._oPug_sh.openValueHelp(
						"/results", 
						function(selection,ctx){
					    },
					    function(ctx){
						    console.log("Pug_Error");
					    },
					    this
					);
				}else if(ObjName === "puo"){
					this._oPuo_sh.openValueHelp(
						"/results", 
						function(selection,ctx){
					    },
					    function(ctx){
						    console.log("Puo_Error");
					    },
					    this
					);
				}else if(ObjName === "wbs"){
					this._oWbs_sh.openValueHelp(
						"/results", 
						function(selection,ctx){
							if(selection){
								this.oMain.set_search_selected_data(ObjName, selection); //Input box 의 경우 상용
							}
					    },
					    function(ctx){
						    console.log("Wbs_Error");
					    },
					    this
					);
				}else if(ObjName === "lfa"){
					this._oLfa_sh.openValueHelp(
						"/results", 
						function(selection,ctx){
							if(selection){
								this.oMain.set_search_selected_data(ObjName, selection); //Input box 의 경우 상용
							}
					    },
					    function(ctx){
						    console.log("Lfa_Error");
					    },
					    this
					);
				}else if(ObjName === "stl"){
					this._oStl_sh.openValueHelp(
						"/results", 
						function(selection,ctx){
							if(selection){
								this.oMain.set_search_selected_data(ObjName, selection); //Input box 의 경우 상용
							}
					    },
					    function(ctx){
						    console.log("Stl_Error");
					    },
					    this
					);
				}else if(ObjName === "mat"){
					this._oMat_sh.openValueHelp(
						"/results", 
						function(selection,ctx){
							if(selection){
								this.oMain.set_search_selected_data(ObjName, selection); //Input box 의 경우 상용
							}
					    },
					    function(ctx){
						    console.log("Mat_Error");
					    },
					    this
					);
				}else if(ObjName === "rev"){
					this._oRev_sh.openValueHelp(
						"/results", 
						function(selection,ctx){
							if(selection){
							   this.oMain.set_search_selected_data(ObjName, selection);  //Input box 의 경우 상용
							}
					    },
					    function(ctx){
						    console.log("Rev_Error");
					    },
					    this
					);
				}else if(ObjName === "cur"){
					this._oCur_sh.openValueHelp(
						"/results", 
						function(selection,ctx){
							if(selection){
							   this.oMain.set_search_selected_data(ObjName, selection);  //Input box 의 경우 상용
							}
					    },
					    function(ctx){
						    console.log("Cur_Error");
					    },
					    this
					);
				}else if(ObjName === "asm_init" || ObjName === "asm"){
					this._oAsm_sh.openValueHelp(
						"/results", 
						function(selection,ctx){
							if(selection){
							   this.oMain.set_search_selected_data(ObjName, selection);  //Input box 의 경우 상용
							}
					    },
					    function(ctx){
						    console.log("Ams_Error");
					    },
					    this
					);
				}	
			},
			
			//mode : 하나의 값만 input이 가능 해야 할때는  mode 'X' 를 준다.
			set_token : function(Obj, oEvent, mode, objValue){ 
				var g_token = [];
				
				var strArr;
				if(oEvent){
					strArr = oEvent.oSource.sId.split("--");
				}else{
					strArr = Obj.getId().split("--");
				}
				var cnt = strArr.length - 1;
				var sIdstr = strArr[cnt];
				
				if(!mode){
					g_token = Obj.getTokens();
				}
				
				var val;
				if(objValue){
					val = objValue;
				}else{
					val = oEvent.getParameters().newValue;
				}
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
							g_token.push(new sap.m.Token({key: data[i].Key, text: data[i].Name}));
							Obj.setValue("");
							
						    if( Obj instanceof sap.m.MultiInput ){
						    	Obj.setTokens(g_token);
						    }else{
						    	this.oMain.set_search_selected_data(sIdstr, g_token[0], data[i]);
						    }
						   return;
						}
					}
					this.oMain.set_search_selected_data(sIdstr, g_token[0], data[i], "X");
					return "X";
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
			
			//WBS, Vender 의 경우 데이터가 많이 나오므로 Searh help 버튼 클릿시 데이터 조회 한다. 
			get_sh_help : function(obj){
				if(obj == "wbs"){
					return this._oWbs_sh;
				}else if(obj == "lfa"){
					return this._oLfa_sh;
				}else if(obj == "mat"){
					return this._oMat_sh;
				}else if(obj == "asm_init" || obj == "asm"){
					return this._oAsm_sh;
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
		    _get_search_Model : function(Obj, key, urlParameters, objType, title, field, openMode, oPageObj, oEvent) {
	
		    	var oModel = this.oMain.getView().getModel("possible");
		    	oModel.setDefaultCountMode(sap.ui.model.odata.CountMode.None);
		    	
		    	if(oPageObj){
					oModel.attachRequestSent( function(){ oPageObj.setBusy(true); });
					oModel.attachRequestCompleted( function(){ oPageObj.setBusy(false); });			    		
		    	}
		    	
				var path = "/ImportSet('" + key + "')" ;
							
				var controll = this;
				if(oEvent){
					var objValue = oEvent.getParameters().newValue;
				}
				
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
			              if(key === "WOC"){
			            	  controll.set_table_work_ctr("",Obj);
			              }
			              
					  }else if(objType === "H"){
							
						var sh_Model = new sap.ui.model.json.JSONModel();
						sh_Model.setData(oData.Result);
					
						if(key === "NOT"){			// WHEN 'NOT'. "1
							controll._oNot_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 		
						}else if(key === "PLG"){	// WHEN 'PLG'. "2
							controll._oPlg_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect								
						}else if(key === "WOC"){	// WHEN 'WOC'. "3
							controll._oWoc_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, false);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key === "PLT"){	// WHEN 'PLT'. "4
							controll._oPlt_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key === "LOC"){	// WHEN 'LOC'. "5
							controll._oLoc_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key === "PLS"){	// WHEN 'PLS'. "6
							controll._oPls_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key === "ABI"){	// WHEN 'ABI'. "7
							controll._oAbi_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key === "COC"){	// WHEN 'COC'. "8
							controll._oCoc_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, false);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key === "ORT"){	// WHEN 'ORT'. "9
							controll._oOrt_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key === "ACT"){	// WHEN 'ACT'.  "10
							controll._oAct_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key === "PRI"){	// WHEN 'PRI'.  "11
							controll._oPri_sh = new ValueHelpHelper(	
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key === "REV"){	// WHEN 'REV'.  "12
							controll._oRev_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, false);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key === "COK"){	// WHEN 'COK'.  "13
							controll._oCok_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key === "STL"){	// WHEN 'STL'.  "15
							controll._oStl_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, false);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key === "PSF"){	// WHEN 'PSF'.  "16
							controll._oPsf_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key === "EQC"){	// WHEN 'EQC'.  "17
							controll._oEqc_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key === "TOT"){	// WHEN 'TOT'.  "18
							controll._oTot_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key === "COM"){	// WHEN 'COM'.  "19
							controll._oCom_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key === "MAG"){	// WHEN 'MAG'.  "20
							controll._oMag_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key === "MRC"){	// WHEN 'MRC'.  "21
							controll._oMrc_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key === "PUG"){	// WHEN 'PUG'.  "22
							controll._oPug_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key === "GLA"){	// WHEN 'GLA'.  "23
							controll._oGla_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key === "MEP"){	// WHEN 'MEP'.  "24
							controll._oMep_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key === "CAG"){	// WHEN 'CAG'.  "25
							controll._oCag_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key === "CAC"){	// WHEN 'CAC'.  "26
							controll._oCac_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key === "MPC"){	// WHEN 'MPC'.  "27"
							controll._oMpc_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key === "PIC"){	// WHEN 'PIC'.  "28"
							controll._oPic_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
						}else if(key === "WBS"){	// WHEN 'WBS'.  
							controll._oWbs_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, false);  //Model, UI Object, SearchHelp table, title, MultiSelect 
							if(openMode){  
								controll.openValueHelp("wbs");  // WBS의 데이터의 경우 Help를 click 할때 데이터만 가져오고 help창은 제어 한다. 
							}
						}else if(key === "LFA"){	// WHEN 'LFA'.  
							controll._oLfa_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, false);  //Model, UI Object, SearchHelp table, title, MultiSelect 
							if(openMode === "X"){    //Search Help를 open
								controll.openValueHelp("lfa");  // Vender 데이터의 경우 Help를 click 할때 데이터를 가져오고 help창은 제어 한다. 
							}
						}else if(key === "MAT"){	// WHEN 'MAT'.  
							controll._oMat_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, false);  //Model, UI Object, SearchHelp table, title, MultiSelect 
							if(openMode === "X"){  //Search Help 창 open
								controll.openValueHelp("mat");  // MAT 데이터의 경우 Help를 click 할때 데이터를 가져오고 help창은 제어 한다. 
							}
//							else if(openMode === "T"){  // .아직 Model이 설정되지 않았으므로 setModel 이후에 한다 
//								controll.set_token(Obj, "", "X", objValue);
//				    		}
//						}else if(key === "ASM"){
//							controll._oAsm_sh = new ValueHelpHelper(
//			                		sh_Model, Obj, field, title, false);  //Model, UI Object, SearchHelp table, title, MultiSelect 
//						}	
						}else if(key === "ASM"){
							controll._oAsm_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, false);  //Model, UI Object, SearchHelp table, title, MultiSelect 

							if(openMode === "X"){  
								if(Obj.sId == "asm_init"){
									controll.openValueHelp("asm_init");  // WBS의 데이터의 경우 Help를 click 할때 데이터만 가져오고 help창은 제어 한다.	
								}else{
									controll.openValueHelp("asm");  // WBS의 데이터의 경우 Help를 click 할때 데이터만 가져오고 help창은 제어 한다.
								}
								
							}							
						}						
						
						
						Obj.setModel(sh_Model);
						var template = new sap.ui.core.Item({text:"{Name}", key:"{Key}"});
						Obj.bindAggregation("suggestionItems", "/results" , template);
						
						if(key === "MAT" && openMode === "T"){  //Token 값만 던진다 
							controll.set_token(Obj, "", "X", objValue);
						}else if(key === "LFA" && openMode === "T"){
							controll.set_token(Obj, "", "X", objValue);
						}else if(key === "ASM" && openMode === "T"){
							controll.set_token(Obj, "", "X", objValue);
						}
						
					  }
				  }.bind(this),
				  error : function(oError){
					  Toast.show( key + "_SearchHelp_Error" );
				  }
				}
				oModel.read(path, mParameters);
			},
			
			
			set_table_work_ctr : function(woc_model, Obj){
				this.oMain.set_table_work_ctr(woc_model, Obj);
			},
			
			
			get_equip_info : function(equnr, s_swerk, objName){
				
				var oModel = this.oMain.getView().getModel("equip");
				var lange =  this.oMain.getLanguage();
			
				var filterStr = "Equnr eq '"+ equnr +"'";
				
				var path = "/KeyListSet(Type='P',Spras='"+lange+"',Swerk='"+s_swerk+"')";
				var mParameters = {
					urlParameters : {
						"$expand" : "KeyEqList",
						"$filter" : filterStr
					},
					success : function(oData) {
						if(oData.RetType === "E"){
						   this.oMain.set_equnr_info(oData, "E", objName);
						}else{
						   this.oMain.set_equnr_info(oData, "S", objName);
						}

					}.bind(this),
					error : function() {
						this.oMain.set_equnr_info("", "E", objName);
					}.bind(this)
				};
			     oModel.read(path, mParameters);
			},
			
			
			get_fl_info : function(tplnr, s_swerk){
				
				var oModel = this.oMain.getView().getModel("equip");
				var lange =  this.oMain.getLanguage();
			
				var filterStr = "Spras eq '"+lange+"' and Swerk eq '"+s_swerk+"'";
				
				var path = "/EqTreeSet(Id='"+tplnr+"')";
				var mParameters = {
					urlParameters : {
						"$filter" : filterStr
					},
					success : function(oData) {
						if(oData.RetType === "E"){
						   this.oMain.set_tplnr_info(oData, "E");
						}else{
						   this.oMain.set_tplnr_info(oData, "S");
						};

					}.bind(this),
					error : function() {
						this.oMain.set_tplnr_info("", "E");
					}.bind(this)
				}
			     oModel.read(path, mParameters);

			},
		    						  
		};
	}
);