const prisma = require("../config/prisma");

/*
========================
START CHAT (CREATE OR GET CONVERSATION)
========================
*/
exports.startChat = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    let conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          {
            participants: {
              some: { id: req.user.id },
            },
          },
          {
            participants: {
              some: { id: userId },
            },
          },
        ],
      },
      include: {
        participants: true,
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participants: {
            connect: [
              { id: req.user.id },
              { id: userId },
            ],
          },
        },
      });
    }

    res.redirect(
      `/chat/conversation/${conversation.id}`
    );
  } catch (error) {
    console.log(error);
    res.send("Failed to start chat");
  }
};

/*
========================
SEND MESSAGE
========================
*/
exports.sendMessage = async (
  req,
  res
) => {

  try {

    const conversationId =
      parseInt(
        req.params.conversationId
      );

    const text =
      req.body?.text || "";

    let imageUrl = null;

    if (req.file) {

      imageUrl =
        "/uploads/" +
        req.file.filename;

    }

    const message =
      await prisma.message.create({

        data: {

          text,

          image: imageUrl,

          sender: {
            connect: {
              id: req.user.id,
            },
          },

          conversation: {
            connect: {
              id: conversationId,
            },
          },

        },

        include: {
          sender: true,
        },

      });

    const io =
      req.app.get("io");

    io.to(
      `conversation-${conversationId}`
    ).emit(
      "newMessage",
      {
        username:
          message.sender.username,

        text: message.text,

        image: message.image,
      }
    );

    io.emit(
      "refreshInbox"
    );

    res.json({
      success: true,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
    });

  }

};

/*
========================
GET INBOX (WITH UNREAD COUNT)
========================
*/
/*
========================
GET INBOX
========================
*/
exports.getInbox = async (req, res) => {
  try {

    const conversations =
      await prisma.conversation.findMany({
        where: {
          participants: {
            some: {
              id: req.user.id,
            },
          },
        },

        include: {
          participants: true,

          messages: {
            include: {
              sender: true,
            },

            orderBy: {
              createdAt: "desc",
            },

            take: 1,
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    // ADD UNREAD COUNT
    const updatedConversations =
      await Promise.all(

        conversations.map(async (
          conversation
        ) => {

          const unread =
            await prisma.message.count({
              where: {
                conversationId:
                  conversation.id,

                senderId: {
                  not: req.user.id,
                },

                read: false,
              },
            });

          return {
            ...conversation,
            unread,
          };

        })
      );

    res.render("chat/inbox", {
      conversations:
        updatedConversations,

      currentUser: req.user,
    });

  } catch (error) {

    console.log(error);

    res.send(
      "Failed to load inbox"
    );

  }
};

/*
========================
OPEN CHAT (MARK AS READ)
========================
*/
exports.openChat = async (req, res) => {
  try {
    const conversationId = parseInt(
      req.params.conversationId
    );

    // mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId: conversationId,
        senderId: {
          not: req.user.id,
        },
        read: false,
      },
      data: {
        read: true,
      },
    });

    const conversation =
      await prisma.conversation.findUnique({
        where: {
          id: conversationId,
        },

        include: {
          participants: true,

          messages: {
            include: {
              sender: true,
            },

            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

    if (!conversation) {
      return res.send("Conversation not found");
    }

    res.render("chat/conversation", {
      conversation,
      messages: conversation.messages,
      currentUser: req.user,
    });
  } catch (error) {
    console.log(error);
    res.send("Failed to open chat");
  }
};