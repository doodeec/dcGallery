'use strict';

angular.module('dc-gallery', [])
    .directive('dcGallery', function ($q, $timeout) {
        //jqLite offset polyfill
        function offset(elm) {
            try {
                return elm.offset();
            } catch (e) {
            }
            var _x = 0;
            var _y = 0;
            var body = document.documentElement || document.body;
            var scrollX = window.pageXOffset || body.scrollLeft;
            var scrollY = window.pageYOffset || body.scrollTop;
            _x = elm.getBoundingClientRect().left + scrollX;
            _y = elm.getBoundingClientRect().top + scrollY;
            return { left: _x, top: _y };
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
                'ng-style="{left: fswPos.left+\'px\', top: fswPos.top+\'px\'}">' +
                '<img ng-src="{{ fsUrl }}" ng-class="{opaque: !fsLoaded}"/>' +
                '</div>' +
                '</div>',
            compile: function (tElem, tAttrs) {
                function toFullscreen(imgUrl) {
                    var defer = $q.defer(),
                        img = new Image();

                    img.addEventListener('load', defer.resolve);
                    img.src = imgUrl;
                    return defer.promise;
                }

                return function (scope, elem, attrs) {
                    scope.toFullscreen = function (url, target) {
                        var imageUrl = url.replace('thumb/', '');
                        scope.fsUrl = url;
                        scope.fswPos = offset(target);
                        scope.fsShow = true;

                        toFullscreen(imageUrl).then(function () {
                            scope.fsUrl = imageUrl;
                            scope.fsLoaded = true;
                        });
                    };
                    scope.cancelFullscreen = function () {
                        scope.fsLoaded = false;
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
            template: '<div class="dc-image" ng-click="toFullscreen(imageUrl,$event.target)">' +
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