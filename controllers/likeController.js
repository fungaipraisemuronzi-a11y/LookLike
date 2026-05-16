const prisma = require("../config/prisma");

exports.toggleLike = async (req, res) => {
  try {

    const postId = parseInt(req.params.postId);

    const existingLike = await prisma.like.findFirst({
      where: {
        userId: req.user.id,
        postId,
      },
    });

    if (existingLike) {

      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });

    } else {

      await prisma.like.create({
        data: {
          userId: req.user.id,
          postId,
        },
      });

    }

    res.redirect("/feed");

  } catch (error) {
    console.log(error);
    res.send("Like failed");
  }
};