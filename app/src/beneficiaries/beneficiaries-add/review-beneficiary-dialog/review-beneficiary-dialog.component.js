(function(){
	'use strict';

	angular.module('selfService')
		.controller('ReviewBeneficiaryDialogCtrl', ['$scope', '$rootScope', '$state', '$stateParams', '$filter', '$mdDialog', '$mdToast', 'addBeneficiaryFormData', 'BeneficiariesService', ReviewBeneficiaryDialogCtrl])

	function ReviewBeneficiaryDialogCtrl($scope, $rootScope, $state, $stateParams, $filter, $mdDialog, $mdToast, addBeneficiaryFormData, BeneficiariesService) {
		
		var vm = this;
		vm.addBeneficiaryFormData = Object.assign({}, addBeneficiaryFormData);
		vm.cancel = cancel;
		vm.accountType = accountType;
		vm.add = add;
		
		function cancel() {
			$mdDialog.cancel();
		}

		function accountType(id) {
					if (1 == id) {
						return 'Loan Account';
					} else {
						return 'Savings Account';
					}
			}

		function add() {
			// Sending
			BeneficiariesService.beneficiary().save(vm.addBeneficiaryFormData).$promise.then(function () {
					$mdDialog.hide("success");
					$mdToast.show(
						$mdToast.simple()
							.textContent('Beneficiary Added Successfully')
							.position('top right')
							.hideDelay(3000)
							.toastClass('md-success')
					);
					$state.go('app.beneficiarieslist');
			}, function (resp) {
				var errorMessage = 'An error occurred while adding the beneficiary';
				if (resp.data && resp.data.errors && resp.data.errors.length > 0) {
					errorMessage = resp.data.errors[0].defaultUserMessage || 'The account details provided do not match our records. Please verify the office name and account number.';
				}
				$mdDialog.hide({error: errorMessage});
			});
		}
	}
})();