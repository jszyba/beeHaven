const Particle = require('particle-api-js');
const particle = new Particle();
const mongoose = require('mongoose');
const moment = require('moment');

mongoose.Promise = global.Promise;

const beehiveId1 = "46002d000251353337353037";
const beehiveId2 = "1f0031000d51363034323832";
const photonId1 = "390031001747343337363432";

let batterySchema = mongoose.Schema({
    deviceId: String,
    datetime: String,
    voltage: Number,
    batPerc: Number
});

let BatteryInfo = mongoose.model("BatteryInfo", batterySchema);

let uri = 'mongodb://localhost/beeHaven';
let opts = { useMongoClient: true };
mongoose.connect(uri, opts, function(error) {
    if (!error) {
        console.log("Mongo connection successful.");
        getTokenAndData();
    }
});


// FUNCTIONS
function getTokenAndData(frequency=30000){
    particle.login({username: 'jsheebs@gmail.com', password: 'filmore181'}).then(
        function(data) {
            const token = data.body.access_token;
            // listDevices(token);
            // getDeviceAttrs(token, beehiveId2);
            getDeviceVariables(token, beehiveId2);
            // setInterval(function () {
            //     getBatteryInfo(token, beehiveId2, 'batteryInfo')
            // }, frequency);
        },
        function (err) {
            console.log('Could not log in.', err);
        }
    );
}

function listDevices(token){
    const devicesPr = particle.listDevices({auth: token});
    devicesPr.then(
        function(devices){
            console.log('Devices: ', devices);
        },
        function(err) {
            console.log('List devices call failed: ', err);
        }
    );
}

function getDeviceAttrs(token, deviceId) {
    const devicesPr = particle.getDevice({deviceId: deviceId, auth: token});
    devicesPr.then(
        function (data) {
            console.log('Device attrs retrieved successfully:', data.body);
        },
        function (err) {
            console.log('API call failed: ', err);
        }
    );
}

function getDeviceVariables(token, deviceId) {
    let devicesPr = particle.getDevice({deviceId: deviceId, auth: token});
    devicesPr.then(function (data) {
        let variables =  data.body.variables;
        Object.keys(variables).map(key => {
            console.log(`Getting variable: ${key}`);
            getVariable(token, deviceId, key);
        })
    }, function (err) {
        console.log('API call failed: ', err);
    });
}

function getVariable(token, deviceId, variableName) {
    particle.getVariable({ deviceId: deviceId, name: variableName, auth: token }).then(function(data) {
        let variable = JSON.parse(data.body.result);
        console.log(variableName + ": ", variable);
    }, function(err) {
        console.log('An error occurred while getting attrs:', err);
    });
}

function getBatteryInfo(token, deviceId, variableName) {
    particle.getVariable({ deviceId: deviceId, name: variableName, auth: token }).then(function(data) {
        batteryInfo = JSON.parse(data.body.result);
        insertIntoMongo(deviceId, batteryInfo)
    }, function(err) {
        console.log('An error occurred while getting attrs:', err);
    });
}

function insertIntoMongo(deviceId, object, table='beeHaven', coll="bees") {
    object["datetime"] = moment(moment.now()).format('YYYY-MM-DD HH:mm:ss');
    object["deviceId"] = deviceId;
    let data = new BatteryInfo(object);
    data.save()
        .then(item => {
            console.log(`${item} saved to mongo db.`)
        })
        .catch(err => {
            console.log(`Unable to save to database: ${err}`);
        });
}