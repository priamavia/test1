var language;
var txtlang;
var loginId;
var userData = [];
var uiCtrlAuth = [];

sap.ui.define([
		"sap/ui/core/mvc/Controller"
	], function (Controller) {
		"use strict";

		return Controller.extend("cj.pm0110.controller.BaseController", {
			/**
			 * Convenience method for accessing the router.
			 * @public
			 * @returns {sap.ui.core.routing.Router} the router for this component
			 */
			getRouter : function () {
				return sap.ui.core.UIComponent.getRouterFor(this);
			},

			/**
			 * Convenience method for getting the view model by name.
			 * @public
			 * @param {string} [sName] the model name
			 * @returns {sap.ui.model.Model} the model instance
			 */
			getModel : function (sName) {
				return this.getView().getModel(sName);
			},

			/**
			 * Convenience method for setting the view model.
			 * @public
			 * @param {sap.ui.model.Model} oModel the model instance
			 * @param {string} sName the model name
			 * @returns {sap.ui.mvc.View} the view instance
			 */
			setModel : function (oModel, sName) {
				return this.getView().setModel(oModel, sName);
			},

			/**
			 * Getter for the resource bundle.
			 * @public
			 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
			 */
			getResourceBundle : function () {
				return this.getOwnerComponent().getModel("i18n").getResourceBundle();
			},
			
			
			/**
			 *@public  
			 *@return {sap.ushell.User} login User Info
			 */
			getLoginInfo : function (){
				
			    if (window.location.hostname == "localhost") {
			    	language = "E";
			    	loginId = "HUSEL";  //"HUSEL";
		         	return "";
		         
			    } else {
			    	if(sap.ushell == undefined){
				    	language = sap.ui.getCore().getConfiguration().getLanguage();
				    	loginId = "HUSEL";
			         	return "";			    		
			    	}else{
	     	        	language = sap.ushell.Container.getUser().getLanguage();
			        	loginId = sap.ushell.Container.getUser().getId();
			        	
			        	return sap.ushell.Container.getUser();
			    	}		        	
		         }
				
			},

			/**
			 * @public
			 */
			getLanguage : function() {
                return language;
			},
			/**
			 * @public
			 */
			getLoginId : function() {
				return loginId;
			},
			/**
			 * @public
			 */
			set_UserInfo : function(userinfo) {
				userData = userinfo;
				
			       for(var i=0; i<userData.length; i++){
			    	   if(userData[i].Auth === 'LANGU'){
			    		   txtlang = userData[i].Value;
			    		   break;
			    	   }
			       }
			       
			       if(txtlang === '1'){
			    	   sap.ui.getCore().getConfiguration().setLanguage("zh");	
			       }					
			},
			/**
			 * @public
			 */
			get_UserInfo : function() {
				return userData;
			},
			/**
			 * @public
			 */
		    get_Auth : function(auth) {
		    	
		       var auth_arr = [];
		       
		       for(var i=0; i<userData.length; i++){
		    	   if(userData[i].Auth === auth){
		    		   auth_arr.push(
		    		    {
		    		    	"Auth" : userData[i].Auth,
					    	"Value" : userData[i].Value,
					    	"Name" : userData[i].Name,
					    	"KeyName" : userData[i].KeyName,
					    	"Default" : userData[i].Default,
					    	"Add1" : userData[i].Add1,
					    	"Add2" : userData[i].Add2,
					    	"Add3" : userData[i].Add3,
					    	"Add4" : userData[i].Add4,
					    	"Add9" : userData[i].Add9
		    		    }
		    		   );
		    	   }
		       }
		       
		       return auth_arr;
		    },
			/**
			 * @public
			 */
			set_uiCtrlAuth : function(uiauth){
				uiCtrlAuth = uiauth;
			},
			/**
			 * @public
			 */
			get_uiCtrlAuth : function(){
				return uiCtrlAuth;
			}
		   
			/**
			 * Event handler when the share by E-Mail button has been clicked
			 * @public
			 */
/*			onShareEmailPress : function () {
				var oViewModel = (this.getModel("objectView") || this.getModel("worklistView"));
				sap.m.URLHelper.triggerEmail(
					null,
					oViewModel.getProperty("/shareSendEmailSubject"),
					oViewModel.getProperty("/shareSendEmailMessage")
				);
			}*/

		});

	}
);