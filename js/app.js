/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var app = angular.module("myApp", ["ngRoute", "webcam"]);
app.config(function ($routeProvider) {
    $routeProvider
            .when("/", {
                templateUrl: "template/video.html",
                controller: "videoCtrl"
            });
});

app.controller("videoCtrl", ['$scope', '$http', '$window', function ($scope, $http, $window) {
            var btnStartRecording = document.querySelector('#btn-start-recording');
            var btnStopRecording  = document.querySelector('#btn-stop-recording');
            
            var videoElement      = document.querySelector('video');
            
            var progressBar = document.querySelector('#progress-bar');
            var percentage = document.querySelector('#percentage');
            
            var recorder;

            // reusable helpers
            
            // this function submits recorded blob to nodejs server
            function postFiles() {
                var blob = recorder.getBlob();

                // getting unique identifier for the file name
                var fileName = generateRandomString() + '.webm';
                
                var file = new File([blob], fileName, {
                    type: 'video/webm'
                });

//                 videoElement.src = '';
//                 videoElement.poster = '/ajax-loader.gif';
// // 
               var dataElements = new FormData();
                    dataElements.append('email' , 'rhinny.glory@credencys.com');
                     dataElements.append('video' , file);
                    var post = $http({
                        method: "POST",
                        url: "http://192.168.11.221:3030/user-media/upload",
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
                alert("audio:",session.audio)
                navigator.getUserMedia(session, success_callback, function(error) {
                    alert('Unable to capture your camera. Please check console logs.');
                    console.error(error);
                });
            }

            // UI events handling
            $scope.startRecording = function(){
                // console.log("started");
                // btnStartRecording.onclick = function() {
                    btnStartRecording.disabled = true;
                    
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
                // console.log("stopped");
                // btnStopRecording.onclick = function() {
                    btnStartRecording.disabled = false;
                    btnStopRecording.disabled = true;
                    
                    recorder.stopRecording(postFiles);
                    // var blob = recorder.getBlob();
// console.log(blob,'bloddd')
// return false;
                    // getting unique identifier for the file name
                    // var fileName = generateRandomString() + '.webm';
                    
                    // var file = new File([blob], fileName, {
                    //     type: 'video/webm'
                    // });
                    // console.log(file,'file')
                    // var header ={ "Access-Control-Allow-Origin": "*"};
                    // videoElement.src = '';
                    // // videoElement.poster = '/ajax-loader.gif';
                    // var dataElements = new FormData();
                    // dataElements.append('email' , 'rhinny.glory@credencys.com');
                    //  dataElements.append('video' , file);
                    //  console.log(file, "file")
                    // // dataElements.video = file;
                    // console.log(header,"Header");
                    // console.log(dataElements,"Hejader");
                    // // debugger;
                    // var post = $http({
                    //     method: "POST",
                    //     url: "http://192.168.11.221:3030/user-media/upload",
                    //     data: dataElements,
                    //      dataType: 'json',
                    //     processData: false,
                    //    contentType: false,
                    //     headers: {'Content-Type': undefined}
                    // });
                    // console.log(post,'post')
         
                    // post.success(function (data, status) {
                    //     document.querySelector('#footer-h2').innerHTML = '<a href="' + videoElement.src + '">' + videoElement.src + '</a>';
                    //     // $window.alert("Hello: " + data.Name + " .\nCurrent Date and Time: " + data.DateTime);
                    // });
         
                    // post.error(function (data, status) {
                    //     $window.alert(data.Message);
                    // });


                    // xhr('192.168.11.221:3030/user-media/upload', file, function(responseText) {
                    //     var fileURL = JSON.parse(responseText).fileURL;

                    //     console.info('fileURL', fileURL);
                    //     videoElement.src = fileURL;
                    //     videoElement.play();
                    //     videoElement.muted = false;
                    //     videoElement.controls = true;

                    //     document.querySelector('#footer-h2').innerHTML = '<a href="' + videoElement.src + '">' + videoElement.src + '</a>';
                    // });
                    
                    if(mediaStream) mediaStream.stop();
                // };
            }

            window.onbeforeunload = function() {
                startRecording.disabled = false;
            };
        // $scope.myChannel = {
        //     // the fields below are all optional
        //     videoHeight: 800,
        //     videoWidth: 600,
        //     video: null // Will reference the video element on success
        // };

        // navigator.getUserMedia = navigator.getUserMedia ||
        //         navigator.webkitGetUserMedia ||
        //         navigator.mediaDevices.getUserMedia;

        // if (navigator.getUserMedia) {
        //     navigator.getUserMedia({audio: true, video: {width: 1280, height: 720}},
        //             function (stream) {
        //                 var video = document.querySelector('video');
        //                 video.srcObject = stream;
        //                 video.onloadedmetadata = function (e) {
        //                     video.play();
        //                 };
        //             },
        //             function (err) {
        //                 console.log("The following error occurred: " + err.name);
        //             }
        //     );
        // } else {
        //     console.log("getUserMedia not supported");
        // }
//    var video = angular.element('#video'),
//        vendorUrl = window.URL || window.webkitURL;
//        
//        navigator.getMedia = navigator.getUserMedia ||
//                             navigator.webkitGetUserMedia ||
//                             navigator.mozGetUserMedia ||
//                             navigator.msGetUserMedia;
//                     console.log(video,"video");
//                     
//       navigator.getMedia({
//          video: true,
//          audio: false
//       }, function(stream){
////           video.src = vendorUrl.createObjectURL(stream);
//           video.src = window.URL.createObjectURL(stream);;
//           video.play();
//   }, function(error){
//           console.log(error);
//       });
    }]);