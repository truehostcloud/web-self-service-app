(function () {
    'use strict';

    angular.module('selfService')
        .controller('LoginCtrl', ['$scope', '$rootScope', '$state', '$mdToast', 'AUTH_EVENTS', 'AuthService', 'AccountService', LoginCtrl]);

    function LoginCtrl($scope, $rootScope, $state, $mdToast, AUTH_EVENTS, AuthService, AccountService) {

        var vm = this;
        vm.authenticating = false;
        vm.formErrors = [];

        /**
         * @method doLogin
         * @description To perform the login action on the page
         */
        $scope.doLogin = function () {
            vm.authenticating = true;
            vm.formErrors = [];
            AuthService.doLogin().save($scope.loginData).$promise
                .then(function (result) {
                    AuthService.setUser(result);
                    AccountService.getClients().get().$promise
                        .then(function (res) {
                            vm.authenticating = false;
                            $state.go("app.dashboard");
                            if (res.pageItems.length !== 0) {
                                AccountService.setClientId(res.pageItems[0].id);
                                $mdToast.show(
                                    $mdToast.simple()
                                        .textContent("Successful Login")
                                        .hideDelay(2000)
                                        .position('top right')
                                        .toastClass('md-success')
                                );
                
                            } else {
                                $mdToast.show(
                                    $mdToast.simple()
                                        .textContent("No Clients Found")
                                        .hideDelay(2000)
                                        .position('top right')
                                        .toastClass('md-warning')
                                );
                                AuthService.logout();
                            }
                        })
                        .catch(function (error) {
                            vm.authenticating = false;
                            $mdToast.show(
                                $mdToast.simple()
                                    .textContent("Not a Self Service User")
                                    .hideDelay(2000)
                                    .position('top right')
                                    .toastClass('md-error')
                            );
                            AuthService.logout();
                        })
                }).catch(function (error) {
                    vm.authenticating = false;
                    vm.formErrors = ['Invalid login credentials. Please check your username and password.'];
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent("Invalid Login Credentials")
                            .hideDelay(2000)
                            .position('top right')
                            .toastClass('md-error')
                    );
                })
        }

    }

})();
