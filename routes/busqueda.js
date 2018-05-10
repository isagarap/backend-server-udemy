var express = require('express');
var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// Busqueda por colección
app.get('/coleccion/:tabla/:busqueda', (req, res) => {

    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    var promesa;

    switch (tabla.toString().toLower()) {
        case "hospital":
            promesa = BuscarHospitales(busqueda, regex);
            break;
        case "usuario":
            promesa = BuscarUsuarios(busqueda, regex);
            break;
        case "medico":
            promesa = BuscarMedicos(busqueda, regex);
            break;
        default:
            return res.status(400).json({
                ok: false,
                message: 'Los tipos de busqueda solo son usuarios, medicos y hospitales',
                error: { message: 'Tipo de tabla / Coleccion no válida' }
            });
    }

    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    });

});

// Busqueda general
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([
        BuscarHospitales(busqueda, regex),
        BuscarMedicos(busqueda, regex),
        BuscarUsuarios(busqueda, regex)
    ]).then(respuestas => {

        res.status(200).json({
            ok: true,
            hospitales: respuestas[0],
            medicos: respuestas[1],
            usuarios: respuestas[2]
        });

    });

});

function BuscarHospitales(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email role')
            .exec((err, hospitales) => {

                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitales);
                }

            });

    });

}

function BuscarMedicos(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email role')
            .populate('hospital')
            .exec((err, medicos) => {

                if (err) {
                    reject('Error al cargar Medico', err);
                } else {
                    resolve(medicos);
                }

            });

    });

}

function BuscarUsuarios(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Usuario
            .find({}, 'nombre email role')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {

                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }

            })

    });

}

module.exports = app;