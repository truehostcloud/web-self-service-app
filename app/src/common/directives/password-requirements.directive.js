(function() {
    'use strict';
    
    angular.module('selfService')
        .directive('passwordRequirements', passwordRequirements);
        
    function passwordRequirements() {
        return {
            restrict: 'E',
            scope: {
                form: '=',
                model: '=',
                fieldName: '@'
            },
            template: 
                '<div class="password-requirements" ng-if="model">' +
                    '<div class="requirement" ng-class="{\'met\': requirements.hasValidLength}">' +
                        '<i class="material-icons">{{requirements.hasValidLength ? \'check_circle\' : \'radio_button_unchecked\'}}</i>' +
                        '<span>12-50 characters long</span>' +
                    '</div>' +
                    '<div class="requirement" ng-class="{\'met\': requirements.hasUpperCase}">' +
                        '<i class="material-icons">{{requirements.hasUpperCase ? \'check_circle\' : \'radio_button_unchecked\'}}</i>' +
                        '<span>Contains uppercase letter</span>' +
                    '</div>' +
                    '<div class="requirement" ng-class="{\'met\': requirements.hasLowerCase}">' +
                        '<i class="material-icons">{{requirements.hasLowerCase ? \'check_circle\' : \'radio_button_unchecked\'}}</i>' +
                        '<span>Contains lowercase letter</span>' +
                    '</div>' +
                    '<div class="requirement" ng-class="{\'met\': requirements.hasNumber}">' +
                        '<i class="material-icons">{{requirements.hasNumber ? \'check_circle\' : \'radio_button_unchecked\'}}</i>' +
                        '<span>Contains number</span>' +
                    '</div>' +
                    '<div class="requirement" ng-class="{\'met\': requirements.hasSpecialChar}">' +
                        '<i class="material-icons">{{requirements.hasSpecialChar ? \'check_circle\' : \'radio_button_unchecked\'}}</i>' +
                        '<span>Contains special character</span>' +
                    '</div>' +
                    '<div class="requirement" ng-class="{\'met\': requirements.hasNoSpaces}">' +
                        '<i class="material-icons">{{requirements.hasNoSpaces ? \'check_circle\' : \'radio_button_unchecked\'}}</i>' +
                        '<span>No spaces</span>' +
                    '</div>' +
                    '<div class="requirement" ng-class="{\'met\': requirements.hasNoRepeatingChars}">' +
                        '<i class="material-icons">{{requirements.hasNoRepeatingChars ? \'check_circle\' : \'radio_button_unchecked\'}}</i>' +
                        '<span>No consecutive repeating characters</span>' +
                    '</div>' +
                '</div>',
            link: function(scope) {
                scope.requirements = {
                    hasUpperCase: false,
                    hasLowerCase: false,
                    hasNumber: false,
                    hasSpecialChar: false,
                    hasValidLength: false,
                    hasNoSpaces: true,
                    hasNoRepeatingChars: true
                };

                scope.$watch('model', function(newValue) {
                    if (!newValue) return;

                    scope.requirements = {
                        hasUpperCase: /[A-Z]/.test(newValue),
                        hasLowerCase: /[a-z]/.test(newValue),
                        hasNumber: /[0-9]/.test(newValue),
                        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(newValue),
                        hasValidLength: newValue.length >= 12 && newValue.length <= 50,
                        hasNoSpaces: !/\s/.test(newValue),
                        hasNoRepeatingChars: !/(.)\1{1,}/.test(newValue)
                    };

                    var isValid = true;
                    for (var key in scope.requirements) {
                        if (scope.requirements.hasOwnProperty(key) && !scope.requirements[key]) {
                            isValid = false;
                            break;
                        }
                    }
                    scope.form[scope.fieldName].$setValidity('passwordStrength', isValid);
                });
            }
        };
    }
})(); 