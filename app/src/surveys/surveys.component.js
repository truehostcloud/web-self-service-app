(function(){
    'use strict';
    
    angular.module('selfService')
        .controller('SurveysCtrl', ['$scope','$mdToast', '$state', 'AccountService' ,'SurveysService', SurveysCtrl]);

    function SurveysCtrl($scope, $mdToast, $state, AccountService, SurveysService) {
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
        vm.editSurvey = editSurvey;

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
            SurveysService.getLatestClientSurveySubmissions(clientId).then(function(response) {
                vm.surveys = response.data;
                vm.loadingSurveys = false;
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
            $state.go('app.takeSurvey');
        }

        function editSurvey(survey) {
            $state.go('app.editSurvey', { 
                surveyId: survey.surveyId
            });
        }
        
        loadSurveys();
    }
})(); 