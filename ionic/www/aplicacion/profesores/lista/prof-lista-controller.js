﻿angular.module('starter')
  .controller('PasarListaCtrl', controlador);

function controlador($scope, $ionicPopup, $ionicLoading, ObtenerDatosSrv, $http) {
  var SERVERURL = 'http://80.49.113.168:9095';

  $scope.alumnos = [];
  $scope.asignaturas_profesor = [];

  $http.post(SERVERURL + '/asignaturas_profesor', {id_profesor: ObtenerDatosSrv.user.data.id})
    .then(function (res) {
      $scope.asignaturas_profesor = res.data;
      for (var i = 0; i < $scope.asignaturas_profesor.length; i++) {
        $scope.asignaturas_profesor[i].showAsig = false;
        $http.post(SERVERURL + '/alumnos_clase', {id_clase: $scope.asignaturas_profesor[i].id_clase})
          .then(function (res) {
            for(var j=0; j<res.data.length; j++){
              $scope.alumnos.push(res.data[j]);
            }
          })
          .catch(function (err) {
            console.log(err);
          })
      }
    })
    .catch(function (err) {
      console.log(err);
    });

  /*$scope.asignaturas = [
    {
      id: 1,
      nombre: 'Matemáticas',
      curso: '1º ESO',
      alumnos: [
        {nombre: 'Jose Maria', apellidos: 'Fsadasdf'},
        {nombre: 'Pepito'},
        {nombre: 'Fulanito'}
      ],
      showAsig: false
    },
    {
      id: 2,
      nombre: 'Matemáticas',
      curso: '2º ESO',
      alumnos: [
        {nombre: 'Fran'},
        {nombre: 'Luis'},
        {nombre: 'Ana'}
      ],
      showAsig: false
    },
    {
      id: 3,
      nombre: 'Lengua',
      curso: '4º ESO',
      alumnos: [
        {nombre: 'Gustavo'},
        {nombre: 'Marisa'}
      ],
      showAsig: false
    }
  ];*/

  $scope.enviarFaltas = function (asig) {
    $ionicPopup.confirm({
      title: 'Confirmación envío incidencias',
      template: '¿Estás seguro de que quieres enviar las incidencias?'
    }).then(function (res) {
      if (res) {
        for(var i=0; i<$scope.alumnos.length; i++){
          var sesion = 0;
          if ($scope.alumnos[i].falta){
            sesion = obtenerSesion();
            ponerIncidencia($scope.alumnos[i].id, ObtenerDatosSrv.user.data.id, sesion, 'FALTA', '');
            $scope.alumnos[i].falta = false;
          }
          if ($scope.alumnos[i].retraso){
            sesion = obtenerSesion();
            ponerIncidencia($scope.alumnos[i].id, ObtenerDatosSrv.user.data.id, sesion, 'RETRASO', '');
            $scope.alumnos[i].retraso = false;
          }
        }
      }
    });
  };

  function ponerIncidencia(id_alumno, id_profesor, sesion, tipo, descripcion) {
    $http.post(SERVERURL + '/insertar_evento'
      , {
        id_alumno: id_alumno,
        id_profesor: id_profesor,
        sesion: sesion,
        tipo: tipo,
        descripcion: descripcion
      })
      .then(function (res) {
        $ionicLoading.show({
          template: 'Se han enviado las incidencias con éxito',
          noBackdrop: true,
          duration: 2000
        });
        console.log(res);
        return res;
      })
      .catch(function (err) {
        console.log(err);
      });
  }

  function obtenerSesion() {
    var fecha = new Date();
    var hora = fecha.getHours();
    var minuto = fecha.getMinutes();

    if(8 == hora){
      return 1;
    } else if (9 == hora){
      if (minuto < 10){
        return 1;
      } else {
        return 2;
      }
    } else if (10 == hora){
      if (minuto < 5){
        return 2;
      } else {
        return 3;
      }
    } else if (11 == hora){
      return 5;
    } else if (12 == hora){
      if (minuto < 25){
        return 5;
      } else {
        return 6;
      }
    } else if (13 == hora){
      if (minuto < 20){
        return 6;
      } else {
        return 7;
      }
    } else if (14 == hora){
      return 7;
    } else {
      return null;
    }
  }
}
