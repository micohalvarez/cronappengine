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

exports.hourly_job = functions.pubsub
  .topic('hourly-tick')
  .onPublish(message => {
    var todaysDate = new Date();

    //for each companies
    companiesRef.orderByValue().on('value', function(snapshot) {
      snapshot.forEach(function(companies) {
        var companyId = companies.key;
        var drivers = companies.child('drivers');
        var vehicles = companies.child('vehicles');
        var notifsRef = companies.child('notifications');
        //for each drivers
        drivers.forEach(function(driversData) {
          var certificateExpiry = driversData.child('certificateExpiry').val();
          var certificateExpiryDate = new Date(certificateExpiry);
          console.log('CURRENT DATE  ', todaysDate);
          console.log('Certificate Expiry Date ', certificateExpiryDate);
          console.log('Certificate ++31 ', certificateExpiryDate.getDate() + 7);
          if (certificateExpiryDate.getDate() + 7 == currentDate) {
            console.log('HELLO WORLD I PUSHED THIS DATA');
            notifsRef.push().set({
              driverId: driversData.key,
              expiryDate: certificateExpiry,
              expiryCard: 'Certification'
            });
          }
        });
      });
    });

    //check driverlicense date
    //if one month push to database

    //for each vehicles
    //check regiwtrwion
    //one month push to database

    console.log('This job is run every hour!');

    return true;
  });
