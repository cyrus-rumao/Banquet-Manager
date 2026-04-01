import jwt from 'jsonwebtoken';
// import { redis } from "../redis.js";
import User from '../Models/UserModel.js';
import bcrypt from 'bcrypt';

export const protect = async (req, res, next) => {
	try {
		const accessToken = req.cookies.accessToken;
		if (!accessToken) {
			console.log('No access token');
			return res.status(401).json({ message: 'Unauthenticated' });
		}
		try {
			const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
			const user = await User.findById(decoded.userId).select('-password');
			if (!user) {
				return res.status(404).json({ message: 'User not found' });
			}
			req.user = user;
			next();
		} catch (error) {
			if (error.name === 'TokenExpiredError') {
				return res.status(401).json({ message: 'Token Expired' });
			}
			throw error;
		}
	} catch (error) {
		console.log('Error in Protect Route', error);
		return res
			.status(500)
			.json({ message: 'Unauthorised- Invalid Access Token' });
	}
};
export const adminRoute = async (req, res, next) => {
	try {
		if (req.user && req.user.role === 'ADMIN') {
			next();
		} else {
			return res.status(403).json({ message: 'Forbidden! Admin Access Only' });
		}
	} catch (error) {
		console.log('Error in Admin Route', error);
		return res.status(500).json({ message: 'Unauthorised' });
	}
};
export const salesRoute = async (req, res, next) => {
	try {
		if (req.user && req.user.role === 'SALES') {
			next();
		} else {
			return res.status(403).json({ message: 'Forbidden! Sales Access Only' });
		}
	} catch (error) {
		console.log('Error in Sales Route', error);
		return res.status(500).json({ message: 'Unauthorised' });
	}
};
export const financeRoute = async (req, res, next) => {
	try {
		if (req.user && req.user.role === 'FINANCE') {
			next();
		} else {
			return res
				.status(403)
				.json({ message: 'Forbidden! Finance Access Only' });
		}
	} catch (error) {
		console.log('Error in Finance Route', error);
		return res.status(500).json({ message: 'Unauthorised' });
	}
};
