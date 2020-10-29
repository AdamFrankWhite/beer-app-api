const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const uniqid = require("uniqid");
const nodemailer = require("nodemailer");

const sendMail = (request) => {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "mail.adamwhite.tech",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: "adam@adamwhite.tech", // generated ethereal user
            pass: "wPn9j$sFeVq8", // generated ethereal password
        },
    });

    let emailBody = `
    <b>Hello there,<b>
    <p>To reset your password, please click the following link:<a href="http://localhost:5000/users/reset/${request.id}">http://localhost:5000/users/reset/${request.id}</a></p>  
  `;
    console.log(request.email);
    // send mail with defined transport object
    transporter.sendMail(
        {
            from: '"BeerMe Admin 👻" <adam@adamwhite.tech>', // sender address
            to: `<${request.email}>`, // list of receivers
            subject: "Password Reset", // Subject line
            text: "Hello,", // plain text body
            html: emailBody, // html body
        },
        (error, info) => {
            if (error) {
                console.log(error);
            }
            console.log(info);
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
        let beers = user.beers ? user.beers : [];
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
                        // console.log({ beers, token, user });
                        res.status(200).json({
                            beers,
                            token,

                            username: user.username,
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
                };
                res.json({ sent: true });
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

exports.newPassword = (req, res) => {
    console.log(req.params.id);
};
