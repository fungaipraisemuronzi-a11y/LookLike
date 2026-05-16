const prisma = require("../config/prisma");
const supabase = require("../config/supabase");

exports.getFeed = async (req, res) => {
  try {

    // Get followed users
    const following = await prisma.follow.findMany({
      where: {
        followerId: req.user.id,
      },
    });

    const followingIds = following.map(
      follow => follow.followingId
    );

    // Include own posts
    followingIds.push(req.user.id);

    const posts = await prisma.post.findMany({
      where: {
        authorId: {
          in: followingIds,
        },
      },

      include: {
        author: true,

        comments: {
          include: {
            user: true,
          },
        },

        likes: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    res.render("posts/feed", {
      posts,
    });

  } catch (error) {
    console.log(error);
    res.send("Error loading feed");
  }
};

exports.getCreatePost = (req, res) => {
  res.render("posts/newPost");
};

exports.createPost = async (req, res) => {
  try {
    const { content } = req.body;

    let imageUrl = null;

    if (req.file) {

      const fileName = `${Date.now()}-${req.file.originalname}`;

      const { error } = await supabase.storage
        .from("posts")
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
        });

      if (error) {
        console.log(error);
        return res.send("Image upload failed");
      }

      const {
        data: publicUrlData,
      } = supabase.storage
        .from("posts")
        .getPublicUrl(fileName);

      imageUrl = publicUrlData.publicUrl;
    }

    await prisma.post.create({
      data: {
        content,
        imageUrl,
        authorId: req.user.id,
      },
    });

    res.redirect("/feed");

  } catch (error) {
    console.log(error);
    res.send("Failed to create post");
  }
};

exports.deletePost = async (req, res) => {
  try {

    const postId = parseInt(req.params.postId);

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    // Check ownership
    if (post.authorId !== req.user.id) {
      return res.send("Unauthorized");
    }

    // Delete comments first
    await prisma.comment.deleteMany({
      where: {
        postId,
      },
    });

    // Delete likes
    await prisma.like.deleteMany({
      where: {
        postId,
      },
    });

    // Delete post
    await prisma.post.delete({
      where: {
        id: postId,
      },
    });

    res.redirect("/feed");

  } catch (error) {
    console.log(error);
    res.send("Delete failed");
  }
};