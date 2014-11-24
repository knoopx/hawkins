angular.module("hawkins", ["ionic", "firebase"])
  .constant("root", new Firebase("https://hawkins.firebaseio.com"))
  .controller("BuildCtrl", function($scope, $firebase, root, $state, $stateParams) {
    $scope.build = $firebase(root.child("builds").child($stateParams.id)).$asObject();
    $scope.log = $firebase(root.child("logs").child($stateParams.id)).$asArray();

    $scope.remove = function() {
      $scope.builds.$remove($scope.builds.$getRecord($scope.build.$id)).then(function() {
        root.child("builds").limitToLast(1).once("child_added", function(snap) {
          $state.go("show", {id: snap.key()});
        });
      });
    };

    $scope.rebuild = function() {
      root.child("pushes").push($scope.build.push);
    };
  })
  .controller("BuildsCtrl", function($scope, $firebase, root) {
    $scope.builds = $firebase(root.child("builds").limitToLast(25)).$asArray();
    $scope.pushes = $firebase(root.child("pushes")).$asArray();
    $scope.statusIcon = function(status) {
      switch (status) {
        case "running":
          return "ion-gear-b spin";
        case "success":
          return "ion-checkmark";
        case "failed":
          return "ion-alert-circled";
        default:
          return "ion-flash-off";
      }
    };
  })
  .filter('ansiHtml', function($sce) {
    return function(item) {
      var filter = new Filter();
      return $sce.trustAsHtml(filter.toHtml(item));
    };
  })
  .filter('reverse', function() {
    return function(items) {
      return items.slice().reverse();
    };
  })
  .filter("time", function() {
    return function(input) {
      input /= 1000
      var minutes, seconds, z;
      z = function(n) {
        return (n < 10 ? "0" : "") + n;
      };
      seconds = Math.floor(input % 60);
      minutes = Math.floor(input / 60);
      return z(minutes) + ":" + z(seconds);
    };
  })
  .directive('timer', function($compile, $interval) {
    return {
      restrict: "E",
      scope: {
        startTime: "="
      },
      controller: function($scope, $element) {
        $element.append($compile($element.contents())($scope));
        var updateTime = function() {
          $scope.time = (new Date).getTime() - $scope.startTime;
        };

        var timer = $interval(function() {
          updateTime();
        }, 1000);

        $element.bind('$destroy', function() {
          $interval.cancel(timer);
        });
      }
    }
  })
  .directive('autoscroll', function() {
    return {
      link: function(scope, element, attrs) {
        scope.$watch(function() {
          return element[0].scrollHeight;
        }, function(size) {
          element[0].scrollTop = size;
        });
      }
    }
  })
  .config(function($urlRouterProvider, $stateProvider) {
    $urlRouterProvider.otherwise("/builds");
    $stateProvider
      .state("index", {
        url: '/builds'
      })
      .state("show", {
        url: "/builds/:id",
        templateUrl: "templates/builds/show.html",
        controller: "BuildCtrl"
      })
  });
