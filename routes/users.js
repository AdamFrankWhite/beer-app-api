const router = require("express").Router();
let User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const { verifyToken } = require("../functions/VerifyToken");
// Functions
const {
    getUsers,
    login,
    register,
    forgotPassword,
    resetPassword,
    setTheme,
    changeEmail,
    changePassword,
    setMarketingPref,
} = require("../functions/userFunctions");
const {
    addBeer,
    getUserBeers,
    deleteBeer,
    updateBeerRating,
    addNewGroup,
    // updateBeerRatingById
} = require("../functions/beerFunctions");

// User Routes
router.route("/").get(getUsers);
router.route("/login").post(login);
router.route("/register").post(register);
router.route("/forgot").post(forgotPassword);
router.route("/reset").put(resetPassword);
router.route("/set-theme").put(setTheme);
router.route("/email").put(changeEmail);
router.route("/change-password").put(changePassword);
router.route("/set-marketing").post(setMarketingPref);
// Beer routes

router.route("/my-beers/:username").get(getUserBeers);
router.route("/my-beers/add").post(addBeer);
router.route("/my-beers/delete-beer").put(deleteBeer);
router.route("/my-beers/update").put(updateBeerRating);
router.route("/my-beers/add-group").post(addNewGroup);

// router.route("/my-beers/update/:id").post(updateBeerRatingById);

module.exports = router;
