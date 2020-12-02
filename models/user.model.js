const mongoose = require("mongoose");
const bcrypt = require("bcrypt-nodejs");
const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3,
        },
        password: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 5,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 6,
        },
        // NEW
        beers: {
            type: Array,
            required: false,
        },
        beerGroups: {
            type: Array,
            required: false,
        },
        theme: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.statics.authenticate = (username, password, callback) => {
    User.findOne({ username: username }).exec((error, user) => {
        if (error) {
            return callback(error);
        } else if (!user) {
            let error = new Error("User not found");
            error.status = 401;
            return callback(error);
        }
        bcrypt.compare(password, user.password, (error, result) => {
            if (result === true) {
                return callback(null, user);
            } else {
                return callback();
            }
        });
    });
};

const User = mongoose.model("User", userSchema);

module.exports = User;
