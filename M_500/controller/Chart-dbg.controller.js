sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("zcoui0001.controller.Chart", {
            onInit: function () {

            },

            onNavButtonPressed: function() {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("");
            }
        });
    });
