<?php

use Firebase\JWT\JWT;

class UserModel
{
	public $enlace;
	public function __construct()
	{

		$this->enlace = new MySqlConnect();
	}
	public function all()
	{
		try {
			//Consulta sql
			$vSql = "SELECT * FROM user;";

			//Ejecutar la consulta
			$vResultado = $this->enlace->ExecuteSQL($vSql);

			// Retornar el objeto
			return $vResultado;
		} catch (Exception $e) {
			die($e->getMessage());
		}
	}

	public function get($id)
	{
		try {
			$rolM = new RolModel();

			//Consulta sql
			$vSql = "SELECT * FROM user where id=$id";
			//Ejecutar la consulta
			$vResultado = $this->enlace->ExecuteSQL($vSql);
			if ($vResultado) {
				$vResultado = $vResultado[0];
				$rol = $rolM->getRolUser($id);
				$vResultado->rol = $rol;
				// Retornar el objeto
				return $vResultado;
			} else {
				return null;
			}
		} catch (Exception $e) {
			die($e->getMessage());
		}
	}
	public function allCustomer()
	{
		try {
			//Consulta sql
			$vSql = "SELECT * FROM movie_rental.user
					where rol_id=2;";

			//Ejecutar la consulta
			$vResultado = $this->enlace->ExecuteSQL($vSql);

			// Retornar el objeto
			return $vResultado;
		} catch (Exception $e) {
			die($e->getMessage());
		}
	}
	public function customerbyShopRental($idShopRental)
	{
		try {
			//Consulta sql
			$vSql = "SELECT * FROM movie_rental.user
					where rol_id=2 and shop_id=$idShopRental;";

			//Ejecutar la consulta
			$vResultado = $this->enlace->ExecuteSQL($vSql);

			// Retornar el objeto
			return $vResultado;
		} catch (Exception $e) {
			die($e->getMessage());
		}
	}
	/**
	 * Autenticación de usuario
	 * Verifica credenciales y retorna información del usuario con su rol
	 */
	public function login($correo, $contrasena)
	{
		try {
			// Validar que se proporcionen credenciales
			if (empty($correo) || empty($contrasena)) {
				return [
					'success' => false,
					'message' => 'Correo y contraseña son requeridos'
				];
			}

			// Buscar usuario por correo
			$sql = "SELECT u.id, u.nombre, u.correo, u.contrasena, u.telefono, u.rol_id, r.nombre as rol_nombre
					FROM usuarios u
					INNER JOIN roles r ON u.rol_id = r.id
					WHERE u.correo = '" . addslashes($correo) . "'";
			
			$resultado = $this->enlace->ExecuteSQL($sql, 'asoc');

			if (empty($resultado)) {
				return [
					'success' => false,
					'message' => 'Credenciales inválidas'
				];
			}

			$usuario = $resultado[0];

			// Verificar contraseña usando password_verify
			if (!password_verify($contrasena, $usuario['contrasena'])) {
				return [
					'success' => false,
					'message' => 'Credenciales inválidas'
				];
			}

			// Si es técnico, obtener información adicional
			$tecnicoInfo = null;
			if ($usuario['rol_id'] == 3) { // Rol técnico
				$sqlTecnico = "SELECT t.id as tecnico_id, t.disponible 
							   FROM tecnicos t 
							   WHERE t.usuario_id = " . $usuario['id'];
				$tecnicoData = $this->enlace->ExecuteSQL($sqlTecnico, 'asoc');
				if (!empty($tecnicoData)) {
					$tecnicoInfo = $tecnicoData[0];
				}
			}

			// Registrar inicio de sesión
			require_once __DIR__ . '/NotificacionModel.php';
			$notificacionModel = new NotificacionModel();
			$notificacionModel->notificarInicioSesion(
				$usuario['id'],
				$_SERVER['REMOTE_ADDR'] ?? null,
				$_SERVER['HTTP_USER_AGENT'] ?? null
			);

			// Retornar usuario autenticado (sin contraseña)
			unset($usuario['contrasena']);
			
			return [
				'success' => true,
				'message' => 'Inicio de sesión exitoso',
				'usuario' => array_merge($usuario, $tecnicoInfo ? ['tecnico' => $tecnicoInfo] : [])
			];

		} catch (Exception $e) {
			error_log("Error en login: " . $e->getMessage());
			return [
				'success' => false,
				'message' => 'Error al iniciar sesión: ' . $e->getMessage()
			];
		}
	}

