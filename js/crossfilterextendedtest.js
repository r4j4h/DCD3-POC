var referralData;
var dimensionData;

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
    console.log(referralData.length);

    for (var i=0; i<referralData.length; i++) {
        var theDate = new Date(referralData[i].date);

        var dd = theDate.getDay();
        var mm = theDate.getMonth() + 1;
        var yy = theDate.getFullYear();
        referralData[i].date = yy + '-' + mm + '-' + dd;

        console.log(referralData[i].facilityId);
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
    $('#chart-pie-clinic').on('click', function(){
        console.log("HIIIII!!!!!");
        clinicDim.group().reduceSum(function(d) {return console.log('referralCount');});
//        statusDim.group().reduceSum(function(d) {return d.hits;});
    });

    // Parse JSON string into object
    referralData = JSON.parse(response);
//    console.log(referralData);

    dataTranslation(dimensionData, referralData);

    var ndx = crossfilter(referralData);
    var ndxClinic0 = crossfilter(referralData);
    var ndxClinic1 = crossfilter(referralData);
    var ndxClinic2 = crossfilter(referralData);
    var ndxClinic3 = crossfilter(referralData);
    var ndxClinic4 = crossfilter(referralData);

//            var parseDate = d3.time.format("%m/%d/%Y").parse;
//            var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%SZ");

    referralData.forEach(function (d) {
        d.orderByDate =  d.date;
        d.date = d3.time.format("%Y-%m-%d").parse(d.date);
    });

//    print_filter("referralData");

    var dateDim = ndx.dimension(function (d) {
        return d.date;
    });

    var clinicDim = ndx.dimension(function (d) {
        return d.facilityName
    });
    var clinicTotal = clinicDim.group().reduceSum(dc.pluck('referralCount'));

    var typeDim = ndx.dimension(function (d) {
        return d.referralTypeName
    });
    var typeTotal = typeDim.group().reduceSum(dc.pluck('referralCount'));

    var sourceDim = ndx.dimension(function (d) {
        return d.referralSourceName
    });
    var sourceTotal = sourceDim.group().reduceSum(dc.pluck('referralCount'));

    var clinicDateDim0 = ndxClinic0.dimension(function (d) {
        return d.date;
    });
    var clinicIdDim0 = ndxClinic0.dimension(function (d) {
        return d.facilityId
    });

    var clinicDateDim1 = ndxClinic1.dimension(function (d) {
        return d.date;
    });
    var clinicIdDim1 = ndxClinic1.dimension(function (d) {
        return d.facilityId
    });

    var clinicDateDim2 = ndxClinic2.dimension(function (d) {
        return d.date;
    });
    var clinicIdDim2 = ndxClinic2.dimension(function (d) {
        return d.facilityId
    });

    var clinicDateDim3 = ndxClinic3.dimension(function (d) {
        return d.date;
    });
    var clinicIdDim3 = ndxClinic3.dimension(function (d) {
        return d.facilityId
    });

    var clinicDateDim4 = ndxClinic4.dimension(function (d) {
        return d.date;
    });
    var clinicIdDim4 = ndxClinic4.dimension(function (d) {
        return d.facilityId
    });

//    for (var i=0; i<5; i++) {
////        clinicReferralTotals[i] = clinicIdDim.group().reduceSum(function(d) {return d.referralCount;});
//        var j=i;
//        clinicReferralTotals[i] = dateDim.group().reduceSum(function(d) {console.log("i==" + j);if (d.facilityId===j) {console.log("ABC!");return d.referralCount;}});
//    }

//    var clinicReferralTotals = dateDim.group().reduceSum(function (d) {
//        return d.referralCount;
//    });

    console.log(dateDim.bottom(1)[0].date);
    console.log(dateDim.top(1)[0].date);
    var minDate = new Date(2007, 0, 1, 0, 0, 0, 0);
    var maxDate = new Date(2015, 8, 30, 0, 0, 0, 0);
//    var minDate = d3.time.month.offset(dateDim.bottom(1)[0].date, -1);
//    var maxDate = d3.time.month.offset(dateDim.top(1)[0].date, 1);
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
        .innerRadius(0)
        .data(function(d) {return d.order(function (d){return d.referralCount;}).top(10)})
        .ordering(function(d){return d.sourceId;});

    var sourceActivePatients = dateDim.group().reduceSum(function (d) {
        return d.active_patients;
    });
    var sourceDischargedPatients = dateDim.group().reduceSum(function (d) {
        return d.discharged_patients;
    });
    var sourceNotYetSeen = dateDim.group().reduceSum(function (d) {
        return d.not_yet_seen;
    });

//    var referralsLineChart = dc.lineChart("#chart-line-referrals-totals");
//    referralsLineChart
//        .height(200)
//        .dimension(dateDim)
//        .group(sourceActivePatients, "Active")
//        .stack(sourceDischargedPatients, "Discharged")
//        .stack(sourceNotYetSeen, "Not Yet Seen")
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

//    var clinicReferralTotals = [];
//    var a = 0;
//    var aa = 1;
//    var aaa = 2;
//    var aaaa = 3;
//    var aaaaa = 4;
//
//    clinicReferralTotals[0] = dateDim.group().reduceSum(function(d) {if (d.facilityId===a) return d.referralCount;return 0;});
//    clinicReferralTotals[1] = dateDim.group().reduceSum(function(d) {if (d.facilityId===aa) return d.referralCount;return 0;});
//    clinicReferralTotals[2] = dateDim.group().reduceSum(function(d) {if (d.facilityId===aaa) return d.referralCount;return 0;});
//    clinicReferralTotals[3] = dateDim.group().reduceSum(function(d) {if (d.facilityId===aaaa) return d.referralCount;return 0;});
//    clinicReferralTotals[4] = dateDim.group().reduceSum(function(d) {if (d.facilityId===aaaaa) return d.referralCount;return 0;});

//    var obj = {};
//    var varPreface = "a";
//    for (var i=0; i<5; i++) {
//        obj["variable_" + varPreface] = i;
//        varPreface += varPreface;
//        clinicReferralTotals[i] = dateDim.group().reduceSum(function(d) {if (d.facilityId===obj["variable_" + varPreface]) return d.referralCount;return 0;});
//    }

//    var tmpFacilityIds = [];
//    for (var i=0; i<5; i++) {
//        tmpFacilityIds[i] = i;
//    }
//
//    var facilityIdVars = [];
//    var clinicReferralTotals = [];
//
//    for (var i=0; i<5; i++) {
//        facilityIdVars[i] = tmpFacilityIds[i];
//        clinicReferralTotals[i] = dateDim.group().reduceSum(function(d) {if (d.facilityId===facilityIdVars[i]) return d.referralCount;return 0;});
//    }

    var clinicReferralTotals = [];
    clinicReferralTotals[0] = clinicDateDim0.group().reduceSum(function(d) {return d.referralCount;});
    clinicReferralTotals[1] = clinicDateDim1.group().reduceSum(function(d) {return d.referralCount;});
    clinicReferralTotals[2] = clinicDateDim2.group().reduceSum(function(d) {return d.referralCount;});
    clinicReferralTotals[3] = clinicDateDim3.group().reduceSum(function(d) {return d.referralCount;});
    clinicReferralTotals[4] = clinicDateDim4.group().reduceSum(function(d) {return d.referralCount;});

    var referralsLineChart = dc.compositeChart("#chart-line-referrals-totals");
    referralsLineChart
//        .title(function (d) {
//            return "\nFacility: " + d.facilityName;
//
//        })
//        .valueAccessor(function (d) {
//            return d.referralCount;
//        })
        .height(200)
        .dimension(dateDim)
//        .group(dateDim)
//        .group(clinicReferralTotals[0], "Referral1 Totals")
//       .group(clinicReferralTotals[1], "Referral2 Totals")
//        .group(clinicReferralTotals[2], "Referral3 Totals")
//        .group(clinicReferralTotals[3], "Referral4 Totals")
//        .group(clinicReferralTotals[4], "Referral5 Totals")
//        .group(sourceActivePatients, "Active")
//        .stack(sourceDischargedPatients, "Discharged")
//        .stack(sourceNotYetSeen, "Not Yet Seen")
        .elasticY(true)
        .elasticX(true)
        .x(d3.time.scale().domain([minDate, maxDate]))
        .brushOn(false)
        .legend(dc.legend().x(50).y(10).itemHeight(13).gap(5))
        .yAxisLabel("Referral Counts")
        .xAxis(d3.svg.axis()
            .ticks(d3.time.years, 1)
            .tickFormat(d3.time.format('%Y')))
        .compose([
            dc.lineChart(referralsLineChart).group(clinicReferralTotals[0], "Facility 0").colors('orange'),
            dc.lineChart(referralsLineChart).group(clinicReferralTotals[1], "Facility 1").colors('red'),
            dc.lineChart(referralsLineChart).group(clinicReferralTotals[2], "Facility 2").colors('black'),
            dc.lineChart(referralsLineChart).group(clinicReferralTotals[3], "Facility 3").colors('red'),
            dc.lineChart(referralsLineChart).group(clinicReferralTotals[4], "Facility 4").colors('green')
        ])
        .renderHorizontalGridLines(true)
//            .ticks(d3.time.months, 1)
//            .tickFormat(d3.time.format('%b %Y')));

    clinicIdDim0.filter(0);
    clinicIdDim1.filter(1);
    clinicIdDim2.filter(2);
    clinicIdDim3.filter(3);
    clinicIdDim4.filter(4);

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
