const bcrypt = require("bcrypt");
const passport = require("passport");

const prisma = require("../config/prisma");

exports.getRegister = (req, res) => {
  res.render("auth/register");
};

exports.postRegister = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email },
        ],
      },
    });

    if (existingUser) {
      return res.send("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    res.redirect("/feed");

  } catch (error) {
    console.log(error);
    res.send("Registration failed");
  }
};

exports.getLogin = (req, res) => {
  res.render("auth/login");
};

exports.postLogin = passport.authenticate("local", {
  successRedirect: "/feed",
  failureRedirect: "/login",
  failureFlash: true,
});

exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }

    res.redirect("/login");
  });
};

