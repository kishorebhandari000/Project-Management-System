const express = require('express');
const { createTask, getTasks, getTask, updateTask, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/').post(createTask).get(getTasks);
router.route('/:id').get(getTask).put(updateTask).delete(deleteTask);

module.exports = router;

router.post("/tasks/:id/assign", async (req, res) => {
  const { userId } = req.body;
  const task = await Task.findByIdAndUpdate(req.params.id, { assignee: userId }, { new: true });
  const user = await User.findById(userId);

  await sendNotification(req.app, {
    userId: user._id,
    email: user.email,
    title: "New task assigned",
    message: `You've been assigned "${task.title}"`,
  });

  res.json(task);
});