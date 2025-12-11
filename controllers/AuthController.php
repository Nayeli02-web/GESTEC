<?php
/**
 * AuthController
 * Maneja autenticación y autorización de usuarios
 * Roles: 1=Administrador, 2=Cliente (Director), 3=Técnico
 */

require_once __DIR__ . '/../models/UserModel.php';
require_once __DIR__ . '/core/Response.php';

class AuthController
{
    private $userModel;

    public function __construct()
    {
        $this->userModel = new UserModel();
    }

    /**
     * POST /auth/login
     * Autenticación de usuario
     */
    public function login()
    {
        try {
            $json = file_get_contents('php://input');
            $datos = json_decode($json);

            if (!isset($datos->correo) || !isset($datos->contrasena)) {
                $response = new Response();
                $response->status(400)->toJSON([
                    'status' => 400,
                    'message' => 'Correo y contraseña son requeridos'
                ]);
                return;
            }

            $resultado = $this->userModel->login($datos->correo, $datos->contrasena);

            if ($resultado['success']) {
                // Iniciar sesión PHP
                if (session_status() === PHP_SESSION_NONE) {
                    session_start();
                }
                
                $_SESSION['usuario_id'] = $resultado['usuario']['id'];
                $_SESSION['rol_id'] = $resultado['usuario']['rol_id'];
                $_SESSION['rol_nombre'] = $resultado['usuario']['rol_nombre'];
                $_SESSION['nombre'] = $resultado['usuario']['nombre'];
                $_SESSION['correo'] = $resultado['usuario']['correo'];

                $response = new Response();
                $response->status(200)->toJSON([
                    'status' => 200,
                    'message' => $resultado['message'],
                    'result' => $resultado['usuario']
                ]);
            } else {
                $response = new Response();
                $response->status(401)->toJSON([
                    'status' => 401,
                    'message' => $resultado['message']
                ]);
            }

        } catch (Exception $e) {
            error_log("Error en AuthController::login: " . $e->getMessage());
            $response = new Response();
            $response->status(500)->toJSON([
                'status' => 500,
                'message' => 'Error al iniciar sesión'
            ]);
        }
    }

    /**
     * POST /auth/register
     * Registro de nuevo usuario
     */
    public function register()
    {
        try {
            $json = file_get_contents('php://input');
            $datos = json_decode($json);

            // Si no se especifica rol_id, usar Cliente (2) por defecto
            if (!isset($datos->rol_id)) {
                $datos->rol_id = 2;
            }

            $resultado = $this->userModel->create($datos);

            if ($resultado['success']) {
                $response = new Response();
                $response->status(201)->toJSON([
                    'status' => 201,
                    'message' => $resultado['message'],
                    'result' => ['usuario_id' => $resultado['usuario_id']]
                ]);
            } else {
                $response = new Response();
                $response->status(400)->toJSON([
                    'status' => 400,
                    'message' => $resultado['message']
                ]);
            }

        } catch (Exception $e) {
            error_log("Error en AuthController::register: " . $e->getMessage());
            $response = new Response();
            $response->status(500)->toJSON([
                'status' => 500,
                'message' => 'Error al registrar usuario'
            ]);
        }
    }

