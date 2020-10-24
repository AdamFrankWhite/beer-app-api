const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
exports.getUsers = (req, res) => {
    User.find()
        .then((users) => res.json(users))
        .catch((err) => res.status(400).json("Error: " + err));
};

exports.login = (req, res, next) => {
    const user = {
        username: req.body.username,
        password: req.body.password,
    };

    User.authenticate(user.username, user.password, (error, user) => {
        let beers = user.beers;
        if (error || !user) {
            let err = new Error("User or password do not match");
            err.status = 401;
            return next(err);
        } else {
            console.log("Login attempt...");
            // If authorised, create token
            jwt.sign(
                { user },
                "secret_key",
                // { expiresIn: "5m" },
                (err, token) => {
                    if (token) {
                        console.log("Success");
                        res.status(200).json({ beers, token });
                    } else {
                        console.log("Login failed");
                        res.status(401).json("Error: " + err);
                    }
                }
            );
        }
    });

    // User.findOne(user)
    //     .then(user => res.json(user))
    //     .catch(err => res.status(400).json('Error: ' + err))
};

exports.register = (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    const newUser = new User({
        username,
        password,
        email,
    });
    bcrypt.hash(password, 10, function (err, hash) {
        newUser.password = hash;
        newUser
            .save()
            .then(() => res.json("User added!"))
            .catch((err) => res.status(400).json("Error is... " + err));
    });
};
