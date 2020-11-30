const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const uniqid = require("uniqid");
const nodemailer = require("nodemailer");
const getEmailBody = require("../emailBody.js");
// const {
//     getResetRequest,
//     createResetRequest,
// } = require("../models/resetRequests");
// const { get } = require("../routes/users");
const requests = [];

function createResetRequest(resetRequest) {
    requests.push(resetRequest);
    console.log(requests);
}

function getResetRequest(id) {
    // console.log(id, requests[0]);
    console.log(requests);
    const thisRequest = requests.find((req) => req.id == id);

    return thisRequest;
}

const sendMail = (request) => {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        name: "BeerBookmark",
        host: "mail.adamwhite.tech",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: "adam@adamwhite.tech", // generated ethereal user
            pass: "wPn9j$sFeVq8", // generated ethereal password
        },
    });

    let emailBody = getEmailBody(request.id, request.username);
    // send mail with defined transport object
    transporter.sendMail(
        {
            from: '"BeerBookmark Admin" <adam@adamwhite.tech>', // sender address
            to: `"${request.username}" <${request.email}>`, // list of receivers
            subject: "Password Reset", // Subject line
            text: "Hello,", // plain text body
            html: emailBody, // html body
        },
        (error, info) => {
            if (error) {
                console.log(error);
            } else {
                console.log(info);
            }
        }
    );
};

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
        if (error || !user) {
            let err = new Error("User or password do not match");
            err.status = 401;
            return next(err);
        } else {
            let beers = user.beers ? user.beers : [];
            console.log("Login attempt...");
            // If authorised, create token
            jwt.sign(
                { user },
                "secret_key",
                // { expiresIn: "5m" },
                (err, token) => {
                    if (token) {
                        // console.log({ beers, token, user });
                        res.status(200).json({
                            beers,
                            token,
                            theme: user.theme,
                            username: user.username,
                            email: user.email,
                        });
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
    console.log(username + " added");
};

exports.forgotPassword = (req, res) => {
    const { email } = req.body;
    console.log(email);
    User.findOne({ email })
        .then((user) => {
            if (user) {
                let id = uniqid();
                let request = {
                    id,
                    email,
                    username: user.username,
                };

                res.json({ sent: true });
                createResetRequest(request);
                console.log("User Found", request);
                sendMail(request);
                //Sent email reset
                //Notify User email sent
            } else {
                res.json({ sent: false });
                console.log("No user with that email address");
                //Notify user email not found
            }
        })
        .catch((err) => console.log(err));
};

exports.changePassword = (req, res) => {
    const { username, oldPassword, newPassword } = req.body;
    User.authenticate(username, oldPassword, (error, user) => {
        if (error || !user) {
            let err = new Error("Password incorrect");
            err.status = 401;
            return next(err);
        } else {
            //Set new password
            bcrypt.hash(newPassword, 10).then((hashed) => {
                User.findOneAndUpdate(
                    { username: username },
                    { $set: { password: hashed } },
                    { new: true, useFindAndModify: false },
                    (err, user) => {
                        if (err) {
                            throw err;
                        }
                        console.log("You have successfully changed password");
                        res.json("Password changed");
                    }
                );
            });
        }
    });
};
exports.resetPassword = (req, res) => {
    const { id, newPassword } = req.body;
    console.log(id, newPassword);
    let thisRequest = getResetRequest(id);
    if (thisRequest) {
        let hashedPassword;
        bcrypt.hash(newPassword, 10).then((hashed) => {
            hashedPassword = hashed;
            User.findOneAndUpdate(
                { email: thisRequest.email },
                { $set: { password: hashedPassword } },
                { new: true, useFindAndModify: false },
                (err, user) => {
                    if (err) {
                        throw err;
                    }
                    console.log("Successfully changed password");
                    res.json(user);
                }
            );
        });
    } else {
        res.status(404).json("Oh dear");
    }
};

exports.setTheme = (req, res) => {
    const { username, color } = req.body;
    console.log(username, color);
    User.findOneAndUpdate(
        { username },
        { $set: { theme: color } },
        { use: true, useFindAndModify: false },
        (err, user) => {
            if (err) {
                res.json(err);
            } else {
                console.log("theme changed");
                res.status(204).json(user);
            }
        }
    );
};

exports.changeEmail = (req, res) => {
    const { username, email } = req.body;
    User.findOneAndUpdate(
        { username },
        { $set: { email: email } },
        { use: true, useFindAndModify: false },
        (err, user) => {
            if (err) {
                res.json(err);
            } else {
                console.log("email updated: ", user.email);
                res.json(user);
            }
        }
    );
};
