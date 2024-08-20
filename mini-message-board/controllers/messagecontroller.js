let nextId = 1
const messages = [
  {
    id: nextId++,
    text: "Hi there!",
    user: "Amando",
    date: new Date().toDateString(),
  },
  {
    id: nextId++,
    text: "Hello World!",
    user: "Charles",
    date: new Date().toDateString(),
  },
];

exports.getMessages = (req, res) => {
  res.render("index", { title: "Mini Messageboard", messages });
};

exports.getNewMessageForm = (req, res) => {
  res.render("form", { title: "New Message" });
};

exports.postNewMessage = (req, res) => {
  const { user, text } = req.body;
  const newMessage = { id: nextId++, user, text, date: new Date().toDateString() };
  messages.push(newMessage);
  res.redirect("/");
};

exports.getMessageDetails = (req, res) => {
  const message = messages.find((msg) => msg.id === parseInt(req.params.id));
  if (message) {
    res.render("message", { title: "Message Details", message });
  } else {
    res.status(404).send("Message not found");
  }
};
