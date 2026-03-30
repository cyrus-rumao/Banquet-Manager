import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

export const login = async (req, res) => {
	const { email, password } = req.body;

	try {
		// console.log('Searching for email:', `|${email}|`); // pipes | show hidden spaces
		// console.log('Mongoose is looking in collection:', User.collection.name);
		const user = await User.findOne({
			email,
		});

		if (!user) {
			const allUsers = await User.find({}, 'email');
			console.log(
				'Existing emails in DB:',
				allUsers.map((u) => `|${u.email}|`),
			);
			return res.status(404).json({ message: 'User not found' });
		}
		console.log(password);
		console.log(user);
		const isMatch = password === user.password; // In production, use bcrypt to compare hashed passwords
		if (!isMatch) {
			return res.status(401).json({ message: 'Invalid credentials' });
		}

		const token = jwt.sign(
			{ id: user._id, role: user.role },
			process.env.JWT_SECRET,
			{
				expiresIn: '24h',
			},
		);

		res.status(200).json({ token, message: 'Login successful', user });
	} catch (error) {
		res.status(500).json({ message: 'Error in login', error: error.message });
	}
};

export const register = async (req, res) => {
	try {
		const { name, email, password, role, phone } = req.body;

		if (!name || !email || !password || !role) {
			return res
				.status(400)
				.json({ message: 'Please provide all required fields' });
		}

		// 2. Check if user already exists (Standardizes email to lowercase)
		const userExists = await User.findOne({
			email: email.toLowerCase().trim(),
		});
		if (userExists) {
			return res
				.status(400)
				.json({ message: 'User already exists with this email' });
		}

		// 3. Create the User (Password stored as raw string as requested)
		const user = await User.create({
			name,
			email: email.toLowerCase().trim(),
			password,
			role: role.toUpperCase(), // Ensure it matches your ENUM ['ADMIN', 'SALES', etc]
			phone,
			isActive: true,
		});

		// 4. Generate Token so they are logged in immediately after registration
		const token = jwt.sign(
			{ id: user._id, role: user.role },
			process.env.JWT_SECRET,
			{
				expiresIn: '24h',
			},
		);


		res.status(201).json({
			message: 'User registered successfully',
			token,
			user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
      },
		});
	} catch (error) {
		console.error('Registration Error:', error);
		res.status(500).json({
			message: 'Error in registration',
			error: error.message,
		});
	}
};
