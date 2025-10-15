<?php
class MovieModel
{
    //Conectarse a la BD
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }
   /**
     * Listar peliculas
     * @param 
     * @return $vResultado - Lista de objetos
     */
    public function all()
    {
        try {
            $imagenM=new ImageModel();
            //Consulta SQL
            $vSQL = "SELECT * FROM movie order by title desc;";
            //Ejecutar la consulta
            $vResultado = $this->enlace->ExecuteSQL($vSQL);
            //Incluir imagenes
            if(!empty($vResultado) && is_array($vResultado)){
                for ($i=0; $i < count($vResultado); $i++) { 
                    $vResultado[$i]=$this->get($vResultado[$i]->id);

                    //$vResultado[$i]->imagen=$imagenM->getImageMovie(($vResultado[$i]->id));
                }
            }

            //Retornar la respuesta

            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
    /**
     * Obtener una pelicula
     * @param $id de la pelicula
     * @return $vresultado - Objeto pelicula
     */
    //
    public function get($id)
    {
        try {
            $directorM=new DirectorModel();
            $genreM=new GenreModel();
            $actorM=new ActorModel();
            $imagenM=new ImageModel();
            $vSql = "SELECT * FROM movie
                    where id=$id;";

            //Ejecutar la consulta sql
            $vResultado = $this->enlace->executeSQL($vSql);
            if(!empty($vResultado)){
                $vResultado=$vResultado[0];
                //Imagenes
                $vResultado->imagen=$imagenM->getImageMovie(($vResultado->id));
                //Director
                $director=$directorM->get($vResultado->director_id);
                $vResultado->director=$director;
                //Generos --genres
                $listaGeneros=$genreM->getGenreMovie($vResultado->id);
                $vResultado->genres=$listaGeneros;
                //Actores --actors
                $listaActores=$actorM->getActorMovie($id);
                $vResultado->actors=$listaActores;
            }

            
            //Retornar la respuesta
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
    /**
     * Obtener las peliculas por tienda
     * @param $idShopRental identificador de la tienda
     * @return $vresultado - Lista de peliculas incluyendo el precio
     */
    //
    public function moviesByShopRental($idShopRental)
    {
        try {
            $imagenM=new ImageModel();
            //Consulta SQL
            $vSQL = "SELECT m.*, i.price
                    FROM movie m, inventory i
                    where 
                    m.id=i.movie_id
                    and shop_id=$idShopRental
                    order by m.title desc";
            //Ejecutar la consulta
            $vResultado = $this->enlace->ExecuteSQL($vSQL);

            //Incluir imagenes
            if(!empty($vResultado) && is_array($vResultado)){
                for ($i=0; $i < count($vResultado); $i++) { 
                    $vResultado[$i]->imagen=$imagenM->getImageMovie(($vResultado[$i]->id));
                }
            }
            //Retornar la respuesta

            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
    /**
     * Obtener la cantidad de peliculas por genero
     * @param 
     * @return $vresultado - Cantidad de peliculas por genero
     */
    //
    public function getCountByGenre()
    {
        try {

            $vResultado = null;
            //Consulta sql
            $vSql = "SELECT count(mg.genre_id) as 'Cantidad', g.title as 'Genero'
			FROM genre g, movie_genre mg, movie m
			where mg.movie_id=m.id and mg.genre_id=g.id
			group by mg.genre_id";

            //Ejecutar la consulta
            $vResultado = $this->enlace->ExecuteSQL($vSql);
            // Retornar el objeto
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
    /**
     * Crear pelicula
     * @param $objeto pelicula a insertar
     * @return $this->get($idMovie) - Objeto pelicula
     */
    //
    public function create($objeto)
    {
        try {
            
        } catch (Exception $e) {
            handleException($e);
        }
    }
    /**
     * Actualizar pelicula
     * @param $objeto pelicula a actualizar
     * @return $this->get($idMovie) - Objeto pelicula
     */
    //
    public function update($objeto)
    {
        try {
           
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
