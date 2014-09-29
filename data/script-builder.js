/**
 * Created by brianbuikema on 9/18/14.
 */

var fs = require('fs');

var referralDataFilename = './referral-query-results-extended.json';
var referralDimensionsFilename = './referral-dimension-data-extended.json';
var facilities = ["Heal Good", "I Creak Please Help", "Feel Better Now", "PT Magic", "Acme Clinic"];
var types = ["Ads", "Physicians", "Contacts", "Unknown"];
var yearStart = 2008;
var today = new Date();
var yearEnd = today.getFullYear();
var sourceCount = 200;
var sourceTypes = [];
var monthlyReferralCount = 60;

function initialize() {
    // make sourceId 0 a contact - he will have lots of referrals
//    sourceTypes[0] = 2;

    // 50% physicians
    for (var i=0; i<sourceCount/2; i++) {
//        for (var i=1; i<sourceCount/2; i++) {
        sourceTypes[i] = 1;
    }

    // 25% ads
    for (var i=sourceCount/2-1; i<sourceCount/2-1 + sourceCount/4; i++) {
        sourceTypes[i] = 0;
    }

    // 25% contacts/unknown randomized
    for (var i=sourceCount/2 + sourceCount/4 - 1; i<sourceCount; i++) {
        sourceTypes[i] = Math.floor(Math.random() * 2) + 2;
    }

}

function createReferralSourceDataRecord(year, month, sourceId) {
    // todo:  ensure all sourceId's associate to their respective "single" typeId
    var record = new Object();
    record.date = new Date(year, month, Math.floor(Math.random() * 28), 0, 0, 0, 0);
    record.facilityId = Math.floor(Math.random() * facilities.length);
    record.sourceId = sourceId;
    record.typeId = sourceTypes[record.sourceId];

    record.active_patients = Math.floor(Math.random() * 5) + 20;
    record.discharged_patients = Math.floor(Math.random() * 5) + 20;
    record.not_yet_seen = Math.floor(Math.random() * 5) + 20;
//    record.active_patients = Math.floor(Math.random() * 100);
//    record.discharged_patients = Math.floor(Math.random() * 100);
//    record.not_yet_seen = Math.floor(Math.random() * 100);
    record.referralCount = record.active_patients +
        record.discharged_patients +
        record.not_yet_seen;
    record.shrinkage = 25.67;
    return record;
}

function createReferralDataRecord(year, month) {
    return createReferralSourceDataRecord(year, month, Math.floor(Math.random() * sourceCount));
}

function createReferralDataFile() {
    var wstream = fs.createWriteStream(referralDataFilename);
    wstream.write('[\n');

    wstream.write(JSON.stringify(createReferralDataRecord(yearStart-1, today.getMonth())) + ',\n');

    var generateMonthlyReferralCount = monthlyReferralCount/(yearEnd-yearStart+1);
    for (var year=yearStart; year<=yearEnd; year++) {
        generateMonthlyReferralCount += monthlyReferralCount/(yearEnd-yearStart+1);
        for (var month=0; month<12; month++) {
            for (var i=0; i<generateMonthlyReferralCount; i++) {
//                for (var i=0; i<Math.floor(Math.random() * generateMonthlyReferralCount); i++) {
                wstream.write(JSON.stringify(createReferralDataRecord(year, month)) + ',\n');
            }
            for (var i=0; i<1; i++) {
                wstream.write(JSON.stringify(createReferralSourceDataRecord(year, month, 0)) + ',\n');
            }
        }
    }

    wstream.write(JSON.stringify(createReferralDataRecord(yearEnd + 1, today.getMonth())) + '\n');

    wstream.write(']\n');
    wstream.end();
}

function createReferralDimensionsDataFile() {
    wstream = fs.createWriteStream(referralDimensionsFilename);
    var referralDimensions = new Object();

    referralDimensions.status = "success";
    referralDimensions.data = new Object();

    var dimensionRecords = [];
    for (var i=0; i<facilities.length; i++) {
        facility = new Object();
        facility.id = i;
        facility.name = facilities[i];
        dimensionRecords.push(facility);
    }
    referralDimensions.data.facilities = dimensionRecords;

    dimensionRecords = [];
    for (var i=0; i<types.length; i++) {
        type = new Object();
        type.id = i;
        type.name = types[i];
        dimensionRecords.push(type);
    }
    referralDimensions.data.referralTypes = dimensionRecords;

    dimensionRecords = [];
    for (var i=0; i<sourceCount; i++) {
        source = new Object();
        source.id = i;
        source.name = "source " + i;
        dimensionRecords.push(source);
    }
    referralDimensions.data.referralSources = dimensionRecords;


    wstream.write(JSON.stringify(referralDimensions));
    wstream.end();
}

initialize();
createReferralDataFile();
createReferralDimensionsDataFile();
