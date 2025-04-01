(function () {
    'use strict';

    angular.module('selfService')
        .controller('ForgotPwdCtrl', ['$scope', '$state', '$mdToast', 'AuthService', 'AccountService', ForgotPwdCtrl]);

    /**
     * @module ForgotPwdCtrl
     * @description
     * Handles Forgot Password
     */
    function ForgotPwdCtrl($scope, $state, $mdToast, AuthService, AccountService) {
        var vm = this;
        vm.form = {
            email: '',
            token: '',
            newPassword: '',
            confirmPassword: ''
        };
        vm.showResetForm = false;
        vm.passwordStrength = {
            hasUpperCase: false,
            hasLowerCase: false,
            hasNumber: false,
            hasSpecialChar: false,
            hasValidLength: false,
            hasNoSpaces: true,
            hasNoRepeatingChars: true
        };

        vm.validatePasswordStrength = function() {
            var password = vm.form.newPassword;
            if (!password) return;

            vm.passwordStrength = {
                hasUpperCase: /[A-Z]/.test(password),
                hasLowerCase: /[a-z]/.test(password),
                hasNumber: /[0-9]/.test(password),
                hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
                hasValidLength: password.length >= 12 && password.length <= 50,
                hasNoSpaces: !/\s/.test(password),
                hasNoRepeatingChars: !/(.)\1{1,}/.test(password)
            };

            // Set form validity
            var isValid = Object.values(vm.passwordStrength).every(function(value) {
                return value === true;
            });
            $scope.forgotPasswordForm.newPassword.$setValidity('passwordStrength', isValid);
        };

        vm.validatePasswords = function() {
            if (vm.form.newPassword && vm.form.confirmPassword) {
                $scope.forgotPasswordForm.confirmPassword.$setValidity('compareTo', 
                    vm.form.newPassword === vm.form.confirmPassword);
            }
        };

        vm.submitResetRequest = function() {
            if (vm.form.email) {
                AccountService.requestPasswordReset(vm.form.email).then(function() {
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent('Password reset instructions have been sent to your email')
                            .position('top right')
                            .toastClass('md-success')
                            .hideDelay(3000)
                    );
                    vm.showResetForm = true;
                }).catch(function(error) {
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent('Failed to send reset instructions. Please try again.')
                            .position('top right')
                            .toastClass('md-error')
                            .hideDelay(3000)
                    );
                });
            }
        };

        vm.verifyAndResetPassword = function() {
            if (vm.form.newPassword !== vm.form.confirmPassword) {
                $mdToast.show(
                    $mdToast.simple()
                        .textContent('Passwords do not match')
                        .position('top right')
                        .toastClass('md-error')
                        .hideDelay(3000)
                );
                return;
            }

            AccountService.verifyAndResetPassword(vm.form.token, vm.form.newPassword).then(function() {
                $mdToast.show(
                    $mdToast.simple()
                        .textContent('Password has been reset successfully')
                        .position('top right')
                        .toastClass('md-success')
                        .hideDelay(3000)
                );
                $state.go('login');
            }).catch(function(error) {
                $mdToast.show(
                    $mdToast.simple()
                        .textContent('Failed to reset password. Please try again.')
                        .position('top right')
                        .toastClass('md-error')
                        .hideDelay(3000)
                );
            });
        };
    }

})();
