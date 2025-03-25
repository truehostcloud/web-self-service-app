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
        vm.loadSavingsAccounts = loadSavingsAccounts;

        init();

        function init() {
            AccountService.getClientId().then(function (clientId) {
                vm.clientId = clientId;
                getSharesTemplate(clientId, null);
                loadSavingsAccounts(clientId);
            });
        }

        function loadSavingsAccounts(clientId) {
            AccountService.getAllAccounts(clientId).get().$promise.then(function(accounts) {
                
                vm.savingsAccounts = accounts.savingsAccounts || [];
            }, function(error) {
                
                $mdToast.show(
                    $mdToast.simple()
                        .textContent("Error loading savings accounts")
                        .hideDelay(2000)
                        .position('top right')
                        .toastClass('md-error')
                );
            });
        }

        function getSharesTemplate(clientId, productId) {
            var existingProductOptions = vm.template.productOptions;
            
            
            SharesApplicationService.template().get({
                clientId: clientId,
                productId: productId
            }).$promise.then(function(template) {
                
                if (!productId) {
                    vm.template = template;
                } else {
                    vm.form = Object.assign({}, vm.form, {
                        productId: template.productId || productId,
                        requestedShares: null,
                        savingsAccountId: null,
                        submittedDate: $filter('date')(new Date(), 'dd MMMM yyyy'),
                        applicationDate: new Date()
                    });
                    
                    vm.template = Object.assign({}, vm.template, {
                        currency: template.currency,
                        savingsAccountOptions: template.savingsAccountOptions,
                        minimumShares: template.minimumShares,
                        nominalPrice: template.unitPrice,
                        productOptions: existingProductOptions
                    });
                }
                
                
            }, function(error) {
                
                $mdToast.show(
                    $mdToast.simple()
                        .textContent("Error loading share products")
                        .hideDelay(2000)
                        .position('top right')
                        .toastClass('md-error')
                );
            });
        }

        function clearForm() {
            $scope.shareApplicationForm.$setPristine();
            $scope.shareApplicationForm.$setUntouched();
            vm.template = {};
            vm.form = {
                locale: 'en_GB',
                dateFormat: 'dd MMMM yyyy'
            };
            init();
        }

        function submit() {
            var sharesTemp = {
                clientId: vm.clientId,
                productId: vm.form.productId,
                requestedShares: vm.form.requestedShares,
                savingsAccountId: vm.form.savingsAccountId,
                submittedDate: vm.form.submittedDate,
                applicationDate: $filter('date')(vm.form.applicationDate, 'dd MMMM yyyy')
            };
            
            var data = Object.assign({}, sharesTemp, {
                locale: vm.form.locale,
                dateFormat: vm.form.dateFormat
            });

            SharesApplicationService.submitApplication().submit(data).$promise.then(function() {
                clearForm();
                $mdToast.show(
                    $mdToast.simple()
                        .textContent("Shares Account Application Submitted Successfully")
                        .hideDelay(2000)
                        .position('top right')
                        .toastClass('md-success')
                );
            }, function(){
                $mdToast.show(
                    $mdToast.simple()
                        .textContent("Error Creating Shares Account Application")
                        .hideDelay(2000)
                        .position('top right')
                        .toastClass('md-error')
                );
            });
        }
    }
})();
