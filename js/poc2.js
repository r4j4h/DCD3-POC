var referralData;
var dimensionData;
var referralsBarChart;
var compositeTestChart;

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
    loadJSON('data/referral-query-results-extended.json', render);
}

function dataTranslation(dimensionData, referralData) {
    console.log("dataTranslation referralData.length: " + referralData.length);

    for (var i=0; i<referralData.length; i++) {
        for (var j=0; j<dimensionData.data["facilities"].length; j++) {
            if (dimensionData.data["facilities"][j].id == referralData[i].facilityId) {
                referralData[i].facilityName = dimensionData.data["facilities"][j].name;
                break;
            }
        }

        for (var j=0; j<dimensionData.data["referralTypes"].length; j++) {
            if (dimensionData.data["referralTypes"][j].id == referralData[i].typeId) {
                referralData[i].referralTypeName = dimensionData.data["referralTypes"][j].name;
                break;
            }
        }

        for (var j=0; j<dimensionData.data["referralSources"].length; j++) {
            if (dimensionData.data["referralSources"][j].id == referralData[i].sourceId) {
                referralData[i].referralSourceName = dimensionData.data["referralSources"][j].name;
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

    var n = 5;
    var topNClinicIdsByReferralCount = clinicIdsByReferralCount.top(n);
    var topNClinicNamesByReferralCount = clinicNamesByReferralCount.top(n);

    var clinicReferralsByTimesName = [];
    for (var i=0; i<n; i++) {
        clinicReferralsByTimesName[i] = topNClinicNamesByReferralCount[i].key;
        console.log("clinicReferralsByTimesName[i]: " + clinicReferralsByTimesName[i]);
    }

    var colors = ["#46D5EB", "#4693EB", "#eeff00", "#ff0022", "#2200ff"];
    var colorChoice = d3.scale.ordinal().domain(clinicReferralsByTimesName)
        .range(colors);
//    var colors = ['red', 'green', 'blue', 'orange', 'yellow'];

    var referringClinicReferralsByTime = [];
    for (var i=0; i<n; i++) {
        (function(index) {
            referringClinicReferralsByTime[index] = dateDim.group().reduce(
                function (p, v) {
                    if (v.facilityId === topNClinicIdsByReferralCount[index].key) {
                        p.referralCount += v.referralCount;
                        p.activePatients += v.active_patients;
                        p.dischargedPatients += v.discharged_patients;
                        p.notYetSeen += v.not_yet_seen;
                        p.date = new Date(v.date);
        //                var dt = new Date(v.date);
        //                 p.date = dt.getFullYear() + '-' + (dt.getMonth() + 1) + '-' + (dt.getDay() + 1);
                    }

                    return p;
                },
                function (p, v) {
                    if (v.facilityId === topNClinicIdsByReferralCount[index].key) {
                        p.referralCount -= v.referralCount;
                        p.activePatients -= v.active_patients;
                        p.dischargedPatients -= v.discharged_patients;
                        p.notYetSeen -= v.not_yet_seen;
                    }

                    return p;
                },
                function () {
                    return {referralCount: 0, activePatients: 0, dischargedPatients: 0, notYetSeen: 0, date: null};
                });
        })(i);
    }

    console.log("bottom 1\'s .date: " + dateDim.bottom(1)[0].date);
    console.log("top 1\'s .date: " + dateDim.top(1)[0].date);
    var minDate = new Date(2007, 0, 1, 0, 0, 0, 0);
    var maxDate = new Date(2015, 8, 30, 0, 0, 0, 0);
//    var minDate = d3.time.month.offset(dateDim.bottom(1)[0].date, -1);
//    var maxDate = d3.time.month.offset(dateDim.top(1)[0].date, 1);
    console.log("minDate: " + minDate);
    console.log("maxDate: " + maxDate);
//    var reduceClinicTotal = clinicIdDim.group(clinicTotal.reduceSum(function(d) { return d.value; }));

    function anyFilterChangedHandler()
    {
        var allOfEm = clinicIdDim.top(Infinity);

        var referralCountTotals = 0;
        $.each(allOfEm, function(idx, e) {
            referralCountTotals += e.referralCount;
        });
        $('#total-referred-patients-total').text( referralCountTotals);

        var totalActivePatients = 0;
        $.each(allOfEm, function(idx, e) {
            totalActivePatients += e.active_patients;
        });
        $('#active-patients-total').text( totalActivePatients);

        var totalDischargedPatients = 0;
        $.each(allOfEm, function(idx, e) {
            totalDischargedPatients += e.discharged_patients;
        });
        $('#discharged-patients-total').text(totalDischargedPatients);

        var nysPatients = 0;
        $.each(allOfEm, function(idx, e) {
            nysPatients += e.not_yet_seen;
        });
        $('#not-yet-seen-patients-total').text( nysPatients);
    }

    var clinicPieChart = dc.pieChart("#chart-pie-clinic");
    clinicPieChart
//        .label(function(d) {
//            return JSON.stringify(d);
//        })
//        .colorAccessor(function (d) {
//            return d.key;
//        })
        .width(150).height(150)
        .dimension(clinicNameDim)
        .group(clinicTotal)
        .on('filtered', anyFilterChangedHandler)
        .colors(colorChoice)
        .innerRadius(0);

    var typePieChart = dc.pieChart("#chart-pie-type");
    typePieChart
        .width(150).height(150)
        .dimension(typeDim)
        .group(typeTotal)
        .on('filtered', anyFilterChangedHandler)
        .innerRadius(0);

    var sourcePieChart = dc.pieChart("#chart-pie-source");
    sourcePieChart
        .width(150).height(150)
        .dimension(sourceDim)
        .group(sourceTotal)
        .on('filtered', anyFilterChangedHandler)
        .innerRadius(0)
        .data(function(d) {return d.order(function (d){return d.referralCount;}).top(10)})
        .ordering(function(d){return d.sourceId;});

    referralsBarChart = dc.barChart("#chart-bar-referrals-totals")
    referralsBarChart.width(990)
        .height(60)
        .margins({top: 0, right: 50, bottom: 20, left: 60})
        .dimension(dateDim)
        .group(referralCounts, "Total Referral Counts")
        .centerBar(true)
        .gap(5)
        .x(d3.time.scale().domain([minDate, maxDate]))
        .round(d3.time.month.round)
        .alwaysUseRounding(true)
        .xUnits(d3.time.months)
    ;

//    referralsBarChart = dc.lineChart("#chart-line-referrals-totals")
//    referralsBarChart
//        .height(200)
//        .dimension(dateDim)
//        .group(referralCounts, "Total Referral Counts")
//        .mouseZoomable(true)
//        .renderArea(true)
//        .x(d3.time.scale().domain([minDate, maxDate]))
//        .brushOn(true)
//        .legend(dc.legend().x(50).y(10).itemHeight(13).gap(5))
//        .yAxisLabel("Referral Counts")
//        .xAxis(d3.svg.axis()
//            .ticks(d3.time.years, 1)
//            .tickFormat(d3.time.format('%Y')));
////            .ticks(d3.time.months, 1)
////            .tickFormat(d3.time.format('%b %Y')));

    var clinicLineCharts = [];

    compositeTestChart = dc.compositeChart("#composite-test-chart");

    for (var i=0; i<n; i++) {
        clinicLineCharts.push(dc.lineChart(compositeTestChart)
            .dimension(dateDim)
            .group(referringClinicReferralsByTime[i], clinicReferralsByTimesName[i])
            .valueAccessor(function (d) {
                return d.value.referralCount;
            })
            .colors(colorChoice)
            .renderArea(true)
        );
    }

    compositeTestChart
        .width(990)
        .height(250)
        .transitionDuration(1000)
        .margins({top: 30, right: 50, bottom: 25, left: 40})
        .mouseZoomable(true)
        // Specify a range chart to link the brush extent of the range with the zoom focus of the current chart.
        .rangeChart(referralsBarChart)
        .x(d3.time.scale().domain([minDate, maxDate]))
        .round(d3.time.month.round)
        .xUnits(d3.time.months)
        .yAxisLabel("Referral Counts")
        .elasticY(true)
        .renderHorizontalGridLines(true)
        .legend(dc.legend().x(60).y(10).itemHeight(13).gap(5))
        .brushOn(false)
        .title(function (d) {
            return "Active: " + d.value.activePatients + "\n" +
                "Discharged: " + d.value.dischargedPatients + "\n" +
                "Not Yet Seen: " + d.value.notYetSeen + "\n" +
                "Total: " + d.value.referralCount + "\n" +
                d.value.date;
        })
        .on('filtered', anyFilterChangedHandler)
        .compose(clinicLineCharts)
    ;

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
    anyFilterChangedHandler();
}

function displayCharts() {
    loadJSON('data/referral-dimension-data-extended.json', processDimensions);
}
