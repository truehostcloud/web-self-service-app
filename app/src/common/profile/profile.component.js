(function() {
    angular.module('selfService')
        .controller('ProfileCtrl', ['$scope', 'AccountService', ProfileCtrl]);

    function ProfileCtrl($scope, AccountService) {
        const vm = this;
        vm.profile = {};
        vm.profileImage = null;
        vm.loading = true;

        vm.formatDate = formatDate;
        vm.getStatusClass = getStatusClass;

        initialise();

        function initialise() {
            AccountService.getClientId().then(function(clientId) {
                getClientDetails(clientId);
                getClientImage(clientId);
            });
        }

        function getClientDetails(clientId) {
            AccountService.getClient(clientId).get().$promise.then(function(data) {
                vm.profile = data;
                vm.loading = false;
            });
        }

        function getClientImage(clientId) {
            AccountService.getClientImage(clientId).then(function(resp) {
                vm.profileImage = resp.data;
            });
        }

        function formatDate(dateArray) {
            if (!dateArray) return '';
            return new Date(dateArray[0], dateArray[1] - 1, dateArray[2]).toLocaleDateString('en-GB');
        }

        function getStatusClass(status) {
            if (!status) return '';
            return status.value.toLowerCase() === 'active' ? 'status-active' : 'status-inactive';
        }
    }
})(); 