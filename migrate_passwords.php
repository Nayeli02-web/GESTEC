<?php
/**
 * Script para migrar contraseñas planas a hash
 * Ejecutar una sola vez después del desarrollo
 */

// Conexión directa sin usar clases del framework
$host = 'localhost';
$db = 'gestec';
$user = 'root';
$pass = '123456';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Error de conexión: " . $e->getMessage());
}

echo "=== MIGRACIÓN DE CONTRASEÑAS ===\n\n";

// Obtener todos los usuarios con contraseñas planas (sin $2y$ que indica bcrypt)
$sql = "SELECT id, nombre, correo, contrasena FROM usuarios WHERE contrasena NOT LIKE '$2y$%'";
$stmt = $pdo->query($sql);
$usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (empty($usuarios)) {
    echo "No hay contraseñas planas para migrar. Todas las contraseñas ya están encriptadas.\n";
    exit(0);
}

echo "Encontrados " . count($usuarios) . " usuarios con contraseñas planas.\n\n";

$migrados = 0;
$errores = 0;

foreach ($usuarios as $usuario) {
    echo "Migrando usuario: {$usuario['nombre']} ({$usuario['correo']})... ";
    
    try {
        // Hashear la contraseña actual
        $hash = password_hash($usuario['contrasena'], PASSWORD_DEFAULT);
        
        // Actualizar en la base de datos
        $sqlUpdate = "UPDATE usuarios SET contrasena = :hash WHERE id = :id";
        $stmt = $pdo->prepare($sqlUpdate);
        $stmt->execute(['hash' => $hash, 'id' => $usuario['id']]);
        
        echo "OK\n";
        $migrados++;
        
    } catch (Exception $e) {
        echo "ERROR: " . $e->getMessage() . "\n";
        $errores++;
    }
}

echo "\n=== RESUMEN ===\n";
echo "Migrados: $migrados\n";
echo "Errores: $errores\n";
echo "\n";

if ($errores === 0) {
    echo "Migración completada exitosamente.\n";
    echo "IMPORTANTE: Las contraseñas actuales siguen siendo las mismas, solo ahora están encriptadas.\n";
    echo "Se recomienda que los usuarios cambien sus contraseñas por seguridad.\n";
} else {
    echo "Hubo errores durante la migración. \n";
}

echo "\n";