	/**
	 * Crear nuevo usuario
	 * Admins pueden crear cualquier tipo, técnicos y clientes se auto-registran
	 */
	public function create($objeto)
	{
		try {
			// Validaciones
			if (empty($objeto->nombre) || empty($objeto->correo) || empty($objeto->contrasena)) {
				return [
					'success' => false,
					'message' => 'Nombre, correo y contraseña son obligatorios'
				];
			}

			// Validar formato de correo
			if (!filter_var($objeto->correo, FILTER_VALIDATE_EMAIL)) {
				return [
					'success' => false,
					'message' => 'Formato de correo inválido'
				];
			}

			// Verificar si el correo ya existe
			$sqlCheck = "SELECT id FROM usuarios WHERE correo = '" . addslashes($objeto->correo) . "'";
			$existe = $this->enlace->ExecuteSQL($sqlCheck, 'asoc');
			
			if (!empty($existe)) {
				return [
					'success' => false,
					'message' => 'El correo ya está registrado'
				];
			}

			// Validar complejidad de contraseña (mínimo 8 caracteres, letras y números)
			if (strlen($objeto->contrasena) < 8) {
				return [
					'success' => false,
					'message' => 'La contraseña debe tener al menos 8 caracteres'
				];
			}

			if (!preg_match('/[a-zA-Z]/', $objeto->contrasena) || !preg_match('/[0-9]/', $objeto->contrasena)) {
				return [
					'success' => false,
					'message' => 'La contraseña debe contener al menos una letra y un número'
				];
			}

			// Hash de contraseña
			$contrasenaHash = password_hash($objeto->contrasena, PASSWORD_DEFAULT);
			
			// Rol por defecto: Cliente (2)
			$rol_id = $objeto->rol_id ?? 2;
			
			// Insertar usuario
			$sql = "INSERT INTO usuarios (nombre, correo, contrasena, telefono, rol_id) 
					VALUES (
						'" . addslashes($objeto->nombre) . "',
						'" . addslashes($objeto->correo) . "',
						'" . $contrasenaHash . "',
						'" . addslashes($objeto->telefono ?? '') . "',
						$rol_id
					)";
			
			$this->enlace->executeSQL_DML($sql);
			// $usuario_id = $this->enlace->lastInsertId(); // No disponible en MySqlConnect

			return [
				'success' => true,
				'message' => 'Usuario creado exitosamente',
				'usuario_id' => null // ID se genera pero no se retorna (no es crítico)
			];

		} catch (Exception $e) {
			error_log("Error al crear usuario: " . $e->getMessage());
			return [
				'success' => false,
				'message' => 'Error al crear usuario: ' . $e->getMessage()
			];
		}
	}

	/**
	 * Obtener usuario por ID con información de rol
	 */
	public function getUsuarioCompleto($id)
	{
		try {
			$sql = "SELECT u.id, u.nombre, u.correo, u.telefono, u.rol_id, r.nombre as rol_nombre
					FROM usuarios u
					INNER JOIN roles r ON u.rol_id = r.id
					WHERE u.id = $id";
			
			$resultado = $this->enlace->ExecuteSQL($sql, 'asoc');

			if (empty($resultado)) {
				return null;
			}

			return $resultado[0];
		} catch (Exception $e) {
			error_log("Error al obtener usuario: " . $e->getMessage());
			return null;
		}
	}

	/**
	 * Listar todos los usuarios con sus roles
	 */
	public function listarUsuarios($rol_id = null)
	{
		try {
			$whereClause = $rol_id ? "WHERE u.rol_id = $rol_id" : "";
			
			$sql = "SELECT u.id, u.nombre, u.correo, u.telefono, u.rol_id, r.nombre as rol_nombre
					FROM usuarios u
					INNER JOIN roles r ON u.rol_id = r.id
					$whereClause
					ORDER BY u.nombre";
			
			return $this->enlace->ExecuteSQL($sql, 'asoc');
		} catch (Exception $e) {
			error_log("Error al listar usuarios: " . $e->getMessage());
			return [];
		}
	}

