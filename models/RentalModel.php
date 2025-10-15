<?php
class RentalModel{
    public $enlace;
    public function __construct() {
        
        $this->enlace=new MySqlConnect();
       
    }
    public function all(){
        try {
            //Consulta sql
			$vSql = "SELECT * FROM rental order by rental_date asc;";
			
            //Ejecutar la consulta
			$vResultado = $this->enlace->ExecuteSQL ( $vSql);
            if(!empty($vResultado) && is_array($vResultado)){
                for ($i=0; $i <= count($vResultado)-1; $i++) { 
                    $vResultado[$i]=$this->get($vResultado[$i]->id);
                }
                
            }
			// Retornar el objeto
			return $vResultado;
		} catch ( Exception $e ) {
			die ( $e->getMessage () );
		}
    }

    public function get($id){
        $vResultado=null;
        try {
            $rentalMovieM=new RentalMovieModel();
            $shopM=new ShopRentalModel();
            $userM=new UserModel();
            //Consulta sql
			$vSql = "SELECT * FROM rental where id=$id";           
			
            //Ejecutar la consulta
			$vResultado = $this->enlace->ExecuteSQL ( $vSql);
            if (!empty($vResultado)) {
                $vResultado=$vResultado[0];
                //Tienda
                $vResultado->shopRental=$shopM->get($vResultado->shop_id);
                //Cliente
                $vResultado->customer=$userM->get($vResultado->customer_id);
                //Lista de peliculas
                $vResultado->movies=$rentalMovieM->getRental($id);
            }
			// Retornar el objeto
			return $vResultado;
		} catch ( Exception $e ) {
			die ( $e->getMessage () );
		}
    }
    
	public function create($objeto) {
        try {
            
		} catch ( Exception $e ) {
			die ( $e->getMessage () );
		}
    }
    //Ventas por mes x Tienda
    public function rentalMonthbyShop()
    {
        try {
            //Consulta sql
            $vSql = "SELECT 
                        r.shop_id, 
                        s.name AS shop_name,
                        DATE_FORMAT(r.rental_date, '%m-%Y') AS month,
                        SUM(r.total) AS monthly_total
                    FROM 
                        rental r
                    JOIN 
                        shop_rental s ON r.shop_id = s.id
                    GROUP BY 
                        r.shop_id, shop_name, month
                    ORDER BY 
                        r.shop_id, month;";

            //Ejecutar la consulta
            $vResultado = $this->enlace->ExecuteSQL($vSql);

            // Retornar el objeto
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //cantidad de alquileres por pelicula
    public function rentalbyMovie()
    {
        try {
            //Consulta sql
            $vSql = "SELECT 
                        m.title AS pelicula,
                        COUNT(rm.movie_id) AS cantidad_alquileres
                    FROM 
                        rental_movie rm
                    JOIN 
                        movie m ON rm.movie_id = m.id
                    GROUP BY 
                        m.title
                    ORDER BY 
                        cantidad_alquileres DESC;";

            //Ejecutar la consulta
            $vResultado = $this->enlace->ExecuteSQL($vSql);

            // Retornar el objeto
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
}