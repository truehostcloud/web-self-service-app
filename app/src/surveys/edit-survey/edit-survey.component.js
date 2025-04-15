(function(){
    'use strict';
    
    angular.module('selfService')
        .controller('EditSurveyCtrl', ['$scope', '$state', '$stateParams', 'SurveysService', 'AccountService', '$mdToast', EditSurveyCtrl]);

    function EditSurveyCtrl($scope, $state, $stateParams, SurveysService, AccountService, $mdToast) {
        var vm = this;
        
        vm.loadingSurveys = false;
        vm.loadingError = false;
        vm.submitting = false;
        vm.surveyData = null;
        vm.componentGroups = [];
        vm.clientId = null;
        vm.isEditing = true;
        vm.userResponses = [];
        
        vm.submitSurvey = submitSurvey;
        vm.cancel = cancel;
        vm.retryLoading = loadSurvey;
        vm.loadExistingResponses = loadExistingResponses;
        vm.isChoiceSelected = isChoiceSelected;
        
        function groupByComponent(questions) {
            var groups = {};
            questions.forEach(function(question) {
                var key = question.componentKey || 'default';
                if (!groups[key]) {
                    groups[key] = [];
                }
                groups[key].push(question);
            });
            return Object.values(groups);
        }
        
        function loadSurvey() {
            vm.loadingSurveys = true;
            vm.loadingError = false;
            
            AccountService.getClientId().then(function(clientId) {
                vm.clientId = clientId;
                // First load the client's survey responses
                return SurveysService.getClientSurveySubmission($stateParams.surveyId, clientId);
            }).then(function(response) {
                vm.userResponses = response.data;
                // Then load the survey questions and choices
                return SurveysService.getAllSurveys();
            }).then(function(response) {
                vm.surveyData = response.data.find(function(survey) {
                    return survey.id === parseInt($stateParams.surveyId);
                });
               
                if (vm.surveyData) {
                    // Find the response for this survey
                    var surveyResponse = vm.userResponses.find(function(r) {
                        return r.surveyId === vm.surveyData.id;
                    });

                    if (surveyResponse) {
                        // Set the selectedResponseId for each question
                        vm.surveyData.questionDatas.forEach(function(question) {
                            var questionResponse = surveyResponse.scorecardValues.find(function(response) {
                                return response.questionId === question.id;
                            });
                            if (questionResponse) {
                                question.selectedResponseId = questionResponse.responseId;
                            }
                        });
                    }

                    vm.componentGroups = groupByComponent(vm.surveyData.questionDatas);
                } else {
                    vm.loadingError = true;
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent('Survey not found')
                            .position('top right')
                            .toastClass('md-error')
                    );
                }
                
                vm.loadingSurveys = false;
            }).catch(function() {
                vm.loadingSurveys = false;
                vm.loadingError = true;
                $mdToast.show(
                    $mdToast.simple()
                        .textContent('Failed to load survey. Please try again.')
                        .position('top right')
                        .toastClass('md-error')
                );
            });
        }
        
        function submitSurvey() {
            if (!vm.surveyData || !vm.clientId) {
                $mdToast.show(
                    $mdToast.simple()
                        .textContent('Please answer all questions')
                        .position('top right')
                        .toastClass('md-warning')
                );
                return;
            }
            
            var unansweredQuestions = vm.surveyData.questionDatas.some(function(q) {
                return !q.selectedResponseId;
            });
            
            if (unansweredQuestions) {
                $mdToast.show(
                    $mdToast.simple()
                        .textContent('Please answer all questions before submitting')
                        .position('top right')
                        .toastClass('md-warning')
                );
                return;
            }
            
            var formData = {
                clientId: vm.clientId,
                scorecardValues: vm.surveyData.questionDatas.map(function(q) {
                    var selectedOption = q.responseDatas.find(function(option) {
                        return option.id === q.selectedResponseId;
                    });
                    return {
                        questionId: q.id,
                        responseId: q.selectedResponseId,
                        value: selectedOption ? selectedOption.value : 0
                    };
                })
            };
            
            vm.submitting = true;
            SurveysService.updateSurvey(vm.surveyData.id, vm.clientId, formData)
                .then(function() {
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent('Survey responses updated successfully')
                            .position('top right')
                            .toastClass('md-success')
                    );
                    $state.go('app.surveys');
                })
                .catch(function() {
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent('Failed to update survey. Please try again.')
                            .position('top right')
                            .toastClass('md-error')
                    );
                })
                .finally(function() {
                    vm.submitting = false;
                });
        }

        function loadExistingResponses() {
            SurveysService.getClientSurveySubmission(vm.surveyData.id, vm.clientId)
                .then(function(response) {
                    vm.userResponses = response.data;
                    
                    if (vm.userResponses && vm.userResponses.length > 0) {
                        var surveyResponse = vm.userResponses.find(function(response) {
                            return response.surveyId === vm.surveyData.id;
                        });

                        if (surveyResponse) {
                            vm.surveyData.questionDatas.forEach(function(question) {
                                question.answer = null;
                                question.selectedResponseId = null;
                                
                                var questionResponse = surveyResponse.scorecardValues.find(function(response) {
                                    return response.questionId === question.id;
                                });
                                
                                if (questionResponse) {
                                    var selectedOption = question.responseDatas.find(function(option) {
                                        return option.id === questionResponse.responseId;
                                    });
                                    
                                    if (selectedOption) {
                                        question.answer = selectedOption;
                                        question.selectedResponseId = selectedOption.id;
                                    }
                                }
                            });
                            
                            vm.componentGroups = groupByComponent(vm.surveyData.questionDatas);
                            
                            if (!$scope.$$phase) {
                                $scope.$apply();
                            }
                        }
                    } else {
                        $mdToast.show(
                            $mdToast.simple()
                                .textContent('No previous responses found')
                                .position('top right')
                                .toastClass('md-warning')
                        );
                    }
                })
                .catch(function() {
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent('Failed to load existing responses. Please try again.')
                            .position('top right')
                            .toastClass('md-error')
                    );
                });
        }

        function isChoiceSelected(questionId, choiceId) {
            if (!vm.userResponses || !vm.surveyData) return false;
            
            var response = vm.userResponses.find(function(r) {
                return r.surveyId === vm.surveyData.id;
            });
            
            if (!response || !response.scorecardValues) return false;

            return response.scorecardValues.some(function(scorecard) {
                return scorecard.questionId === questionId && scorecard.responseId === choiceId;
            });
        }
        
        $scope.$watch('vm.componentGroups', function(newVal) {
            if (newVal) {
                newVal.forEach(function(component) {
                    component.forEach(function(question) {
                        $scope.$watch(function() {
                            return question.selectedResponseId;
                        }, function(newVal) {
                            if (newVal) {
                                var selectedOption = question.responseDatas.find(function(option) {
                                    return option.id === newVal;
                                });
                                if (selectedOption) {
                                    question.answer = selectedOption;
                                }
                            }
                        });
                    });
                });
            }
        });

        function cancel() {
            $state.go('app.surveys');
        }
        
        loadSurvey();
    }
})(); 