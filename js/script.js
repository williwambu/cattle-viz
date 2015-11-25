var response = '';
var app = angular.module('app', []);

$(document).ready(function() {
    $('.menu-top').click(function(e) {
        console.log('clicked');
        e.preventDefault();
        $(this).addClass('active-item');
    });
});

app.controller('menuCtrl', function($scope, $http) {
    $http.get('data/cattle.json')
        .success(function(result) {
            response = angular.fromJson(result);
            var county_array = [];
            response.forEach(
                function(element) {
                    county_array.push(element.County);
                }
            );

            $scope.counties = unique(county_array);
            $scope.alphabets = 'abcdefghijklmnopqrstuvwxyz'.split('');
            $scope.letter = 'b';
            $scope.changeLetter = function($index) {
                $scope.letter = $scope.alphabets[$index];
            };

            drawChart(filterCattle(districtData(countiesData(response, "baringo"), "baringo")));
            drawDonutPie(countyStat(countiesData(response, "baringo")), countyStat2(countiesData(response, "baringo")), "baringo");

            $scope.updatePie = function($event) {
                console.log($event);
                console.log($event.target.attributes.data);
                var county = $event.target.attributes.data.value;
                var county_data = countiesData(response, county);
                console.log(county_data);
                $("#pieChart").empty();
                drawDonutPie(countyStat(county_data), countyStat2(county_data), county_data, county);
            };
            $scope.itemClass = function(alphabet) {
                if (alphabet.active) {
                    return 'active-item';
                } else {
                    return 'inactive-item';
                }
            };

            var active_letters = getFirstLetter(unique(county_array));
            var results = [];
            $.each($scope.alphabets, function(i, item) {
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
        .error(function(error) {
            console.log('An error occurred' + error);
        });
});

/* starts with letter filter */
app.filter('startsWithLetter', function() {
    return function(counties, letter) {
        var filtered = [];

        var letterMatch = new RegExp(letter, 'i');

        for (var i = 0; i < counties.length; i++) {

            var item = counties[i];
            if (letterMatch.test(item.substring(0, 1))) {
                filtered.push(item);
            }
        }

        return filtered;
    }
});

//get the first letter of county -- to be used to create alphabet menu
function startsWith(counties, letter) {
    var filtered = [];
    var letterMatch = new RegExp(letter, 'i');
    for (var i = 0; i < counties.length; i++) {
        var item = counties[i];
        if (letterMatch.test(item.substring(0, 1))) {
            filtered.push(item);
        }
    }

    return filtered;
}


app.filter('zeroCounties', function() {
    return function(counties, letter) {
        if (startsWith(counties, letter) == 0) {
            return false;
        }
        return true;
    }
});

/*
 * function to filter data based on county
 * @param data are contents of cattle.json
 * @param county is the county we want to analyse
 */
function countiesData(data, county) {
        var county_data = [];
        data.forEach(function(element) {
            if (element.County.toLowerCase() === county.toLowerCase()) {
                county_data.push(element);
            }
        });

        return county_data;
    }
    /*
     * function to filter a counties data on basis of district
     * @param data is value returned from calling
     * countiesData() function
     */
function districtData(data, district) {
    var district_data = [];
    data.forEach(
        function(element) {

            if (element.District.toLowerCase() === district.toLowerCase()) {
                district_data = element;
            }

        }
    );

    return district_data;
}

function allCountyDistricts(data) {
        var district_data = [];
        data.forEach(
            function(element) {
                district_data.push(element);
            }
        );

        return district_data;
    }
    /*
     * create an array to use for the
     * pie chart (Donut Chart)
     * @param data is value returned by districtData function above
     */
function filterCattle(data) {
        var final = [{
            "category": "cattle",
            measure: data["Cattle"]
        }, {
            "category": "sheep",
            measure: data["Sheep"]
        }, {
            "category": "goats",
            measure: data["Goats"]
        }, {
            "category": "camels",
            measure: data["Camels"]
        }, {
            "category": "donkeys",
            measure: data["Donkeys"]
        }, {
            "category": "pigs",
            measure: data["Pigs"]
        }, {
            "category": "i. chicken",
            measure: data["Indigenous Chicken"]
        }, {
            "category": "c. chicken",
            measure: data["Chicken Commercial"]
        }, {
            "category": "bee hives",
            measure: data["Bee Hives"]
        }];

        return final;
    }
    /*
     * calculates the total animals in a district
     */
function calculateTotal(data) {
        var total = 0;
        data.forEach(function(element) {
            total = total + parseInt(element.measure);
        });

        return total;
    }
    /*
     * returns an array of objects with district name and totals for each district
     */
function countyStat(countyData) {
    var final_array = [];
    countyData.forEach(function(district) {
        var a_district = filterCattle(district);
        var total = calculateTotal(a_district);
        final_array.push(total);
    });
    return final_array;
}

function countyStat2(countyData) {
    var final_array = [];
    countyData.forEach(function(district) {
        final_array.push(district.District);
    });
    return final_array;
}

/**
 * @param data county data for drawing the graph
 */
function drawChart(data) {

    //var data = [4, 8, 15, 16, 23, 42, 63,56,30 ,76];
    //  var chart = d3.select(".chart");
    //var margin
    var width = 620;
    var bottom_height = 15;
    var margin = 10;
    var height = 400 - (2 * margin);
    var padding = 5;
    var color = d3.scale.category10();

    //setting the x axis scale
    var xScale = d3.scale.linear()
        .domain([0, data.length])
        .range([0, width]);

    // setting the y axis scale
    var yScale = d3.scale.linear()
        .range([height, 0])
        .domain([0, d3.max(data, function(d) {
            return d.measure;
        })]);

    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height + bottom_height + 10); // add 10 to give space for the labels

    var bars = svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", function(d, i) {
            return xScale(i);
        })
        .attr("y", function(d) {
            return yScale(d.measure);
        })
        .attr("width", width / data.length - padding)
        .attr("height", function(d) {
            return height - yScale(d.measure);
        })
        .attr("fill", function(d, i) {
            return color(i);
        })
        .attr("class", "rect")
        .on("mouseover", function(d) {
            var xPosition = parseFloat(d3.select(this).attr("x") + 50);
            var yPosition = parseFloat(d3.select(this).attr("y")) + 15;
            //Create the tooltip label
            svg.append("text")
                .attr("id", "tooltip")
                .attr("x", xPosition)
                .attr("y", yPosition)
                .attr("text-anchor", "middle")
                .attr("font-family", "Helvetica,Arial,sans-serif")
                .attr("font-size", "12px")
                .attr("font-weight", 400)
                .attr("fill", "black")
                .text(d.category + ": " + d.measure);
        })
        .on("mouseout", function() {
            //Remove the tooltip
            d3.select("#tooltip").remove();
        });

    svg.append("g")
        .selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .text(function(d) {
            return d.category.toLowerCase();
        })
        .attr("x", function(d, i) {
            return (i * (width / data.length)) + 35;
        })
        .attr("y", height + bottom_height)
        .attr("class", "bar-label")
        .attr("text-anchor", "middle")
        .attr("font-family", "Helvetica,Arial,sans-serif")
        .attr("font-size", "13px")
        .attr("font-weight", 400)
        .attr("fill", function(d, i) {
            return color(i);
        });


    svg.selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .text(function(d) {
            return d.measure;
        })
        .attr("x", function(d, i) {
            return i * (width / data.length);
        })
        .attr("y", function(d) {
            return height - yScale(d.measure) - 5;
        })

    .attr("class", "text");

    // .attr("text-anchor" , "middle")
    bars.selectAll("text").attr("transform", "rotate(90)");
    svg.
    append("text")
        .attr("id", "title")
        .attr("x", width / 2 - 30)
        .attr("y", margin + 10)
        .text("");
}

function updateChart(data, color, district) {
    var width = 620;
    var bottom_height = 10;
    var margin = 10;
    var height = 400 - (2 * margin);
    var padding = 5;
    var colorScale = d3.scale.category10();

    //setting the x axis scale
    var xScale = d3.scale.linear()
        .domain([0, data.length])
        .range([0, width]);

    // setting the y axis scale
    var yScale = d3.scale.linear()
        .range([height, 30])
        .domain([0, d3.max(data, function(d) {
            return d.measure;
        })]);

    var svg = d3.select("#chart")
        .attr("width", width)
        .attr("height", height + bottom_height + 10); // add 10 to give space for the labels

    var bars = svg.selectAll("rect")
        .data(data)
        .transition().duration(1500)
        .attr("x", function(d, i) {
            return xScale(i);
        })
        .attr("y", function(d) {
            return yScale(d.measure);
        })
        .attr("width", width / data.length - padding)
        .attr("height", function(d) {
            return height - yScale(d.measure);
        })
        .attr("fill", function(d, i) {
            return colorScale(i);
        })
        .attr("class", "rect");
    d3.select("#title").text(district);
}

function drawDonutPie(data, text, county_data, county) {
        var margin = 20;
        var height = 400 - margin,
            width = 400,
            radius = 200;

        var color = d3.scale.category20();

        var pie = d3.layout.pie();

        var arc = d3.svg.arc()
            .innerRadius(radius - 150)
            .outerRadius(radius - 20);
        var arcFinal = d3.svg.arc()
            .innerRadius(radius - 130)
            .outerRadius(radius - 50);

        var svg = d3.select("#pieChart")
            .append("svg")
            .attr("height", height)
            .attr("width", width)
            .append("g") // create a group of svg elements
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        var path = svg.selectAll("path")
            .data(pie(data))
            .enter()
            .append("g")
            .attr("class", "slice")
            .append("path")
            .attr("fill", function(d, i) {
                return color(i);
            })
            .attr("d", arc)
            .on("mouseover", function() {
                $(this).attr('fill', 'blue');
            })
            .on("mouseout", function(d, i) {
                $(this).attr("fill", function() {
                    return color(i)
                });
            });

        var slice = d3.selectAll("g.slice")
            .on("mouseover", function(d, i) {
                $(this).attr("fill", "blue");
                $(this).attr('color', 'white');
                updateChart(filterCattle(districtData(county_data, text[i])), color(i), text[i]);
            })
            .on("mouseout", function(d, i) {
                $(this).attr("opacity", 1);
            });


        slice.append("g")
            .attr("class", "label")
            .append("text")
            .attr("transform", function(d) {
                return "translate(" + arc.centroid(d) + ")rotate(" + angle(d, -90, 90) + ")";
            })
            .attr("text-anchor", "middle")
            .text(function(d, i) {
                return text[i];
            })
            .attr("font-family", "Helvetica,Arial,sans-serif")
            .attr("font-size", "16px")
            .attr("font-weight", 600)
            .attr("fill", "black");
        // function to rotate the text
        function angle(d, offset, threshold) {
            var a = (d.startAngle + d.endAngle) * 90 / Math.PI + offset;
            return a > threshold ? a - 180 : a;
        }

    }
    /*
     * Return a unique array of elements
     * Intended to filter redundant data from cattle.json
     * and avoid duplicates in the menu list
     */
function unique(list) {
    var result = [];
    $.each(list, function(i, e) {
        if ($.inArray(e, result) == -1) result.push(e);
    });
    return result;
}

/*
 * function to find the duplicates in
 * an array
 */
function findDuplicates(array) {
    var duplicate_count = 0;
    for (var i = 0; i < array.length; i++) {
        for (var j = 1; j < array.length - 1; j++) {
            if (array[i] == array[j]) {
                console.log(array[j]);
                duplicate_count++;
            }
        }
    }
    return duplicate_count;
}

function getText() {
    $.ajax({
        url: "cattle.txt",
        type: "GET",
        data: "text",
        error: function(error) {
            console.log(error);
        },
        success: function(response) {
            console.log($.parseJSON(response));
        }
    });
}
getText();

function getFirstLetter(names) {
    var letters = [];
    console.log(names);
    $.each(names, function(i, name) {
        var letter = name.substring(0, 1);
        letters.push(letter);
    });

    return unique(letters);
}