    /**
     * POST /auth/logout
     * Cerrar sesión
     */
    public function logout()
    {
        try {
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }
            
            session_destroy();

            $response = new Response();
            $response->status(200)->toJSON([
                'status' => 200,
                'message' => 'Sesión cerrada exitosamente'
            ]);

        } catch (Exception $e) {
            error_log("Error en AuthController::logout: " . $e->getMessage());
            $response = new Response();
            $response->status(500)->toJSON([
                'status' => 500,
                'message' => 'Error al cerrar sesión'
            ]);
        }
    }

    /**
     * GET /auth/session
     * Verificar sesión activa
     */
    public function session()
    {
        try {
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }

            $response = new Response();

            if (isset($_SESSION['usuario_id'])) {
                $response->status(200)->toJSON([
                    'status' => 200,
                    'result' => [
                        'usuario_id' => $_SESSION['usuario_id'],
                        'rol_id' => $_SESSION['rol_id'],
                        'rol_nombre' => $_SESSION['rol_nombre'],
                        'nombre' => $_SESSION['nombre'],
                        'correo' => $_SESSION['correo']
                    ]
                ]);
            } else {
                $response->status(401)->toJSON([
                    'status' => 401,
                    'message' => 'No hay sesión activa'
                ]);
            }

        } catch (Exception $e) {
            error_log("Error en AuthController::session: " . $e->getMessage());
            $response = new Response();
            $response->status(500)->toJSON([
                'status' => 500,
                'message' => 'Error al verificar sesión'
            ]);
        }
    }

    /**
     * GET /auth/usuarios
     * Listar usuarios (solo administradores)
     */
    public function usuarios()
    {
        try {
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }

            // Verificar que sea administrador
            if (!isset($_SESSION['rol_id']) || $_SESSION['rol_id'] != 1) {
                $response = new Response();
                $response->status(403)->toJSON([
                    'status' => 403,
                    'message' => 'No autorizado'
                ]);
                return;
            }

            $usuarios = $this->userModel->listarUsuarios();
            $response = new Response();
            $response->status(200)->toJSON([
                'status' => 200,
                'result' => $usuarios
            ]);

        } catch (Exception $e) {
            error_log("Error en AuthController::usuarios: " . $e->getMessage());
            $response = new Response();
            $response->status(500)->toJSON([
                'status' => 500,
                'message' => 'Error al obtener usuarios'
            ]);
        }
    }

    /**
     * POST /auth/crear-usuario
     * Crear usuario (solo administradores)
     */
    public function create()
    {
        try {
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }

            // Verificar que sea administrador
            if (!isset($_SESSION['rol_id']) || $_SESSION['rol_id'] != 1) {
                $response = new Response();
                $response->status(403)->toJSON([
                    'status' => 403,
                    'message' => 'No autorizado'
                ]);
                return;
            }

            $json = file_get_contents('php://input');
            $datos = json_decode($json);

            $resultado = $this->userModel->create($datos);

            if ($resultado['success']) {
                $response = new Response();
                $response->status(201)->toJSON([
                    'status' => 201,
                    'message' => $resultado['message'],
                    'result' => ['usuario_id' => $resultado['usuario_id']]
                ]);
            } else {
                $response = new Response();
                $response->status(400)->toJSON([
                    'status' => 400,
                    'message' => $resultado['message']
                ]);
            }

        } catch (Exception $e) {
            error_log("Error en AuthController::create: " . $e->getMessage());
            $response = new Response();
            $response->status(500)->toJSON([
                'status' => 500,
                'message' => 'Error al crear usuario'
            ]);
        }
    }

    /**
     * PUT /auth/usuario/{id}
     * Actualizar usuario (sin cambiar contraseña)
     */
    public function update($id)
    {
        try {
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }

            // Verificar que sea administrador
            if (!isset($_SESSION['rol_id']) || $_SESSION['rol_id'] != 1) {
                $response = new Response();
                $response->status(403)->toJSON([
                    'status' => 403,
                    'message' => 'No autorizado'
                ]);
                return;
            }

            $json = file_get_contents('php://input');
            $datos = json_decode($json);

            $resultado = $this->userModel->update($id, $datos);

            if ($resultado['success']) {
                $response = new Response();
                $response->status(200)->toJSON([
                    'status' => 200,
                    'message' => $resultado['message']
                ]);
            } else {
                $response = new Response();
                $response->status(400)->toJSON([
                    'status' => 400,
                    'message' => $resultado['message']
                ]);
            }

        } catch (Exception $e) {
            error_log("Error en AuthController::update: " . $e->getMessage());
            $response = new Response();
            $response->status(500)->toJSON([
                'status' => 500,
                'message' => 'Error al actualizar usuario'
            ]);
        }
    }

    /**
     * PUT /auth/usuario/{id}/password
     * Actualizar contraseña de usuario
     */
    public function updatePassword($id)
    {
        try {
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }

            // Verificar que sea administrador
            if (!isset($_SESSION['rol_id']) || $_SESSION['rol_id'] != 1) {
                $response = new Response();
                $response->status(403)->toJSON([
                    'status' => 403,
                    'message' => 'No autorizado'
                ]);
                return;
            }

            $json = file_get_contents('php://input');
            $datos = json_decode($json);

            if (empty($datos->password)) {
                $response = new Response();
                $response->status(400)->toJSON([
                    'status' => 400,
                    'message' => 'La contraseña es requerida'
                ]);
                return;
            }

            $resultado = $this->userModel->updatePassword($id, $datos->password);

            if ($resultado['success']) {
                $response = new Response();
                $response->status(200)->toJSON([
                    'status' => 200,
                    'message' => $resultado['message']
                ]);
            } else {
                $response = new Response();
                $response->status(400)->toJSON([
                    'status' => 400,
                    'message' => $resultado['message']
                ]);
            }

        } catch (Exception $e) {
            error_log("Error en AuthController::updatePassword: " . $e->getMessage());
            $response = new Response();
            $response->status(500)->toJSON([
                'status' => 500,
                'message' => 'Error al actualizar contraseña'
            ]);
        }
    }

    /**
     * DELETE /auth/usuario/{id}
     * Eliminar usuario
     */
    public function deleteUser($id)
    {
        try {
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }

            // Verificar que sea administrador
            if (!isset($_SESSION['rol_id']) || $_SESSION['rol_id'] != 1) {
                $response = new Response();
                $response->status(403)->toJSON([
                    'status' => 403,
                    'message' => 'No autorizado'
                ]);
                return;
            }

            $resultado = $this->userModel->delete($id);

            if ($resultado['success']) {
                $response = new Response();
                $response->status(200)->toJSON([
                    'status' => 200,
                    'message' => $resultado['message']
                ]);
            } else {
                $response = new Response();
                $response->status(400)->toJSON([
                    'status' => 400,
                    'message' => $resultado['message']
                ]);
            }

        } catch (Exception $e) {
            error_log("Error en AuthController::deleteUser: " . $e->getMessage());
            $response = new Response();
            $response->status(500)->toJSON([
                'status' => 500,
                'message' => 'Error al eliminar usuario'
            ]);
        }
    }
}
