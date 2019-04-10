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

  //for each companies
  companiesRef.orderByValue().on('value', function(snapshot) {
    snapshot.forEach(function(companies) {
      var compLocation = 'companies/' + companies.key;
      var driversRef = db.ref(compLocation).child('drivers');
      var vehiclesRef = db.ref(compLocation).child('vehicles');

      var notifs = {};
      var notifsRef = db.ref(compLocation).child('notifications');

      driversRef.orderByValue().on('value', function(snapshot) {
        snapshot.forEach(function(drivers) {
          var certificateExpiryDate = new Date(
            drivers.child('certificateExpiry').val()
          );
          var cert_expiring = drivers.child('cert_expiring').val();
          var license_expiring = drivers.child('license_expiring').val();
          var licenseExpiryDate = new Date(
            drivers.child('licenseExpiryDate').val()
          );

          certificateExpiryDate.setDate(certificateExpiryDate.getDate() - 30);
          licenseExpiryDate.setDate(licenseExpiryDate.getDate() - 90);

          if (certificateExpiryDate >= todaysDate && cert_expiring == 0) {
            notifs[notifsRef.push().key] = {
              driverId: drivers.key,
              expiryDate: drivers.child('certificateExpiry').val(),
              expiryCard: 'Certification'
            };
          }
          if (licenseExpiryDate >= todaysDate && license_expiring == 0) {
            notifs[notifsRef.push().key] = {
              driverId: drivers.key,
              expiryDate: drivers.child('licenseExpiryDate').val(),
              expiryCard: 'License'
            };
          }
        });
      });
    });
  });
  notifsRef.update(notifs);
  console.log('This job is run every day!!!');
  return true;
});
