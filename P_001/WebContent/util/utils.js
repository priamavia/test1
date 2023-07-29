sap.ui.define([
       	"sap/m/MessageToast"
	] , function(MessageToast) {
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
					var fieldName;
					try{
						fieldName = aColumns[i].getLabel().getText();

					}catch(err){
						fieldName = aColumns[i].getLabel().getSrc();
					}					
					var oExportColumn = {
						name: fieldName,
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
			
			
			set_token : function(Obj, oEvent){
				var g_token = [];
				g_token = Obj.getTokens();
				    
			    var val = oEvent.getParameters().newValue.toUpperCase();
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
			
			
			set_filter : function(Obj, Val){
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
		};
	}
);