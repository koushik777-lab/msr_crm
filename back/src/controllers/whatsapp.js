// let RESPONSES = [];
// const { create } = require("../models/Agents");
const AgentModel = require("../models/Agents");
const Chat = require("../models/Chat");
const ContactDetails = require("../models/ContactDetails");
// const ContactDetails = require("../models/ContactDetails");
const Contact = require("../models/ContactDetails");

const sendWhatsAppMessage = async (req, res) => {
  try {
    const { phoneNumber, tempName, tempLang, agentName } = req.body;
    if (!phoneNumber || !tempName || !tempLang) {
      return res.status(400).json({
        message: "Phone number and template name and language are required",
      });
    }
    // find contact

    let ContactDetails = await Contact.findOne({ number: "91" + phoneNumber });
    if (ContactDetails) {
      const contactAssignedTo = ContactDetails?.assignedTo;
      if (contactAssignedTo !== agentName) {
        console.log("different agent");
        const recentChat = await Chat.findOne({ direction: "recieved" }).sort({
          createdAt: -1,
        });
        console.log("RECENT CHAT", recentChat);
        let isOlderThan1Day = recentChat
          ? Date.now() - recentChat.createdAt.getTime() > 24 * 60 * 60 * 1000
          : true;
        if (!isOlderThan1Day) {
          console.log("Time< 24hrs");
          return res
            ?.status(500)
            .json({ error: "Contact is already assigned to another agent" });
        } else {
          console.log("Time> 24hrs");

          console.log("Time limit up new assigning");
          ContactDetails = await Contact.findOneAndUpdate(
            { number: "91" + phoneNumber },
            {
              assignedTo: agentName,
            },
            { new: true },
          );
          // create Chat
          await createChat(
            phoneNumber,
            tempName,
            tempLang,
            agentName,
            ContactDetails._id,
          );
          return res.status(200).json({
            message: "Message Send successfully",
            // newChat,
            // ContactDetails,
          });
        }
      } else {
        console.log("same agent");
        // sendChat
        await createChat(
          phoneNumber,
          tempName,
          tempLang,
          agentName,
          ContactDetails._id,
        );
        return res.status(200).json({
          message: "Message Send successfully",
          // newChat,
          // ContactDetails,
        });
      }
    } else {
      console.log("Contact not found, creating new contact");
      ContactDetails = await Contact.create({
        number: "91" + phoneNumber,
        assignedTo: agentName,
      });
      console.log("Contact created", ContactDetails);
      // create Chat
      await createChat(
        phoneNumber,
        tempName,
        tempLang,
        agentName,
        ContactDetails._id,
      );
      return res.status(200).json({
        message: "Message Send successfully",
        // newChat,
        // ContactDetails,
      });
    }

    // console.log(response);

    // if (response.result === "success") {
    //   // generate new contact if not present
    //   let ContactDetails = await Contact.findOne({
    //     number: "91" + phoneNumber,
    //   });
    //   let isOlderThan1Day = false;
    //   if (!ContactDetails) {
    //     console.log("Contact not found, creating new contact");
    //     ContactDetails = await Contact.create({
    //       number: response?.data?.phone_number,
    //       assignedTo: agentName,
    //     });
    //     await createChat(response, tempName, agentName, ContactDetails);
    //   } else {
    //     console.log("Contact found, updating contact");
    //     const recentChat = await Chat.findOne({ direction: "recieved" }).sort({
    //       createdAt: -1,
    //     });
    //     console.log(recentChat);
    //     isOlderThan1Day = recentChat
    //       ? Date.now() - recentChat.createdAt.getTime() > 24 * 60 * 60 * 1000
    //       : true;
    //     if (!isOlderThan1Day && ContactDetails?.assignedTo !== agentName) {
    //       console.log("Contact assigned to different agent");

    //       res
    //         ?.status(500)
    //         .json({ message: "Contact is already assigned to another agent" });
    //       return;
    //     } else {
    //       console.log("Time limit up new assigning");
    //       createChat(response, tempName, agentName, ContactDetails);
    //       ContactDetails = await Contact.findOneAndUpdate(
    //         { number: "91" + phoneNumber },
    //         {
    //           assignedTo: agentName,
    //         },
    //         { new: true }
    //       );
    //     }
    //   }
    // create chat with contactDetails

    // async function createChat(response, tempName, agentName, ContactDetails) {
    //   const newChat = await Chat.create({
    //     whatsapp_message_id: response?.data?.wamid,
    //     direction: "send",
    //     message: {
    //       message_type: "text",
    //       body: `You send ${tempName} template message`,
    //     },
    //     agentName: agentName,
    //     contactId: ContactDetails._id,
    //   });
    //   return newChat;
    // }

    // console.log(response);
    // return res.status(500).json({ message: response.message });
    // throw new Error(response.message);
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ message: "INTERNAL SERVER ERROR", error: error.message });
  }
};

