app.controller('menuCtrl', function ($scope, $http) {
    $http.get('data/cattle.json')
        .success(function (result) {
            response = angular.fromJson(result);
            var county_array = [];
            response.forEach(
                function (element) {
                    county_array.push(element.County);
                }
            );

            $scope.counties = unique(county_array);
            $scope.alphabets = 'abcdefghijklmnopqrstuvwxyz'.split('');
            $scope.letter = 'b'; //first letter of district to select
            $scope.changeLetter = function ($index) {
                $scope.letter = $scope.alphabets[$index];
            };

            drawChart(filterCattle(districtData(countiesData(response, "baringo"), "baringo")));
            drawDonutPie(countyStat(countiesData(response, "baringo")), countyStat2(countiesData(response, "baringo")), "baringo");

            $scope.updatePie = function ($event) {
                var county = $event.target.attributes.data.value;
                var county_data = countiesData(response, county);

                $("#pieChart").empty();
                drawDonutPie(countyStat(county_data), countyStat2(county_data), county_data);
            };
            $scope.itemClass = function (alphabet) {
                if (alphabet.active) {
                    return 'active-item';
                } else {
                    return 'inactive-item';
                }
            };

            var active_letters = getFirstLetter(unique(county_array));
            var results = [];
            $.each($scope.alphabets, function (i, item) {
                var obj = '';
                if ($.inArray(item.toUpperCase(), active_letters) != -1) {
                    obj = {
                        "item": item,
                        "active": true
                    };
                    results.push(obj);
                } else {
                    obj = {
                        "item": item,
                        "active": false
                    };
                    results.push(obj);
                }
            });
            console.log(results);
            $scope.alpha_data = results;
        })
        .error(function (error) {
            console.log('An error occurred' + error);
        });
});