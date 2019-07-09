// Copyright 2017 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
const functions = require('firebase-functions');
var admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'https://armada-220507.firebaseio.com/'
});

var db = admin.database();
var companiesRef = db.ref('companies');

exports.daily_job = functions.pubsub.topic('daily-tick').onPublish(message => {
  var todaysDate = new Date();
  todaysDate.setHours(0, 0, 0, 0);
  var notifsRef;
  var notifs = {};
  var compLocation;
  //for each companies
  var test = companiesRef.orderByValue().once('value', function(snapshot) {
    snapshot.forEach(function(companies) {
      compLocation = 'companies/' + companies.key;
      var driversRef = db.ref(compLocation).child('employees');
      var vehiclesRef = db.ref(compLocation).child('vehicles');

      driversRef.orderByValue().once('value', function(snapshot) {
        snapshot.forEach(function(drivers) {
          var certificateExpiryDate = new Date(
            drivers.child('certificateExpiry').val()
          );
          var cert_expiring = drivers.child('cert_expiring').val();
          var license_expiring = drivers.child('license_expiring').val();
          var licenseExpiryDate = new Date(
            drivers.child('licenseExpiryDate').val()
          );
          var thisChild = driversRef.child(drivers.key);

          certificateExpiryDate.setDate(certificateExpiryDate.getDate() - 30);
          licenseExpiryDate.setDate(licenseExpiryDate.getDate() - 90);

          if (certificateExpiryDate <= todaysDate && cert_expiring == 0) {
            compLocation = 'companies/' + companies.key;
            notifsRef = db.ref(compLocation).child('notifications');
            notifs[notifsRef.push().key] = {
              id: drivers.key.toString(),
              createdAt: todaysDate.toString(),
              is_active: 1,
              type: 'Driver',
              expiryDate: drivers.child('certificateExpiry').val(),
              notifText:
                drivers.child('firstName').val() +
                ' ' +
                drivers.child('lastName').val() +
                "'s certificate will expire on " +
                drivers.child('certificateExpiry').val(),
              expiry_type: 'certificate'
            };
            thisChild.update({
              cert_expiring: 1
            });
            notifsRef.update(notifs);
          }
          if (licenseExpiryDate <= todaysDate && license_expiring == 0) {
            compLocation = 'companies/' + companies.key;
            notifsRef = db.ref(compLocation).child('notifications');
            notifs[notifsRef.push().key] = {
              id: drivers.key.toString(),
              createdAt: todaysDate.toString(),
              is_active: 1,
              type: 'Driver',
              expiryDate: drivers.child('licenseExpiryDate').val(),
              notifText:
                drivers.child('firstName').val() +
                ' ' +
                drivers.child('lastName').val() +
                "'s driver's license will expire on " +
                drivers.child('licenseExpiryDate').val(),
              expiry_type: 'license'
            };
            thisChild.update({
              license_expiring: 1
            });
            notifsRef.update(notifs);
          }
        });
      });
      vehiclesRef.orderByValue().once('value', function(snapshot) {
        snapshot.forEach(function(vehicles) {
          var registrationExpiryDate = new Date(
            vehicles.child('registrationExpiryDate').val()
          );
          var reg_expiring = vehicles.child('reg_expiring').val();
          var is_maintenance = vehicles.child('is_maintenance').val();
          var thisChild = vehiclesRef.child(vehicles.key);
          registrationExpiryDate.setDate(registrationExpiryDate.getDate() - 30);
          var distanceTravelled = vehicles.child('distanceTravelled').val();
          var distanceOfLastMaintenance = vehicles
            .child('distanceOfLastMaintenance')
            .val();

          if (registrationExpiryDate <= todaysDate && reg_expiring == 0) {
            compLocation = 'companies/' + companies.key;
            notifsRef = db.ref(compLocation).child('notifications');
            notifs[notifsRef.push().key] = {
              id: vehicles.key.toString(),
              type: 'Vehicle',
              createdAt: todaysDate.toString(),
              is_active: 1,
              expiryDate: vehicles.child('registrationExpiryDate').val(),
              notifText:
                'Vehicle Plate No: ' +
                vehicles.child('plateNumber').val() +
                ' registration will expire on ' +
                vehicles.child('registrationExpiryDate').val(),
              expiry_type: 'registration'
            };
            thisChild.update({
              reg_expiring: 1
            });
            notifsRef.update(notifs);
          }
          if (
            distanceTravelled - distanceOfLastMaintenance >= 50000 &&
            is_maintenance == 0
          ) {
            compLocation = 'companies/' + companies.key;
            notifsRef = db.ref(compLocation).child('notifications');
            notifs[notifsRef.push().key] = {
              id: vehicles.key.toString(),
              type: 'Vehicle',
              createdAt: todaysDate.toString(),
              is_active: 1,
              notifText:
                'Vehicle Plate No: ' +
                vehicles.child('plateNumber').val() +
                ' needs Maintenance ',
              expiry_type: 'maintenance'
            };
            thisChild.update({
              is_maintenance: 1
            });
            notifsRef.update(notifs);
          }
        });
      });
    });
  });
  Promise.resolve(test).then(() => {});
  console.log('This job is run every day!!!');
  return true;
});
