/*
 * Controlador
 */
var conection = require('../lib/conexionbd.js');

function Controlador () {

}

var Controlador = {
    obtenerPeliculas: function(req, res) {
        var limit = req.query.cantidad
        var order = req.query.columna_orden
        var tipo_orden = req.query.tipo_orden
        var pagina = req.query.pagina

        var titulo;
        var anio;
        var genero;

        if(req.query.titulo === undefined){ 
            titulo = " WHERE titulo LIKE '%%' "; 
        } else {
            titulo = " WHERE titulo LIKE '%"+req.query.titulo+"%' ";
        } 

        if(req.query.anio === undefined){ 
            anio = ""; 
        } else {
            anio = " AND anio="+req.query.anio+ " ";
        }

        if(req.query.genero === undefined){ 
            genero = ""; 
        } else {
            genero = " AND genero_id="+req.query.genero+ " ";
        }

        var sql = "SELECT * FROM pelicula" + titulo + anio + genero + " ORDER BY " + order + " " + tipo_orden + " LIMIT "+ pagina +","+ limit;
        var sqlCount = "SELECT COUNT(*) as total FROM pelicula" + titulo + anio + genero;
        conection.query(sql, function(error, resultado, fields) {
            //si hubo un error, se informa y se envía un mensaje de error
            if (error) {
                console.log("Hubo un error en la consulta", error.message);
                return res.status(404).send("Hubo un error en la consulta");
            }
    
            conection.query(sqlCount, function(err, resultadoTotal) {
                //si no hubo error, se crea el objeto respuesta con las peliculas encontradas
                var respuesta = {
                    'peliculas': resultado,
                    'total': resultadoTotal[0].total
                };

                //se envía la respuesta
                res.send(JSON.stringify(respuesta));
            })

        });
    },

    obtenerGeneros: function (req, res) {
        var sql = "select * from genero"
        //se ejecuta la consulta
        conection.query(sql, function(error, resultado, fields) {
            //si hubo un error, se informa y se envía un mensaje de error
            if (error) {
                console.log("Hubo un error en la consulta", error.message);
                return res.status(404).send("Hubo un error en la consulta");
            }
            //si no hubo error, se crea el objeto respuesta con las peliculas encontradas
            var respuesta = {
                'generos': resultado
            };
            //se envía la respuesta
            res.send(JSON.stringify(respuesta));
        });
    },

    obtenerPeliculaPorId: function (req, res) {
        var peliSql = `SELECT * FROM pelicula JOIN genero ON pelicula.genero_id = genero.id WHERE pelicula.id = ${req.params.id}`;
        var actoresSql = `SELECT * FROM actor_pelicula JOIN actor ON actor_pelicula.actor_id = actor.id WHERE actor_pelicula.pelicula_id = ${req.params.id}`;

        let respuesta = {};

        //se ejecuta la consulta
        conection.query(peliSql, function(error, resultado, fields) {
            //si hubo un error, se informa y se envía un mensaje de error
            if (error || !resultado.length) {
                var errorMessage = error ? error.message : 'No existe un resultado.'
                console.log("Hubo un error en la consulta", errorMessage);
                return res.status(404).send("Hubo un error en la consulta");
            }

            conection.query(actoresSql, (err, resultadoActores) => {
                const actores = [];
                resultadoActores.forEach(actor => {
                    actores.push(actor);
                })

                respuesta = {
                    'pelicula': resultado[0],
                    'actores': actores,
                    'genero' : resultado[0].genero_id,
                };
    
                //se envía la respuesta
                res.send(JSON.stringify(respuesta));
            });
        
        });
    },

    recomendarPelicula: function(req, res) {
        var limit = req.query.cantidad || 10;
        var order = req.query.columna_orden || 'pelicula.id';
        var tipo_orden = req.query.tipo_orden || 'ASC';
        var pagina = req.query.pagina || 0;

        var whereFilters = [];

        if(req.query.genero && req.query.genero.length > 0){ 
            whereFilters.push("genero.nombre LIKE '%" + req.query.genero + "%'");
        }

        if(req.query.anio_inicio && !req.query.anio_fin && req.query.anio_inicio.length > 0){ 
            whereFilters.push("anio="+req.query.anio_inicio);
        }

        if(req.query.anio_fin && !req.query.anio_inicio && req.query.anio_fin.length > 0){ 
            whereFilters.push("anio="+req.query.anio_fin);
        }

        if(req.query.anio_fin && req.query.anio_inicio){ 
            whereFilters.push("anio BETWEEN "+req.query.anio_inicio + " AND " + req.query.anio_fin);
        }

        if(req.query.puntuacion && req.query.puntuacion.length > 0){ 
            whereFilters.push("puntuacion="+req.query.puntuacion);
        }

        var whereFilterSql = '';
        if (whereFilters.length > 0) {
            whereFilterSql = `WHERE ${whereFilters.join(' AND ')}`;
        }

        var sql = "SELECT * FROM pelicula JOIN genero ON genero.id = pelicula.genero_id " + whereFilterSql + " ORDER BY " + order + " " + tipo_orden + " LIMIT "+ pagina +","+ limit;
        var sqlCount = "SELECT COUNT(*) as total FROM pelicula JOIN genero ON genero.id = pelicula.genero_id " + whereFilterSql;
        
        console.log(sql);
        console.log(sqlCount)
        
        conection.query(sql, function(error, resultado, fields) {
            //si hubo un error, se informa y se envía un mensaje de error
            if (error) {
                console.log("Hubo un error en la consulta", error.message);
                return res.status(404).send("Hubo un error en la consulta");
            }
    
            conection.query(sqlCount, function(err, resultadoTotal) {
                //si no hubo error, se crea el objeto respuesta con las peliculas encontradas
                var respuesta = {
                    'peliculas': resultado,
                    'total': resultadoTotal[0].total
                };

                //se envía la respuesta
                res.send(JSON.stringify(respuesta));
            })

        });

    }
}

module.exports = {
    Controlador
}

