const { 
    insertQuestion, 
    getQuestionsByAuthor, 
    getQuestionById,
    getUserById,
    updateQuestion,
    deleteQuestion,
    insertAnswer,
    addAnswerToQuestion,
    getAnswerById,
    deleteAnswer,
    updateQuestionVotes,
    addQuestionUpvotedBy,
    removeQuestionUpvotedBy,
    addQuestionDownvotedBy,
    removeQuestionDownvotedBy,
} = require("../lib/database");

const newQuestion = async (req, res) => {
    const { title, body, tags } = req.body;

    const tagsArray = tags.split(",").map(tag => tag.trim());

    const questionData = {
        title,
        body,
        tags: tagsArray,
        created: new Date(),
        votes: 0,
        answers: [],
        author: req.session.userId,
        authorUsername: req.session.username,
        upvotedBy: [],
        downvotedBy: [],
    };

    console.log("Question data:", questionData);

    await insertQuestion(questionData);

    res.redirect("/");
};

const renderMyQuestionsPage = async (req, res) => {
    const questions = await getQuestionsByAuthor(req.session.userId);
    const author = await getUserById(req.session.userId);
    res.render("myquestions", { questions , author });
}

const renderSubmitQuestionPage = (req, res) => {
    res.render("submitqn");
};

const getAQuestionById = async (req, res) => {
    const questionId = req.params.id;

    try {
        const question = await getQuestionById(questionId);
        if (!question) {
            return res.status(404).send("Question not found");
        }

        const author = await getUserById(question.author);
        if (!author) {
            return res.status(404).send("Author not found");
        }

        const answers = [];
        for (const answerId of question.answers) {
            const answerIdStr = answerId.toString();
            const answer = await getAnswerById(answerIdStr);
            const answerAuthor = await getUserById(answer.author);
            answer.author = answerAuthor;
            if (answer) {
                answers.push(answer);
            }
        }

        res.render("singlequestion", { question, author, answers });
    } catch (error) {
        console.error("Error fetching question:", error);
        res.status(500).send("Internal Server Error");
    }
};

const editQuesion = async (req, res) => {
    const questionId = req.params.id;
    const { title, body, tags } = req.body;
    const tagsArray = tags.split(",").map(tag => tag.trim());
    const questionData = {
        title,
        body,
        tags: tagsArray,
    };
    await updateQuestion(questionId, questionData);
    res.redirect(`/questions/${questionId}`);
}

const renderEditQuestionPage = async (req, res) => {
    const questionId = req.params.id;
    const question = await getQuestionById(questionId);
    res.render("editquestion", { question });
}

const deleteAQuestion = async (req, res) => {
    const questionId = req.params.id;

    try {
        const question = await getQuestionById(questionId);
        if (!question) {
            return res.status(404).send("Question not found");
        }
        for (const answerId of question.answers) {
            await deleteAnswer(answerId.toString());
        }

        await deleteQuestion(questionId);

        res.redirect("/questions/list");
    } catch (error) {
        console.error("Error deleting question:", error);
        res.status(500).send("Internal Server Error");
    }
};

const newAnswer = async (req, res) => {
    const { body } = req.body;

    const answerData = {
        body,
        created: new Date(),
        votes: 0,
        questionId: req.params.id,
        author: req.session.userId,
        authorUsername: req.session.username,
        upvotedBy: [],
        downvotedBy: [],
    };

    console.log("Answer data:", answerData);

    const answer = await insertAnswer(answerData);
    await addAnswerToQuestion(req.params.id, answer.insertedId);
    res.redirect("/questions/" + req.params.id);
}

const renderSubmitAnswerPage = async (req, res) => {
    const question = await getQuestionById(req.params.id); 
    res.render("submitanswer", { question });
}

const upvoteQuestion = async (req, res) => {
    const questionId = req.params.id;
    const userId = req.session.userId;
    const question = await getQuestionById(questionId);

    if (question.upvotedBy.includes(userId)) {
        return;
    } else if (question.downvotedBy.includes(userId)) {
        question.votes += 1;
        await removeQuestionDownvotedBy(questionId, userId);
        await updateQuestionVotes(questionId, question);
    } else {
        question.votes += 1;
        await addQuestionUpvotedBy(questionId, userId);
        await updateQuestionVotes(questionId, question);
    }
    res.redirect(`/questions/${questionId}`);
}

const downvoteQuestion = async (req, res) => {
    const questionId = req.params.id;
    const userId = req.session.userId;
    const question = await getQuestionById(questionId);

    if(question.downvotedBy.includes(userId)) {
        return;
    }
    else if (question.upvotedBy.includes(userId)){
        question.votes -= 1;
        await removeQuestionUpvotedBy(questionId, userId);
        await updateQuestionVotes(questionId, question);
    } else {
        question.votes -= 1;
        await addQuestionDownvotedBy(questionId, userId);
        await updateQuestionVotes(questionId, question);
    }
    res.redirect(`/questions/${questionId}`);
}

module.exports = {
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
    downvoteQuestion,
};