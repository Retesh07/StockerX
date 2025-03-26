const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Helper function to generate token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const authController = {
    register: async (req, res) => {
        try {
            const { username, email, password } = req.body;

            // Input validation
            if (!username || !email || !password) {
                return res.status(400).json({
                    message: 'Please provide all required fields'
                });
            }

            // Check if user already exists
            const userExists = await User.findOne({
                $or: [
                    { email: email.toLowerCase() },
                    { username: username.toLowerCase() }
                ]
            });

            if (userExists) {
                return res.status(400).json({
                    message: 'User already exists with this email or username'
                });
            }

            // Create new user
            const user = await User.create({
                username: username.toLowerCase(),
                email: email.toLowerCase(),
                password, // Password will be hashed by the User model pre-save middleware
                virtualBalance: 10000 // Starting balance
            });

            if (user) {
                const token = generateToken(user._id);

                // Set cookie
                res.cookie('jwt', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
                });

                // Send response
                res.status(201).json({
                    user: {
                        _id: user._id,
                        username: user.username,
                        email: user.email,
                        virtualBalance: user.virtualBalance
                    },
                    token
                });
            }
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                message: 'Registration failed',
                error: error.message
            });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Find user
            const user = await User.findOne({ email: email.toLowerCase() });

            // Check if user exists and password matches
            if (user && (await user.matchPassword(password))) {
                const token = generateToken(user._id);

                // Set cookie
                res.cookie('jwt', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
                });

                // Send response
                res.json({
                    user: {
                        _id: user._id,
                        username: user.username,
                        email: user.email,
                        virtualBalance: user.virtualBalance
                    },
                    token
                });
            } else {
                res.status(401).json({
                    message: 'Invalid email or password'
                });
            }
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                message: 'Login failed',
                error: error.message
            });
        }
    },

    logout: async (req, res) => {
        try {
            res.cookie('jwt', '', {
                httpOnly: true,
                expires: new Date(0)
            });
            
            res.json({ message: 'Logged out successfully' });
        } catch (error) {
            res.status(500).json({
                message: 'Logout failed',
                error: error.message
            });
        }
    },

    getProfile: async (req, res) => {
        try {
            const user = await User.findById(req.user._id).select('-password');
            if (user) {
                res.json(user);
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        } catch (error) {
            res.status(500).json({
                message: 'Error fetching profile',
                error: error.message
            });
        }
    }
};

module.exports = authController; 