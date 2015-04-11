/**
 * Created by William Muli on 3/21/2015.
 */
function drawForceLayout(dataset, profPics) {
    var width = 700;
    var height = 700;
    var colorScale = d3.scale.category20();
    var svg = d3.select("#forceLayout")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    var force = d3.layout.force()
        .nodes(dataset.nodes)
        .links(dataset.edges)
        .linkDistance(200)
        .charge([-500])
        .size([width, height])
        .start();
    var edges = svg.selectAll("line")
        .data(dataset.edges)
        .enter()
        .append("line")
        .style("stroke", "#ccc")
        .style("stroke-width", 1);

    var nodes = svg.selectAll(".node")
        .data(dataset.nodes)
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("name", function (d, i) {
            return dataset.nodes[i].name;
        })
        .call(force.drag)
        .on("click", function (d, i) {
            console.log(dataset.nodes[i].name);
        });

    nodes.append("image")
        .attr("xlink:href", function (d, i) {
            return profPics[i];
        })
        .attr("class", "images-profile")
        .attr("x", -8)
        .attr("y", -8)
        .attr("width", 20)
        .attr("height", 20);
    nodes.append("text")
        .attr("dx", 12)
        .attr("dy", ".35em")
        .attr("class", "label")
        .text(function (d, i) {
            return dataset.nodes[i].name;
        });

    force.on("tick", function () {
        edges.attr("x1", function (d) {
            return d.source.x;
        })
            .attr("y1", function (d) {
                return d.source.y;
            })
            .attr("x2", function (d) {
                return d.target.x;
            })
            .attr("y2", function (d) {
                return d.target.y;
            });
        nodes.attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
    });
}
function showStuff() {
    console.log(function (d, i) {
        return dataset.nodes[i].name;
    });
}

$.ajax({
    type: "GET",
    url: 'followers.json',
    dataType: 'JSON',
    error: function (error) {
        console.log("An error occurred" + error);
    },
    success: function (response) {
        var all_users = response.users;
        var nodes = userScreenNames(all_users);
        var source = 'muliswilliam';
        var obj = {"name": source};
        nodes.unshift(obj);
        console.log(nodes);
        var edges = createEdgesData(source, nodes);
        console.log(edges);
        var dataset = {
            nodes: nodes,
            edges: edges
        };
        var pics = userProfilePictures(all_users);
        pics.unshift("");
        console.log(pics);
        drawForceLayout(dataset, pics);
    }
});
function userScreenNames(users) {
    var nodes = [];
    users.forEach(
        function (user) {
            var obj = {"name": user.screen_name};
            nodes.push(obj);
        }

    );
    return nodes;
}
function userProfilePictures(users) {
    var profile_pics = [];
    users.forEach(
        function (user) {
            var pic = user.profile_image_url;
            profile_pics.push(pic);
        }
    );
    return profile_pics;
}
/*
 * Since the user node is the source for all the followers nodes,
 * we are going to set the source to that node and the target to
 * all the followers to produce an array of objects
 */
function createEdgesData(source, nodes) {
    var edges = [];
    nodes.forEach(function (node, i) {
        var obj = { source: 0, target: i};
        edges.push(obj);
    });

    return edges;
}