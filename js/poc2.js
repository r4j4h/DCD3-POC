var referralData;
var dimensionData;
var referralsLineChart;//=dc.lineChart("#chart-line-referrals-totals");
//var referralsLineChart = dc.barChart("#chart-line-referrals-totals");
var compositeTestChart;// = dc.compositeChart("#composite-test-chart");
var sourceActivePatients;
var sourceDischargedPatients;
var sourceNotYetSeen;

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

function processDimensions(response) {
    // Parse JSON string into object
    dimensionData = JSON.parse(response);
//    console.log(dimensionData);
    loadJSON('data/referral-query-results-extended.json', render);
}

function dataTranslation(dimensionData, referralData) {
    console.log("dataTranslation referralData.length: " + referralData.length);

    for (var i=0; i<referralData.length; i++) {
//        var theDate = new Date(referralData[i].date);
//
//        var dd = theDate.getDay() + 1;
//        var mm = theDate.getMonth() + 1;
//        var yy = theDate.getFullYear();
//        referralData[i].date = yy + '-' + mm + '-' + dd;
//        console.log(referralData[i].date);

//        console.log("dataTranslation referralData["+i+"].facilityId: " + referralData[i].facilityId);
        for (var j=0; j<dimensionData.data["facilities"].length; j++) {
            if (dimensionData.data["facilities"][j].id == referralData[i].facilityId) {
                referralData[i].facilityName = dimensionData.data["facilities"][j].name;
//                console.log(dimensionData.data["facilities"][j].name);
                break;
            }
        }

        for (var j=0; j<dimensionData.data["referralTypes"].length; j++) {
            if (dimensionData.data["referralTypes"][j].id == referralData[i].typeId) {
                referralData[i].referralTypeName = dimensionData.data["referralTypes"][j].name;
//                console.log(dimensionData.data["referralTypes"][j].name);
                break;
            }
        }

        for (var j=0; j<dimensionData.data["referralSources"].length; j++) {
            if (dimensionData.data["referralSources"][j].id == referralData[i].sourceId) {
                referralData[i].referralSourceName = dimensionData.data["referralSources"][j].name;
//                console.log(dimensionData.data["referralSources"][j].name);
                break;
            }
        }
    }
}

