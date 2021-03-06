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
    console.log("dataTranslation referralData.length: " + referralData.length);

    for (var i=0; i<referralData.length; i++) {
        var theDate = new Date(referralData[i].date);

        var dd = theDate.getDay();
        var mm = theDate.getMonth() + 1;
        var yy = theDate.getFullYear();
        referralData[i].date = yy + '-' + mm + '-' + dd;

        console.log("dataTranslation referralData["+i+"].facilityId: " + referralData[i].facilityId);
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
        clinicNameDim.group().reduceSum(function(d) {return console.log('referralCount');});
//        statusDim.group().reduceSum(function(d) {return d.hits;});
    });

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

    var sourceActivePatients = dateDim.group().reduceSum(function (d) {
        return d.active_patients;
    });
    var sourceDischargedPatients = dateDim.group().reduceSum(function (d) {
        return d.discharged_patients;
    });
    var sourceNotYetSeen = dateDim.group().reduceSum(function (d) {
        return d.not_yet_seen;
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

    var firstPlaceReferringClinicDateDim = ndx.dimension(function (d) {
        if ( d.facilityId === top3ClinicIdsByReferralCount[0].key ) {
            return d.date; 
        }
    });
    var secondPlaceReferringClinicDateDim = ndx.dimension(function (d) {
        if ( d.facilityId === top3ClinicIdsByReferralCount[1].key ) {
            return d.date; 
        }
    });
    var thirdPlaceReferringClinicDateDim = ndx.dimension(function (d) {
        if ( d.facilityId === top3ClinicIdsByReferralCount[2].key ) {
            return d.date; 
        }
    });


    var firstPlaceReferringClinicReferralsByTimesName = top3ClinicNamesByReferralCount[0].key;
    var secondPlaceReferringClinicReferralsByTimesName = top3ClinicNamesByReferralCount[1].key;
    var thirdPlaceReferringClinicReferralsByTimesName = top3ClinicNamesByReferralCount[2].key;
    var firstPlaceReferringClinicReferralsByTime = firstPlaceReferringClinicDateDim.group().reduceSum(function (d) {
        return d.referralCount;
    });
    var secondPlaceReferringClinicReferralsByTime = secondPlaceReferringClinicDateDim.group().reduceSum(function (d) {
        return d.referralCount;
    });
    var thirdPlaceReferringClinicReferralsByTime = thirdPlaceReferringClinicDateDim.group().reduceSum(function (d) {
        return d.referralCount;
    });
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
            .ticks(d3.time.years, 1)
            .tickFormat(d3.time.format('%Y')));
//            .ticks(d3.time.months, 1)
//            .tickFormat(d3.time.format('%b %Y')));


    var compositeTestChart = dc.compositeChart("#composite-test-chart");
        compositeTestChart
            .height(250)
            .x(d3.time.scale().domain([minDate, maxDate]))
            .brushOn(false)
            .legend(dc.legend().x(60).y(10).itemHeight(13).gap(5))
            .yAxisLabel("Top 2 Clinic's Referrals over Time")
            .compose([
                dc.lineChart(compositeTestChart)
                    .dimension(dateDim)
                    .colors('red')
                    .group(firstPlaceReferringClinicReferralsByTime, firstPlaceReferringClinicReferralsByTimesName)
                    .renderArea(true)
                ,
                dc.lineChart(compositeTestChart)
                    .dimension(dateDim)
                    .colors('green')
                    .group(secondPlaceReferringClinicReferralsByTime, secondPlaceReferringClinicReferralsByTimesName)
                    .renderArea(true)
                ,
                dc.lineChart(compositeTestChart)
                    .dimension(dateDim)
                    .colors('blue')
                    .group(thirdPlaceReferringClinicReferralsByTime, thirdPlaceReferringClinicReferralsByTimesName)
                    .renderArea(true)
            ])
            .xAxis(d3.svg.axis()
                .ticks(d3.time.years, 1)
                .tickFormat(d3.time.format('%Y')))
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
}

function displayCharts() {
    loadJSON('data/referral-dimension-data-extended.json', processDimensions);
}
