const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const beerSchema = new Schema(
    {
        beerName: { type: String, required: true },
        beerType: { type: String, required: true },
        beerDescription: { type: String, required: true },
        brewery: { type: String, required: true },
        date: { type: Date, required: true },
        stars: { type: Number, required: false },
        img: { type: String, required: true },
    },
    {
        timestamps: true,
    }
);

const Beer = mongoose.model("Beer", beerSchema);

module.exports = Beer;
