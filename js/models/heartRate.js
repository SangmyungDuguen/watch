// 5.5

/*
 * Copyright (c) 2015 Samsung Electronics Co., Ltd. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* global define, console, window, tizen */

/**
 * Heart Rate Monitor module.
 *
 * @module models/heartRate
 * @requires {@link core/event}
 * @requires {@link core/storage/idb}
 * @namespace models/heartRate
 * @memberof models/heartRate
 */

define({
    name: 'models/heartRate',
    requires: [
        'core/event',
        'core/storage/idb'
    ],
    def: function modelsHeartRate(req) {
        'use strict';
        
        //******************** 전역 변수 모음 *********************
        var lon = null;
        var lat = null;
        var age = '';
        var email = '';
        var ngrok_address = '';
        var sensorData = 0;
        //***************************************************
      
        //******************** 기존에 있던 함수들 ******************
        var indexedDB = req.core.storage.idb,
            event = req.core.event,
            CONTEXT_TYPE = 'HRM',
            STORAGE_IDB_KEY = 'limit',
            heartRate = null,
            heartRateData = {};
        
        var heartbeattimeoption = {
            // callbackInterval은 HRM의 경우 10ms ~ 1000ms 범위를 가지며, default 값은 100ms임. 범위를 벗어날 경우 작동안함.
        	//   				 GPS의 경우 SampleInterval 이상의 값을 가져야 하며, default 값은 150000ms임.
            'callbackInterval': 1000,
            // SampleInterval은 GPS의 경우 1000ms 이상의 값을 가져야 하며, default 값은 1000ms임, 기기마다 최대값이 다름.
            // GPS를 제외한 나머지 타입에서 sampleInterval은 무시됨.
            'sampleInterval': 1000
        };
        //***************************************************
        
        //***************** 자바스크립트 랜덤 함수 ******************
//        var random = Math.random() * max; // 0 ~ max 사이의 실수 랜덤값.
//        var random = Math.floor(Math.random() * 80) + 40;
        //***************************************************
        
        //************************ 시간 함수  *******************
		Date.prototype.yyyymmdd = function()
		{
			var mm = this.getMonth() + 1;
			var dd = this.getDate();

			return [this.getFullYear(),
			        (mm>9 ? '' : '0') + mm,
			        (dd>9 ? '' : '0') + dd
	        ].join('-');
		};
		
		Date.prototype.hhmmss = function()
		{
			var hh = this.getHours();
			var mm = this.getMinutes();
			var ss = this.getSeconds();

			return [(hh>9 ? '' : '0') + hh,
			        (mm>9 ? '' : '0') + mm,
				    (ss>9 ? '' : '0') + ss,
		    ].join(':');
		};

		Date.prototype.yyyymmddhhmmss = function()
		{
			return this.yyyymmdd() + " " + this.hhmmss();
		};
		//***********************************************************
        
		//********************* 사용자가 Email 입력 ****************
		function write_user_email()
		{
			if(email == '')
			{
				email = prompt("Email 주소를 입력하세요.", "터치하세요.");
				alert(email);
				
				return email;
			}
		}
		//***********************************************************
		
		//********************* ngrok 주소 입력 ************************
		function write_ngrok_address()
		{
			if(ngrok_address == '')
			{
				ngrok_address = prompt("ngrok 주소를 입력하세요.", "터치하세요.");
				return ngrok_address;
			}
		}
		//**********************************************************
		
		//********************* 중력 관련 코드 ***************************
//		var gravitySensor = tizen.sensorservice.getDefaultSensor("GRAVITY");
//
//		function Gravity_successcallback()
//		{
//		  gravitySensor.getGravitySensorData(
//				  function(sensorData)
//				  {
//			  			console.log("Gravity X: " + sensorData.x);
//			  			console.log("Gravity Y: " + sensorData.y);
//			  			console.log("Gravity Z: " + sensorData.z);
//				  },
//				  function()
//				  {
//			  			console.log("Gravity Sensor Error");
//				  });
//		}
		//**********************************************************
		
		//******************** 가속도 관련 코드 **************************
//		var accelerationSensor = tizen.sensorservice.getDefaultSensor("ACCELERATION");
//
//		function Accel_successcallback()
//		{
//		  accelerationSensor.getAccelerationSensorData(
//				  function(sensorData)
//				  {
//			  		console.log("Accel X: " + sensorData.x);
//			  		console.log("Accel Y: " + sensorData.y);
//			  		console.log("Accel Z: " + sensorData.z);
//				  }, 
//				  function()
//				  {
//					console.log("Accel Sensor Error");
//				  });
//		}		
		//**********************************************************
		
		//********************* 메인 코드 ******************************
        function setHeartRateData(heartRateInfo) {
            var pData = {
                rate: heartRateInfo.heartRate,
                rrinterval: heartRateInfo.rRInterval
            };

            heartRateData = pData;
            
            return pData;
        }

        function getData() {
            return heartRateData;
        }

        function start() {            
//        	email = write_user_email(); // 사용자에게 Email정보 입력하게 만들기.
//        	ngrok_address = write_ngrok_address(); // ngrok 주소 입력하기.
        	console.log("app started");
        	
        	document.getElementById('email-btn').addEventListener('click', function(){
        		console.log("button clicked");
        		email = document.getElementById('input-email').value;
        		ngrok_address = document.getElementById('input-ngrok').value;
        		age = document.getElementById('input-age').value;
        		console.log(ngrok_address);
        		console.log(email);
        		console.log(age);
        	});
        	
//			var sendbeaturlpath = "http://" + ngrok_address + ".ngrok.io/api/user/" + email + "/send/info";
//        	
//        	$.ajax({
//				type: "POST",
//				contentType: "application/json",
//				url: sendbeaturlpath,
//				data: JSON.stringify(age),
//				dataType: 'json',
//				
//				cache: false,
//				timeout: 600000,
//				success: function (data) {
//					console.log("SUCCESS : age", data);
//				},
//				error: function (e) {
//					console.log("ERROR : age", e);
//				}
//			});        	
        	
            heartRate.start(
            		"HRM",
            		function(hrmInfo){
            			setHeartRateData(hrmInfo);
            			event.fire('change', getData());
            			console.log(hrmInfo.heartRate);
            			
            			navigator.geolocation.getCurrentPosition(
            						function(position){
              				        	lat = String(position.coords.latitude);
            							lon = String(position.coords.longitude);
  
            				        	console.log(lat);
            				        	console.log(lon);
            						},
            						function(error){
            							console.log('locationerrorcallback');
            				        	
            				        	switch (error.code)
            				        	{
            				        		case error.PERMISSION_DENIED:
            				        			console.log('User denied the request for Geolocation.');
            				        			break;
            				        		case error.POSITION_UNAVAILABLE:
            				        			console.log('Location information is unavailable.');
            				        			break;
            				        		case error.TIMEOUT:
            				        			console.log('The request to get user location timed out.');
            				        			break;
            				        		case error.UNKNOWN_ERROR:
            				        			console.log('An unknown error occurred.');
            				        			break;
            				        	}
            						}
            					);
						
						var date = new Date();	
						var dateTime = date.yyyymmddhhmmss();
						
            			var dataSet1 = {
            					'time': String(dateTime),
            					'beat': String(hrmInfo.heartRate),
    		        			'rrInterval': String(hrmInfo.rRInterval),
    		        			'latitude': String(lat),
            					'longitude': String(lon),
//            					'age': String(age)
            			};
            			
            			console.log(dateTime);

//            			var sendbeaturlpath = "http://" + ngrok_address + ".ngrok.io/api/user/" + email + "/" + age +"/send/info";
            			var sendbeaturlpath = "http://" + ngrok_address + ".ngrok.io/api/user/" + email +"/send/info";
            			
            			console.log(sendbeaturlpath);            			
            			$.ajax({
            				type: "POST",
            				contentType: "application/json",
            				url: sendbeaturlpath,
            				data: JSON.stringify(dataSet1),
            				dataType: 'json',
            				cache: false,
            				timeout: 600000,
            				success: function (data) {
            					console.log("SUCCESS : dataset1", data);
            				},
            				error: function (e) {
            					console.log("ERROR : dataset1", e);
            				}
            			});
            	}, 
            	function(error){
            		event.fire('change', getData());
            		console.log(error);
            	},
            	heartbeattimeoption
            );
        }
        //*********************************************************
        
        function stop() {
            heartRate.stop(CONTEXT_TYPE);
        }

        function getLimit() {
            indexedDB.get(STORAGE_IDB_KEY);
        }

        function setLimit(value) {
            indexedDB.set(STORAGE_IDB_KEY, value);
        }

        function onWriteLimit() {
            event.fire('setLimit');
        }

        function onReadLimit(e) {
            event.fire('getLimit', e);
        }

        function bindEvents() {

            event.on({
                'core.storage.idb.write': onWriteLimit,
                'core.storage.idb.read': onReadLimit
            });
        }
        
        function init() {
            bindEvents();
            
            if (indexedDB.isReady()) {
                getLimit();
            } else {
                event.listen('core.storage.idb.open', getLimit);
            }
            
            //**************************** UI 실행  ******************************
            heartRate = (tizen && tizen.humanactivitymonitor) || (window.webapis && window.webapis.motion) || null;
            //**********************************************************
        }
        return {
            init: init,
            start: start,
            stop: stop,
            getLimit: getLimit,
            setLimit: setLimit
        };
    }
});