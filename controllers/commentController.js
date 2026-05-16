const prisma = require("../config/prisma");

exports.createComment = async (req, res) => {
  try {

    const postId = parseInt(req.params.postId);

    const { text } = req.body;

    await prisma.comment.create({
      data: {
        text,
        userId: req.user.id,
        postId,
      },
    });

    res.redirect("/feed");

  } catch (error) {
    console.log(error);
    res.send("Comment failed");
  }
};