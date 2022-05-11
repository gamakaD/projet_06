const Sauce = require('../models/Sauce')
const fs = require('fs')

// Recuperer toutes les sauces
exports.getAllSauce = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ message: error }))
}

// Recuperer une sauce 
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(400).json({ message: error }))
}

// Creer une sauce
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce)
    delete sauceObject._id
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
    })
    sauce.save()
        .then(() => res.status(201).json({ message: 'New sauce created !' }))
        .catch(error => res.status(400).json({ message: error }))
}

// Mettre a jour une sauce
exports.updateSauce = (req, res, next) => {
    Sauce.findById(req.params.id)
        .then(sauce => {
            if (!sauce) {
                return res.status(404).json({ message: 'Sauce not found !' })
            }
            if (sauce.userId !== req.auth.userId) {
                return res.status(403).json({ error: new Error('Unauthorized request !') })
            }
            const sauceObject = req.file ?
                {
                    ...JSON.parse(req.body.sauce),
                    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
                } : { ...req.body }

            Sauce.findByIdAndUpdate(req.params.id, { ...sauceObject })
                .then(() => res.status(200).json({ message: 'Sauce successfuly updated !' }))
                .catch(error => res.status(400).json({ message: error }))
        })
        .catch(error => res.status(500).json({ message: error }))
}

// Supprimer une sauce
exports.deleteSauce = (req, res, next) => {
    Sauce.findById(req.params.id)
        .then(sauce => {
            if (!sauce) {
                return res.status(404).json({ message: 'Sauce not found !' })
            }
            if (sauce.userId !== req.auth.userId) {
                return res.status(403).json({ error: new Error('Unauthorized request !') })
            }
            const filename = sauce.imageUrl.split('/images/')[1]
            fs.unlink(`images/${filename}`, () => {
                Sauce.findByIdAndDelete(req.params.id)
                    .then(() => res.status(200).json({ message: 'Sauce deleted successfuly !' }))
                    .catch(error => res.status(400).json({ message: error }))
            })
        })
        .catch(error => res.status(500).json({ message: error }))
}

// Liker ou Disliker une sauce
exports.likeSauce = (req, res, next) => {
    Sauce.findById(req.params.id)
        .then(sauce => {
            if (req.body.like === 1) {
                if (!sauce.usersLiked.includes(req.body.userId)) {
                    sauce.likes++
                    sauce.usersLiked.push(req.body.userId)
                }
            }
            if (req.body.like === -1) {
                if (!sauce.usersDisliked.includes(req.body.userId)) {
                    sauce.dislikes++
                    sauce.usersDisliked.push(req.body.userId)
                }
            }
            if (req.body.like === 0) {
                if (sauce.usersLiked.includes(req.body.userId)) {
                    sauce.likes--
                    sauce.usersLiked.splice(sauce.usersLiked.indexOf(req.body.userId), 1)
                } else {
                    sauce.dislikes--
                    sauce.usersDisliked.splice(sauce.usersLiked.indexOf(req.body.userId), 1)
                }
            }
            sauce.save()
                .then(() => res.status(200).json({ message: 'ok' }))
                .catch(error => res.status(400).json({ message: error }))
        })
        .catch(error => res.status(500).json({ message: error }))
}