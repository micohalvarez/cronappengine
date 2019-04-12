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
  console.log('HELLO WORLD');
  //for each companies
  companiesRef.once('value', function(snapshot) {
    snapshot.forEach(function(companies) {
      var compLocation = 'companies/' + companies.key;
      var driversRef = db.ref(compLocation).child('drivers');
      var vehiclesRef = db.ref(compLocation).child('vehicles');
      console.log('HELLO WORLD ' + driversRef);
      notifsRef = db.ref(compLocation).child('notifications');

      vehiclesRef.once('value', function(snapshot) {
        snapshot.forEach(function(vehicles) {
          var registrationExpiryDate = new Date(
            vehicles.child('registrationExpiryDate').val()
          );
          registrationExpiryDate.setDate(registrationExpiryDate.getDate() - 30);
          console.log('REGDATE' + registrationExpiryDate);
          console.log('todaysDate' + todaysDate);
          if (registrationExpiryDate >= todaysDate) {
            console.log('sokpa' + todaysDate);
            notifs[notifsRef.push().key] = {
              createdAt: todaysDate.toString(),
              is_seen: 0,
              expiryDate: vehicles.child('registrationExpiryDate').val(),
              expiryCard: 'Certification'
            };
          }
        });
      });
      console.log('NOTIFSREF' + notifsRef);
      notifsRef.update(notifs);
    });
  });
  console.log('This job is run every day!!!');
  return true;
});
