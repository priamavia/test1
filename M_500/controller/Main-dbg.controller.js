sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("zcoui0001.controller.Main", {
            onInit: function () {

            },

            getRouter: function() {
                return this.getOwnerComponent().getRouter();
            },

            onNavToChartContainer: function() {
                this.getRouter().navTo("Chart");
            }            
        });
    });
