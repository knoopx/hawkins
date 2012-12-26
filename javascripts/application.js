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
    $scope.buildDuration = function(build) {
      var now = (new Date).getTime();
      return ((build.finishedAt ? build.finishedAt : now) - build.startedAt);
    };
    $scope.statusIcon = function(status) {
      switch (status) {
        case "running":
          return "ion-gear-b";
        case "success":
          return "ion-checkmark";
        case "failed":
          return "ion-alert-circled";
        default:
          return "ion-flash-off";
      }
    };
  })
  .filter('formatLog', function($sce) {
    return function(items) {
      var filter = new Filter();
      return $sce.trustAsHtml(filter.toHtml(items.map(function(item) {
        return item.$value
      }).join("")));
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
  .directive('time', function($interval, $filter) {
    return {
      scope: {
        time: "="
      },
      link: function(scope, element, attrs) {
        var filter = $filter('time');
        var timer;

        scope.$watch("time", function(time) {
          if (time) {
            element.text(filter(time));
            if (timer) $interval.cancel(timer);
            timer = $interval(function() {
              element.text(filter(time));
            }, 1000);
            element.bind('$destroy', function() {
              $interval.cancel(timer);
            });
          }
        });
      }
    }
  })
  .directive('autoscroll', function() {
    return {
      link: function(scope, element, attrs) {
        scope.$watch(function() {
          return element[0].scrollHeight
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
