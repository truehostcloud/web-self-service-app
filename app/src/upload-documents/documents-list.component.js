(function() {
    'use strict';

    angular.module('selfService')
        .controller('DocumentsListCtrl', ['$scope', '$mdDialog', '$mdToast', 'UploadDocumentsService', 'AccountService', DocumentsListCtrl]);

    function DocumentsListCtrl($scope, $mdDialog, $mdToast, UploadDocumentsService, AccountService) {
        var vm = this;
        
        vm.documents = [];
        vm.clientId = null;
        vm.openUploadDialog = openUploadDialog;
        vm.downloadDocument = downloadDocument;
        vm.deleteDocument = deleteDocument;
        vm.loadDocuments = loadDocuments;
        vm.downloading = {};

        init();

        function init() {
            AccountService.getClientId().then(function(clientId) {
                vm.clientId = clientId;
                console.log(vm.clientId);
                loadDocuments();
            });
        }

        function loadDocuments() {
            UploadDocumentsService.getDocuments(vm.clientId).get().$promise
                .then(function(response) {
                    console.log(response);
                    vm.documents = response;
                    if (!Array.isArray(vm.documents)) {
                        vm.documents = [vm.documents];
                    }
                })
                .catch(function(err) {
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent("Error Loading Documents")
                            .hideDelay(2000)
                            .position('top right')
                    );
                });
        }

        function downloadDocument(documentId) {
            vm.downloading[documentId] = true;
            const docInfo = vm.documents.find(doc => doc.id === documentId);
            const filename = docInfo ? docInfo.fileName : 'document';
            
            UploadDocumentsService.downloadDocument().get({ 
                clientId: vm.clientId,
                documentId: documentId 
            }).$promise
                .then(function(response) {
                    const blob = new Blob([response.data], { type: 'application/octet-stream' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                })
                .catch(function(err) {
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent("Error Downloading Document")
                            .hideDelay(2000)
                            .position('top right')
                    );
                })
                .finally(function() {
                    vm.downloading[documentId] = false;
                });
        }

        function deleteDocument(documentId) {
            UploadDocumentsService.deleteDocument().delete({ 
                clientId: vm.clientId,
                documentId: documentId 
            }).$promise
                .then(function() {
                    loadDocuments();
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent("Document Deleted Successfully")
                            .hideDelay(2000)
                            .position('top right')
                    );
                })
                .catch(function() {
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent("Error Deleting Document")
                            .hideDelay(2000)
                            .position('top right')
                    );
                });
        }

        function openUploadDialog(ev) {
            $mdDialog.show({
                controller: UploadDialogCtrl,
                controllerAs: 'vm',
                templateUrl: 'src/upload-documents/upload-dialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                locals: {
                    clientId: vm.clientId
                }
            }).then(function() {
                loadDocuments();
            });
        }

        function UploadDialogCtrl($mdDialog, clientId) {
            var vm = this;
            vm.documentData = {
                name: '',
                description: '',
                file: null
            };
            vm.uploading = false;

            vm.cancel = function() {
                $mdDialog.cancel();
            };

            vm.confirm = function() {
                if (!vm.documentData.file) {
                    return;
                }

                vm.uploading = true;
                UploadDocumentsService.uploadDocument().upload(
                    Object.assign(
                        { clientId: clientId },
                        vm.documentData
                    )
                ).$promise
                    .then(function() {
                        $mdDialog.hide();
                        $mdToast.show(
                            $mdToast.simple()
                                .textContent("Document Uploaded Successfully")
                                .hideDelay(2000)
                                .position('top right')
                        );
                    })
                    .catch(function() {
                        $mdToast.show(
                            $mdToast.simple()
                                .textContent("Error Uploading Document")
                                .hideDelay(2000)
                                .position('top right')
                        );
                    })
                    .finally(function() {
                        vm.uploading = false;
                    });
            };

            vm.handleFileSelect = function(element) {
                vm.documentData.file = element.files[0];
                $scope.$apply();
            };
        }
    }
})(); 