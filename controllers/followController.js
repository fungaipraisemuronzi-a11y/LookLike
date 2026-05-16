const prisma = require("../config/prisma");

exports.toggleFollow = async (req, res) => {
  try {

    const followingId = parseInt(req.params.userId);

    // Prevent following yourself
    if (followingId === req.user.id) {
      return res.redirect("/users");
    }

    const existingFollow = await prisma.follow.findFirst({
      where: {
        followerId: req.user.id,
        followingId,
      },
    });

    if (existingFollow) {

      await prisma.follow.delete({
        where: {
          id: existingFollow.id,
        },
      });

    } else {

      await prisma.follow.create({
        data: {
          followerId: req.user.id,
          followingId,
        },
      });

    }

    res.redirect("/users");

  } catch (error) {
    console.log(error);
    res.send("Follow failed");
  }
};