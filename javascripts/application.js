angular.module("hawkins", ["ionic", "firebase", "chart.js"])
  .constant("root", new Firebase("https://hawkins.firebaseio.com"))
  .filter('ansiHtml', function($sce) {
    return function(item) {
      var filter = new Filter();
      return $sce.trustAsHtml(filter.toHtml(item));
    };
  })
  .filter('reverse', function() {
    return function(items) {
      return items && items.slice().reverse();
    };
  })
  .filter('branch', function() {
    return function(item) {
      return item && item.replace(/^refs\/heads\//, "");
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
  .directive('autoscroll', function() {
    return {
      link: function(scope, element, attrs) {
        var autoScroll = true;

        element.on("scroll", function() {
          autoScroll = element[0].scrollTop + element[0].clientHeight == element[0].scrollHeight;
        });

        scope.$watch(function() {
          return element[0].scrollHeight;
        }, function(scrollHeight) {
          if (autoScroll) {
            element[0].scrollTop = scrollHeight;
          }
        });
      }
    };
  })
  .config(function($locationProvider, $urlRouterProvider, $stateProvider) {
    $locationProvider.html5Mode({enabled: true, requireBase: false});
    $stateProvider
      .state("show", {
        url: "/builds/:id",
        templateUrl: "/templates/builds/show.html",
        controller: function($scope, $firebase, root, $state, $stateParams, $interval, $ionicModal, $document) {
          $scope.build = $firebase(root.child("builds").child($stateParams.id)).$asObject();
          $scope.log = $firebase(root.child("logs").child($stateParams.id)).$asArray();
          $scope.examples = $firebase(root.child("examples").child($stateParams.id)).$asArray();
          $scope.example_groups = $firebase(root.child("example_groups").child($stateParams.id)).$asArray();

          var timer = $interval(function() {
            if ($scope.build.finishedAt) {
              $interval.cancel(timer);
              $scope.duration = $scope.build.finishedAt - $scope.build.startedAt;
            } else {
              $scope.duration = (new Date).getTime() - $scope.build.startedAt;
            }
          }, 1000);

          $scope.$on('$destroy', function() {
            $interval.cancel(timer);
          });

          $scope.rebuild = function() {
            root.child("pushes").push($scope.build.push);
          };

          $scope.githubFileUrl = function(location) {
            return ["https://github.com", $scope.build.push.repository.full_name, "blob", $scope.build.push.head_commit.id, location.replace(/^\.\//, "").replace(/:(\d+)/, "#L$1")].join("/")
          };

          $scope.showCapture = function(example) {
            var modalScope = $scope.$new(true);
            $ionicModal.fromTemplateUrl("show-capture-modal.html", {
              scope: modalScope,
              animation: 'fade-in'
            }).then(function(modal) {
              modalScope.example = example;
              removeModal = function() {
                modal.remove();
              };
              $scope.$on('$destroy', removeModal);
              $document.on("keydown", function() {
                $document.off("keydown", this);
                removeModal();
              });
              modal.show();
            });
          };
        }
      })
      .state("index", {
        url: '/builds',
        templateUrl: "/templates/builds/index.html",
        controller: function($scope, $filter) {
          $scope.builds.$loaded().then(function(builds) {
            $scope.labels = [];
            $scope.series = ["Duration"];
            $scope.data = [[]];

            builds.forEach(function(build) {
              if (build.finishedAt && build.startedAt) {
                $scope.labels.push($filter("branch")(build.push.ref));
                $scope.data[0].push(Math.round((build.finishedAt - build.startedAt) / 1000 / 60));
              }
            });
          });
        }
      });
    $urlRouterProvider.otherwise("/builds");
  })
  .run(function($rootScope, $firebase, root, $state) {
    $rootScope.builds = $firebase(root.child("builds").limitToLast(50)).$asArray();
    $rootScope.pushes = $firebase(root.child("pushes")).$asArray();

    $rootScope.remove = function(build) {
      $rootScope.builds.$remove($rootScope.builds.$getRecord(build.$id)).then(function() {
        root.child("builds").limitToLast(1).once("child_added", function(snap) {
          $state.go("show", {id: snap.key()});
        });
      });
    };

    $rootScope.removePush = function(push) {
      $rootScope.pushes.$remove($rootScope.pushes.$getRecord(push.$id));
    };

    $rootScope.statusIcon = function(status) {
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
  });
