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
        
        vm.submitSurvey = submitSurvey;
        vm.cancel = cancel;
        vm.retryLoading = loadSurvey;
        vm.loadExistingResponses = loadExistingResponses;
        
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
        
        function loadSurvey() {
            vm.loadingSurveys = true;
            vm.loadingError = false;
            
            AccountService.getClientId().then(function(clientId) {
                vm.clientId = clientId;
                return SurveysService.getAllSurveys();
            }).then(function(response) {
               vm.surveyData = response.data.find(function(survey) {
                    return survey.id === parseInt($stateParams.surveyId);
                });
               
                if (vm.surveyData) {
                    vm.componentGroups = groupByComponent(vm.surveyData.questionDatas);
                    loadExistingResponses();
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
            }).catch(function(error) {
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
                return !q.answer;
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
                    return {
                        questionId: q.id,
                        responseId: q.answer.id,
                        value: q.answer.value
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
                .catch(function(error) {
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
                    var submissions = response.data;
                    if (submissions && submissions.length > 0) {
                        var allPreviousResponses = submissions.reduce(function(acc, submission) {
                            return acc.concat(submission.scorecardValues);
                        }, []);

                        vm.surveyData.questionDatas.forEach(function(question) {
                            question.answer = null;
                            question.selectedResponseId = null;
                        });
                        
                        allPreviousResponses.forEach(function(response) {
                            var question = vm.surveyData.questionDatas.find(function(q) {
                                return q.id === response.questionId;
                            });
                            if (question) {
                                var selectedOption = question.responseDatas.find(function(option) {
                                    return option.id === response.responseId;
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
                    } else {
                        $mdToast.show(
                            $mdToast.simple()
                                .textContent('No previous responses found')
                                .position('top right')
                                .toastClass('md-warning')
                        );
                    }
                })
                .catch(function(error) {
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent('Failed to load existing responses. Please try again.')
                            .position('top right')
                            .toastClass('md-error')
                    );
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