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

      var companyRef = 'companies/' + companies.key;
      var notifsRef = db.ref(companyRef).child('notifications');

      //for each drivers
      drivers.forEach(function(driversData) {
        var driversLocation = companyRef + '/drivers';

        var curDriver = db.ref(driversLocation).child(driversData.key);

        var certificateExpiryDate = new Date(
          driversData.child('certificateExpiry').val()
        );
        var cert_expiring = driversData.child('cert_expiring').val();

        var licenseExpiryDate = new Date(
          driversData.child('licenseExpiryDate').val()
        );
        var license_expiring = driversData.child('license_expiring').val();

        certificateExpiryDate.setDate(certificateExpiryDate.getDate() - 90);
        licenseExpiryDate.setDate(licenseExpiryDate.getDate() - 30);

        console.log('certificLLLExpiryDate', licenseExpiryDate);
        console.log('certificateExpiryDate', certificateExpiryDate);

        if (certificateExpiryDate <= todaysDate && cert_expiring == 0) {
          console.log('certificateExpiryDatENTERED');
          var newNotifsRef = notifsRef.push();
          newNotifsRef.set({
            driverId: driversData.key,
            expiryDate: driversData.child('certificateExpiry').val(),
            expiryCard: 'Certification'
          });
        }
        if (licenseExpiryDate <= todaysDate && license_expiring == 0) {
          console.log('LICENSE ENTERED');
          var newNotifsRef = notifsRef.push();
          newNotifsRef.set({
            driverId: driversData.key,
            expiryDate: driversData.child('licenseExpiryDate').val(),
            expiryCard: 'Drivers Licesnse'
          });
        }
      });
    });
  });

  console.log('This job is run every day!');

  return true;
});
