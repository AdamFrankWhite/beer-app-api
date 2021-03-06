const Beer = require("../models/beer.model");
const User = require("../models/user.model");

exports.getUserBeers = (req, res) => {
    User.findOne({ username: req.params.username })
        .then((user) => res.json(user.beers))
        .catch((err) => res.status(400).json("Error: " + err));
};

exports.addBeer = (req, res) => {
    const addBeerDetails = {
        id: req.body.id,
        beerName: req.body.beerName,
        beerType: req.body.beerType,
        abv: req.body.abv,
        beerDescription: req.body.beerDescription,
        brewery: req.body.brewery,
        breweryName: req.body.breweryName,
        date: Date.parse(req.body.date),
        stars: req.body.stars,
        img: req.body.img,
        beerInfo: req.body.beerInfo,
        beerGroup: req.body.beerGroup,
    };

    User.findOne({ username: req.body.username }).then((user) => {
        console.log("User found");

        let beers = [...user.beers];
        beers.push(addBeerDetails);
        user.beers = beers;
        user.save()
            .then(() => {
                res.json(user.beers);
            })
            .catch((err) => res.json("Error: " + err));
    });
};

exports.addNewGroup = (req, res) => {
    const { newGroup, username } = req.body;
    User.findOne({ username }).then((user) => {
        let beerGroups = [...user.beerGroups];
        console.log(beerGroups, newGroup);
        if (!beerGroups.includes(newGroup)) {
            beerGroups.push(newGroup);
        } else {
            return res.json({ error: "Group already exists" });
        }

        user.beerGroups = beerGroups;
        user.save()
            .then(() => {
                return res.json(user.beerGroups);
            })
            .catch((err) => res.json("Error: " + err));
    });
};
exports.deleteBeer = (req, res) => {
    const removeBeerDetails = req.body.beerData;

    User.findOne({ username: req.body.username }).then((user) => {
        let beers = [...user.beers];
        let newArray = beers.filter((beer) => beer.id != removeBeerDetails.id);
        user.beers = newArray;
        user.save()
            .then(() => {
                res.json(user.beers);
                res.json("Beer removed");
            })
            .catch((err) => res.json("Error: " + err));
    });
};
exports.updateBeerRating = (req, res) => {
    const updateBeerDetails = req.body.beerData;
    console.log(req.body);
    updateBeerDetails.stars = req.body.newRating;

    User.findOne({ username: req.body.username }).then((user) => {
        let beers = [...user.beers];
        let index = beers.findIndex((beer) => beer.id === updateBeerDetails.id);
        //Remove beer to be edited
        let newBeerList = beers.filter(
            (beer) => beer.id != updateBeerDetails.id
        );
        //Insert updated beer
        newBeerList.splice(index, 0, updateBeerDetails);
        user.beers = newBeerList;
        user.save()
            .then(() => {
                return res.json(updateBeerDetails);
            })
            .catch((err) => res.json("Error: " + err));
    });
};

exports.updateBeerRatingById = (req, res) => {
    Beer.findById(req.params.id).then((beer) => {
        beer.stars = req.body.stars;
        beer.save()
            .then(() => res.json("Beer rating updated"))
            .catch((err) => res.status(400).json("Error: " + err));
    });
};
