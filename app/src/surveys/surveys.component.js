(function(){
    'use strict';
    
    angular.module('selfService')
        .controller('SurveysCtrl', ['$scope', 'SurveysService', SurveysCtrl]);

    function SurveysCtrl($scope, SurveysService) {
        var vm = this;
        
        vm.loadingSurveys = false;
        vm.loadingError = false;
        vm.surveyFilter = '';
        vm.selected = [];
        vm.query = {
            limit: 5,
            offset: 1,
            orderBy: 'dateTime'
        };
        
        vm.surveys = [];
        
        vm.takeSurvey = takeSurvey;
        vm.retryLoading = loadSurveys;
        
        function loadSurveys() {
            vm.loadingSurveys = true;
            vm.loadingError = false;
            SurveysService.getAllSurveys().then(function(response) {
                vm.surveys = response.data;
                vm.loadingSurveys = false;
            }).catch(function(error) {
                vm.loadingSurveys = false;
                vm.loadingError = true;
                console.error('Error loading surveys:', error);
            });
        }
        
        function takeSurvey() {
            // Implement survey taking logic
        }
        
        loadSurveys();
    }
})(); 