import express from 'express';
const router = express.Router();
import { signup, signin, signout } from "#controllers/auth.controller.js"


router.post('/signup', signup);
router.post('/signin', signin);
router.post('/signout', signout);

export default router;