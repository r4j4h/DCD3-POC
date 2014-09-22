var referralData;
var dimensionData;

//        var referralData = [
//            {date: "2013-04-01", typeId: 1, sourceId: 11, facilityId: 111, referralCount: 10, active_patients: 7, discharged_patients: 2, not_yet_seen: 1, shrinkage: 10.00},
//            {date: "2013-04-01", typeId: 1, sourceId: 22, facilityId: 111, referralCount: 20, active_patients: 14, discharged_patients: 4, not_yet_seen: 2, shrinkage: 20.00},
//            {date: "2013-04-01", typeId: 1, sourceId: 33, facilityId: 111, referralCount: 30, active_patients: 21, discharged_patients: 6, not_yet_seen: 3, shrinkage: 30.00},
//            {date: "2013-04-01", typeId: 2, sourceId: 111, facilityId: 111, referralCount: 15, active_patients: 2, discharged_patients: 7, not_yet_seen: 6, shrinkage: 15.00},
//            {date: "2013-04-01", typeId: 2, sourceId: 222, facilityId: 111, referralCount: 25, active_patients: 4, discharged_patients: 14, not_yet_seen: 7, shrinkage: 25.00},
//            {date: "2013-04-01", typeId: 2, sourceId: 333, facilityId: 111, referralCount: 35, active_patients: 6, discharged_patients: 21, not_yet_seen: 8, shrinkage: 35.00},
//            {date: "2013-05-01", typeId: 1, sourceId: 1111, facilityId: 222, referralCount: 11, active_patients: 8, discharged_patients: 2, not_yet_seen: 1, shrinkage: 10.00},
//            {date: "2013-05-01", typeId: 1, sourceId: 22, facilityId: 111, referralCount: 20, active_patients: 14, discharged_patients: 4, not_yet_seen: 2, shrinkage: 20.00},
//            {date: "2013-05-01", typeId: 1, sourceId: 33, facilityId: 111, referralCount: 30, active_patients: 21, discharged_patients: 6, not_yet_seen: 3, shrinkage: 30.00},
//            {date: "2013-05-01", typeId: 2, sourceId: 11111, facilityId: 222, referralCount: 16, active_patients: 3, discharged_patients: 7, not_yet_seen: 6, shrinkage: 16.00},
//            {date: "2013-05-01", typeId: 2, sourceId: 22222, facilityId: 222, referralCount: 26, active_patients: 5, discharged_patients: 14, not_yet_seen: 7, shrinkage: 26.00},
//            {date: "2013-05-01", typeId: 2, sourceId: 33333, facilityId: 222, referralCount: 36, active_patients: 7, discharged_patients: 21, not_yet_seen: 8, shrinkage: 36.00}
//        ];

function print_filter(filter) {
    var f = eval(filter);
    if (typeof(f.length) != "undefined") {
    } else {
    }
    if (typeof(f.top) != "undefined") {
        f = f.top(Infinity);
    } else {
    }
    if (typeof(f.dimension) != "undefined") {
        f = f.dimension(function (d) {
            return "";
        }).top(Infinity);
    } else {
    }
    console.log(filter + "(" + f.length + ") = " + JSON.stringify(f).replace("[", "[\n\t").replace(/}\,/g, "},\n\t").replace("]", "\n]"));
}

