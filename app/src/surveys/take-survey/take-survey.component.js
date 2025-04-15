(function(){
    'use strict';
    
    angular.module('selfService')
        .controller('TakeSurveyCtrl', ['$scope', '$state', 'SurveysService', 'AccountService', '$mdToast', '$mdDialog', TakeSurveyCtrl]);

    function TakeSurveyCtrl($scope, $state, SurveysService, AccountService, $mdToast, $mdDialog) {
        var vm = this;
        
        vm.loadingSurveys = false;
        vm.loadingError = false;
        vm.submitting = false;
        vm.selectedSurvey = null;
        vm.allSurveyData = [];
        vm.surveyData = null;
        vm.componentGroups = [];
        vm.clientId = null;
        vm.showAlreadySubmittedBanner = false;
        vm.isEditing = false;
        
        vm.onSurveySelect = onSurveySelect;
        vm.submitSurvey = submitSurvey;
        vm.cancel = cancel;
        vm.retryLoading = loadAvailableSurveys;
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
        
        function loadAvailableSurveys() {
            vm.loadingSurveys = true;
            vm.loadingError = false;
            
            AccountService.getClientId().then(function(clientId) {
                vm.clientId = clientId;
                return SurveysService.getAllSurveys();
            }).then(function(response) {
                vm.allSurveyData = response.data;
                vm.loadingSurveys = false;
                
                if ($state.params.surveyId) {
                    vm.isEditing = $state.params.editMode === true;
                    vm.selectedSurvey = vm.allSurveyData.find(function(survey) {
                        return survey.id === parseInt($state.params.surveyId);
                    });
                    if (vm.selectedSurvey) {
                        vm.surveyData = vm.selectedSurvey;
                        vm.componentGroups = groupByComponent(vm.surveyData.questionDatas);
                        if (vm.isEditing) {
                            loadExistingResponses();
                        }
                    }
                }
            }).catch(function(error) {
                vm.loadingSurveys = false;
                vm.loadingError = true;
                $mdToast.show(
                    $mdToast.simple()
                        .textContent('Failed to load surveys. Please try again.')
                        .position('top right')
                        .toastClass('md-error')
                );
            });
        }
        
        function onSurveySelect() {
            if (vm.selectedSurvey) {
                vm.surveyData = vm.selectedSurvey;
                
                // Check if survey has already been submitted
                SurveysService.getClientSurveySubmission(vm.surveyData.id, vm.clientId)
                    .then(function(response) {
                        if (response.data && response.data.length > 0) {
                            vm.showAlreadySubmittedBanner = true;
                            vm.isEditing = true;
                            loadExistingResponses();
                        } else {
                            vm.showAlreadySubmittedBanner = false;
                            vm.isEditing = false;
                            vm.surveyData.questionDatas.forEach(function(question) {
                                question.answer = null;
                            });
                            vm.componentGroups = groupByComponent(vm.surveyData.questionDatas);
                        }
                    })
                    .catch(function(error) {
                        $mdToast.show(
                            $mdToast.simple()
                                .textContent('Failed to check survey status. Please try again.')
                                .position('top right')
                                .toastClass('md-error')
                        );
                    });
            }
        }
        
        function submitSurvey() {
            if (!vm.surveyData || !vm.clientId) {
                $mdToast.show(
                    $mdToast.simple()
                        .textContent('Please select a survey and answer all questions')
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
            var submitPromise = vm.isEditing ? 
                SurveysService.updateSurvey(vm.surveyData.id, vm.clientId, formData) :
                SurveysService.submitSurvey(vm.surveyData.id, formData);
            
            submitPromise
                .then(function() {
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent(vm.isEditing ? 'Survey responses updated successfully' : 'Survey submitted successfully')
                            .position('top right')
                            .toastClass('md-success')
                    );
                    $state.go('app.surveys');
                })
                .catch(function(error) {
                    if (error.data && error.data.errors && error.data.errors[0] && 
                        error.data.errors[0].userMessageGlobalisationCode === 'error.msg.survey.already.submitted') {
                        showEditDialog();
                    } else {
                        $mdToast.show(
                            $mdToast.simple()
                                .textContent('Failed to submit survey. Please try again.')
                                .position('top right')
                                .toastClass('md-error')
                        );
                    }
                })
                .finally(function() {
                    vm.submitting = false;
                });
        }

        function showEditDialog() {
            var confirm = $mdDialog.confirm()
                .title('Survey Already Submitted')
                .textContent('You have already submitted this survey. Would you like to edit your responses?')
                .ariaLabel('Edit Survey Responses')
                .ok('Edit Responses')
                .cancel('Cancel');
            
            $mdDialog.show(confirm).then(function() {
                vm.isEditing = true;
                loadExistingResponses();
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
        
        loadAvailableSurveys();
    }
})(); 