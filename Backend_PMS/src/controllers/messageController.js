const asyncHandler = require('../utils/asyncHandler');
const Message = require('../models/Message');
const User = require('../models/User');
const Allocation = require('../models/Allocation');
const realtime = require('../utils/realtime');

// Who a user is allowed to message - based on real project relationships,
// not a free-for-all directory:
//  - admin: anyone
//  - supervisor: students with an approved allocation on one of their
//    projects, plus all admins
//  - student: the supervisor(s) of their approved allocation(s), plus all
//    admins
async function getAllowedContacts(user) {
  if (user.role === 'admin') {
    return User.find({ _id: { $ne: user._id } }).select('name email role');
  }

  const admins = await User.find({ role: 'admin' }).select('name email role');

  if (user.role === 'supervisor') {
    const studentIds = await Allocation.find({ supervisor: user._id, status: 'approved' }).distinct('student');
    const students = await User.find({ _id: { $in: studentIds } }).select('name email role');
    return [...students, ...admins];
  }

  // student
  const supervisorIds = await Allocation.find({ student: user._id, status: 'approved' }).distinct('supervisor');
  const supervisors = await User.find({ _id: { $in: supervisorIds } }).select('name email role');
  return [...supervisors, ...admins];
}

async function isAllowedContact(user, recipientId) {
  if (user.role === 'admin') return true;
  const contacts = await getAllowedContacts(user);
  return contacts.some((c) => String(c._id) === String(recipientId));
}

// @desc   Real contact list for the Messages page - each contact's last
//         message preview and unread count, not fake hardcoded names
// @route  GET /api/messages/contacts
const getContacts = asyncHandler(async (req, res) => {
  const contacts = await getAllowedContacts(req.user);

  const enriched = await Promise.all(
    contacts.map(async (contact) => {
      const lastMessage = await Message.findOne({
        $or: [
          { sender: req.user._id, recipient: contact._id },
          { sender: contact._id, recipient: req.user._id },
        ],
      })
        .sort({ createdAt: -1 })
        .lean();

      const unreadCount = await Message.countDocuments({
        sender: contact._id,
        recipient: req.user._id,
        read: false,
      });

      return {
        user: contact,
        lastMessage: lastMessage
          ? {
              content: lastMessage.content,
              createdAt: lastMessage.createdAt,
              fromMe: String(lastMessage.sender) === String(req.user._id),
            }
          : null,
        unreadCount,
      };
    })
  );

  // Most recently active conversations first
  enriched.sort((a, b) => {
    const aTime = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
    const bTime = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
    return bTime - aTime;
  });

  res.json({ contacts: enriched });
});

// @desc   Full conversation with one contact - also marks their messages
//         to you as read
// @route  GET /api/messages/:userId
const getMessages = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!(await isAllowedContact(req.user, userId))) {
    return res.status(403).json({ message: 'You are not able to message this user' });
  }

  const messages = await Message.find({
    $or: [
      { sender: req.user._id, recipient: userId },
      { sender: userId, recipient: req.user._id },
    ],
  }).sort({ createdAt: 1 });

  await Message.updateMany({ sender: userId, recipient: req.user._id, read: false }, { read: true });

  res.json({ messages });
});

// @desc   Send a message - recipient must be a real, allowed contact
// @route  POST /api/messages
const sendMessage = asyncHandler(async (req, res) => {
  const { recipientId, content } = req.body;
  if (!recipientId || !content?.trim()) {
    return res.status(400).json({ message: 'recipientId and content are required' });
  }

  if (!(await isAllowedContact(req.user, recipientId))) {
    return res.status(403).json({ message: 'You are not able to message this user' });
  }

  const message = await Message.create({
    sender: req.user._id,
    recipient: recipientId,
    content: content.trim(),
  });

  await message.populate('sender', 'name email role');

  realtime.pushToUser(recipientId, 'message', message);

  res.status(201).json({ message });
});

// @desc   Delete a message you sent
// @route  DELETE /api/messages/:messageId
const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  const message = await Message.findById(messageId);
  if (!message) {
    return res.status(404).json({ message: 'Message not found' });
  }

  if (String(message.sender) !== String(req.user._id)) {
    return res.status(403).json({ message: 'You can only delete your own messages' });
  }

  await message.deleteOne();

  realtime.pushToUser(String(message.recipient), 'message-deleted', { _id: message._id });

  res.json({ message: 'Message deleted' });
});

module.exports = { getContacts, getMessages, sendMessage, deleteMessage };