function loadJSON(url, callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', url, true);
//            xobj.open('GET', 'data/referral-query-results.json', true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}

function initDimensions(response) {
    // Parse JSON string into object
    dimensionData = JSON.parse(response);
//    console.log(dimensionData);
    loadJSON('data/referral-query-results.json', render);
}

function dataTranslation(dimensionData, referralData) {
    console.log(referralData.length);

    for (var i=0; i<referralData.length; i++) {
        var theDate = new Date(referralData[i].date);
console.log(theDate);
        var dd = theDate.getDay();
        var mm = theDate.getMonth() + 1;
        var yy = theDate.getFullYear();
        referralData[i].date = yy + '-' + mm + '-' + dd;
console.log(referralData[i].date);

        console.log(referralData[i].facilityId);
        for (var j=0; j<dimensionData.data["facilities"].length; j++) {
            if (dimensionData.data["facilities"][j].id == referralData[i].facilityId) {
                referralData[i].facilityName = dimensionData.data["facilities"][j].name;
                console.log(dimensionData.data["facilities"][j].name);
                break;
            }
        }

        for (var j=0; j<dimensionData.data["referralTypes"].length; j++) {
            if (dimensionData.data["referralTypes"][j].id == referralData[i].typeId) {
                referralData[i].referralTypeName = dimensionData.data["referralTypes"][j].name;
                console.log(dimensionData.data["referralTypes"][j].name);
                break;
            }
        }

        for (var j=0; j<dimensionData.data["referralSources"].length; j++) {
            if (dimensionData.data["referralSources"][j].id == referralData[i].sourceId) {
                referralData[i].referralSourceName = dimensionData.data["referralSources"][j].name;
                console.log(dimensionData.data["referralSources"][j].name);
                break;
            }
        }
    }
}

function render(response) {
    // Parse JSON string into object
    referralData = JSON.parse(response);
//    console.log(referralData);

    dataTranslation(dimensionData, referralData);

    var ndx = crossfilter(referralData);

//            var parseDate = d3.time.format("%m/%d/%Y").parse;
//            var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%SZ");

    referralData.forEach(function (d) {
        d.orderByDate =  d.date;
        d.date = d3.time.format("%Y-%m-%d").parse(d.date);
    });

    print_filter("referralData");

    var dateDim = ndx.dimension(function (d) {
        return d.date;
    });
    var clinicDim = ndx.dimension(function (d) {
        return d.facilityName
    });
    var clinicTotal = clinicDim.group().reduceSum(dc.pluck('referralCount'));
    var sourceActivePatients = dateDim.group().reduceSum(function (d) {
        return d.active_patients;
    });
    var sourceDischargedPatients = dateDim.group().reduceSum(function (d) {
        return d.discharged_patients;
    });
    var sourceNotYetSeen = dateDim.group().reduceSum(function (d) {
        return d.not_yet_seen;
    });

    var typeDim = ndx.dimension(function (d) {
        return d.referralTypeName
    });
    var typeTotal = typeDim.group().reduceSum(dc.pluck('referralCount'));

    var sourceDim = ndx.dimension(function (d) {
        return d.referralSourceName
    });
    var sourceTotal = sourceDim.group().reduceSum(dc.pluck('referralCount'));

    console.log(dateDim.bottom(1)[0].date);
    console.log(dateDim.top(1)[0].date);
    var minDate = d3.time.month.offset(dateDim.bottom(1)[0].date, -1);
    var maxDate = d3.time.month.offset(dateDim.top(1)[0].date, 1);
    console.log(minDate);
    console.log(maxDate);

    var clinicPieChart = dc.pieChart("#chart-pie-clinic");
    clinicPieChart
        .width(150).height(150)
        .dimension(clinicDim)
        .group(clinicTotal)
        .innerRadius(0);

    var typePieChart = dc.pieChart("#chart-pie-type");
    typePieChart
        .width(150).height(150)
        .dimension(typeDim)
        .group(typeTotal)
        .innerRadius(0);

    var sourcePieChart = dc.pieChart("#chart-pie-source");
    sourcePieChart
        .width(150).height(150)
        .dimension(sourceDim)
        .group(sourceTotal)
        .innerRadius(0);

    var referralsLineChart = dc.lineChart("#chart-line-referrals-totals");
    referralsLineChart
        .height(200)
        .dimension(dateDim)
        .group(sourceActivePatients, "Active")
        .stack(sourceDischargedPatients, "Discharged")
        .stack(sourceNotYetSeen, "Not Yet Seen")
        .renderArea(true)
        .x(d3.time.scale().domain([minDate, maxDate]))
        .brushOn(true)
        .legend(dc.legend().x(50).y(10).itemHeight(13).gap(5))
        .yAxisLabel("Referral Counts")
        .xAxis(d3.svg.axis()
            .ticks(d3.time.months, 1)
            .tickFormat(d3.time.format('%b %Y')));

    var datatable = dc.dataTable("#sources-data-table");
    datatable
        .dimension(dateDim)
        .group(function (d) {
            return d.orderByDate;
        })
        // dynamic columns creation using an array of closures
        .columns([
            function (d) {
                return d.referralSourceName;
            },
            function (d) {
                return d.referralTypeName;
            },
            function (d) {
                return d.facilityName;
            },
            function (d) {
                return d.active_patients;
            },
            function (d) {
                return d.discharged_patients;
            },
            function (d) {
                return d.not_yet_seen;
            },
            function (d) {
                return d.referralCount;
            },
            function (d) {
                return d.shrinkage;
            }
        ])
        .sortBy(function (d) {
            return [d.typeId, d.sourceId];
        });

    dc.renderAll();
}

function displayCharts() {
    loadJSON('data/referral-dimension-data.json', initDimensions);
}
