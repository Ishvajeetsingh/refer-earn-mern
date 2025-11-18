const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { nanoid } = require('nanoid');
const User = require('../models/User');
const Config = require('../models/Config');

// POST /register - Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate unique referral code
    const referralCode = nanoid(8);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      referralCode,
      coins: 0
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        userId: newUser._id,
        name: newUser.name,
        email: newUser.email,
        referralCode: newUser.referralCode,
        coins: newUser.coins
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
});

// POST /apply-referral - Apply referral code
router.post('/apply-referral', async (req, res) => {
  try {
    const { userId, referralCode } = req.body;

    // Validation
    if (!userId || !referralCode) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID and referral code are required' 
      });
    }

    // Find the user who is applying the referral code
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check if user has already applied a referral code
    if (user.hasAppliedReferral) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already applied a referral code' 
      });
    }

    // Check if user is trying to use their own referral code
    if (user.referralCode === referralCode) {
      return res.status(400).json({ 
        success: false, 
        message: 'You cannot use your own referral code' 
      });
    }

    // Check if referral code exists
    const referrer = await User.findOne({ referralCode });
    if (!referrer) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invalid referral code' 
      });
    }

    // Get reward coins from config
    let rewardConfig = await Config.findOne({ key: 'referralReward' });
    
    // If config doesn't exist, create default
    if (!rewardConfig) {
      rewardConfig = new Config({
        key: 'referralReward',
        value: 100
      });
      await rewardConfig.save();
    }

    const rewardCoins = rewardConfig.value;

    // Add coins to user's account
    user.coins += rewardCoins;
    user.hasAppliedReferral = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Congratulations! You earned ${rewardCoins} coins`,
      data: {
        userId: user._id,
        coins: user.coins,
        rewardEarned: rewardCoins
      }
    });

  } catch (error) {
    console.error('Apply referral error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while applying referral code' 
    });
  }
});

// GET /user/:userId - Get user details (helper endpoint)
router.get('/user/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;