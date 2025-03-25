(function(){
    'use strict';
    
    angular.module('selfService')
        .service('SurveysService', ['$http', '$resource', 'BASE_URL', SurveysService]);

    function SurveysService($http, $resource, BASE_URL) {
        this.getAllSurveys = function() {
            return $http({
                method: 'GET',
                url: BASE_URL + '/self/surveys'
            });
        };
        
        this.getClientSurveys = function(clientId) {
            return $http({
                method: 'GET',
                url: BASE_URL + '/self/surveys/scorecards/clients/' + clientId
            });
        };

        this.submitSurvey = function(surveyId, formData) {
            return $http({
                method: 'POST',
                url: BASE_URL + '/self/surveys/scorecards/' + surveyId,
                data: formData
            });
        };
    }
})(); 