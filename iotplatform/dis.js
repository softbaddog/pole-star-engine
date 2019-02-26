var request = require('request');
var moment = require('moment');
var crypto = require('crypto');
var myEmitter = require('../MyEmitter');

const AK = "ZQJS6DUH8U2SHEJKSCTI";
const SK = "mCfwko4hBXem9hjzZFO8GYoow8J84dRrKL25efGN";
const projectid = "ad44822859da4e13aed4ddccdd68966d";
const streamName = "dis-aFYy";
const region = "cn-north-1";
const Host = 'dis.cn-north-1.myhuaweicloud.com:20004';

const partitionId = 0;
// const startingSequenceNumber = 0;

const cursorsHTTPRequestMethod = 'GET';
const cursorsCanonicalURI = '/v2/' + projectid + '/cursors/';
const cursorsCanonicalQuery = {
  'stream-name': streamName,
  'partition-id': partitionId,
  // 'cursor-type': 'AT_SEQUENCE_NUMBER',
  // 'cursor-type': 'TRIM_HORIZON',
  'cursor-type': 'LATEST',
  // 'starting-sequence-number': startingSequenceNumber
};

exports.load = function () {
  var cursorsOptions = options(cursorsHTTPRequestMethod, cursorsCanonicalURI, cursorsCanonicalQuery);
  request(cursorsOptions, function (error, res, body) {
    if (!error && res.statusCode == 200) {
      getRecords(body.partition_cursor);
    } else {
      console.error(body);
    }
  });
};

function getRecords(partition_cursor) {
  const recordsHTTPRequestMethod = 'GET';
  const recordsCanonicalURI = '/v2/' + projectid + '/records/';
  const recordsCanonicalQuery = {
    'partition-cursor': partition_cursor,
  };
  var recordsOptions = options(recordsHTTPRequestMethod, recordsCanonicalURI, recordsCanonicalQuery);
  request(recordsOptions, function (error, res, body) {
    if (!error && res.statusCode == 200) {
      // console.log(body);
      if (body.records.length > 0) {
        for (let record of body.records) {
          myEmitter.emit('data', Buffer.from(record.data, 'base64'));
        }
      }
      if (body.next_partition_cursor) {
        getRecords(body.next_partition_cursor);
      }
    } else {
      console.log(body);
    }
  });
}

function options(HTTPRequestMethod, CanonicalURI, CanonicalQuery) {
  const x_sdk_date = moment().utc().format("YYYYMMDDTHHmmss") + 'Z';
  const CanonicalQueryString = jsonSort(CanonicalQuery);
  const CanonicalHeaders = 'host:' + Host + '\nx-sdk-date:' + x_sdk_date + '\n';
  const SignedHeaders = 'host;x-sdk-date';

  const CalculateContentHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  const CanonicalRequest = HTTPRequestMethod + '\n' +
    CanonicalURI + '\n' + CanonicalQueryString + '\n' +
    CanonicalHeaders + '\n' + SignedHeaders + '\n' + CalculateContentHash;

  const hashCanonicalRequest = crypto.createHash('sha256');
  const HashedCanonicalRequest = hashCanonicalRequest.update(CanonicalRequest).digest('hex');

  var CredentialScope = moment(x_sdk_date).utc().format('YYYYMMDD') + '/' + region + '/dis/sdk_request';
  var StringToSing = 'SDK-HMAC-SHA256' + '\n' + x_sdk_date + '\n' + CredentialScope + '\n' + HashedCanonicalRequest;

  var kSecret = "SDK" + SK;
  var hmacDate = crypto.createHmac('sha256', kSecret);
  var kDate = hmacDate.update(moment(x_sdk_date).utc().format('YYYYMMDD')).digest('hex');
  var hmacRegion = crypto.createHmac('sha256', Buffer.from(kDate, 'hex'));
  var kRegion = hmacRegion.update(region).digest('hex');
  var hmacService = crypto.createHmac('sha256', Buffer.from(kRegion, 'hex'));
  var kService = hmacService.update('dis').digest('hex');
  var hmacSigningKey = crypto.createHmac('sha256', Buffer.from(kService, 'hex'));
  var SigningKey = hmacSigningKey.update('sdk_request').digest('hex');

  var hmacSignature = crypto.createHmac('sha256', Buffer.from(SigningKey, 'hex'));
  var Signature = hmacSignature.update(StringToSing).digest('hex');

  return {
    method: HTTPRequestMethod,
    url: 'https://' + Host + CanonicalURI,
    headers: {
      'Content-Type': 'application/json',
      'Host': Host,
      'X-Sdk-Date': x_sdk_date,
      'Authorization': 'SDK-HMAC-SHA256 Credential=' + AK + '/' + moment(x_sdk_date).utc().format('YYYYMMDD') + '/' + region + '/dis/sdk_request' +
        ', SignedHeaders=' + SignedHeaders + ', Signature=' + Signature,

    },
    qs: CanonicalQuery,
    json: true
  };
}

function jsonSort(jsonObj) {
  let arr = [];
  for (var key in jsonObj) {
    arr.push(key);
  }
  arr.sort();
  let str = '';
  for (var i in arr) {
    str += arr[i] + "=" + jsonObj[arr[i]] + "&";
  }
  return str.substr(0, str.length - 1);
}