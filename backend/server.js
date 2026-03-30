import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoute from './routes/authRoute.js';
import qrRoute from './routes/qrRoute.js';
import whatsappRoute from './routes/whatsappRoute.js';
import eventRoute from './routes/eventRoutes.js';
import menuRoute from './routes/menuRoutes.js';
import paymentRoute from './routes/paymentRoute.js';
import brownieRoute from './routes/brownieRoutes.js';
import guestRoute from './routes/guestRoutes.js';
import './models/userModel.js';
import './models/venueModel.js';
import './models/eventModel.js';
import { configStripe } from './config/stripe.js';
dotenv.config();

const app = express();

// 🔹 Middlewares
app.use(
	cors({
		origin: 'http://localhost:5173',
		credentials: true,
	}),
);
app.use(express.json());

// 🔹 Test Route
app.get('/', (req, res) => {
	res.send('API is running 🚀');
});

app.use('/api/auth', authRoute);
app.use('/api/qr', qrRoute);
app.use('/api/whatsapp', whatsappRoute);
app.use('/api/events', eventRoute);
app.use('/api/menu', menuRoute);
app.use('/api/payments', paymentRoute);
app.use('/api/gallery', brownieRoute); // For gallery image uploads and retrievals
app.use('/api/guests', guestRoute);
// 🔹 MongoDB Connection
connectDB();
configStripe();

// 🔹 Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
	// await connectDB();
	console.log(`Server running on port ${PORT}`);
});
