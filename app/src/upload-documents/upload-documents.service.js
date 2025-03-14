(function() {
    'use strict';

    angular.module('selfService')
        .service('UploadDocumentsService', ['$resource', 'BASE_URL', 'AccountService', UploadDocumentsService]);

    function UploadDocumentsService($resource, BASE_URL, AccountService) {
        this.uploadDocument = function() {
            return $resource(BASE_URL + '/self/clients/:clientId/documents', {
                clientId: '@clientId'
            }, {
                upload: {
                    method: 'POST',
                    headers: {'Content-Type': undefined},
                    transformRequest: function(data) {
                        const formData = new FormData();
                        console.log("DATA", data);
                        formData.append('file', data.file);
                        formData.append('name', data.name);
                        formData.append('description', data.description || '');
                        console.log("FORM DATA", {
                            file: data.file,
                            name: data.name,
                            description: data.description
                        });
                        return formData;
                    }
                }
            });
        };

        this.getDocuments = function(clientId) {
            return $resource(BASE_URL + '/self/clients/:clientId/documents', {
                clientId: clientId
            }, {
                get: {
                    method: 'GET',
                    isArray: true
                }
            });
        };

        this.downloadDocument = function() {
            return $resource(BASE_URL + '/self/clients/:clientId/documents/:documentId/attachment', {
                clientId: '@clientId',
                documentId: '@documentId'
            }, {
                get: { 
                    method: 'GET',
                    responseType: 'arraybuffer',
                    transformResponse: function(data) {
                        return {
                            data: data
                        };
                    }
                }
            });
        };

        this.deleteDocument = function() {
            return $resource(BASE_URL + '/self/clients/:clientId/documents/:documentId', {
                clientId: '@clientId',
                documentId: '@documentId'
            }, {
                delete: { method: 'DELETE' }
            });
        };
    }
})(); 