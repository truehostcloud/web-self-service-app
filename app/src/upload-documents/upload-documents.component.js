(function() {
    'use strict';

    angular.module('selfService')
        .controller('UploadDocumentsCtrl', ['$scope', '$mdDialog', '$mdToast', 'UploadDocumentsService', UploadDocumentsCtrl]);

    function UploadDocumentsCtrl($scope, $mdDialog, $mdToast, UploadDocumentsService) {
        var vm = this;
        
        vm.openUploadDialog = openUploadDialog;

        function openUploadDialog(ev) {
            $mdDialog.show({
                controller: UploadDialogCtrl,
                controllerAs: 'vm',
                templateUrl: 'src/upload-documents/upload-dialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false
            });
        }

        function UploadDialogCtrl($mdDialog) {
            var vm = this;
            vm.documentData = {
                name: '',
                description: '',
                file: null
            };

            vm.cancel = function() {
                $mdDialog.cancel();
            };

            vm.confirm = function() {
                if (!vm.documentData.file) {
                    return;
                }

                UploadDocumentsService.uploadDocument().upload(vm.documentData).$promise
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
                    });
            };

            vm.handleFileSelect = function(element) {
                vm.documentData.file = element.files[0];
                $scope.$apply();
            };
        }
    }
})(); 