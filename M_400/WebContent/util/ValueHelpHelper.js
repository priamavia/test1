sap.ui.define([
    "sap/ui/base/Object",
	"sap/ui/comp/valuehelpdialog/ValueHelpDialog",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(Object,ValueHelpDialog,Filter,FilterOperator) {
	"use strict";

	return Object.extend("cj.mm0010.controllers.ValueHelpHelper", {
		aKeys: [],
		theTokenInput: null,
		aTokens : [],
		cols : [],
		config : null,
		fields:[],
		oColModel : new sap.ui.model.json.JSONModel(),
		model : null,
		filter : [],
		binding : null,
		title : "",
		search : "",
		selectOption : "",
		
		constructor: function(model,inputField,config,title,selectOption) {
			if(inputField instanceof sap.m.MultiInput){
				this.isInput = "";
			}else if(inputField instanceof sap.m.Input){
				this.isInput = true;
			}
			
			this.theTokenInput = inputField;
			//this.theTokenInput.setTokens(this.aTokens);
			this.config = config;
			this.title = title;
			this.model = model;//$.extend({}, model);
			this.selectOption = selectOption;
			
			this.parent = parent;
		},
		
		clearValueHelp:function(){
			this.theTokenInput.setTokens([]);
		},
		
		openValueHelp:function(binding,onOk,onCancel,scope){
			var me = this;
			
			this.binding = binding;
			
			me.aKeys = [];
			me.cols = [];
			me.fields = [];
			me.filter = [];
			
			me.aTokens = [];
			if(!this.isInput){
				if(me.theTokenInput.getTokens().length != "0" ){
					for(var i=0;i<me.theTokenInput.getTokens().length;i++){
						me.aTokens.push(me.theTokenInput.getTokens()[i]);
					}
				}
				me.theTokenInput.setTokens(me.aTokens);
			}

			$.each(this.config,function(key,value){
				if(value.search){
					me.search = value.key;
				}
				if(value.iskey && value.iskey === true){
					me.aKeys.push(value.key);
				}
				var col = {};
				col.label=value.label;
				col.template = value.key;//new sap.m.Text();
				if(value.format === "Date"){
					col.oType = new sap.ui.model.type.Date();//{source: {pattern: "yyyyMMdd"},pattern: "dd-MM-YYYY"}
				}
				if(value.width){
					col.width = value.width;
				}
				me.cols.push(col);
				me.fields.push({label:value.label,key:value.key});
				if(value.searchable){
						me.filter.push(new sap.ui.comp.filterbar.FilterGroupItem({ 
							groupTitle: "Group", 
							groupName: "gn1", 
							name: value.key, 
							label: value.label, 
							control: new sap.m.Input(value.key)
						}));
				}
			});
			this.oColModel.setData({cols:this.cols});
			
			var oValueHelpDialog = new ValueHelpDialog({
				basicSearchText: me.theTokenInput.getValue(), 
				title: me.title,
    			modal: true,
				supportMultiselect: me.selectOption,   // Multi Select 
				supportRanges: false,
				supportRangesOnly: false,
				key: me.aKeys[0],	
				descriptionKey: me.aKeys[1],
				ok: function(oControlEvent) {
					
					if(me.isInput){
						me.aTokens = [];
						me.aTokens = oControlEvent.getParameter("tokens");
					}else{
						me.aTokens = oControlEvent.getParameter("tokens");
						me.theTokenInput.setTokens(me.aTokens);
					}
					
/*					me.aTokens = oControlEvent.getParameter("tokens");
					me.theTokenInput.setTokens(me.aTokens);*/
					oValueHelpDialog.close();
					if(me.isInput){
						onOk.call(scope||this,me.aTokens[0], scope);
					}else{
						onOk.call(scope||this,me.aTokens, scope);
					}
				},
				cancel: function(oControlEvent) {
					oValueHelpDialog.close();
					onCancel.call(scope||this, scope);
				},
				afterClose: function() {
					oValueHelpDialog.destroy();
				}
			});
			oValueHelpDialog.getTable().setModel(me.oColModel, "columns");
			oValueHelpDialog.getTable().setModel(me.model);
//			oValueHelpDialog.getTable().bindRows({
//				path:me.binding
//			});	

			// Desktop에서 데이터 바인딩
			if (oValueHelpDialog.getTable().bindRows) {
				oValueHelpDialog.getTable().bindRows({
					path:me.binding
				});
			}
	
			// Moblie 에서 데이터 바인딩
			if (oValueHelpDialog.getTable().bindItems) {
				var oTable = oValueHelpDialog.getTable();
				oTable.bindAggregation("items", me.binding, function(sId, oContext) {
					var aCols = oTable.getModel("columns").getData().cols;
					return new sap.m.ColumnListItem({
						cells: aCols.map(function(column) {
							var colname = column.template;
							return new sap.m.Label({
								text: "{" + colname + "}"
							});
						})
					});
				});
			}
			
			oValueHelpDialog.getTable().getModel().attachRequestSent(function(){
             	if(oValueHelpDialog && oValueHelpDialog.getTable()){
					oValueHelpDialog.getTable().setBusy(true); 
             	}
             });
             oValueHelpDialog.getTable().getModel().attachRequestCompleted(function(){
             	if(oValueHelpDialog && oValueHelpDialog.getTable()){
                	oValueHelpDialog.getTable().setBusy(false); 
             	}
             });
             
			oValueHelpDialog.setRangeKeyFields(me.fields); 
			oValueHelpDialog.setTokens(me.aTokens);
			
			var oFilterBar = new sap.ui.comp.filterbar.FilterBar({
				advancedMode:  true,
				//filterItems: [new sap.ui.comp.filterbar.FilterItem({ name: "s1", control: new sap.m.Input(me.search+"_full")})],
				filterBarExpanded: false,
			    showGoOnFB: !sap.ui.Device.system.phone,				
				filterGroupItems: [me.filter],				
				search: function(search) {
					
					var filters = [];
					$.each(arguments[0].getParameter("selectionSet"),function(key,value){
						if(value.getValue()){
						    var splitTab = value.getId().split("_");
						    if(splitTab.length === 2){
						      filters.push(new Filter(splitTab[0], FilterOperator.Contains, value.getValue()));
						    }else{
							  filters.push(new Filter(value.getId(), FilterOperator.Contains, value.getValue()));
						    }
						}
					});
//					oValueHelpDialog.getTable().bindRows({
//						path:me.binding,
//						filters: filters
//					});
					
					// Desktop에서 필터 적용
					if (oValueHelpDialog.getTable().bindRows) {
						oValueHelpDialog.getTable().bindRows({
							path:me.binding,
							filters: filters
						});
					}
					
					// Moblie 에서 필터 적용
					if (oValueHelpDialog.getTable().bindItems) {
						var oTable = oValueHelpDialog.getTable();					
						oTable.getBinding("items").filter(filters);						
					}					
				}
			});			
					
/*			if (oFilterBar.setBasicSearch) {
				oFilterBar.setBasicSearch(new sap.m.SearchField({
					id:"s1",
					showSearchButton:true, 
					placeholder:"Search",
					search:function(event){
						oValueHelpDialog.getFilterBar().search();
				}}));  
			}*/
			
			oValueHelpDialog.setFilterBar(oFilterBar);
			
			if (this.theTokenInput.$().closest(".sapUiSizeCompact").length > 0) { // check if the Token field runs in Compact mode
				oValueHelpDialog.addStyleClass("sapUiSizeCompact");		
			}
			oValueHelpDialog.open();
			oValueHelpDialog.update();
		}
	});

});