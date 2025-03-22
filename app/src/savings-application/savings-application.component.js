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

        init();

        function init() {
            AccountService.getClientId().then(function (clientId) {
                vm.clientId = clientId;
                getSavingsTemplate(clientId, null);
            });
        }

        function getSavingsTemplate(clientId, productId) {
            SavingsApplicationService.template().get({
                clientId: clientId,
                productId: productId
            }).$promise.then(function(template) {
                if (!productId) {
                    vm.template = template;
                } else {
                    vm.form = Object.assign({}, vm.form, {
                        productId: template.savingsProductId,
                        nominalAnnualInterest: template.nominalAnnualInterestRate,
                        interestCompoundingPeriodType: template.interestCompoundingPeriodType.id,
                        interestPostingPeriodType: template.interestPostingPeriodType.id,
                        interestCalculationType: template.interestCalculationType.id,
                        interestCalculationDaysInYearType: template.interestCalculationDaysInYearType.id,
                        submittedOnDate: $filter('date')(new Date(), 'dd MMMM yyyy')
                    });
                    
                    vm.template.interestCompoundingPeriodTypeOptions = template.interestCompoundingPeriodTypeOptions;
                    vm.template.interestPostingPeriodTypeOptions = template.interestPostingPeriodTypeOptions;
                    vm.template.interestCalculationTypeOptions = template.interestCalculationTypeOptions;
                    vm.template.interestCalculationDaysInYearTypeOptions = template.interestCalculationDaysInYearTypeOptions;
                    vm.template.currency = template.currency;
                }
            });
        }

        function clearForm() {
            $scope.savingsApplicationForm.$setPristine();
            $scope.savingsApplicationForm.$setUntouched();
            vm.template = {};
            vm.form = {
                locale: 'en_GB',
                dateFormat: 'dd MMMM yyyy'
            };
            init();
        }

        function submit() {
            var savingsTemp = {
                clientId: vm.clientId,
                productId: vm.form.productId,
                nominalAnnualInterestRate: vm.form.nominalAnnualInterest,
                interestCompoundingPeriodType: vm.form.interestCompoundingPeriodType,
                interestPostingPeriodType: vm.form.interestPostingPeriodType,
                interestCalculationType: vm.form.interestCalculationType,
                interestCalculationDaysInYearType: vm.form.interestCalculationDaysInYearType,
                submittedOnDate: vm.form.submittedOnDate
            };
            var data = Object.assign({}, savingsTemp, {
                locale: vm.form.locale,
                dateFormat: vm.form.dateFormat
            });
            SavingsApplicationService.submitApplication().submit(data).$promise.then(function() {
                clearForm();
                $mdToast.show(
                    $mdToast.simple()
                        .content("Savings Account Application Submitted Successfully")
                        .hideDelay(2000)
                        .position('top right')
                );
            }, function(){
                $mdToast.show(
                    $mdToast.simple()
                        .content("Error Creating Savings Account Application")
                        .hideDelay(2000)
                        .position('top right')
                );
            });
        }
    }
})();
