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

app.controller("videoCtrl", ['$scope', function ($scope) {
        console.log("hiiiiiiiiiiiiii");
        $scope.myChannel = {
            // the fields below are all optional
            videoHeight: 800,
            videoWidth: 600,
            video: null // Will reference the video element on success
        };

        navigator.getUserMedia = navigator.getUserMedia ||
                navigator.webkitGetUserMedia ||
                navigator.mediaDevices.getUserMedia;

        if (navigator.getUserMedia) {
            navigator.getUserMedia({audio: true, video: {width: 1280, height: 720}},
                    function (stream) {
                        var video = document.querySelector('video');
                        video.srcObject = stream;
                        video.onloadedmetadata = function (e) {
                            video.play();
                        };
                    },
                    function (err) {
                        console.log("The following error occurred: " + err.name);
                    }
            );
        } else {
            console.log("getUserMedia not supported");
        }
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