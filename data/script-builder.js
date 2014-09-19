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
var sourceCount = 250;

function createReferralDataRecord(year, month, sourceId) {
    // todo:  ensure all sourceId's associate to their respective "single" typeId
    var record = new Object();
    record.date = new Date(year, month, Math.floor((Math.random() * 28), 0, 0, 0, 0));
    var dd = record.date.getDay();
    var mm = record.date.getMonth() + 1;
    var yy = record.date.getFullYear();
    record.date = yy + '-' + mm + '-' + dd;
//    record.date = new Date(year, month, Math.floor((Math.random() * 28), 0, 0, 0, 0));
    record.facilityId = Math.floor((Math.random() * facilities.length));
    record.sourceId = sourceId;
//    record.sourceId = Math.floor((Math.random() * sourceCount));
    record.typeId = Math.floor((Math.random() * types.length));

    if (sourceId == 0) {
        record.typeId = 1; // bind to single type
    }

    record.active_patients = Math.floor((Math.random() * 100));
    record.discharged_patients = Math.floor((Math.random() * 100));
    record.not_yet_seen = Math.floor((Math.random() * 100));
    record.referralCount = record.active_patients +
        record.discharged_patients +
        record.not_yet_seen;
    record.shrinkage = 25.67;
    return record;
}

function createReferralDimensionRecord(year, month) {
    var record = new Object();
    return record;
}

var wstream = fs.createWriteStream(referralDataFilename);
wstream.write('[\n');

wstream.write(JSON.stringify(createReferralDataRecord(yearStart-1, today.getMonth())) + ',\n');

for (var year=yearStart; year<=yearEnd; year++) {
    for (var month=0; month<12; month++) {
        for (var i=0; i<Math.floor((Math.random() * 500)); i++) {
            wstream.write(JSON.stringify(createReferralDataRecord(year, month, Math.floor((Math.random() * sourceCount)))) + ',\n');
//            records.push(record);
        }
        for (var i=0; i<25; i++) {
            wstream.write(JSON.stringify(createReferralDataRecord(year, month, 0)) + ',\n');
//            records.push(record);
        }
    }
}

wstream.write(JSON.stringify(createReferralDataRecord(yearEnd + 1, today.getMonth())) + '\n');

wstream.write(']\n');
wstream.end();


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
