/**
 * Created by William Muli on 3/21/2015.
 */
$.ajax({
    url: "cattle.txt",
    type: "GET",
    dataType: "text",
    error: function (error) {
        console.log("An error occurred " + error.toString());
    },
    success: function (text) {
        var response = $.parseJSON(text);
        var county_array = [];
        response.forEach(
            function (element) {
                county_array.push(element.County);
            }
        );
        var unique_counties = unique(county_array);
        $scope.countries = unique_counties;
        unique_counties.sort();
        console.log("Number of counties " + unique_counties.length);
        var output = "<ul>Show Counties";
        unique_counties.forEach(
            function (element) {
                output = output + "<li>" + element + "</li>";
            }
        );
        output += "</ul>";

        drawChart(filterCattle(districtData(countiesData(response, "baringo"), "baringo")));
        drawDonutPie(countyStat(countiesData(response, "baringo")), countyStat2(countiesData(response, "baringo")), "baringo");
        $("#menu").append(output);
        $("#menu ul li").click(function () {

            console.log($(this).text());
            var county = $(this).text();
            var county_data = countiesData(response, county);
            console.log(county_data);
            $("#pieChart").empty();
            drawDonutPie(countyStat(county_data), countyStat2(county_data), county_data, county);
            /* updateChart(filterCattle(districtData(county_data, text[i])), color(i), text[i]);
             updateChart()*/
        });


        /*
         *to generate data for drawing the bar graph,
         * we must call two functions
         * 1. districtData function using county data and the district
         * 2. filterCattle using the return value of the above data
         *  the return value of filterCattle can be used
         */



    }
});
