const { MongoClient, ObjectId } = require("mongodb");
let client = null;

let collectionUsers = null;

async function initDBIfNecessary() {
    if (!client) {
        client = await MongoClient.connect("mongodb://localhost:27017");
        const db = client.db("forum");
        collectionUsers = db.collection("users");
        collectionQuestions = db.collection("questions");
        collectionAnswers = db.collection("answers");
    }
}

async function disconnect() {
    if (client) {
        await client.close();
        client = null;
    }
}

async function search(tags) {
    await initDBIfNecessary();
    return collectionQuestions.find({ tags: { $in: tags } }).toArray();
}

async function insertUser(user) {
    await initDBIfNecessary();
    user.created = new Date();
    await collectionUsers.insertOne(user);
}

async function getUserByUsername(username) {
    await initDBIfNecessary();
    return await collectionUsers.findOne({ username: username });
}

async function getUserByEmail(email) {
    await initDBIfNecessary();
    return await collectionUsers.findOne({ email: email });
}

async function getUserById(userId) {
    await initDBIfNecessary();
    const user = await collectionUsers.findOne({
      _id: ObjectId.createFromHexString(userId),
    });
  
    if (!user) {
      return null;
    }
    return user;
}

async function updateUser(userId, user) {
  await initDBIfNecessary();
  const { username, email, bio , profileImage} = user;
  await collectionUsers.updateOne({
    _id: ObjectId.createFromHexString(userId)
  }, {
    $set: {
      username,
      email,
      bio,
      profileImage
    }
  });
}

async function insertQuestion(question) {
  await initDBIfNecessary();
  await collectionQuestions.insertOne(question);
}

async function getQuestionsByAuthor(userId) {
  await initDBIfNecessary();
  return collectionQuestions.find({ author: userId }).toArray();
}

async function getQuestionById(questionId) {
  await initDBIfNecessary();
  const question = await collectionQuestions.findOne({
    _id: ObjectId.createFromHexString(questionId),
  });
  return question;
}

async function updateQuestion(questionId, question) {
  await initDBIfNecessary();
  const { title, body, tags } = question;
  await collectionQuestions
    .updateOne(
      { _id: ObjectId.createFromHexString(questionId) },
      {
        $set: {
          title,
          body,
          tags,
        },
      }
    );
}

async function updateQuestionVotes(questionId, question) {
  await initDBIfNecessary();
  const { votes } = question;
  await collectionQuestions
    .updateOne(
      { _id: ObjectId.createFromHexString(questionId) },
      {
        $set: {
          votes,
        },
      }
    );
}

async function addQuestionUpvotedBy(questionId, userId) {
  await initDBIfNecessary();
  await collectionQuestions
    .updateOne(
      { _id: ObjectId.createFromHexString(questionId) },
      {
        $push: {
          upvotedBy: userId,
        },
      }
    );
}

async function removeQuestionUpvotedBy(questionId, userId) {
  await initDBIfNecessary();
  await collectionQuestions
    .updateOne(
      { _id: ObjectId.createFromHexString(questionId) },
      {
        $pull: {
          upvotedBy: userId,
        },
      }
    );
}

async function addQuestionDownvotedBy(questionId, userId) {
  await initDBIfNecessary();
  await collectionQuestions
    .updateOne(
      { _id: ObjectId.createFromHexString(questionId) },
      {
        $push: {
          downvotedBy: userId,
        },
      }
    );
}

async function removeQuestionDownvotedBy(questionId, userId) {
  await initDBIfNecessary();
  await collectionQuestions
    .updateOne(
      { _id: ObjectId.createFromHexString(questionId) },
      {
        $pull: {
          downvotedBy: userId,
        },
      }
    );
}

async function updateAnswerVotes(answerId, answer) {
  await initDBIfNecessary();
  const { votes } = answer;
  await collectionAnswers
    .updateOne(
      { _id: ObjectId.createFromHexString(answerId) },
      {
        $set: {
          votes,
        },
      }
    );
}

async function addAnswerToQuestion(questionId, answerId) {
  await initDBIfNecessary();
  await collectionQuestions.updateOne(
    { _id: ObjectId.createFromHexString(questionId) },
    {
      $push: {
        answers: answerId,
      },
    }
  );
}

async function deleteQuestion(questionId) {
  await initDBIfNecessary();
  await collectionQuestions.deleteOne({
    _id: ObjectId.createFromHexString(questionId),
  });
}

async function getAllQuestions() {
  await initDBIfNecessary();
  return collectionQuestions.find({}).toArray();
}

async function insertAnswer(answer) {
  await initDBIfNecessary();
  const newAnswer = await collectionAnswers.insertOne(answer);
  return newAnswer;
}

async function getAnswersByAuthor(userId) {
  await initDBIfNecessary();
  return collectionAnswers.find({ author: userId }).toArray();
}

async function updateAnswer(answerId, answer) {
  await initDBIfNecessary();
  const { body } = answer;
  await collectionAnswers
    .updateOne(
      { _id: ObjectId.createFromHexString(answerId) },
      {
        $set: {
          body,
        },
      }
    );
}

async function deleteAnswer(answerId) {
  await initDBIfNecessary();

  await collectionAnswers.deleteOne({
    _id: ObjectId.createFromHexString(answerId),
  });

  await collectionQuestions.updateMany(
    { answers: ObjectId.createFromHexString(answerId) },
    { $pull: { answers: ObjectId.createFromHexString(answerId) } }
  );
}

async function getAnswerById(answerId) {
  await initDBIfNecessary();
  return collectionAnswers.findOne({
    _id: ObjectId.createFromHexString(answerId),
  });
}

async function addAnswerUpvotedBy(answerId, userId) {
  await initDBIfNecessary();
  await collectionAnswers
    .updateOne(
      { _id: ObjectId.createFromHexString(answerId) },
      {
        $push: {
          upvotedBy: userId,
        },
      }
    );
}

async function removeAnswerUpvotedBy(answerId, userId) {
  await initDBIfNecessary();
  await collectionAnswers
    .updateOne(
      { _id: ObjectId.createFromHexString(answerId) },
      {
        $pull: {
          upvotedBy: userId,
        },
      }
    );
}

async function addAnswerDownvotedBy(answerId, userId) {
  await initDBIfNecessary();
  await collectionAnswers
    .updateOne(
      { _id: ObjectId.createFromHexString(answerId) },
      {
        $push: {
          downvotedBy: userId,
        },
      }
    );
}

async function removeAnswerDownvotedBy(answerId, userId) {
  await initDBIfNecessary();
  await collectionAnswers
    .updateOne(
      { _id: ObjectId.createFromHexString(answerId) },
      {
        $pull: {
          downvotedBy: userId,
        },
      }
    );
}

module.exports = {
    insertUser,
    disconnect,
    getUserByUsername,
    getUserByEmail,
    getUserById,
    updateUser,
    insertQuestion,
    getQuestionsByAuthor,
    getQuestionById,
    updateQuestion,
    deleteQuestion,
    getAllQuestions,
    insertAnswer,
    getAnswersByAuthor,
    updateAnswer,
    deleteAnswer,
    getAnswerById,
    addAnswerToQuestion,
    updateQuestionVotes,
    updateAnswerVotes,
    addQuestionUpvotedBy,
    removeQuestionUpvotedBy,
    addQuestionDownvotedBy,
    removeQuestionDownvotedBy,
    addAnswerUpvotedBy,
    removeAnswerUpvotedBy,
    addAnswerDownvotedBy,
    removeAnswerDownvotedBy,
    search
};