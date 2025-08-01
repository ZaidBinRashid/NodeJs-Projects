const express = require("express");
const path = require("path");
const { connectToMongoDb } = require("./connect");
const { checkForAuthentication, restrictTo } = require('./middlewares/auth');
const URL = require('./models/Url');
const app = express();
const PORT = 8001;

const urlRoute = require("./routes/Url");
const staticRoute = require("./routes/staticRoute");
const userRoute = require("./routes/user");
const cookieParser = require("cookie-parser");


connectToMongoDb("mongodb://localhost:27017/short-url").then(() =>
  console.log("MongoDb Connected")
);

app.set("view engine", "ejs");
app.set('views', path.resolve("./views"))

app.use(express.json());
app.use(express.urlencoded({ extended: false}));
app.use(cookieParser());
app.use(checkForAuthentication);

app.use("/url", restrictTo(['NORMAL']), urlRoute);
app.use("/user",userRoute);
app.use("/",  staticRoute);


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

    if (!entry) {
        return res.status(404).send("Url Not Found");
    }

    res.redirect(entry.redirectURL);
});

app.listen(PORT, () => {
  console.log(`Server started at PORT:${PORT}`);
});
