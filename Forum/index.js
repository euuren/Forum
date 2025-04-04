const express = require("express");
const bodyParser = require("body-parser");
const usersRoutes = require("./routes/users.routes");
const questionsRoutes = require("./routes/questions.routes");
const answersRoutes = require("./routes/answers.routes");
const app = express();
const port = 3000;
const session = require("express-session");
const { getAllQuestions, search } = require("./lib/database");

app.use("/uploads", express.static("uploads"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
    session({
        secret:"0000",
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false },
    })
);
app.set("view engine", "ejs");

app.get("/", requireAuth, async(req, res) => {
    const questions = await getAllQuestions();
    res.render("main", { questions });
});

app.use("/users", usersRoutes);
app.use("/questions", questionsRoutes);
app.use("/answers", answersRoutes);

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

app.get('/search', async (req, res) => {
    const searchQuery = req.query.q;
    const tags = searchQuery.split(',').map(tag => tag.trim());
    const questions = await search(tags);
    res.render("searchresults", { questions, searchQuery });
});

function requireAuth(req, res, next) {
    if (req.session && req.session.userId) {
        next();
    } else {
        res.redirect("/users/login");
    }
}