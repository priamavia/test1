sap.ui.define([
    "cj/pm0040/controller/BaseController",
    "cj/pm0040/util/ValueHelpHelper",
    "cj/pm0040/util/utils",
    "cj/pm0040/util/moment.min",
    "cj/pm0040/util/fullcalendar.min",
    "cj/pm0040/util/jquery-ui.min",    
    "cj/pm0040/util/jquery.qtip.min",
	"cj/pm0040/model/formatter",    
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "jquery.sap.global"
  ], function (BaseController, ValueHelpHelper, utils, RecordMeasurement, moment, fullCalendar, 
		       jqueryui, qtip, formatter, Filter, FilterOperator, JSONModel, Message, Toast, jQuery ) {
    "use strict";

    return BaseController.extend("cj.pm0040.controller.Main", {
    	formatter: formatter,
    /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     * @public
     */
      onInit : function () {
    	var myDivCalendar = '<div id="calendar"></div>';
        var myhtml = this.getView().byId("cal");
        myhtml.setContent(myDivCalendar);
        
        this.renderingSkip = "";
      },

    /**
    * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
    * (NOT before the first rendering! onInit() is used for that one!).
    */
      onBeforeRendering: function() {
    	  	if(this.renderingSkip == ""){    	  
//				this.i18n = this.getView().getModel("i18n").getResourceBundle();
				
				// Maintenance Plan UI
				var oSwerk;
				var arr_swerk = [];
				var arr_kostl = [];
				var arr_kokrs = [];
				
				//ValueHelper
				var _oPsf_sh;  // Sort field
				
				// Search Equipment
				var oSwerk_tab2;
				
				this.oSwerk = this.getView().byId("swerk");
				
//				utils.makeSerachHelpHeader(this);				
	
				this.getLoginInfo();
				this.set_userData();  //"User Auth"		
				
				var btn1 =  this.getView().byId("btnDelayed");
				btn1.addStyleClass("mySuperRedButton");
				var btn2 =  this.getView().byId("btnCompleted");
				btn2.addStyleClass("mySuperGreenButton");		
				var btn3 =  this.getView().byId("btnScheduled");
				btn3.addStyleClass("mySuperYellowButton");
//			      displayFormat="yyyy/MM"
//				  valueFormat="yyyy.MM.dd"
			}else{
	        	this.onSearch();
				this.renderingSkip = "";
			}		
      },

          /**
           * get User Default Value
           */
		set_userData : function() {
			
		    var oModel = this.getView().getModel("userInfo");
		    var path = "/UserAuthSet";
		    
			var controll = this;

			var mParameters = {
			    urlParameters : {
					"$filter" : "UserName eq '"+ controll.getLoginId() + "'"	
				},
				success : function(oData) {
				   var userDefault = [];
				  
				   for(var i=0; i<oData.results.length; i++){
					  userDefault.push(
						 {
					    	"Auth" : oData.results[i].Auth,
					    	"Value" : oData.results[i].Value,
					    	"Name"  : oData.results[i].Name,
					    	"KeyName" : oData.results[i].KeyName,
					    	"Default" : oData.results[i].Default
						  }
					   );
				   }
				   
				   controll.set_UserInfo(userDefault);
				   debugger;
	         	   this.i18n = this.getView().getModel("i18n").getResourceBundle();				
				   utils.makeSerachHelpHeader(this);
				   
				   controll.set_auth();
				   controll.setInitData(new Date());
				   
				   controll.onSearch();
				   
				    // set default value 
				   controll._set_search_field();  // set Search Help
				   
				}.bind(this),
				error : function(oError) {
					sap.m.MessageBox.show(
							this.i18n.getText("oData_conn_error"),
							sap.m.MessageBox.Icon.ERROR,
							this.i18n.getText("error")
						);
//					jQuery.sap.log.info("Odata Error occured");
//					Toast.show("Error");
				}.bind(this)
			};
			oModel.read(path, mParameters);			
		},		

      /*
       * User Default Setting
       */
      set_auth : function(){
        this.arr_swerk  = this.get_Auth("SWERK");
        this.arr_kostl  = this.get_Auth("KOSTL");
        this.arr_kokrs  = this.get_Auth("KOKRS");
		this.locDate    = this.get_Auth("LOCDAT")[0].Value;
		this.locTime    = this.get_Auth("LOCTIM")[0].Value;
		this.dateFormat = this.get_Auth("DATFORMAT")[0].Value;
		this.sep        = this.get_Auth("SEP")[0].Value;        
      },

      /*
       * Plan Date Default Setting
       */
      setInitData : function(vDate){
        this.getView().byId("period").setDateValue( vDate );
  		this.oSwerk = this.getView().byId("swerk");
  		
  		var default_swerk;				
  		if(!this.oSwerk.getSelectedItem()){
  			
  			for(var j=0; j<this.arr_swerk.length; j++){
  				var template = new sap.ui.core.Item();
  			    template.setKey(this.arr_swerk[j].Value);
  		        template.setText(this.arr_swerk[j].KeyName);
  	            this.oSwerk.addItem(template);
  	            
  	            if(this.arr_swerk[j].Default === "X"){
  	            	default_swerk = j;
  	            }
  			}

  			this.oSwerk.setSelectedKey(this.arr_swerk[default_swerk].Value); //Default Value Setting
  		
  		}else{
  			this.oSwerk.setSelectedKey(this.oSwerk.getSelectedItem().getProperty("key"));
  		}			
      },   
		
      /*
       * Search by search Button
       */

      onBtnSearch: function(){
			var result = utils.checkMandatory(this, "mainpage");
			
			if(result){
		          this.onSearch();
		          $('#calendar').fullCalendar('gotoDate', this.getView().byId("period").getDateValue());
		    }else{
				sap.m.MessageBox.show(
					this.i18n.getText("check_mandatory"),
					sap.m.MessageBox.Icon.ERROR,
				    this.i18n.getText("error")
				);
			}    	  
      },

      onSearch : function(){
        var oModel = this.getView().getModel();
        var controll = this;

        var s_swerk;        // swerk
        var s_year = [];    // Year
        var s_month = [];   // Month
        var s_ingrp = [];   // P/G
        var s_arbpl = [];   // Work Center
        var s_mityp = [];   // Plan Category
        var s_psort = [];   // Sort Field
		var s_assign = [];	// assign
		var s_notass = [];  // not assign		

        var s_filter = [];

        /*
         * Key
         */
        var lange = this.getLanguage();
        // Maint. Plant
        s_swerk = this.oSwerk.getSelectedKey();
        //임시 Test*************************************************
//        if (window.location.hostname == "localhost") {
//          var s_swerk = "3011";
//        }
        //******************************************************

        /*
         * filter
         */
        // Plan Date
        var period = this.getView().byId("period").getDateValue();
        var sYear = period.getFullYear();
        var sMonth = period.getMonth() + 1;  // as month starts from 0

          if(sYear){
          s_year.push(sYear);

            if(s_year){
              s_filter.push(utils.set_filter(s_year, "Zyear"));
            }
        }

        if(sMonth){
          s_month.push(sMonth);

            if(s_month){
              s_filter.push(utils.set_filter(s_month, "Zmonth"));
            }
        }
		
        // P/G
        var ingrp = this.getView().byId("ingrp").getSelectedKey();
        if(ingrp){
          s_ingrp.push(ingrp);

            if(s_ingrp){
              s_filter.push(utils.set_filter(s_ingrp, "Ingrp"));
            }
        }

        // Work Center
        var arbpl = this.getView().byId("arbpl").getSelectedKey();
        if(arbpl){
          s_arbpl.push(arbpl);

            if(s_arbpl){
              s_filter.push(utils.set_filter(s_arbpl, "Arbpl"));
            }
        }

        // Plan Category
        var mityp = this.getView().byId("mityp").getSelectedKey();
        if(mityp){
          s_mityp.push(mityp);

            if(s_mityp){
              s_filter.push(utils.set_filter(s_mityp, "Mityp"));
            }
        }

//        // Sort Field
//          var oPsort = this.getView().byId("psort").getTokens();
//          for(var j=0; j<oPsort.length; j++){
//            s_psort.push(oPsort[j].getProperty("key"));
//          }
		
		var psort = this.getView().byId("psort").getSelectedKey();
		if(psort){
			s_psort.push(psort);
			
	    	if(s_ingrp){
	    		s_filter.push(utils.set_filter(s_psort, "Psort"));
		    }		
		}
        
		s_assign.push("X");	
  		s_filter.push(utils.set_filter(s_assign, "Assign"));
	
		s_notass.push("X");
   		s_filter.push(utils.set_filter(s_notass, "Nassign"));
    	
        var filterStr;
        for(var i=0; i<s_filter.length; i++){

          if(i === 0){
            filterStr = s_filter[i];
          }else{
            filterStr = filterStr + " and " + s_filter[i];
          }
        }

        var path = "/InputSet(Spras='"+lange+"',Swerk='"+s_swerk+"')";

        var mParameters = {
          urlParameters : {
            "$expand" : "ResultList",
            "$filter" : filterStr
          },
          success : function(oData) {

             this.setCalendar(oData);

          }.bind(this),
          error : function(oError) {
             sap.m.MessageBox.show(
	             controll.i18n.getText("oData_conn_error"),
	             sap.m.MessageBox.Icon.ERROR,
	             controll.i18n.getText("error")
             );           
          }.bind(this)
        };

           oModel.read(path, mParameters);
      },
      
      setCalendar : function(oData){
        var controll = this;
        var toDay    = this.i18n.getText("lblToday");
        var Scheduled= this.i18n.getText("lblScheduled");
        var Completed= this.i18n.getText("lblCompleted");
        var Delayed  = this.i18n.getText("lblDelayed");
        var eventData = [];
        // Odata to JSON Array
        if(oData!=undefined){
          $('#calendar').fullCalendar('removeEvents');

          oData.ResultList.results.forEach(function(item) {
        	  
        	  var iconTitle;
        	  if(item.MpColor == "green"){
        		  iconTitle = '■' + item.Invnr;  
        	  }else{
        		  iconTitle = item.Invnr;
        	  }
        	  
        	  //iconTitle =  new sap.ui.core.Icon( {  src : item.MpIcon, color : item.MpColor, } )
              
              eventData.push({
                  title:           iconTitle, //item.Invnr,
                  start:           item.Nplda,
                  enddt:           item.Nplda,
                  desc:            item.Wptxt,
                  order:           item.Aufnr,
                  mityp:           item.Mityp,
                  swerk:           item.Swerk,
                  mpoint:          item.MpColor,
                  allDay:          true,
                  backgroundColor: item.Color,      // '#ffffff'
                  borderColor:     item.Color,      // '#000000'
                  textColor:       item.TxtColor
                          });
        		  
          });

          $('#calendar').fullCalendar('addEventSource', eventData );
        }

        $(document).ready(function() {
        	
          $('#calendar').fullCalendar({
              aspectRatio: 2,
              customButtons: {
                  CustomButtonPrev: {
                      text: '<',
                      click: function() {
                        $('#calendar').fullCalendar('prev');
                        var moment = $('#calendar').fullCalendar('getDate');

                        controll.setInitData(moment._d);
                        controll.onBtnSearch();
                      }
                  },
                  CustomButtonNext: {
                      text: '>',
                      click: function() {
                        $('#calendar').fullCalendar('next');
                        var moment = $('#calendar').fullCalendar('getDate');

                        controll.setInitData(moment._d);
                        controll.onBtnSearch();
                      }
                  },
                  CustomButtonToday: {
                      text: toDay,
                      click: function() {
                        var preMoment = $('#calendar').fullCalendar('getDate');

                        var calYear  = preMoment._d.getFullYear();
                        var calMonth = preMoment._d.getMonth() + 1;
                        var calPeriod = calYear + "" + calMonth;

                        var curYear    = new Date().getFullYear();
                        var curMonth   = new Date().getMonth() + 1;
                        var curPeriod = curYear + "" + curMonth;

                          if(calPeriod != curPeriod){
                          $('#calendar').fullCalendar('today');
                          var moment = $('#calendar').fullCalendar('getDate');
                            controll.setInitData(moment._d);
                            controll.onBtnSearch();
                          }
                      }
                  },
                  CbtnScheduled: {
                      text: Scheduled
                  },
                  CbtnCompleted: {
                      text: Completed
                  },
                  CbtnDelayed: {
                      text: Delayed
                  }                  
              },
              header: {
                  left: 'CustomButtonPrev, CustomButtonNext, title ',
                  center: '',
                  right: 'CustomButtonToday'  // today
              },

            defaultDate: this.locDate,
            buttonIcons: false, // show the prev/next text
            navLinks: false, // can click day/week names to navigate views
            businessHours: true, // display business hours
            selectable: true,
            selectHelper: true,
            eventLimit: true, // allow "more" link when too many events
            defaultView: "month",
            editable: false,

            events: eventData,
            eventClick: function(event) {
                controll.onCalendarSelect(event.order, event.mityp, event.swerk, event.mpoint);
              return false;
            },                       
              eventRender: function(event, element) {
                  element.qtip({
                    style: {
                    classes: 'tipstyle'
                  },
                  content: event.description
                  });
              },
            loading: function(bool) {
              $('#loading').toggle(bool);
            }
          });

        });   	        
      },

      /*
       * PM Possible Entry Odata Set
       */
		_set_search_field : function() {
			var v_swerk = this.oSwerk.getSelectedKey();
	
			this.oPlg = this.getView().byId("ingrp");			// Planning Group
			if(this.oPlg){
				utils.set_search_field(v_swerk, this.oPlg, "plg", "C", "", "");
			}				
	
			this.oWoc = this.getView().byId("arbpl");			// Work Center
			if(this.oWoc){
				utils.set_search_field(v_swerk, this.oWoc, "woc", "C", "", "");
			}				
	
			this.oMpc = this.getView().byId("mityp");			// Maintenance Paln Category
			if(this.oMpc){
				utils.set_search_field(v_swerk, this.oMpc, "mpc", "C", "", "");
			}				
	
			
			this.oPsf = this.getView().byId("psort");			// PM Sort Field
			if(this.oPsf){
				utils.set_search_field(v_swerk, this.oPsf, "psf", "C", "", "");
			}		
			
			//this.psort = this.getView().byId("psort");
			
		},
	      
      /**
      * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
      * This hook is the same one that SAPUI5 controls get after being rendered.
      */
//        onAfterRendering: function() {

//      },

      /**
      * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
      */
//        onExit: function() {
//        }
      
        onValueHelpRequest : function(oEvent){
			var strArr = oEvent.oSource.sId.split("--");
			var cnt = strArr.length - 1;
			var sIdstr = strArr[cnt];
					
			var s_swerk = this.oSwerk.getSelectedKey();
			
			if(sIdstr === "equnr"){
            	this.getOwnerComponent().openSearchEqui_Dialog(this, "MultiToggle", s_swerk);
			}else if(sIdstr === "tplnr"){
				this.getOwnerComponent().openFuncLocation_Dialog(this, "MultiToggle", s_swerk);
			}else{
				utils.openValueHelp(sIdstr);
			}				
			
		},			
		  

      /****************************************************************
       *  Event Handler
       ****************************************************************/
      /*
       * ComboBox select
       */
      onSwerkSelect : function(oEvent) {
		this.oPlg.setSelectedKey("");
		this.oWoc.setSelectedKey("");
		this.oMpc.setSelectedKey("");
		this.oPsf.setSelectedKey("");
//		this.oPsf.removeAllTokens();	// psort
		
		this.oPlg.removeAllItems();	// Maint. W/C 
		this.oWoc.removeAllItems();		    // Enployee ID
		this.oMpc.removeAllItems();
		this.oPsf.removeAllItems();		
    	  
    	this._set_search_field();
      },      
      
      onPrev : function(oEvent){
        $('#calendar').fullCalendar('prev');

        var view = $('#calendar').fullCalendar('getView');
        alert("The view's title is " + view.title);
      },
      
      onNext : function(oEvent){
        $('#calendar').fullCalendar('next');

        var view = $('#calendar').fullCalendar('getView');
        alert("The view's title is " + view.title);

      },
      
      onToday : function(oEvent){
        $('#calendar').fullCalendar('today');

        var view = $('#calendar').fullCalendar('getView');
        alert("The view's title is " + view.title);

      },

	/*
	 * MultiInput 의 Key 값을 수기로  입력 시 Token을 생성 한다. 
	 */
	 onChange : function(oEvent){
		var strArr = oEvent.oSource.sId.split("--");
		var cnt = strArr.length - 1;
		var sIdstr = strArr[cnt];
		
		if(sIdstr === "psort"){
			utils.set_token(this.oPsf, oEvent);
		}
	 },
	      
      handlePeriodChange: function (oEvent) {
        var oText = this.byId("period");
        var oDP = oEvent.oSource;
        var sValue = oEvent.getParameter("value");
        var bValid = oEvent.getParameter("valid");
        this._iEvent++;

          // oText.setText("Change - Event " + this._iEvent + ": DatePicker " + oDP.getId() + ":" + sValue);
        if (bValid) {
          oDP.setValueState(sap.ui.core.ValueState.None);
//          if(this.getView().byId("period").getDateValue() != null){
//            $('#calendar').fullCalendar( 'gotoDate', this.getView().byId("period").getDateValue( ));
//          }
        } else {
          oDP.setValueState(sap.ui.core.ValueState.Error);
        }
      },

      onCalendarSelect : function(vOrder, vMityp, vSwerk, vColor) {
    	  var controll = this;

        if(vOrder){
	      	if(vColor == "green"){
	      		
	          var order = this.i18n.getText("lblOrder");
	          var point = this.i18n.getText("lblMeasurePoint");
	      		
	      	  sap.m.MessageBox.confirm(this.i18n.getText("selectionMessage"), 
						{   icon: sap.m.MessageBox.Icon.INFORMATION,
							title: this.i18n.getText("select"),
							actions: [order, point, this.i18n.getText("close")],
			            onClose : function(oAction){
						   	if(oAction == order){
								// Step 1: Get Service for app to app navigation
								var navigationService = sap.ushell.Container.getService('CrossApplicationNavigation');
								// Step 2: Navigate using your semantic object
				
								var hash = navigationService.hrefForExternal({
									  target: {semanticObject : 'ZPM_SO_0110', action: 'display'},
									  params: {param_mode: 'U',
										  	   param_swerk : vSwerk,
										       param_order : vOrder,
										       param_qmnum : "",
										       param_woc   : ""}
									});
				
								var url = window.location.href.split('#')[0] + hash;
								sap.m.URLHelper.redirect(url, true);	
	                  
							}else if(oAction == point){
					              //this._getDialog_measureMemt(vOrder, vMityp).open();   //AUFNR : Order
					          	controll.getOwnerComponent().openRecordMeasure_Dialog(controll, vOrder, vMityp, vSwerk); 
					          	controll.renderingSkip = "X";        								
							}else{
								// close
							}
						 },
			             styleClass: "",
			             initialFocus: sap.m.MessageBox.Action.OK,
			             textDirection : sap.ui.core.TextDirection.Inherit }
				);   
	      	  
	//              //this._getDialog_measureMemt(vOrder, vMityp).open();   //AUFNR : Order
	//          	controll.getOwnerComponent().openRecordMeasure_Dialog(controll, vOrder, vMityp, vSwerk); 
	//          	this.renderingSkip = "X";        		
	      	}else{
				// Step 1: Get Service for app to app navigation
				var navigationService = sap.ushell.Container.getService('CrossApplicationNavigation');
				// Step 2: Navigate using your semantic object

				var hash = navigationService.hrefForExternal({
					  target: {semanticObject : 'ZPM_SO_0110', action: 'display'},
					  params: {param_mode: 'U',
						  	   param_swerk : vSwerk,
						       param_order : vOrder,
						       param_qmnum : "",
						       param_woc   : ""}
					});

				var url = window.location.href.split('#')[0] + hash;
				sap.m.URLHelper.redirect(url, true);	
	      		
	//				  sap.m.MessageBox.show(
	//					      this.i18n.getText("noMeasuringPointMessage"),
	//					      sap.m.MessageBox.Icon.INFORMATION,
	//					      this.i18n.getText("info")
	//					  );	        		
	      	}
      }else{
        sap.m.MessageBox.show(
            this.i18n.getText("err_selectionOrder"),
            sap.m.MessageBox.Icon.INFORMATION,
            this.i18n.getText("info")
        );
      }    	  

 	  
    	  
    	  

      },

		open_wkresult: function(sObj){
			var controll = this;
			
			if(sObj){
				if((sObj.Stat == "I0002"  || sObj.Stat == "I0009" ) && sObj.Zid != ""){  // System status : REL, User Status : ORS3 // && sObj.Ustat == "E0003" && sObj.Zid != ""
					Message.confirm(this.i18n.getText("confirmWorkResult"), 
							{//title: "", 
				             onClose : function(oAction){
									   	if(oAction=="OK"){
									   		controll.getOwnerComponent().openWorkResult_Dialog(controll, 'R', sObj);  //1)
										}else{
											return false;
										}
									   },
				             styleClass: "",
				             initialFocus: sap.m.MessageBox.Action.OK,
				             textDirection : sap.ui.core.TextDirection.Inherit }
						);
				}else if( sObj.Stat == "I0010" && sObj.Zid != ""){
					debugger;
					Message.confirm(this.i18n.getText("selectWorkResult"), 
							{//title: "", 
							icon: sap.m.MessageBox.Icon.INFORMATION,
							title: this.i18n.getText("selection_title"),
						
							actions: [this.i18n.getText("resultDisplay"), this.i18n.getText("resultEntry")],
				             onClose : function(oAction){
									   	if(oAction == controll.i18n.getText("resultDisplay")){
									   		controll.getOwnerComponent().openWorkResult_Dialog(controll, 'D', sObj);  //1)
										}else{
											controll.getOwnerComponent().openWorkResult_Dialog(controll, 'R', sObj);  //1)
										}
									   },
				             styleClass: "",
				             initialFocus: sap.m.MessageBox.Action.OK,
				             textDirection : sap.ui.core.TextDirection.Inherit }
						);		
					
					
				}else if(sObj.Stat == "I0045" || sObj.Stat == "I0046"){  
			   		controll.getOwnerComponent().openWorkResult_Dialog(controll, 'D', sObj);  //1)
				}else{
					sap.m.MessageBox.show(
							  this.i18n.getText("isnotworkresult"),
						      sap.m.MessageBox.Icon.WARNING,
						      this.i18n.getText("warning")
							);						
				}
			}
			
		},					
					
  /****************************************************************
   *  RecordMeasurement_pop Event
   ****************************************************************/
//      onCloseMeasureDialog : function(oEvent){
//        var chkVal = sap.ui.getCore().byId("chkall");  // Checkbox 선택 값 지우기
//        chkVal.setSelected(false);
//
//        this._oDialog_measureMemt.close();
//      },
//
//      onConfirmMeasureDialog : function(oEvent){
//        this._measureMemt_Dialog_handler.dataUpdateProcess("T");
//      },
//
//      onCancelMeasureDialog : function(oEvent){
//        this._measureMemt_Dialog_handler.dataUpdateProcess("C");
//      },
//
//      onSaveMeasureDialog : function(oEvent){
//        this._measureMemt_Dialog_handler.dataUpdateProcess("S");
//      },


//      onSelectApply : function(oEvent){
//        if(oEvent.getParameters().selected){
//          var oTable =  sap.ui.getCore().byId("table_rm");
//
//          for(var i=0;i < oTable.getModel().getData().ResultList.results.length; i++){
//            if (oTable.getModel().getData().ResultList.results[i].Mdocmx == true){
//              oTable.getModel().getData().ResultList.results[i].Ernam = oTable.getModel().getData().Ernam;
//              oTable.getModel().getData().ResultList.results[i].Idate = oTable.getModel().getData().Idate;
//              oTable.getModel().getData().ResultList.results[i].Itime = oTable.getModel().getData().Itime;
//            }
//          }
//
//           var oODataJSONModel =  new sap.ui.model.json.JSONModel();
//           oODataJSONModel.setData(oTable.getModel().oData);
//
//           oTable.setModel(oODataJSONModel);
//           //oTable.bindRows("/ResultList/results");
//        }
//      },

		
  /****************************************************************
   *  Local function
   ****************************************************************/
      /*
       * call popup fragment
       */
      _getDialog_measureMemt : function (sAufnr,sMityp) {
        if (!this._oDialog_measureMemt) {

                this._oDialog_measureMemt = sap.ui.xmlfragment("cj.pm0040.view.RecordMeasurement_pop", this);
                this._measureMemt_Dialog_handler = new RecordMeasurement(this._oDialog_measureMemt, this);

                this.getView().addDependent(this._oDialog_measureMemt);

             }

            if(sAufnr!=undefined){
          this._measureMemt_Dialog_handler.dataSelectProcess(sAufnr, sMityp);
            }
                return this._oDialog_measureMemt;
        },


      formatDate : function(oDate) {
          var formatDate = new Date(oDate);
          var date = formatDate.getDate();
          var month = formatDate.getMonth() + 1;  // as month starts from 0
          var year   = formatDate.getFullYear();
          var ouput = year + "-" + month + "-" +date;

          return  output;
      }


    });
  }
);