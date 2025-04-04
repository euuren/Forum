const express = require("express");
const router = express.Router();

const {
    newQuestion,
    renderMyQuestionsPage,
    renderSubmitQuestionPage,
    getAQuestionById,
    editQuesion,
    renderEditQuestionPage,
    deleteAQuestion,
    newAnswer,
    renderSubmitAnswerPage,
    upvoteQuestion,
    downvoteQuestion
} = require("../handlers/questions.handlers");

router.post("/new", requireAuth, newQuestion);
router.get("/list", requireAuth, renderMyQuestionsPage);
router.get("/new", requireAuth, renderSubmitQuestionPage);
router.get("/:id", requireAuth, getAQuestionById);
router.post("/:id/edit", requireAuth, editQuesion);
router.get("/:id/edit", requireAuth, renderEditQuestionPage);
router.post("/:id/delete", requireAuth, deleteAQuestion);
router.post("/:id/answers/new", requireAuth, newAnswer);
router.get("/:id/answers/new", requireAuth, renderSubmitAnswerPage);
router.post("/:id/upvote", requireAuth, upvoteQuestion);
router.post("/:id/downvote", requireAuth, downvoteQuestion);

module.exports = router;

function requireAuth(req, res, next) {
    if (req.session && req.session.userId) {
        next();
    } else {
        res.redirect("/users/login");
    }
}