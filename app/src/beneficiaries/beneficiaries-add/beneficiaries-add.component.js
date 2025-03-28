(function () {
    'use strict';

    angular.module('selfService')
        .controller('BeneficiariesAddCtrl', ['$scope', '$state', '$stateParams', '$filter', '$mdDialog', '$mdToast', 'BeneficiariesService', 'AccountService', BeneficiariesAddCtrl]);

    function BeneficiariesAddCtrl($scope, $state, $stateParams, $filter, $mdDialog, $mdToast, BeneficiariesService, AccountService) {

        var vm = this;
        vm.addBeneficiaryFormData = {
            "locale": "en_GB"
        };
        vm.accountTypeOptions = [];
        vm.loanAccounts = [];
        vm.savingsAccounts = [];
        vm.selectedAccount = null;
        vm.formError = null;
        vm.offices = [];
        
        vm.getBeneficiaryTemplate = getBeneficiaryTemplate();
        vm.getAccounts = getAccounts();
        vm.getOffices = getOffices();
        vm.clearForm = clearForm;
        vm.submit = submit;
        vm.onAccountSelect = onAccountSelect;
        vm.onAccountTypeChange = onAccountTypeChange;
        vm.hasAccounts = hasAccounts;

        function getBeneficiaryTemplate() {
            BeneficiariesService.template().get().$promise.then(function (data) {
                vm.accountTypeOptions = data.accountTypeOptions;
            });
        }

        function getAccounts() {
            AccountService.getClientId().then(function(clientId) {
                AccountService.getAllAccounts(clientId).get().$promise.then(function(res) {
                    vm.loanAccounts = res.loanAccounts || [];
                    vm.savingsAccounts = res.savingsAccounts || [];
                });
            });
        }

        function getOffices() {
            BeneficiariesService.offices().query().$promise.then(function(data) {
                vm.offices = data;
            });
        }

        function hasAccounts(accountType) {
            if (accountType === 1) {
                return vm.loanAccounts && vm.loanAccounts.length > 0;
            }
            return vm.savingsAccounts && vm.savingsAccounts.length > 0;
        }

        function onAccountTypeChange() {
            vm.selectedAccount = null;
            vm.addBeneficiaryFormData.accountNumber = null;
            vm.addBeneficiaryFormData.officeName = null;
        }

        function onAccountSelect() {
            if (vm.selectedAccount) {
                vm.addBeneficiaryFormData.accountNumber = vm.selectedAccount.accountNo;
                vm.addBeneficiaryFormData.officeName = vm.selectedAccount.officeName || '';
            }
        }

        function clearForm() {
            $scope.addBeneficiaryForm.$setPristine();
            $scope.addBeneficiaryForm.$setUntouched();
            vm.selectedAccount = null;
            vm.formError = null;
            vm.addBeneficiaryFormData = {
                "locale": "en_GB"
            };
        }

        function submit(ev) {
            vm.formError = null;
            $mdDialog.show({
                controller: 'ReviewBeneficiaryDialogCtrl',
                controllerAs: 'vm',
                templateUrl: 'src/beneficiaries/beneficiaries-add/review-beneficiary-dialog/review-beneficiary-dialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                locals: {addBeneficiaryFormData: vm.addBeneficiaryFormData},
                clickOutsideToClose: true
            }).then(function (result) {
                if (result === "success") {
                    clearForm();
                    $state.go('app.beneficiarieslist');
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent('Beneficiary Added Successfully')
                            .position('top right')
                            .hideDelay(3000)
                            .toastClass('md-success')
                    );
                } else if (result && result.error) {
                    vm.formError = result.error;
                }
            }, function() {
                clearForm();
            });
        }
    }
})();