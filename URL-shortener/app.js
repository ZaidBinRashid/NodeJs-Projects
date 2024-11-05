const express = require("express");
const path = require("path");
const { connectToMongoDb } = require("./connect");
const urlRoute = require("./routes/Url");
const staticRoute = require("./routes/staticRoute")
const URL = require('./models/Url');
const app = express();
const PORT = 8001;

connectToMongoDb("mongodb://localhost:27017/short-url").then(() =>
  console.log("MongoDb Connected")
);

app.set("view engine", "ejs");
app.set('views', path.resolve("./views"))

app.use(express.json());
app.use(express.urlencoded({ extended: false}));

app.use("/url", urlRoute);
app.use("/", staticRoute)

app.get('/url/:shortId', async (req, res) => {
    const shortId = req.params.shortId;
    const entry = await URL.findOneAndUpdate(
        {
            shortId,
        },
        {
            $push: {
                visitHistory: {
                    timestamp: Date.now(),
                },
            },
        }
    );
    res.redirect(entry.redirectURL);
});

app.listen(PORT, () => {
  console.log(`Server started at PORT:${PORT}`);
});
