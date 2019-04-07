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
      var drivers = companies.child('drivers');
      var vehicles = companies.child('vehicles');
      var notifsLocation = 'companies/' + companies.key;
      var notifsRef = db.ref(notifsLocation).child('notifications');
      var newNotifsRef = notifsRef.push();
      //for each drivers
      drivers.forEach(function(driversData) {
        var certificateExpiryDate = new Date(
          driversData.child('certificateExpiry').val()
        );
        var certExpiring = driversData.child('cert_expiring').val();

        var licenseExpiryDate = new Date(
          driversData.child('licenseExpiry').val()
        );
        var license_expiring = driversData.child('license_expiring').val();
        certificateExpiryDate.setDate(certificateExpiryDate.getDate() - 90);
        licenseExpiryDate.setDate(certificateExpiryDate.getDate() - 30);

        if (certificateExpiryDate <= todaysDate && certExpiring == '0') {
          newNotifsRef.set({
            driverId: driversData.key,
            expiryDate: driversData.child('certificateExpiry').val(),
            expiryCard: 'Certification'
          });
        }
        if (licenseExpiryDate <= todaysDate && license_expiring == '0') {
          newNotifsRef.set({
            driverId: driversData.key,
            expiryDate: driversData.child('certificateExpiry').val(),
            expiryCard: 'Drivers Licesnse'
          });
        }
      });

      //for each vehicles
      vehicles.forEach(function(vehiclesData) {});
    });
  });

  console.log('This job is run every hour!');

  return true;
});
