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
  //for each companies
  companiesRef.orderByValue().once('value', function(snapshot) {
    snapshot.forEach(function(companies) {
      var compLocation = 'companies/' + companies.key;
      var driversRef = db.ref(compLocation).child('drivers');
      var vehiclesRef = db.ref(compLocation).child('vehicles');

      notifsRef = db.ref(compLocation).child('notifications');

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

          if (certificateExpiryDate >= todaysDate && cert_expiring == 0) {
            notifs[notifsRef.push().key] = {
              createdAt: todaysDate.toString(),
              is_seen: 0,
              expiryDate: drivers.child('certificateExpiry').val(),
              notifText:
                drivers.firstName +
                ' ' +
                driver.lastName +
                "'s certificate will expire on " +
                todaysDate.toLocaleDateString('en-US')
            };
            thisChild.update({
              cert_expiring: 1
            });
          }
          if (licenseExpiryDate >= todaysDate && license_expiring == 0) {
            notifs[notifsRef.push().key] = {
              createdAt: todaysDate.toString(),
              is_seen: 0,
              expiryDate: drivers.child('licenseExpiryDate').val(),
              notifText:
                drivers.firstName +
                ' ' +
                driver.lastName +
                "'s driver's license will expire on " +
                todaysDate.toLocaleDateString('en-US')
            };
            thisChild.update({
              license_expiring: 1
            });
          }
          notifsRef.update(notifs);
        });
      });
      vehiclesRef.orderByValue().once('value', function(snapshot) {
        snapshot.forEach(function(vehicles) {
          var registrationExpiryDate = new Date(
            vehicles.child('registrationExpiryDate').val()
          );
          var reg_expiring = vehicles.child('reg_expiring').val();
          var thisChild = vehiclesRef.child(vehicles.key);
          registrationExpiryDate.setDate(registrationExpiryDate.getDate() - 30);

          if (registrationExpiryDate >= todaysDate && reg_expiring == 0) {
            notifs[notifsRef.push().key] = {
              createdAt: todaysDate.toString(),
              is_seen: 0,
              expiryDate: vehicles.child('registrationExpiryDate').val(),
              notifText:
                'Vehicle Plate No: ' +
                vehicles.plateNumber +
                ' registration will expire on ' +
                todaysDate.toLocaleDateString('en-US')
            };
            thisChild.update({
              reg_expiring: 1
            });
          }
          notifsRef.update(notifs);
        });
      });
    });
  });
  console.log('This job is run every day!!!');
  return true;
});
