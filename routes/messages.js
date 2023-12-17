const express = require("express");
const router = express.Router();
const Message = require("../models/message");
const { ensureLoggedIn } = require("../middleware/auth");
const ExpressError = require("../expressError");

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get("/:id", ensureLoggedIn, async (req, res, next) => {
  try {
    const message = await Message.get(req.params.id);
    // make sure the message retrieved is either from or to the currently logged in user
    if (
      req.user.username === message.from_user.username ||
      req.user.username == message.to_user.username
    ) {
      return res.json(message);
    } else {
      const e = new ExpressError("Unauthorized", 401);
      return next(e);
    }
  } catch (e) {
    return next(e);
  }
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post("/", ensureLoggedIn, async (req, res, next) => {
  try {
    // Get params from body and logged in user
    const { to_username, body } = req.body;
    const from_username = req.user.username;
    // Create the message using Message model
    const message = await Message.create({ from_username, to_username, body });

    // return the created message
    return res.json({ message });
  } catch (e) {
    return next(e);
  }
});

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post("/:id/read", ensureLoggedIn, async (req, res, next) => {
  try {
    
    const user  = req.user;
    const getMessage = await Message.get(req.params.id)
    // check if the current logged in username is the recipient of the message
    if(getMessage.to_username == user.username){
        const message = await Message.markRead(req.params.id)
        return res.json({message})
    } else{
        const e = new ExpressError("Unauthorized")
        return next(e)
    }

  } catch (e) {
    return next(e);
  }
});

module.exports = router;