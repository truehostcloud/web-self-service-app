(function(){
    'use strict';

    angular.module('selfService')
        .controller('SavingsApplicationCtrl', ['$scope', '$filter', '$mdToast', 'AccountService', 'SavingsApplicationService', SavingsApplicationCtrl]);

    /**
     * @module SavingsApplicationCtrl
     * @description
     * Controls Application for Savings
     */
    function SavingsApplicationCtrl($scope, $filter, $mdToast, AccountService, SavingsApplicationService) {
        var vm = this;
        vm.form = {
            locale: 'en_GB',
            dateFormat: 'dd MMMM yyyy'
        };
        vm.template = {};
        vm.clientId = null;

        vm.init = init;
        vm.getSavingsTemplate = getSavingsTemplate;
        vm.clearForm = clearForm;
        vm.submit = submit;
        vm.form = {};

        function clearForm() {
            $scope.savingsApplicationForm.$setPristine();
            $scope.savingsApplicationForm.$setUntouched();
            vm.form = {};
        }

        function submit() {

        }
    }
})();