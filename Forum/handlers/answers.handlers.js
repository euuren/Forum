const { 
    getAnswersByAuthor,
    getUserById,
    getQuestionById,
    updateAnswer,
    deleteAnswer,
    getAnswerById,
    updateAnswerVotes,
    addAnswerUpvotedBy,
    removeAnswerUpvotedBy,
    addAnswerDownvotedBy,
    removeAnswerDownvotedBy
} = require("../lib/database");

const renderMyAnswersPage = async (req, res) => {
    try {
        const answers = await getAnswersByAuthor(req.session.userId);

        const author = await getUserById(req.session.userId);

        const questions = [];

        for (const answer of answers) {
            const question = await getQuestionById(answer.questionId);

            if (question) {
                questions.push(question.title);
            } else {
                questions.push("Unknown Question");
            }
        }

        res.render("myanswers", { answers, author, questions });
    } catch (error) {
        console.error("Error rendering my answers page:", error);
        res.status(500).send("Internal Server Error");
    }
};

const renderEditAnswerPage = async (req, res) => {
    const answerId = req.params.id;
    const answer = await getAnswerById(answerId);
    const question = await getQuestionById(answer.questionId);
    res.render("editanswer", { answer, question });
}

const editAnswer= async (req, res) => {
    const answerId = req.params.id;
    const { body } = req.body;
    const answerData = {
        body,
    };
    await updateAnswer(answerId, answerData);
    res.redirect("/answers/list");
}

const deleteAnAnswer = async (req, res) => {
    const answerId = req.params.id;
    await deleteAnswer(answerId);
    res.redirect("/answers/list");
}

const upvoteAnswer = async (req, res) => {
    const answerId = req.params.id;
    const userId = req.session.userId;
    const answer = await getAnswerById(answerId);
    const questionId = answer.questionId;

    if (answer.upvotedBy.includes(userId)) {
        return;
    } else if (answer.downvotedBy.includes(userId)) {
        answer.votes += 1;
        await removeAnswerDownvotedBy(answerId, userId);
        await updateAnswerVotes(answerId, answer);
    } else {
        answer.votes += 1;
        await addAnswerUpvotedBy(answerId, userId);
        await updateAnswerVotes(answerId, answer);
    }
    res.redirect(`/questions/${questionId}`);
}

const downvoteAnswer = async (req, res) => {
    const answerId = req.params.id;
    const userId = req.session.userId;
    const answer = await getAnswerById(answerId);
    const questionId = answer.questionId;

    if (answer.downvotedBy.includes(userId)) {
        return
    } else if (answer.upvotedBy.includes(userId)) {
        answer.votes -= 1;
        await removeAnswerUpvotedBy(answerId, userId);
        await updateAnswerVotes(answerId, answer);
    } else {
        answer.votes -= 1;
        await addAnswerDownvotedBy(answerId, userId);
        await updateAnswerVotes(answerId, answer);
    }
    res.redirect(`/questions/${questionId}`);
}

module.exports = {
    renderMyAnswersPage,
    deleteAnAnswer,
    editAnswer,
    renderEditAnswerPage,
    upvoteAnswer,
    downvoteAnswer
};