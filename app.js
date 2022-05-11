const express =  require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const path = require('path')

const userRoutes = require('./routes/user')
const sauceRoutes = require('./routes/sauce')

const app = express()

// Creation de la connexion à la db
mongoose.connect('mongodb://localhost/Piquante', { useNewUrlParser: true,
useUnifiedTopology: true })
    .then(() => console.log('Mongodb connection successful !'))
    .catch(() => console.log('Mongodb connection failed !'))

// On utilise Cors pour permettre les connexions via divers sources
app.use(cors())

// On utilise Json pour parser le body des requetes
app.use(express.json())

// Servir le dossier images
app.use('/images', express.static(path.join(__dirname, 'images')))

// On importe nos routes pour la partie User
app.use('/api/auth', userRoutes)

// On importe nos routes pour les sauces
app.use('/api/sauces', sauceRoutes)

// On exporte l'app pour l'utiliser dans le fichier server.js
module.exports = app