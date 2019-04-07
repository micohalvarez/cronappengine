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

var config = {
  apiKey: 'AIzaSyApf-dwUYAlnupmkNeWKgpwTd5irz_3-KM',
  authDomain: 'armada-1648e.firebaseapp.com',
  databaseURL: 'https://armada-220507.firebaseio.com',
  storageBucket: 'aarmada-220507.appspot.com'
};

firebase.initializeApp(config);
var database = firebase.database();

exports.hourly_job = functions.pubsub
  .topic('hourly-tick')
  .onPublish(message => {
    //for each companies
    console.log(`Message Data: ${dataString}`);
    //for each drivers
    //check driverlicense date
    //if one month push to database

    //for each vehicles
    //check regiwtrwion
    //one month push to database

    console.log('This job is run every hour!');
    if (message.data) {
      const dataString = Buffer.from(message.data, 'base64').toString();
      console.log(`Message Data: ${dataString}`);
    }

    return true;
  });
