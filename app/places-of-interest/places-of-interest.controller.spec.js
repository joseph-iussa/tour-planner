'use strict';

describe('placesOfInterest', function () {
    beforeEach(module('placesOfInterest'));

    describe('PlacesOfInterestController', function () {
        var $controller;
        var $rootScope;
        var mockPoiDataServiceResolvingSuccessfully;
        var scope;
        var controller;

        beforeEach(inject(function (_$controller_, _$rootScope_, $q) {
            $controller = _$controller_;
            $rootScope = _$rootScope_;
            mockPoiDataServiceResolvingSuccessfully = function (lat, lng, radius) {
                return $q.resolve([]);
            };
            scope = $rootScope.$new();
            controller = $controller('PlacesOfInterestController',
                { $scope: scope, fetchPlaceOfInterestData: mockPoiDataServiceResolvingSuccessfully });
        }));

        it('sets placesOfInterest to empty array on start-up', function () {
            expect(scope.placesOfInterest).toEqual([]);
        });

        it('sets poiDataFetchError to false on start-up', function () {
            expect(scope.poiDataFetchError).toEqual(false);
        });

        it('broadcasts "placeOfInterestRemoved" event when removePlaceOfInterest is called', function () {
            var poiToRemove = {};
            spyOn($rootScope, '$broadcast');

            scope.removePlaceOfInterest(poiToRemove);

            expect($rootScope.$broadcast).toHaveBeenCalledWith('placeOfInterestRemoved', poiToRemove);
        });

        it('responds to "placeOfInterestRemoved" event with non-existant poi by taking no action', function () {
            var nonExistantPoi = { prop1: '', prop2: '' };
            scope.placesOfInterest = ['foo', 'bar', 42];

            $rootScope.$broadcast('placeOfInterestRemoved', nonExistantPoi);

            expect(scope.placesOfInterest).toEqual(['foo', 'bar', 42]);
        });

        it('responds to "placeOfInterestRemoved" event by removing correct poi', function () {
            var removedPoi = { prop1: '', prop2: '' };
            scope.placesOfInterest = ['foo', 'bar', 42, removedPoi];

            $rootScope.$broadcast('placeOfInterestRemoved', removedPoi);

            expect(scope.placesOfInterest).not.toContain(removedPoi);
        });

        describe('"searchAreaSet" event handling', function () {
            var poisReturnedFromService = [{ prop: 1 }, { prop: 2 }, { prop: 3 }];
            var fakeSearchArea = { origin: { lat: 100, lng: 100 }, radius: 100 };
            var mockPoiDataServiceResolvingWithError;

            beforeEach(inject(function ($q) {
                mockPoiDataServiceResolvingSuccessfully = function (lat, lng, radius) {
                    return $q.resolve(poisReturnedFromService);
                };
                mockPoiDataServiceResolvingWithError = function (lat, lng, radius) {
                    return $q.reject('Failure Text');
                };
            }));

            it('responds to "searchAreaSet" event and successfully resolved poi service call by ' +
                'setting placesOfInterest array to pois returned from service', function () {
                controller = $controller('PlacesOfInterestController',
                    { $scope: scope, fetchPlaceOfInterestData: mockPoiDataServiceResolvingSuccessfully });

                $rootScope.$broadcast('searchAreaSet', fakeSearchArea);
                $rootScope.$apply();

                expect(scope.placesOfInterest).toEqual(poisReturnedFromService);
            });

            it('responds to "searchAreaSet" event and successfully resolved poi service call by ' +
                'setting poiDataFetchError to false', function () {
                controller = $controller('PlacesOfInterestController',
                    { $scope: scope, fetchPlaceOfInterestData: mockPoiDataServiceResolvingSuccessfully });

                $rootScope.$broadcast('searchAreaSet', fakeSearchArea);
                $rootScope.$apply();

                expect(scope.poiDataFetchError).toEqual(false);
            });

            it('responds to "searchAreaSet" event and failed poi service call by ' +
                'setting placesOfInterest to empty array', function () {
                controller = $controller('PlacesOfInterestController',
                    { $scope: scope, fetchPlaceOfInterestData: mockPoiDataServiceResolvingWithError });

                $rootScope.$broadcast('searchAreaSet', fakeSearchArea);
                $rootScope.$apply();

                expect(scope.placesOfInterest).toEqual([]);
            });

            it('responds to "searchAreaSet" event and failed poi service call by ' +
                'setting poiDataFetchError to true', function () {
                controller = $controller('PlacesOfInterestController',
                    { $scope: scope, fetchPlaceOfInterestData: mockPoiDataServiceResolvingWithError });

                $rootScope.$broadcast('searchAreaSet', fakeSearchArea);
                $rootScope.$apply();

                expect(scope.poiDataFetchError).toEqual(true);
            });

            it('responds to "searchAreaSet" event by raising "placesOfInterestUpdated" event '
                + 'with current placesOfInterest attached', function () {
                controller = $controller('PlacesOfInterestController',
                    { $scope: scope, fetchPlaceOfInterestData: mockPoiDataServiceResolvingSuccessfully });
                // Can't spy on $rootScope.$broadcast because we're using it to fire an event, so
                // have to do this.
                var eventFired = false;
                scope.$on('placesOfInterestUpdated', function (e, pois) {
                    if (isEqual(scope.placesOfInterest, pois)) {
                        eventFired = true;
                    }
                });

                $rootScope.$broadcast('searchAreaSet', fakeSearchArea);
                $rootScope.$apply();

                expect(eventFired).toEqual(true);
            });
        });

        it('responds to "searchAreaCleared" event by setting placesOfInterest to '
            + 'empty array', function () {
            scope.placesOfInterest = ['foo'];

            $rootScope.$broadcast('searchAreaCleared');

            expect(scope.placesOfInterest).toEqual([]);
        });

        it('responds to "searchAreaCleared" event by raising placesOfInterestUpdated event', function () {
            var eventFired = false;
            scope.$on('placesOfInterestUpdated', function (e, pois) {
                if (isEqual(scope.placesOfInterest, pois)) {
                    eventFired = true;
                }
            });

            $rootScope.$broadcast('searchAreaCleared');

            expect(eventFired).toEqual(true);
        });
    });
});