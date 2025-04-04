const { insertUser, updateUser, getUserById, getUserByEmail } = require("../lib/database");

const addAUser = async (req, res) => {
    const userData = req.body;
    console.log("#/users/add");
    console.log(JSON.stringify(userData));
    await insertUser(userData);
    res.redirect("/");
};

const renderSignUpPage = async (req, res) => {
    res.render("signup");
};

const renderLoginPage = async (req, res) => {
    res.render("login");
};

const updateAUser = async (req, res) => {
    const userId = req.params.id;
    const { username, email, bio } = req.body;
    const currentUser = await getUserById(userId);
    const profileImage = req.file ? `/uploads/${req.file.filename}` : currentUser.profileImage;

    console.log("Uploaded file:", req.file);
    console.log("Form data:", { username, email, bio, profileImage });

    if (!username || !email || !bio) {
        return res.status(400).send("Missing form data");
    }
    await updateUser(userId, { username, email, bio, profileImage });
    req.session.user = { ...req.session.user, username, email, bio, profileImage };
    res.redirect("/users/myprofile");
};

const renderMyProfilePage = async (req, res) => {
    res.render("myprofile", { user: req.session.user });
};

const renderEditMyProfilePage = async (req, res) => {
    res.render("editmyprofile", { user: req.session.user, _id: req.session.userId });
};

const doLogin = async (req, res) => {
    const { email, password } = req.body;
    const foundUser = await getUserByEmail(email);
    if (foundUser && foundUser.password === password) {
        req.session.userId = foundUser._id;
        req.session.user = foundUser;
        req.session.username = foundUser.username;
        res.redirect("/");
    } else {
        res.redirect("/users/login");
    }
};

const logout = (req, res) => {
    req.session.userId = null;
    res.redirect("/users/login");
};

module.exports = {
    addAUser,
    updateAUser,
    renderSignUpPage,
    renderLoginPage,
    doLogin,
    logout,
    renderMyProfilePage,
    renderEditMyProfilePage,
};