(function(){
    'use strict';
    
    angular.module('selfService')
        .controller('SurveysCtrl', ['$scope','$mdToast', 'AccountService' ,'SurveysService', SurveysCtrl]);

    function SurveysCtrl($scope, $mdToast, AccountService, SurveysService) {
        var vm = this;
        vm.clientId = null;
        vm.loadingSurveys = false;
        vm.loadingError = false;
        vm.surveyFilter = '';
        vm.selected = [];
        vm.query = {
            limit: 10,
            offset: 1,
            orderBy: 'dateTime'
        };
        
        vm.surveys = [];
        
        vm.takeSurvey = takeSurvey;
        vm.retryLoading = loadSurveys;
        vm.init = init;
        vm.getClientSurveys = getClientSurveys;

        function loadSurveys() {
            vm.loadingSurveys = true;
            vm.loadingError = false;
            init();
        }

        function init() {
            AccountService.getClientId().then(function(clientId) {
                vm.clientId = clientId;
                getClientSurveys(clientId);
            });
        }

        function getClientSurveys(clientId) {
            SurveysService.getClientSurveys(clientId).then(function(response) {
                vm.surveys = response.data;
                vm.loadingSurveys = false;
                console.log(vm.surveys);
            }).catch(function(error) {
                vm.loadingSurveys = false;
                vm.loadingError = true;
                $mdToast.show(
                    $mdToast.simple()
                        .textContent("Error loading surveys",error)
                        .hideDelay(2000)
                        .position('top right')
                        .toastClass('md-error')
                );
            });
        }
        
        function takeSurvey() {
            // Implement survey taking logic
        }
        
        loadSurveys();
    }
})(); 