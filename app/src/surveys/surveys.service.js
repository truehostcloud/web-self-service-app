(function(){
    'use strict';
    
    angular.module('selfService')
        .service('SurveysService', ['$http', '$resource', 'BASE_URL', '$q', SurveysService]);

    function SurveysService($http, $resource, BASE_URL, $q) {
        this.getAllSurveys = function() {
            return $http({
                method: 'GET',
                url: BASE_URL + '/self/surveys'
            }).then(function(response) {
                if (!response.data || !Array.isArray(response.data)) {
                    return $q.reject('Invalid survey data received');
                }
                return response;
            });
        };
        
        this.getClientSurveys = function(clientId) {
            if (!clientId) {
                return $q.reject('Client ID is required');
            }
            return $http({
                method: 'GET',
                url: BASE_URL + '/self/surveys/scorecards/clients/' + clientId
            }).then(function(response) {
                if (!response.data || !Array.isArray(response.data)) {
                    return $q.reject('Invalid client survey data received');
                }
                return response;
            });
        };

        this.getLatestClientSurveySubmissions = function(clientId) {
            if (!clientId) {
                return $q.reject('Client ID is required');
            }
            return $http({
                method: 'GET',
                url: BASE_URL + '/self/surveys/scorecards/clients/' + clientId + '/surveys'
            }).then(function(response) {
                if (!response.data || !Array.isArray(response.data)) {
                    return $q.reject('Invalid survey submissions data received');
                }
                return response;
            });
        };

        this.getClientSurveySubmission = function(surveyId, clientId) {
            if (!surveyId || !clientId) {
                return $q.reject('Survey ID and Client ID are required');
            }
            return $http({
                method: 'GET',
                url: BASE_URL + '/self/surveys/scorecards/clients/' + clientId + '/surveys'
            }).then(function(response) {
                if (!response.data || !Array.isArray(response.data)) {
                    return $q.reject('Invalid survey submission data received');
                }
                // Filter responses for the specific survey
                var surveyResponses = response.data.filter(function(submission) {
                    return submission.surveyId === parseInt(surveyId);
                });
                return {
                    data: surveyResponses
                };
            });
        };

        this.getLatestSurveyResponse = function(surveyId, clientId) {
            if (!surveyId || !clientId) {
                return $q.reject('Survey ID and Client ID are required');
            }
            return this.getClientSurveySubmission(surveyId, clientId)
                .then(function(response) {
                    if (response.data && response.data.length > 0) {
                        return response.data[0];
                    }
                    return null;
                });
        };

        this.submitSurvey = function(surveyId, formData) {
            if (!surveyId || !formData) {
                return $q.reject('Survey ID and form data are required');
            }
            if (!formData.scorecardValues || !Array.isArray(formData.scorecardValues)) {
                return $q.reject('Invalid scorecard values format');
            }
            return $http({
                method: 'POST',
                url: BASE_URL + '/self/surveys/scorecards/' + surveyId,
                data: formData
            });
        };

        this.updateSurvey = function(surveyId, clientId, formData) {
            if (!surveyId || !clientId || !formData) {
                return $q.reject('Survey ID, Client ID and form data are required');
            }
            if (!formData.scorecardValues || !Array.isArray(formData.scorecardValues)) {
                return $q.reject('Invalid scorecard values format');
            }

            var validatedScorecardValues = formData.scorecardValues.map(function(response) {
                if (!response.questionId || !response.responseId || response.value === undefined) {
                    throw new Error('Invalid scorecard value format');
                }
                return {
                    questionId: parseInt(response.questionId),
                    responseId: parseInt(response.responseId),
                    value: parseInt(response.value)
                };
            });

            return $http({
                method: 'PUT',
                url: BASE_URL + '/self/surveys/scorecards/' + surveyId + '/clients/' + clientId,
                data: {
                    scorecardValues: validatedScorecardValues
                }
            });
        };
    }
})(); 