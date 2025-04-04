const express = require("express");
const router = express.Router();

const {
    renderMyAnswersPage,
    renderEditAnswerPage,
    editAnswer,
    deleteAnAnswer,
    upvoteAnswer,
    downvoteAnswer,
} = require("../handlers/answers.handlers");

router.get("/list", requireAuth, renderMyAnswersPage);
router.get("/:id/edit", requireAuth, renderEditAnswerPage);
router.post("/:id/edit", requireAuth, editAnswer);
router.post("/:id/delete", requireAuth, deleteAnAnswer);
router.post("/:id/upvote", requireAuth, upvoteAnswer);
router.post("/:id/downvote", requireAuth, downvoteAnswer);

module.exports = router;

function requireAuth(req, res, next) {
    if (req.session && req.session.userId) {
        next();
    } else {
        res.redirect("/users/login");
    }
}