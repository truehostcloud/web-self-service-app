(function(){
    'use strict';

    angular.module('selfService')
        .controller('SharesApplicationCtrl', ['$scope', '$filter', '$mdToast', 'AccountService', 'SharesApplicationService', SharesApplicationCtrl]);

    /**
     * @module SharesApplicationCtrl
     * @description
     * Controls Application for Shares
     */
    function SharesApplicationCtrl($scope, $filter, $mdToast, AccountService, SharesApplicationService) {
        var vm = this;
        vm.form = {
            locale: 'en_GB',
            dateFormat: 'dd MMMM yyyy'
        };
        vm.template = {};
        vm.clientId = null;
        vm.savingsAccounts = [];

        vm.init = init;
        vm.getSharesTemplate = getSharesTemplate;
        vm.clearForm = clearForm;
        vm.submit = submit;
        vm.form = {};

        function clearForm() {
            $scope.shareApplicationForm.$setPristine();
            $scope.shareApplicationForm.$setUntouched();
            vm.form = {};
        }

        function submit() {

        }

    }
})();