import {addTicketComments, getTicketComments} from "../controllers/ticketCommentsController.js";

router.post("/:id/comments", isLoggedIn, addTicketComments);
router.get("/:id/comments", isLoggedIn, getTicketComments);