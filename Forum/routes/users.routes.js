const express = require("express");
const router = express.Router();
const upload = require("../config/multerConfig");

const {
    addAUser,
    updateAUser,
    renderSignUpPage,
    renderLoginPage,
    doLogin,
    logout,
    renderMyProfilePage,
    renderEditMyProfilePage
} = require("../handlers/users.handlers");

router.post("/new", addAUser);
router.get("/signup", renderSignUpPage);
router.get("/login", renderLoginPage);
router.post("/:id/edit", upload.single("profileImage"), updateAUser);
router.post("/dologin", doLogin);
router.get("/logout", logout);
router.get("/myprofile", requireAuth, renderMyProfilePage);
router.get("/editmyprofile", requireAuth, renderEditMyProfilePage);

function requireAuth(req, res, next) {
    if (req.session && req.session.userId) {
        next();
    } else {
        res.redirect("/users/login");
    }
}

module.exports = router;