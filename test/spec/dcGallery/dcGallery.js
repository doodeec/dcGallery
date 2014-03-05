'use strict';

describe('Gallery:: dcGallery', function () {

    beforeEach(module('dc-gallery'));

    var template = '<div dc-gallery images="images"></div>';

    var $rootScope,
        element,
        scope;

    beforeEach(inject(function ($injector) {
        $rootScope = $injector.get('$rootScope');

        var $compile = $injector.get('$compile');
        scope = $rootScope.$new();

        scope.images = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

        element = angular.element(template);
        $compile(element)(scope);
    }));

    it('should be defined', function () {
        scope.$digest();
        expect(element).toBeDefined(true);
    });

    it('should have 18 children + 2 more elements', function () {
        scope.$digest();
        expect(element.children().length).toBe(20);
    });
});
