(function(){
    'use strict';
    
    angular.module('selfService')
        .controller('TakeSurveyCtrl', ['$scope', '$state', 'SurveysService', 'AccountService', '$mdToast', TakeSurveyCtrl]);

    function TakeSurveyCtrl($scope, $state, SurveysService, AccountService, $mdToast) {
        var vm = this;
        
        vm.loadingSurveys = false;
        vm.loadingError = false;
        vm.submitting = false;
        vm.selectedSurvey = null;
        vm.allSurveyData = [];
        vm.surveyData = null;
        vm.componentGroups = [];
        vm.clientId = null;
        
        vm.onSurveySelect = onSurveySelect;
        vm.submitSurvey = submitSurvey;
        vm.cancel = cancel;
        vm.retryLoading = loadAvailableSurveys;
        
        function groupByComponent(questions) {
            var groups = {};
            questions.forEach(function(question) {
                var key = question.componentKey || 'default';
                if (!groups[key]) {
                    groups[key] = [];
                }
                question.answer = null;
                groups[key].push(question);
            });
            return Object.values(groups);
        }
        
        function loadAvailableSurveys() {
            vm.loadingSurveys = true;
            vm.loadingError = false;
            
            AccountService.getClientId().then(function(clientId) {
                vm.clientId = clientId;
                return SurveysService.getAllSurveys();
            }).then(function(response) {
                vm.allSurveyData = response.data;
                vm.loadingSurveys = false;
            }).catch(function(error) {
                vm.loadingSurveys = false;
                vm.loadingError = true;
                console.error('Error loading surveys:', error);
                $mdToast.show(
                    $mdToast.simple()
                        .textContent('Failed to load surveys. Please try again.')
                        .position('top right')
                        .theme('md-error')
                );
            });
        }
        
        function onSurveySelect() {
            if (vm.selectedSurvey) {
                vm.surveyData = vm.selectedSurvey;
                vm.componentGroups = groupByComponent(vm.surveyData.questionDatas);
            }
        }
        
        function submitSurvey() {
            
            if (!vm.surveyData || !vm.clientId) {
                $mdToast.show(
                    $mdToast.simple()
                        .textContent('Please select a survey and answer all questions')
                        .position('top right')
                        .theme('md-warning')
                );
                return;
            }
            
            
            var unansweredQuestions = vm.surveyData.questionDatas.some(function(q) {
                return !q.answer;
            });
            
            if (unansweredQuestions) {
                $mdToast.show(
                    $mdToast.simple()
                        .textContent('Please answer all questions before submitting')
                        .position('top right')
                        .theme('md-warning')
                );
                return;
            }
            
            
            var formData = {
                clientId: vm.clientId,
                scorecardValues: vm.surveyData.questionDatas.map(function(q) {
                    return {
                        questionId: q.id,
                        responseId: q.answer.id,
                        value: q.answer.value
                    };
                })
            };
            
            
            vm.submitting = true;
            SurveysService.submitSurvey(vm.surveyData.id, formData)
                .then(function() {
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent('Survey submitted successfully')
                            .position('top right')
                            .theme('md-success')
                    );
                    $state.go('app.surveys');
                })
                .catch(function(error) {
                    console.error('Error submitting survey:', error);
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent('Failed to submit survey. Please try again.')
                            .position('top right')
                            .theme('md-error')
                    );
                })
                .finally(function() {
                    vm.submitting = false;
                });
        }

        function cancel() {
            $state.go('app.surveys');
        }
        
        loadAvailableSurveys();
    }
})(); 