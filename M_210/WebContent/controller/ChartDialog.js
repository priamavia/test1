sap.ui.define([
	"sap/ui/base/Object"
], function (Object) {
	"use strict";

	return Object.extend("cj.pm_m210.controller.ChartDialog", {

		// Popup Create 
		_getDialog : function (oView) {
			// create dialog lazily
			if (!this._oDialog) {
				// create dialog via fragment factory
				this._oDialog = sap.ui.xmlfragment("cj.pm_m210.view.ChartDialog", this);
				// connect dialog to view (models, lifecycle)
				oView.addDependent(this._oDialog);
				// detach the dialog from the view's lifecycle
				oView.attachBeforeExit(function () {
					oView.removeDependent(this._oDialog);
				}.bind(this));
			}
			return this._oDialog;
		},

		destroy: function () {
			if (this._oDialog) {
				this._oDialog.destroy();
			}
		},

		open : function (oView) {
			
			// Text model assign
			this.i18n = oView.getModel("i18n").getResourceBundle();
			
			// Popup Create
			var chart = this._getDialog(oView) ;
	 
		 	// List에서 선택한 Line read
			var oModel = oView.getModel("ChartList");
			var oTableData = oModel.getData();
			
			if(oTableData.NP_SELECT_LIST.results.length < 1 ){
				 sap.m.MessageBox.show(
						 this.i18n.getText("chart_err_msg02"),
						 sap.m.MessageBox.Icon.ERROR,
						 this.i18n.getText("error")  
				 );
			}
		 
	      
			// Table에 출력된 데이터에서 선택한 라인과 같은 Measuring point에 해돵되는 데이터만 Select
			// Graph에 필요한 date, min, max, target, value값만 선택한다.
			var oSel_data = [];
			
			for(var i=0;  i< oTableData.NP_SELECT_LIST.results.length;  i++ ){
				var chart_data = {};
				chart_data.Idate = oTableData.NP_SELECT_LIST.results[i].CDatum;
				chart_data.Mrmin = oTableData.NP_SELECT_LIST.results[i].CMrmin;
				chart_data.Mrmax = oTableData.NP_SELECT_LIST.results[i].CMrmax;
				chart_data.Desir = oTableData.NP_SELECT_LIST.results[i].CDesir;
				chart_data.Recdv = oTableData.NP_SELECT_LIST.results[i].CRecdv;
				oSel_data.push(chart_data);
			}
			
			var date   = this.i18n.getText("lblDate");
			var min    = this.i18n.getText("lblMin");
			var max    = this.i18n.getText("lblMax");
			var target = this.i18n.getText("lblTarget");
			var recdv  = this.i18n.getText("lblRecdv");
			
		   //set graph
			// 1.Get the id of the VizFrame		 
			var oVizFrame = sap.ui.getCore().byId("idcolumn");
			// Popup에 chart를 출력하므로 여러번 Chart를 조회 할때 이전 데이터 Remove
			oVizFrame.destroyFeeds();
			var oVizModel = new sap.ui.model.json.JSONModel();
			oVizModel.setData(oSel_data);
		   
			// Graphe의 X(Dimension), Y(Measures)지정 
			var oDataset = new sap.viz.ui5.data.FlattenedDataset({
				dimensions : [{ 
	                name: date, 
	                value: "{Idate}" 
	            }], 
	            measures : [{ 
	                name: min, 
	                value: '{Mrmin}' 
	            }, { 
	                name: max, 
	                value: '{Mrmax}' 
	            }, { 
	                name: target, 
	                value: '{Desir}' 
	            },
	            { 
	                name: recdv, 
	                value: '{Recdv}' 
	            }], 

			data : {
			path : "/"
			}
			});
			oVizFrame.setDataset(oDataset);
			oVizFrame.setModel(oVizModel);
			oVizFrame.setVizType('line');  //Chart type
				
            //Chart title 지정 
			var l_title = this.i18n.getText("chart_title") 
				+  " : " + oTableData.NP_SELECT_LIST.results[0].Psort ;
			// Set Viz properties  
			oVizFrame.setVizProperties({
			plotArea: {
			//colorPalette : d3.scale.category20().range()
				colorPalette: ['#d1d6e0', '#61a656','#848f94' , '#FF0000']  // Chart Line color
			},
		    title: {
		        visible: true,
		        text: l_title
		    }
		
			});

			//Category, Value생성 
		 	var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
				'uid': "valueAxis",
				'type': "Measure",
				'values': [min, max, target, recdv] 
				}),
				feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
				'uid': "categoryAxis",
				'type': "Dimension",
				'values':   [date]
				})
 		
			oVizFrame.addFeed(feedValueAxis);
			oVizFrame.addFeed(feedCategoryAxis);
			
			chart.open();
		},

		onCloseDialog : function () {
			this._getDialog().close();
		}
	});

});