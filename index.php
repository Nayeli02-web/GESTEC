<?php
// Composer autoloader
require_once 'vendor/autoload.php';
/*Encabezada de las solicitudes*/
/*CORS*/
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");
header('Content-Type: application/json');

/*--- Requerimientos Clases o librerías*/
require_once "controllers/core/Config.php";
require_once "controllers/core/HandleException.php";
require_once "controllers/core/Logger.php";
require_once "controllers/core/MySqlConnect.php";
require_once "controllers/core/Request.php";
require_once "controllers/core/Response.php";

/***--- Agregar todos los modelos*/
require_once "models/RolModel.php";
require_once "models/UserModel.php";
require_once "models/TecnicoModel.php";
require_once "models/EspecialidadModel.php";
require_once "models/CategoriaModel.php";
require_once "models/EtiquetaModel.php";
require_once "models/SLAModel.php";
require_once "models/TicketModel.php";

/***--- Agregar todos los controladores*/
require_once "controllers/DirectorController.php";
require_once "controllers/TecnicoController.php";
require_once "controllers/EspecialidadController.php";
require_once "controllers/CategoriaController.php";
require_once "controllers/EtiquetaController.php";
require_once "controllers/SLAController.php";
require_once "controllers/TicketController.php";


//Enrutador
require_once "routes/RoutesController.php";
$index = new RoutesController();
$index->routes();


