'use strict';

angular.module('dc-gallery', [])
    .directive('dcGallery', function ($q, $timeout, $window) {
        //jqLite offset polyfill
        function offset(elm) {
            try {
                return elm.offset();
            } catch (e) {
                var body = document.documentElement || document.body,
                    scrollX = window.pageXOffset || body.scrollLeft,
                    scrollY = window.pageYOffset || body.scrollTop;
                return {
                    left: elm.getBoundingClientRect().left + scrollX,
                    top: elm.getBoundingClientRect().top + scrollY
                };
            }
        }

        return {
            restrict: 'EA',
            replace: true,
            scope: {
                images: "="
            },
            template: '<div class="dc-gallery">' +
                '<dc-image ng-repeat="img in images" dc-image-url="{{ img }}"></dc-image>' +
                '<div class="backdrop" ng-click="cancelFullscreen()" ng-show="fsLoaded"></div>' +
                '<div class="fullscreenWrapper" ng-click="cancelFullscreen()"' +
                'ng-class="{revealed: fsLoaded, shown: fsShow}"' +
                'ng-style="{\'-webkit-transform\': \'translate(\'+fswPos.left+\'px,\'+fswPos.top+\'px)\',' +
                '\'transform\': \'translate(\'+fswPos.left+\'px,\'+fswPos.top+\'px)\',' +
                'width: fswSz.width+\'px\', height: fswSz.height+\'px\'}">' +
                '<img ng-src="{{ fsUrl }}" ng-class="{opaque: !fsLoaded}"/>' +
                '</div>' +
                '</div>',
            compile: function (tElem, tAttrs) {
                function toFullscreen(imgUrl) {
                    var defer = $q.defer(),
                        img = new Image(),
                        resolveObj = {height: 0, width: 0};

                    img.addEventListener('load', function () {
                        if ($window.innerWidth / img.width > $window.innerHeight / img.height) {
                            resolveObj.height = $window.innerHeight;
                            resolveObj.width = img.width / (img.height / $window.innerHeight);
                        } else {
                            resolveObj.width = $window.innerWidth;
                            resolveObj.height = img.height / (img.width / $window.innerWidth);
                        }
                        defer.resolve(resolveObj);
                    });
                    img.src = imgUrl;
                    return defer.promise;
                }

                return function (scope, elem, attrs) {
                    scope.toFullscreen = function (url, target) {
                        var imageUrl = url.replace('thumb/', '');
                        scope.fsUrl = url;
                        scope.fswPos = offset(target);
                        scope.fsShow = true;

                        toFullscreen(imageUrl).then(function (size) {
                            scope.fswSz = size;
                            scope.fsUrl = imageUrl;
                            scope.fsLoaded = true;
                        });
                    };
                    scope.cancelFullscreen = function () {
                        scope.fsLoaded = false;
                        scope.fswSz = {};
                        $timeout(function () {
                            scope.fsShow = false;
                        }, 250);
                    };
                }
            }
        }
    })
    .directive('dcImage', function () {
        return {
            restrict: 'EA',
            replace: true,
            template: '<div class="dc-image" ng-class="{loaded: loaded}" ng-click="toFullscreen(imageUrl,$event.target)">' +
                '<img ng-src="{{ imageUrl }}" ng-class="{revealed: loaded}" />' +
                '</div>',
            scope: true,
            link: function (scope, elem, attrs) {
                var url = attrs.dcImageUrl || null;

                if (url) {
                    url = scope.imageUrl = 'images/thumb/' + url + '.jpg';
                    var img = new Image();
                    img.onload = function () {
                        scope.$apply(function () {
                            scope.loaded = true;
                        });
                    };
                    img.src = url;
                }
            }
        }
    });