function render(response) {
//    $('#chart-pie-clinic').on('click', function(){
//        console.log("HIIIII!!!!!");
//        clinicNameDim.group().reduceSum(function(d) {return console.log('referralCount');});
////        statusDim.group().reduceSum(function(d) {return d.hits;});
//    });

    // Parse JSON string into object
    referralData = JSON.parse(response);

    dataTranslation(dimensionData, referralData);

    var ndx = crossfilter(referralData);

    referralData.forEach(function (d) {
        d.orderByDate =  d.date;
        d.date = new Date(d.date).getTime();
    });

//    referralData.forEach(function (d) {
//        d.orderByDate =  d.date;
//        d.date = d3.time.format("%Y-%m-%d").parse(d.date);
//    });

//    print_filter("referralData");

    var dateDim = ndx.dimension(function (d) {
        return d.date;
    });
    var clinicIdDim = ndx.dimension(function (d) {
        return d.facilityId
    });
    var clinicNameDim = ndx.dimension(function (d) {
        return d.facilityName
    });
    var clinicTotal = clinicNameDim.group().reduceSum(dc.pluck('referralCount'));

    var typeDim = ndx.dimension(function (d) {
        return d.referralTypeName
    });
    var typeTotal = typeDim.group().reduceSum(dc.pluck('referralCount'));

    var sourceDim = ndx.dimension(function (d) {
        return d.referralSourceName
    });
    var sourceTotal = sourceDim.group().reduceSum(dc.pluck('referralCount'));

    sourceActivePatients = dateDim.group().reduceSum(function (d) {
        return d.active_patients;
    });
    sourceDischargedPatients = dateDim.group().reduceSum(function (d) {
        return d.discharged_patients;
    });
    sourceNotYetSeen = dateDim.group().reduceSum(function (d) {
        return d.not_yet_seen;
    });
    var referralCounts = dateDim.group().reduceSum(function (d) {
        return d.referralCount;
    });

    // Prepare dimension groups for composite chart
    var clinicIdsByReferralCount = clinicIdDim.group().reduceSum(function (d) {
        return d.referralCount;
    });
    var clinicNamesByReferralCount = clinicNameDim.group().reduceSum(function (d) {
        return d.referralCount;
    });
    var top3ClinicIdsByReferralCount = clinicIdsByReferralCount.top(3);
    var top3ClinicNamesByReferralCount = clinicNamesByReferralCount.top(3);


    var firstPlaceReferringClinicReferralsByTimesName = top3ClinicNamesByReferralCount[0].key;
    var secondPlaceReferringClinicReferralsByTimesName = top3ClinicNamesByReferralCount[1].key;
    var thirdPlaceReferringClinicReferralsByTimesName = top3ClinicNamesByReferralCount[2].key;

    console.log("top3ClinicIdsByReferralCount[0].key: " + top3ClinicIdsByReferralCount[0].key);
    console.log("top3ClinicIdsByReferralCount[1].key: " + top3ClinicIdsByReferralCount[1].key);
    console.log("top3ClinicIdsByReferralCount[2].key: " + top3ClinicIdsByReferralCount[2].key);

    var firstPlaceReferringClinicReferralsByTime = dateDim.group().reduce(
        function (p, v) {
            if (v.facilityId === top3ClinicIdsByReferralCount[0].key) {
                p.referralCount += v.referralCount;
            }

            return p;
        },
        function (p, v) {
            if (v.facilityId === top3ClinicIdsByReferralCount[0].key) {
                p.referralCount -= v.referralCount;
            }

            return p;
        },
        function () {
            return {referralCount: 0};
        }
    );

    var secondPlaceReferringClinicReferralsByTime = dateDim.group().reduce(
        function (p, v) {
            if (v.facilityId === top3ClinicIdsByReferralCount[1].key) {
                p.referralCount += v.referralCount;
            }

            return p;
        },
        function (p, v) {
            if (v.facilityId === top3ClinicIdsByReferralCount[1].key) {
                p.referralCount -= v.referralCount;
            }

            return p;
        },
        function () {
            return {referralCount: 0};
        }
    );

    var thirdPlaceReferringClinicReferralsByTime = dateDim.group().reduce(
        function (p, v) {
            if (v.facilityId === top3ClinicIdsByReferralCount[2].key) {
                p.referralCount += v.referralCount;
            }

            return p;
        },
        function (p, v) {
            if (v.facilityId === top3ClinicIdsByReferralCount[2].key) {
                p.referralCount -= v.referralCount;
            }

            return p;
        },
        function () {
            return {referralCount: 0};
        }
    );
    // debugger;

    console.log("bottom 1\'s .date: " + dateDim.bottom(1)[0].date);
    console.log("top 1\'s .date: " + dateDim.top(1)[0].date);
    var minDate = new Date(2007, 0, 1, 0, 0, 0, 0);
    var maxDate = new Date(2015, 8, 30, 0, 0, 0, 0);
//    var minDate = d3.time.month.offset(dateDim.bottom(1)[0].date, -1);
//    var maxDate = d3.time.month.offset(dateDim.top(1)[0].date, 1);
    console.log("minDate: " + minDate);
    console.log("maxDate: " + maxDate);

    var clinicPieChart = dc.pieChart("#chart-pie-clinic");
    clinicPieChart
        .width(150).height(150)
        .dimension(clinicNameDim)
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
        .innerRadius(0)
        .data(function(d) {return d.order(function (d){return d.referralCount;}).top(10)})
        .ordering(function(d){return d.sourceId;});

    referralsLineChart = dc.lineChart("#chart-line-referrals-totals")
    referralsLineChart
        .height(200)
        .dimension(dateDim)
        .group(referralCounts, "Total Referral Counts")
        .mouseZoomable(true)
        .renderArea(true)
        .x(d3.time.scale().domain([minDate, maxDate]))
        .brushOn(true)
        .legend(dc.legend().x(50).y(10).itemHeight(13).gap(5))
        .yAxisLabel("Referral Counts")
        .xAxis(d3.svg.axis()
            .ticks(d3.time.years, 1)
            .tickFormat(d3.time.format('%Y')));
//            .ticks(d3.time.months, 1)
//            .tickFormat(d3.time.format('%b %Y')));

    compositeTestChart = dc.compositeChart("#composite-test-chart");

    var firstLineChart = dc.lineChart(compositeTestChart);
    firstLineChart
        .dimension(dateDim)
        .colors('red')
        .group(firstPlaceReferringClinicReferralsByTime, firstPlaceReferringClinicReferralsByTimesName)
        .valueAccessor(function (d) {
            return d.value.referralCount;
        })
        .renderArea(true);

    compositeTestChart
//        .renderArea(true)
        .width(990)
        .height(200)
        .transitionDuration(1000)
        .margins({top: 30, right: 50, bottom: 25, left: 40})
//        .dimension(dateDim)
        .mouseZoomable(true)
        // Specify a range chart to link the brush extent of the range with the zoom focus of the current chart.
        .rangeChart(referralsLineChart)
        .x(d3.time.scale().domain([minDate, maxDate]))
        .round(d3.time.month.round)
        .xUnits(d3.time.months)
        .yAxisLabel("Referral Counts")
        .elasticY(true)
        .renderHorizontalGridLines(true)
        .legend(dc.legend().x(60).y(10).itemHeight(13).gap(5))
        .brushOn(false)
        .compose([
            firstLineChart,
            dc.lineChart(compositeTestChart)
                .dimension(dateDim)
                .colors('green')
                .group(secondPlaceReferringClinicReferralsByTime, secondPlaceReferringClinicReferralsByTimesName)
                .valueAccessor(function (d) {
                    return d.value.referralCount;
                })
                .renderArea(true)
            ,
            dc.lineChart(compositeTestChart)
                .dimension(dateDim)
                .colors('blue')
                .group(thirdPlaceReferringClinicReferralsByTime, thirdPlaceReferringClinicReferralsByTimesName)
                .valueAccessor(function (d) {
                    return d.value.referralCount;
                })
                .renderArea(true)
        ]);
//        .title(function (d) {
//            var value = d.value.avg ? d.value.avg : d.value;
//            if (isNaN(value)) value = 0;
//            return dateFormat(d.key) + "\n" + numberFormat(value);
//        });

//    referralsLineChart
//        .width(990)
//        .height(200)
//        .dimension(dateDim)
//        .group(sourceActivePatients, "Active")
//        .stack(sourceDischargedPatients, "Discharged")
//        .stack(sourceNotYetSeen, "Not Yet Seen")
//        .mouseZoomable(true)
//        .renderArea(true)
//        .x(d3.time.scale().domain([minDate, maxDate]))
//        .brushOn(false)
//        .legend(dc.legend().x(50).y(10).itemHeight(13).gap(5))
////        .yAxisLabel("Referral Counts")
//        .xAxis(d3.svg.axis()
////            .ticks(d3.time.years, 1)
////            .tickFormat(d3.time.format('%Y')));
//            .ticks(d3.time.months, 1)
//            .tickFormat(d3.time.format('%b %Y')));

//    referralsLineChart.width(990)
//        .height(40)
//        .margins({top: 0, right: 50, bottom: 20, left: 40})
//        .dimension(dateDim)
//        .group(referralCounts)
//        .centerBar(true)
//        .gap(1)
//        .x(d3.time.scale().domain([minDate, maxDate]))
//        .round(d3.time.month.round)
//        .alwaysUseRounding(true)
//        .xUnits(d3.time.months)
//        .brushOn(true);

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
    loadJSON('data/referral-dimension-data-extended.json', processDimensions);
}
