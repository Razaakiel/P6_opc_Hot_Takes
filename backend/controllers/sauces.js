const Sauces = require('../models/Sauces');
const fs = require('fs');

exports.createSauces = (req, res, next) => {
    console.log('createThing : ', req.body);
    const thingObject = JSON.parse(req.body.sauce);
    delete thingObject._id;
    const thing = new Sauces({
        ...thingObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [' '],
        usersDisLiked: [' '],
    });
    thing.save()
        .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
        .catch(error => res.status(400).json({ error }));
};

exports.getOneSauces = (req, res, next) => {
    Sauces.findOne({
        _id: req.params.id
    }).then(
        (thing) => {
            res.status(200).json(thing);
        }
    ).catch(
        (error) => {
            res.status(404).json({
                error: error
            });
        }
    );
};

exports.modifySauces = (req, res, next) => {
    const thingObject = req.file ?
        {
            ...JSON.parse(req.body.thing),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body };
    Sauces.updateOne({ _id: req.params.id }, { ...thingObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Objet modifié !'}))
        .catch(error => res.status(403).json({ error, message: 'unauthorized request !' }));
};

exports.deleteSauces = (req, res, next) => {
    Sauces.findOne({ _id: req.params.id })
        .then(thing => {
            const filename = thing.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauces.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
                    .catch(error => res.status(400).json({ error }));
            });
        })
        .catch(error => res.status(500).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
    Sauces.find().then(
        (things) => {
            res.status(200).json(things);
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};

exports.likeDislikeSauce = (req, res, next) => {
    let like = req.body.like
    let userId = req.body.userId
    let sauceId = req.params.id

    switch (like) {
        case 1 :
            Sauces.updateOne({_id: sauceId}, {$push: {usersLiked: userId}, $inc: {likes: +1}})
                .then(() => res.status(200).json({message: `J'aime`}))
                .catch((error) => res.status(400).json({error}))

            break;

        case 0 :
            Sauces.findOne({_id: sauceId})
                .then((sauce) => {
                    if (sauce.usersLiked.includes(userId)) {
                        Sauces.updateOne({_id: sauceId}, {$pull: {usersLiked: userId}, $inc: {likes: -1}})
                            .then(() => res.status(200).json({message: `Neutre`}))
                            .catch((error) => res.status(400).json({error}))
                    }
                    if (sauce.usersDisliked.includes(userId)) {
                        Sauces.updateOne({_id: sauceId}, {$pull: {usersDisliked: userId}, $inc: {Dislikes: -1}})
                            .then(() => res.status(200).json({message: `Neutre`}))
                            .catch((error) => res.status(400).json({error}))
                    }
                })
                .catch((error) => res.status(404).json({error}))
            break;

        case -1 :
            Sauces.updateOne({_id: sauceId}, {$push: {usersDisliked: userId}, $inc: {Dislikes: +1}})
                .then(() => {
                    res.status(200).json({message: `Je n'aime pas`})
                })
                .catch((error) => res.status(400).json({error}))
            break;console.log("je n'aimes pas !")

        default:
            console.log(error);
    }
};