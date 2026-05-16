const prisma = require("../config/prisma");
const supabase = require("../config/supabase");

exports.getUsers = async (req, res) => {
  try {

    const users = await prisma.user.findMany({
  where: {
    id: {
      not: req.user.id,
    },
  },

  include: {
    followers: true,
    following: true,
  },
});
    res.render("users/index", {
      users,
    });

  } catch (error) {
    console.log(error);
    res.send("Failed to load users");
  }
};

exports.getProfile = async (req, res) => {
  try {

    const userId = parseInt(req.params.userId);

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },

      include: {
        posts: {
          include: {
            likes: true,
            comments: true,
          },

          orderBy: {
            createdAt: "desc",
          },
        },

        followers: true,
        following: true,
      },
    });

    res.render("users/profile", {
      profileUser: user,
    });

  } catch (error) {
    console.log(error);
    res.send("Profile not found");
  }
};

exports.getEditProfile = (req, res) => {
  res.render("users/editProfile");
};

exports.updateProfile = async (req, res) => {
  try {

    const { username, bio } = req.body;

    let profileImage = req.user.profileImage;

    if (req.file) {

      const fileName =
        `profile-${Date.now()}-${req.file.originalname}`;

      const { error } = await supabase.storage
        .from("posts")
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
        });

      if (error) {
        console.log(error);
        return res.send(error.message);
      }

      const {
        data: publicUrlData,
      } = supabase.storage
        .from("posts")
        .getPublicUrl(fileName);

      profileImage = publicUrlData.publicUrl;
    }

    await prisma.user.update({
      where: {
        id: req.user.id,
      },

      data: {
        username,
        bio,
        profileImage,
      },
    });

    res.redirect(`/users/${req.user.id}`);

  } catch (error) {
    console.log(error);
    res.send("Profile update failed");
  }
};