	/**
	 * Actualizar datos de usuario (sin cambiar contraseña)
	 */
	public function update($id, $objeto)
	{
		try {
			// Validar campos obligatorios
			if (empty($objeto->nombre) || empty($objeto->correo)) {
				return [
					'success' => false,
					'message' => 'Nombre y correo son obligatorios'
				];
			}

			// Validar formato de correo
			if (!filter_var($objeto->correo, FILTER_VALIDATE_EMAIL)) {
				return [
					'success' => false,
					'message' => 'Formato de correo inválido'
				];
			}

			// Verificar si el correo ya existe en otro usuario
			$sqlCheck = "SELECT id FROM usuarios WHERE correo = '" . addslashes($objeto->correo) . "' AND id != $id";
			$existe = $this->enlace->ExecuteSQL($sqlCheck, 'asoc');
			
			if (!empty($existe)) {
				return [
					'success' => false,
					'message' => 'El correo ya está registrado por otro usuario'
				];
			}

			// Actualizar usuario (sin contraseña)
			$sql = "UPDATE usuarios SET 
						nombre = '" . addslashes($objeto->nombre) . "',
						correo = '" . addslashes($objeto->correo) . "',
						telefono = '" . addslashes($objeto->telefono ?? '') . "',
						rol_id = " . ($objeto->rol_id ?? 2) . "
					 WHERE id = $id";
			
			$this->enlace->executeSQL_DML($sql);

			return [
				'success' => true,
				'message' => 'Usuario actualizado exitosamente'
			];

		} catch (Exception $e) {
			error_log("Error en update: " . $e->getMessage());
			return [
				'success' => false,
				'message' => 'Error al actualizar usuario: ' . $e->getMessage()
			];
		}
	}

	/**
	 * Actualizar contraseña de usuario (con validaciones de seguridad)
	 */
	public function updatePassword($id, $nuevaContrasena)
	{
		try {
			// Validar complejidad de contraseña
			if (strlen($nuevaContrasena) < 8) {
				return [
					'success' => false,
					'message' => 'La contraseña debe tener al menos 8 caracteres'
				];
			}

			if (!preg_match('/[a-zA-Z]/', $nuevaContrasena) || !preg_match('/[0-9]/', $nuevaContrasena)) {
				return [
					'success' => false,
					'message' => 'La contraseña debe contener al menos una letra y un número'
				];
			}

			// Hash de contraseña
			$contrasenaHash = password_hash($nuevaContrasena, PASSWORD_DEFAULT);

			// Actualizar contraseña
			$sql = "UPDATE usuarios SET contrasena = '$contrasenaHash' WHERE id = $id";
			$this->enlace->executeSQL_DML($sql);

			return [
				'success' => true,
				'message' => 'Contraseña actualizada exitosamente'
			];

		} catch (Exception $e) {
			error_log("Error en updatePassword: " . $e->getMessage());
			return [
				'success' => false,
				'message' => 'Error al actualizar contraseña: ' . $e->getMessage()
			];
		}
	}

	/**
	 * Eliminar usuario (soft delete o hard delete según necesidad)
	 */
	public function delete($id)
	{
		try {
			// Verificar que no sea el último administrador
			$sqlCheckAdmin = "SELECT COUNT(*) as total FROM usuarios WHERE rol_id = 1 AND id != $id";
			$resultAdmin = $this->enlace->ExecuteSQL($sqlCheckAdmin, 'asoc');
			
			$sqlUsuario = "SELECT rol_id FROM usuarios WHERE id = $id";
			$usuario = $this->enlace->ExecuteSQL($sqlUsuario, 'asoc');
			
			if (!empty($usuario) && $usuario[0]['rol_id'] == 1 && $resultAdmin[0]['total'] == 0) {
				return [
					'success' => false,
					'message' => 'No se puede eliminar el último administrador del sistema'
				];
			}

			// Eliminar usuario
			$sql = "DELETE FROM usuarios WHERE id = $id";
			$this->enlace->executeSQL_DML($sql);

			return [
				'success' => true,
				'message' => 'Usuario eliminado exitosamente'
			];

		} catch (Exception $e) {
			error_log("Error en delete: " . $e->getMessage());
			return [
				'success' => false,
				'message' => 'Error al eliminar usuario: ' . $e->getMessage()
			];
		}
	}
}
