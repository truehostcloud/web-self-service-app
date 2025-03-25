(function () {
    'use strict';

    angular.module('selfService')
        .controller('RegisterCtrl', ['$scope', '$state', '$mdToast', 'AuthService', '$location',  RegisterCtrl]);

    /**
     * @module RegisterCtrl
     * @description
     * Handles Registration of self service user
     */
    function RegisterCtrl($scope, $state, $mdToast, AuthService, $location) {
        var vm = this;
        vm.clearForm = clearForm;
        vm.formErrors = [];

        vm.form={
            "authenticationMode" :"email"
        };

        function clearForm() {
            $scope.form.$setPristine();
            $scope.form.$setUntouched();
            vm.form = {
                "authenticationMode" :"email"
            };
            vm.formErrors = [];
        }

        $scope.submit = function() {
            vm.formErrors = [];
            AuthService.register(vm.form).then(function () {
                $mdToast.show(
                    $mdToast.simple()
                        .textContent('Confirmation email is sent')
                        .position('top right')
                        .toastClass('md-success')
                );
                vm.clearForm();
            }, function (resp) {
                if(resp.data && resp.data.errors){
                    vm.formErrors = resp.data.errors.map(function (data) {
                        return data.defaultUserMessage;
                    });
                    
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent(vm.formErrors.join(' '))
                            .position('top right')
                            .toastClass('md-error')
                    );
                } else {
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent('Confirmation email is sent')
                            .position('top right')
                            .toastClass('md-success')
                    );
                    $location.path('/verify');
                    vm.clearForm();
                }
            });
        }
    }

})();
