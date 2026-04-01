import User from '../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { connectRedis } from '../config/redis.js';

const generateTokens = (userId) => {
	const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
		expiresIn: '15m',
	});
	const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
		expiresIn: '7d',
	});
	// console.log('Tokens: ', accessToken, refreshToken);
	return { accessToken, refreshToken };
};

const storeRefreshToken = async (refreshToken, userId) => {
	try {
		const user = await User.findById(userId).select('email');
		if (!user) return;

		await connectRedis().hset(
			`refresh_token:${user._id}`,
			'token',
			refreshToken,
			'email',
			user.email,
		);

		await connectRedis().expire(`refresh_token:${userId}`, 7 * 24 * 60 * 60);
	} catch (err) {
		console.log(err);
	}
};

const setCookies = (res, accessToken, refreshToken) => {
	(res.cookie('accessToken', accessToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production' ? true : false,
		sameSite: 'lax',
		maxAge: 15 * 60 * 1000,
	}),
		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production' ? true : false,
			sameSite: 'lax',
			maxAge: 7 * 24 * 60 * 60 * 1000,
		}));
};

export const signup = async (req, res) => {
	const { name, email, phone, password } = req.body;
	try {
		const existinguser = await User.findOne({
			$or: [{ email }, { phone }],
		});
		if (existinguser) {
			return res
				.status(400)
				.json({ message: 'User already exists', success: false });
		}
		const hashedPassword = await bcrypt.hash(password, 10);

		const user = await User.create({
			name,
			email,
			phone,
			password: hashedPassword,
		});

		const { accessToken, refreshToken } = generateTokens(user._id);
		await storeRefreshToken(refreshToken, user._id);

		setCookies(res, accessToken, refreshToken);

		await user.save();
		return res.status(201).json({
			_id: user._id,
			name: user.name,
			password: user.password,
			email: user.email,
			phone: user.phone,
			role: user.role,
		});
	} catch (error) {
		console.log(error);	
		return res.status(500).json({ message: 'Error in Auth Controller' });
	}
};
export const login = async (req, res) => {
	const { email, password } = req.body;
	try {
		const existinguser = await User.findOne({ email });

		if (
			!existinguser ||
			!(await bcrypt.compare(password, existinguser.password))
		) {
			return res.status(400).json({ message: 'Invalid credentials' });
		}
		// console.log("Generating Tokens! for User: ❌", email);

		const { accessToken, refreshToken } = generateTokens(existinguser._id);
		// console.log("Storing Tokens for ❌", email);
		await storeRefreshToken(refreshToken, existinguser._id);

		setCookies(res, accessToken, refreshToken);

		return res.status(200).json({
			message: 'Login successful',
			success: true,
			user: {
				_id: existinguser._id,
				name: existinguser.name,
				email: existinguser.email,
				role: existinguser.role,
			},
		});
	} catch (error) {
		console.error('Error in login Controller:', error);
		return res.status(500).json({ message: 'Internal server error' });
	}
};

export const logout = async (req, res) => {
	try {
		const refreshToken = req.cookies.refreshToken;
		if (refreshToken) {
			const decoded = jwt.verify(
				refreshToken,
				process.env.REFRESH_TOKEN_SECRET,
			);
			await connectRedis().del(`refresh_token:${decoded.userId}`);
			res.clearCookie('accessToken');
			res.clearCookie('refreshToken');
			return res
				.status(200)
				.json({ message: 'Logout successful', success: true });
		} else {
			return res.status(400).json({ message: 'No Refresh Token Found' });
		}
	} catch (error) {
		return res.status(500).json({ message: 'Error in Logging out' });
	}
};

export const refreshToken = async (req, res) => {
	try {
		const refreshToken = req.cookies.refreshToken;
		if (!refreshToken) {
			return res.status(400).json({ message: 'No Refresh Token Found' });
		}
		if (refreshToken) {
			const decoded = jwt.verify(
				refreshToken,
				process.env.REFRESH_TOKEN_SECRET,
			);
			const storedToken = await connectRedis().get(`refresh_token:${decoded.userId}`);
			if (storedToken !== refreshToken) {
				return res.status(401).json({ message: 'Unauthorized' });
			}
			const accessToken = jwt.sign(
				{ userId: decoded.userId },
				process.env.ACCESS_TOKEN_SECRET,
				{
					expiresIn: '15m',
				},
			);

			res.cookie('accessToken', accessToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production' ? true : false,
				sameSite: 'strict',
				maxAge: 15 * 60 * 1000,
			});
			return res
				.status(200)
				.json({ accessToken, message: 'Token Refreshed Successfully' });
		}
	} catch (error) {
		console.log('Error in Refreshing Token', error);
		return res.status(500).json({ message: 'Error in Refreshing Token' });
	}
};

export const getProfile = async (req, res) => {
	try {
		res.json(req.user);
	} catch (error) {
		return res.status(500).json({ message: 'Internal Server Error' });
	}
};
