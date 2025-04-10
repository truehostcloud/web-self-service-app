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

        this.getLatestClientSurveySubmissions = function(clientId) {
            return $http({
                method: 'GET',
                url: BASE_URL + '/self/surveys/scorecards/clients/' + clientId + '/latest'
            });
        };

        this.getClientSurveySubmission = function(surveyId, clientId) {
            return $http({
                method: 'GET',
                url: BASE_URL + '/self/surveys/scorecards/' + surveyId + '/clients/' + clientId
            });
        };

        this.submitSurvey = function(surveyId, formData) {
            return $http({
                method: 'POST',
                url: BASE_URL + '/self/surveys/scorecards/' + surveyId,
                data: formData
            });
        };

        this.updateSurvey = function(surveyId, clientId, formData) {
            var now = new Date();
            // For ScorecardData.createdOn (LocalDateTime)
            var localDateTimeFormat = now.toISOString().split('.')[0].replace('Z', '');
            // For ScorecardValue.createdOn (OffsetDateTime)
            var offsetDateTimeFormat = now.toISOString().split('.')[0] + 'Z';

            return $http({
                method: 'PUT',
                url: BASE_URL + '/self/surveys/scorecards/' + surveyId + '/clients/' + clientId,
                data: {
                    clientId: parseInt(clientId),
                    createdOn: localDateTimeFormat,
                    scorecardValues: formData.scorecardValues.map(function(response) {
                        return {
                            questionId: parseInt(response.questionId),
                            responseId: parseInt(response.responseId),
                            value: parseInt(response.value),
                            createdOn: offsetDateTimeFormat
                        };
                    })
                }
            });
        };
    }
})(); 