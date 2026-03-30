import express from 'express';
import {
	addMenu,
	addMenuItem,
	getAllMenuItems,
	getMenu,
} from '../controllers/menuController.js';
const router = express.Router();
router.post('/item', addMenuItem);
router.post('/', addMenu);
router.get('/:eventId', getMenu);
router.get('/', getAllMenuItems);

export default router;
