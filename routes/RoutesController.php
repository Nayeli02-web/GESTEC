<?php
class RoutesController
{
    public function __construct()
    {
    }

    public function routes()
    {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        $uri = $_SERVER['REQUEST_URI'] ?? '/';

        // Serve uploaded files directly
        if (strpos($uri, '/uploads/') === 0) {
            $filePath = $_SERVER['DOCUMENT_ROOT'] . $uri;
            if (file_exists($filePath)) {
                header('Content-Type: ' . mime_content_type($filePath));
                readfile($filePath);
                exit;
            }
            http_response_code(404);
            header('Content-Type: text/plain');
            echo 'Archivo no encontrado.';
            exit;
        }

        // Preflight
        if ($method === 'OPTIONS') {
            http_response_code(200);
            exit;
        }

        // Normalize path and split segments
        $path = parse_url($uri, PHP_URL_PATH);
        $segments = array_values(array_filter(explode('/', $path)));

        if (empty($segments)) {
            header('Content-Type: application/json');
            http_response_code(404);
            echo json_encode(['status' => 404, 'result' => 'Controlador no especificado']);
            return;
        }

        // Find controller segment (supports project subfolders)
        $foundIndex = null;
        $controllerClass = null;
        foreach ($segments as $idx => $seg) {
            $candidate = ucfirst($seg) . 'Controller';
            // If class not already declared, try requiring the controller file by convention.
            // This supports controllers that are not pre-required in index.php.
            if (!class_exists($candidate)) {
                $controllerFile = __DIR__ . '/../controllers/' . $candidate . '.php';
                if (file_exists($controllerFile)) {
                    require_once $controllerFile;
                }
            }

            if (class_exists($candidate)) {
                $foundIndex = $idx;
                $controllerClass = $candidate;
                break;
            }
        }

        if ($foundIndex === null) {
            header('Content-Type: application/json');
            http_response_code(404);
            echo json_encode(['status' => 404, 'result' => 'Controlador no encontrado']);
            return;
        }

        $action = $segments[$foundIndex + 1] ?? null;
        $param1 = $segments[$foundIndex + 2] ?? null;
        $param2 = $segments[$foundIndex + 3] ?? null;

        try {
            $controller = new $controllerClass();

            switch ($method) {
                case 'GET':
                    if (!$action) {
                        $controller->index();
                    } elseif (is_numeric($action) && !$param1) {
                        $controller->get($action);
                    } elseif ($action && method_exists($controller, $action)) {
                        if ($param1 && $param2) {
                            $controller->$action($param1, $param2);
                        } elseif ($param1) {
                            $controller->$action($param1);
                        } else {
                            $controller->$action();
                        }
                    } else {
                        header('Content-Type: application/json');
                        http_response_code(404);
                        echo json_encode(['status' => 404, 'result' => 'Acción no encontrada']);
                    }
                    break;

                case 'POST':
                    if ($action && method_exists($controller, $action)) {
                        $controller->$action();
                    } else {
                        $controller->create();
                    }
                    break;

                case 'PUT':
                case 'PATCH':
                    if ($param1 && is_numeric($param1)) {
                        $controller->update($param1);
                    } else {
                        $controller->update();
                    }
                    break;

                case 'DELETE':
                    if ($param1) {
                        $controller->delete($param1);
                    } elseif ($action && method_exists($controller, $action)) {
                        $controller->$action();
                    } else {
                        $controller->delete();
                    }
                    break;

                default:
                    header('Content-Type: application/json');
                    http_response_code(405);
                    echo json_encode(['status' => 405, 'result' => 'Método HTTP no permitido']);
                    break;
            }
        } catch (\Throwable $th) {
            header('Content-Type: application/json');
            http_response_code(500);
            echo json_encode(['status' => 500, 'result' => $th->getMessage()]);
        }
    }
}
