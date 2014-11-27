angular.module("hawkins", ["ionic", "firebase"])
  .constant("root", new Firebase("https://hawkins.firebaseio.com"))
  .controller("BuildCtrl", function($scope, $firebase, root, $state, $stateParams) {
    $scope.build = $firebase(root.child("builds").child($stateParams.id)).$asObject();
    $scope.log = $firebase(root.child("logs").child($stateParams.id)).$asArray();
    $scope.examples = $firebase(root.child("examples").child($stateParams.id)).$asArray();
    $scope.example_groups = $firebase(root.child("example_groups").child($stateParams.id)).$asArray();

    $scope.rebuild = function() {
      root.child("pushes").push($scope.build.push);
    };

    $scope.githubFileUrl = function(location) {
      return ["https://github.com", $scope.build.push.repository.full_name, "blob", $scope.build.push.head_commit.id, location.replace(/^\.\//, "").replace(/:(\d+)/, "#L$1")].join("/")
    }
  })
  .controller("BuildsCtrl", function($scope, $state, $firebase, root) {
    $scope.builds = $firebase(root.child("builds").limitToLast(25)).$asArray();
    $scope.pushes = $firebase(root.child("pushes")).$asArray();

    $scope.remove = function(build) {
      $scope.builds.$remove($scope.builds.$getRecord(build.$id)).then(function() {
        root.child("builds").limitToLast(1).once("child_added", function(snap) {
          $state.go("show", {id: snap.key()});
        });
      });
    };

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
  .filter('branch', function() {
    return function(item) {
      return item && item.replace(/^refs\/heads\//, "")
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
  .config(function($locationProvider, $urlRouterProvider, $stateProvider) {
    $locationProvider.html5Mode({enabled: true, requireBase: false});
    $urlRouterProvider.otherwise("/builds");
    $stateProvider
      .state("index", {
        url: '/builds'
      })
      .state("show", {
        url: "/builds/:id",
        templateUrl: "/templates/builds/show.html",
        controller: "BuildCtrl"
      })
  });
