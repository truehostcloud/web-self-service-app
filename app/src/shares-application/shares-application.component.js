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
                console.log('Savings accounts:', accounts);
                vm.savingsAccounts = accounts.savingsAccounts || [];
            }, function(error) {
                console.error('Error fetching savings accounts:', error);
                $mdToast.show(
                    $mdToast.simple()
                        .content("Error loading savings accounts")
                        .hideDelay(2000)
                        .position('top right')
                );
            });
        }

        function getSharesTemplate(clientId, productId) {
            var existingProductOptions = vm.template.productOptions;
            console.log('Fetching shares template with:', { clientId: clientId, productId: productId });
            
            SharesApplicationService.template().get({
                clientId: clientId,
                productId: productId
            }).$promise.then(function(template) {
                console.log('Shares template response:', template);
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
                console.log('Updated template:', vm.template);
                console.log('Updated form:', vm.form);
            }, function(error) {
                console.error('Error fetching shares template:', error);
                $mdToast.show(
                    $mdToast.simple()
                        .content("Error loading share products")
                        .hideDelay(2000)
                        .position('top right')
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

        }

    }
})();