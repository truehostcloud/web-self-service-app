(function () {
    'use strict';

    angular.module('selfService')
        .controller('RegisterCtrl', ['$scope', '$state', '$mdToast', 'AuthService', '$location', RegisterCtrl]);

    /**
     * @module RegisterCtrl
     * @description
     * Handles Registration of self service user
     */
    function RegisterCtrl($scope, $state, $mdToast, AuthService, $location) {
        var vm = this;
        vm.clearForm = clearForm;
        vm.formErrors = [];

        vm.form = {
            authenticationMode: "email",
            accountNumber: '',
            username: '',
            firstName: '',
            lastName: '',
            email: '',
            mobileNumber: '',
            password: '',
            passwordConfirm: ''
        };

        function clearForm() {
            $scope.form.$setPristine();
            $scope.form.$setUntouched();
            vm.form = {
                authenticationMode: "email",
                accountNumber: '',
                username: '',
                firstName: '',
                lastName: '',
                email: '',
                mobileNumber: '',
                password: '',
                passwordConfirm: ''
            };
            vm.formErrors = [];
        }

        vm.validatePasswords = function() {
            if (vm.form.password && vm.form.passwordConfirm) {
                $scope.registerForm.passwordConfirm.$setValidity('compareTo', 
                    vm.form.password === vm.form.passwordConfirm);
            }
        };

        $scope.submit = function() {
            if (vm.form.password !== vm.form.passwordConfirm) {
                vm.formErrors = ['Passwords do not match'];
                return;
            }

            var registrationPayload = {
                authenticationMode: vm.form.authenticationMode,
                accountNumber: vm.form.accountNumber,
                username: vm.form.username,
                firstName: vm.form.firstName,
                lastName: vm.form.lastName,
                email: vm.form.email,
                mobileNumber: vm.form.mobileNumber,
                password: vm.form.password
            };

            AuthService.register(registrationPayload).then(function () {
                $mdToast.show(
                    $mdToast.simple()
                        .textContent('Registration successful! Please check your email for verification instructions.')
                        .position('top right')
                        .toastClass('md-success')
                );
                $state.go('login');
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
                            .textContent('Registration successful! Please check your email for verification instructions.')
                            .position('top right')
                            .toastClass('md-success')
                    );
                    $state.go('login');
                    vm.clearForm();
                }
            });
        }
    }

})();
