(function() {
  'use strict';

  angular
    .module('YOUR APP NAME')
    .config(['$stateProvider', '$urlRouterProvider', stateProvider]);

  function stateProvider($stateProvider, $urlRouterProvider) {

    // For any unmatched url, redirect to login
    $urlRouterProvider.otherwise('/login');

    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'login.html'
      })
  }

})();