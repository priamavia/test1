sap.ui.define([
        "cj/pm0090/util/ValueHelpHelper",
		"cj/pm0090/model/formatter",
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
				
			 	//Assembly
				this.asm_fields = [
                   {label: this.oMain.i18n.getText("lblMaterial"),      key: "Key", searchable:true, iskey:true, search:true },
				   {label: this.oMain.i18n.getText("lblDescription"),   key: "Name", searchable:true, iskey:true, search:true }
				];
								
							    				
				this.aTokens = null;
			},
			
			// openMode = 'X' �ʱ⿡ �����͸� �������� �ʰ� help�� ������ ���������� ����
			set_search_field : function(oSwerk, Obj, ObjName, mode, param1, param2, openMode, oPageObj, oEvent){
				var lange = this.oMain.getLanguage();
				var plant = oSwerk;

//				if(plant.substring(0,1) == "2"){
//					lange = "ZH";
//				}				
				
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
				
				if(ObjName === "not"){
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Spras eq '"+ lange + "'"
					}
					this._get_search_Model(Obj, "NOT", urlParameters, mode, this.oMain.i18n.getText("lblNotificationType"), this.not_fields);

				}else if(ObjName === "cac"){
					var type = param1;   // D
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Spras eq '"+ lange + "' and Input1 eq '"+ type +"' and Input2 eq 'PM'"   //Input1 : Catalog type
					}
					this._get_search_Model(Obj, "CAC", urlParameters, mode, this.oMain.i18n.getText("Severity"), this.cac_fields);
					
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
					
				}else if(ObjName === "cpc"){
					var urlParameters = {
							"$expand" : "Result" ,
						    "$filter" : "Spras eq '"+ lange + "' and Input1 eq '" + plant + "'"
				    }
					this._get_search_Model(Obj, "CPC", urlParameters, mode, this.oMain.i18n.getText("lblCostCenter"), this.coc_fields);
					
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
					var equnr = param1;   // ȭ�鿡 �Էµ� ���� �����;� ��
					var urlParameters = {
							"$expand" : "Result" ,
							"$filter" : "Spras eq '"+ lange + "' and Input1 eq '" + equnr + "'"	
					}
					this._get_search_Model(Obj, "MEP", urlParameters,  mode, this.oMain.i18n.getText("lblMeasuringPoint"), this.mep_fields);	
					
				}else if(ObjName == "pri"){  //Priority
					var urlParameters = {
							"$expand" : "Result" ,
							"$filter" : "Spras eq '"+ lange + "'"	
					}
					this._get_search_Model(Obj, "PRI", urlParameters,  mode, this.oMain.i18n.getText("lblPriority"), "");	
					
				}else if(ObjName == "plg"){  //Planner Group
					var urlParameters = {
							"$expand" : "Result" ,
							"$filter" : "Spras eq '"+ lange + "' and Input1 eq '" + plant +"'"
					}
					this._get_search_Model(Obj, "PLG", urlParameters,  mode, this.oMain.i18n.getText("lblPlannerGroup"), "");	

				}else if(ObjName == "pls"){  //Plant Section
					var urlParameters = {
							"$expand" : "Result" ,
							"$filter" : "Spras eq '"+ lange + "' and Input1 eq '" + plant +"'"
					}
					this._get_search_Model(Obj, "PLS", urlParameters,  mode, this.oMain.i18n.getText("lblPlantSection"), "");	
					
				}else if(ObjName == "uom"){  // Units of Measurement
	
					var urlParameters = {
							"$expand" : "Result" ,
							"$filter" : "Spras eq '"+ lange + "' and Input1 eq '" + param1 +"'"
					}
					this._get_search_Model(Obj, "UOM", urlParameters,  mode, this.oMain.i18n.getText("lblUnitsofMeasurement"), "" , "", "", "","X");	//KeyName ��� Name ��������
				}else if(ObjName === "asm"){	// WHEN 'ASM'.
					var matnr = param2;   // ȭ�鿡 �Էµ� ���� �����;� ��

					var urlParameters = {
							"$expand" : "Result" ,
							"$filter" : "Spras eq '"+ lange + "' and Input1 eq '" + plant +"' and Input2 eq '" + matnr + "'"	
					}
					
					this._get_search_Model(Obj, "ASM", urlParameters,  mode, this.oMain.i18n.getText("lblAssembly"), this.asm_fields, openMode, "", oEvent, "");
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
				}else if(ObjName === "bautl_init" || ObjName === "bautl"){
//					debugger;
					this._oAsm_sh.openValueHelp(
							"/results",
							function(selection,ctx){
								if(selection){
									this.oMain.set_search_selected_data(ObjName, selection);
								}
					        },
					        function(ctx){
						       console.log("Asm_Error");
					        },
					        this
						 );				
				}
			},
			
			
			//mode : �ϳ��� ���� input�� ���� �ؾ� �Ҷ���  mode 'X' �� �ش�.
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
				    //var data = oEvent.getSource().getModel().getData().results;
				    //var data = Obj.getModel().getData().results;
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
					this.oMain.set_search_selected_data(sIdstr, g_token[0], data[i], "X");
					return "X";
				}
			},
			
			/*
			 * Filter ��  �Ķ���� ����
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
			 * Filter �� Between �Ӽ� �ֱ� (ex. ��¥ from ~ to )
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
				
			
			checkMandatory : function(oMain, pageName){
				var oView = oMain.getView();
				var oPage = oView.byId(pageName);
				var page_child_cnt = oPage.getContent().length;
				
			    this.required = [];
			    var _check;
			
			    var controll = this;
				
				for(var i=0; i<page_child_cnt; i++){
					try{
					  if(oPage.getContent()[i] instanceof sap.ui.table.Table ){   // Table�� ��� �ٸ��� üũ�ؾ� ��
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
			
			
			getDateTime : function(value){
				
				if(!value){
					return { date : "00000000", time : "000000" };
				}
				var strArr = [];
				
				var date, time;
				
				strArr = value.split("-");
				date = strArr[0];
                time = strArr[1];

                return { date : date, time : time };

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
					
					debugger;
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

			//equipment ������ �����´�.
           get_equip_info : function(equnr, s_swerk){
				
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
						   this.oMain.set_equnr_info(oData, "E");
						}else{
						   this.oMain.set_equnr_info(oData, "S");
						}

					}.bind(this),
					error : function() {
						this.oMain.set_equnr_info(oData, "E");
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
						this.oMain.set_tplnr_info(oData, "E");
					}.bind(this)
				}
			     oModel.read(path, mParameters);
				
			
				
			},
			
			//Assembly �� ��� �����Ͱ� ���� �����Ƿ� Searh help ��ư Ŭ���� ������ ��ȸ �Ѵ�.
			get_sh_help : function(obj){
				if(obj == "bautl_init" || obj == "bautl"){
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
		       * Search Help Odata ȣ��
		       */
		    _get_search_Model : function(Obj, key, urlParameters, objType, title, field, openMode, oPageObj, oEvent, name) {
	
		    	var oModel = this.oMain.getView().getModel("possible");
		    	oModel.setDefaultCountMode(sap.ui.model.odata.CountMode.None);
		    	
		    	if(oPageObj){
					oModel.attachRequestSent( function(){ oPageObj.setBusy(true); });
					oModel.attachRequestCompleted( function(){ oPageObj.setBusy(false); });			    		
		    	}
		    	
//		    	if(Obj.getParent().getParent().getParent().getParent().getParent().getParent().sId == "dialog_init"){
//		    		var oDialog = Obj.getParent().getParent().getParent().getParent().getParent().getParent();
//		    		
//					oModel.attachRequestSent( function(){ oDialog.setBusy(true); });
//					oModel.attachRequestCompleted( function(){ oDialog.setBusy(false); });		    		
//		    	}
		    	
				var path = "/ImportSet('" + key + "')" ;
							
				if(oEvent){
					var objValue = oEvent.getParameters().newValue;
				}
				
				var controll = this;
				
				var mParameters = {
				  urlParameters : urlParameters,
				  success : function(oData) {
					 if(objType === "C"){  // combobox, select
						
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
			               if(name){
		                	 template.setText(oData.Result.results[i].Name);
		               	   }else{
		                	 template.setText(oData.Result.results[i].KeyName);
		               	   }
			               Obj.addItem(template);
			               Obj.setModel(sh_Model);
			             }
			
					 }else if(objType === "H"){  //search help
							
						var sh_Model = new sap.ui.model.json.JSONModel();
						sh_Model.setData(oData.Result);

						if(key === "NOT"){
							controll._oNot_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect
						}else if(key === "CAC"){
							controll._oCac_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, false);  //Model, UI Object, SearchHelp table, title, MultiSelect
						}else if(key === "LOC"){
							controll._oLoc_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect
					    }else if(key === "COC"){
							controll._oCoc_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, false);  //Model, UI Object, SearchHelp table, title, MultiSelect
						}else if(key === "WOC"){
							controll._oWoc_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, false);  //Model, UI Object, SearchHelp table, title, MultiSelect
						}else if(key === "EQC"){
							controll._oEqc_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect
						}else if(key === "TOT"){
							controll._oTot_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect
						}else if(key === "MEP"){
							controll._oMep_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect
						}else if(key === "ASM"){
							controll._oAsm_sh = new ValueHelpHelper(
			                		sh_Model, Obj, field, title, false);  //Model, UI Object, SearchHelp table, title, MultiSelect

							if(openMode == "X"){
								if(Obj.sId == "bautl_init"){
									controll.openValueHelp("bautl_init");  // WBS�� �������� ��� Help�� click �Ҷ� �����͸� �������� helpâ�� ���� �Ѵ�.	
								}else{
									controll.openValueHelp("bautl");  // WBS�� �������� ��� Help�� click �Ҷ� �����͸� �������� helpâ�� ���� �Ѵ�.
								}
								
							}							
						}
						
						Obj.setModel(sh_Model);
						var template = new sap.ui.core.Item({text:"{KeyName}", key:"{Key}"});
						Obj.bindAggregation("suggestionItems", "/results" , template);					
						
						if(key === "ASM" && openMode === "T"){  //Token ���� ������
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
			
			
			_truncateDecimals : function (number) {
			    return Math[number < 0 ? 'ceil' : 'floor'](number);
			},
			
			

			
		};
	}
);