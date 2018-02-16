/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var app = angular.module("myApp", ["ngRoute", "webcam"]);
app.config(function ($routeProvider) {
    $routeProvider
            .when("/", {
                templateUrl: "template/email.html",
                controller: "videoCtrl"
            })
            .when("/record", {
                templateUrl: "template/video.html",
                controller: "videoCtrl"
            })
            .when("/extension", {
                templateUrl: "template/extension.html",
                controller: "videoCtrl"
            })
            .when("/sorry", {
                templateUrl: "template/sorry.html"
            })
            .when("/thanks", {
                templateUrl: "template/thanku.html"
            })
            .when("/recordings", {
                templateUrl: "template/recordings.html",
                controller: "videoCtrl"
            });
});

app.controller("videoCtrl", ['$scope', '$http', '$window', 'constant', '$location',
 function ($scope, $http, $window, constant, $location) {
            $scope.eml_add = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
            $scope.screenBlob;
            $scope.isAvail = false;
            var recorderOfScreen;
            $scope.downloadUrl = constant.apiUrl + 'public/';

            $scope.submitEmail = function(){
                if ($scope.email !== "") {
                    localStorage.setItem('email', $scope.email);
                    getChromeExtensionStatus('ajhifddimkapgcifgcodmmfdlknahffk', function(status) {
                        if(status == 'installed-enabled') {
                            // chrome extension is installed & enabled.
                            $location.path('/record');
                        }
                        
                        if(status == 'installed-disabled') {
                            // chrome extension is installed but disabled.
                            alert("Please enable your screen sharing extension....")
                        }
                        
                        if(status == 'not-installed') {
                            // chrome extension is not installed
                            $location.path('/extension');
                        }
                        
                        if(status == 'not-chrome') {
                            // using non-chrome browser
                            $location.path('/record');
                        }
                    });
                }
            }

            function captureScreen(cb) {
                getScreenId(function (error, sourceId, screen_constraints) {
                    navigator.mediaDevices.getUserMedia(screen_constraints).then(cb).catch(function(error) {
                      if (error) {
                                var url = (constant.env === 'dev' && constant.env != undefined) ? constant.pageUrl + 'sorry' : constant.pageUrl + 'sorry'
                                $window.location.href = url;
                      }
                    });
                });
            }
            function captureCamera(cb) {
                navigator.mediaDevices.getUserMedia({audio: true, video: true}).then(cb);
            }
            function keepStreamActive(stream) {
                var video = document.createElement('video');
                video.muted = true;
                setSrcObject(stream, video);
                video.style.display = 'none';
                (document.body || document.documentElement).appendChild(video);
            }

            $scope.getShareScreen=function(){
                captureScreen(function(screen) {
                    screen.width = window.screen.width;
                    screen.height = window.screen.height;
                    screen.fullcanvas = true;recorderOfScreen = RecordRTC(screen, {
                        type: 'video',
                        mimeType: 'video/webm'
                    });
                    recorderOfScreen.startRecording();
            });
            }

            $scope.stopScreenRecording = function(){
            }
            

            var btnStartRecording = document.querySelector('#btn-start-recording');
            var btnStopRecording  = document.querySelector('#btn-stop-recording');
            
            var videoElement      = document.querySelector('video');
            
            var progressBar = document.querySelector('#progress-bar');
            var percentage = document.querySelector('#percentage');
            
            var recorder;
            
            // this function submits recorded blob to nodejs server
            function postFiles() {
                var blob = recorder.getBlob();
                   var blobs = recorderOfScreen.getBlob();
                var fileName = generateRandomString() + '.webm';
                var screenFile = generateRandomString() + '.webm';
                
                var file = new File([blob], fileName, {
                    type: 'video/webm'
                });

                var fileTwo = new File([blobs], screenFile, {
                    type: 'video/webm'
                });
               var dataElements = new FormData();
                    dataElements.append('email' , localStorage.getItem('email'));
                    console.log(localStorage.getItem('email'))
                     dataElements.append('video' , file);
                     dataElements.append('screenCaptureVideo' , fileTwo);
                    var post = $http({
                        method: "POST",
                        url: constant.apiUrl + "user-media/upload",
                        data: dataElements,
                         dataType: 'json',
                        processData: false,
                       contentType: false,
                        headers: {'Content-Type': undefined}
                    });
         
                    post.success(function (data, status) {
          
                    });
         
                    post.error(function (data, status) {
                        $window.alert(data.Message);
                    });
            }
            
            // XHR2/FormData
            function xhr(url, data, callback) {
                var request = new XMLHttpRequest();
                request.onreadystatechange = function() {
                    if (request.readyState == 4 && request.status == 200) {
                        callback(request.responseText);
                    }
                };
                        
                request.upload.onprogress = function(event) {
                    progressBar.max = event.total;
                    progressBar.value = event.loaded;
                    progressBar.innerHTML = 'Upload Progress ' + Math.round(event.loaded / event.total * 100) + "%";
                };
                        
                request.upload.onload = function() {
                    percentage.style.display = 'none';
                    progressBar.style.display = 'none';
                };
                request.open('POST', url);

                var formData = new FormData();
                formData.append('file', data);
                request.send(formData);
            }

            // generating random string
            function generateRandomString() {
                if (window.crypto) {
                    var a = window.crypto.getRandomValues(new Uint32Array(3)),
                        token = '';
                    for (var i = 0, l = a.length; i < l; i++) token += a[i].toString(36);
                    return token;
                } else {
                    return (Math.random() * new Date().getTime()).toString(36).replace( /\./g , '');
                }
            }

            var mediaStream = null;
            // reusable getUserMedia
            function captureUserMedia(success_callback) {
                var session = {
                    audio: true,
                    video: true
                };
                navigator.getUserMedia(session, success_callback, function(error) {
                    alert('Unable to capture your camera. Please check console logs.');
                    console.error(error);
                });
            }

            // UI events handling
            $scope.startRecording = function(){
                    btnStartRecording.disabled = true;
                    $scope.getShareScreen();
                    captureUserMedia(function(stream) {
                        mediaStream = stream;
                        
                        videoElement.src = window.URL.createObjectURL(stream);
                        videoElement.play();
                        videoElement.muted = true;
                        videoElement.controls = false;
                        
                        recorder = RecordRTC(stream, {
                            type: 'video'
                        });
                        
                        recorder.startRecording();
                        
                        // enable stop-recording button
                        btnStopRecording.disabled = false;
                    });
                // };
            }
            

            $scope.stopRecording = function(){
                    btnStartRecording.disabled = false;
                    btnStopRecording.disabled = true;
                    recorderOfScreen.stopRecording();
                    recorder.stopRecording(postFiles);
                    
                    if(mediaStream) mediaStream.stop();
                    $location.path('/thanks');
            }

            window.onbeforeunload = function() {
                startRecording.disabled = false;
            };

        navigator.getUserMedia = navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia;

$scope.recordingsUrl = [];
$scope.recordingsUrl = $location.url().split('/');
            if($scope.recordingsUrl[1] == 'recordings'){
                console.log("recordings", $scope.recordingsUrl[1]);
                $http.get(constant.apiUrl + 'user-media').
                    then(function(response) {
                        $scope.records = response.data.data;
                        console.log("$scope.records", $scope.records);
                    });
            }

            $scope.openNewTab = function(url, link){
                console.log(url,link);
                $window.open(url+link, '_blank');
            };
    }]);