const recieveWhatsappMessage = async (req, res) => {
  try {
    // console.log(JSON.stringify(req.body));
    // update name of contact person
    let contactInfo = await Contact.findOneAndUpdate(
      { number: req?.body?.contact?.phone_number },
      {
        name:
          req?.body?.contact?.first_name + " " + req?.body?.contact?.last_name,
      },
      { new: true },
    ).lean();

    //make a new chat
    //check wheather the chat exists

    const chat = await Chat.findOne({
      whatsapp_message_id: req?.body?.message?.whatsapp_message_id,
    });
    // console.log("CHAT", chat, contactInfo);
    if (!chat) {
      await Chat.create({
        whatsapp_message_id: req?.body?.message?.whatsapp_message_id,
        direction: "recieved",
        message: {
          message_type: "text",
          body: req?.body?.message?.body
            ? req?.body?.message?.body
            : req?.body?.message?.media?.link,
        },
        status: "delivered",
        ...(contactInfo?._id && { contactId: contactInfo?._id }),
        ...(contactInfo?.assignedTo && { agentName: contactInfo?.assignedTo }),
        ...(req?.body?.message?.replied_to_whatsapp_message_id && {
          replied_to_message:
            req?.body?.message?.replied_to_whatsapp_message_id,
        }),
      });
    }

    res
      .status(200)
      .json({ message: "Webhook received successfully", data: req.body });
  } catch (error) {
    console.log("WHATSAPP MESSAGE ERROR", error?.message);
    return res
      .status(500)
      .json({ message: "INTERNAL SERVER ERROR", error: error.message });
  }
};

async function createChat(phoneNumber, tempName, tempLang, agentName, userId) {
  // try {
  const url = `${process.env.WHATSAPP_BASE_URL}/${process.env.WHATSAPP_VENDOR_UID}/contact/send-template-message`;
  // console.log(url);
  let response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${process.env.WHATSAPP_TOKEN}`,
    },
    body: JSON.stringify({
      phone_number: phoneNumber,
      template_name: tempName,
      template_language: tempLang,
    }),
  });
  response = await response.json();

  console.log(response);
  if (response.result === "success") {
    const newChat = await Chat.create({
      whatsapp_message_id: response?.data?.wamid,
      direction: "send",
      message: {
        message_type: "text",
        body: `You send ${tempName} template message`,
      },
      agentName: agentName,
      contactId: userId,
    });
    return newChat;
  } else throw new Error(response.message);
  // } catch (error) {}
}

const getWhatsappContacts = async (req, res) => {
  try {
    let Contacts = await ContactDetails.find({
      // assignedTo: req?.isAgent ? req?.user?.name : "admin",
      ...(req?.isAgent && { assignedTo: req?.user?.name }),
    }).sort({ updatedAt: -1 });
    console.log("CONTACTS", Contacts);
    let unreadChatCount;
    if (req?.isAgent) {
      unreadChatCount = await Promise.all(
        Contacts.map(async (val) => {
          const count = await Chat.countDocuments({
            contactId: val?._id,
            agentName: req?.user?.name,
            // agentName: req?.isAgent ? req?.user?.name : "admin",
            status: "delivered", // assuming this is the intended string
            direction: "recieved",
          });
          return count;
        }),
      );
    }

    Contacts = Contacts.map((v, idx) => ({
      ...v.toObject(),
      ...(req?.isAgent && { unreadChat: unreadChatCount[idx] }),
    }));

    return res.status(201).json({ message: "Your contacts", data: Contacts });
  } catch (error) {
    console.log(error?.message);
    return res
      .status(500)
      .json({ message: "INTERNAL SERVER ERROR", error: error.message });
  }
};

const getAllChats = async (req, res) => {
  try {
    const contactId = req?.params?.contactId;
    const agentName = req?.isAgent ? req?.user?.name : "admin";
    // update status to read
    await Chat.updateMany(
      { contactId: contactId, agentName: agentName, direction: "recieved" },
      { status: "read" },
    );

    // fetch chats
    const Chats = await Chat.find({
      contactId: contactId,
      ...(req?.isAgent && { agentName: req?.user?.name }),
    }).sort({ createdAt: -1 });
    return res.status(201).json({ message: "Your chats", data: Chats });
  } catch (error) {
    console.log(error?.message);
    return res
      .status(500)
      .json({ message: "INTERNAL SERVER ERROR", error: error.message });
  }
};

const assignDifferentAgent = async (req, res) => {
  try {
    const { contacts, agentId } = req?.body;
    if (req?.isAgent) {
      throw new Error("Unauthorized  Request");
    }
    if (!Array.isArray(contacts) || contacts?.length == 0) {
      throw new Error("No Contacts are updated");
    }
    if (!agentId) {
      throw new Error("Invalid Agent");
    }
    const agent = await AgentModel.findById(agentId);
    if (!agent) {
      return res.status(404).json({
        message: "Agent Not Found",
      });
    }
    const result = await Promise.all(
      contacts.map(async (contact) => {
        return Promise.all([
          ContactDetails.findByIdAndUpdate(
            contact,
            { assignedTo: agent?.name },
            { new: true },
          ).lean(),

          Chat.updateMany({ contactId: contact }, { agentName: agent?.name }),
        ]);
      }),
    );
    return res.status(201).json({
      message: "Chats Updated Successfull",
      // result
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
      error: error?.message,
    });
  }
};

module.exports = {
  sendWhatsAppMessage,
  recieveWhatsappMessage,
  getWhatsappContacts,
  getAllChats,
  assignDifferentAgent,
};
