(function() {
    'use strict';
    
    angular.module('selfService')
        .directive('compareTo', compareTo);
        
    function compareTo() {
        return {
            require: 'ngModel',
            scope: {
                compareTo: '='
            },
            link: function(scope, element, attributes, ngModel) {
                ngModel.$validators.compareTo = function(modelValue) {
                    return modelValue === scope.compareTo;
                };
                
                scope.$watch('compareTo', function() {
                    ngModel.$validate();
                });
            }
        };
    }
})(); 