(function() {
    'use strict';

    angular.module('selfService')
        .service('SharesApplicationService', ['$resource', 'BASE_URL', SharesApplicationService]);

    /**
     * @module SharesApplicationService
     * @description
     * Service required for Shares Application
     */
    function SharesApplicationService($resource, BASE_URL) {
        this.submitApplication = function() {
            return $resource(BASE_URL + '/self/shareaccounts', {}, {
                submit: {
                    method: 'POST'
                }
            });
        }

        this.template = function() {
            return $resource(BASE_URL + '/self/shareaccounts/template', {}, {
                get: {
                    method: 'GET',
                    params: {
                        clientId: '@clientId'
                    }
                }
            });
        }
    }

})();