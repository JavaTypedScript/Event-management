const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
    return jwt.sign({id},process.env.JWT_SECRET,{expiresIn:'30d'});
};

// @desc Register new user
// @route POST /api/auth/register
const registerUser = async (req,res) => {
    const {name,email,password,department,year} = req.body;
    try {
        if(!name||!email||!password) {
            res.status(400).json({
                message:'Enter all credentials'
            });
        }

        const userExists = await User.findOne({email});
        if(userExists) {
            return res.status(400).json({
                message:'User already exists'
            })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const user = await User.create({
            name,
            email,
            password:hashedPassword,
            department,
            year,
            role:'participant'
        });

        if(user){
            res.status(201).json(
                {
                    _id:user.id,
                    name:user.name,
                    email:user.email,
                    role:user.role,
                    token:generateToken(user._id),
                }
            )
        }else{
            res.status(400).json({
                message: error.message
            })
        }

    } catch (error) {
        res.status(500).json({message:'Invalid user data'});
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
const loginUser = async(req,res) => {
    const {email,password} = req.body;
    try {
        const user = await User.findOne({
            email,
        });

        if(user && (await bcrypt.compare(password,user.password))){
            res.json({
                _id:user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                managedClub: user.managedClub,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({
                message:'Invalid credientials'
            })
        }
    } catch (error) {
        res.status(500).json({
            message:error.message
        });
    }
}

// @desc     Get user data
// @route    GET /api/auth/me
const getMe = async (req,res) => {
    res.status(200).json(req.user);
}

// @desc    Get all users (for admin list)
// @route   GET /api/auth/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password'); // Don't send passwords
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user role & club assignment
// @route   PUT /api/auth/users/:id/role
const updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (user) {
      user.role = req.body.role;

      // Logic: If promoting to Organizer, Assign the Club
      if (req.body.role === 'organizer') {
        if (!req.body.managedClub) {
          return res.status(400).json({ message: "Club/Committee name is required for Organizers." });
        }
        user.managedClub = req.body.managedClub;
      } 
      // Logic: If demoting to Participant, remove Club
      else if (req.body.role === 'participant') {
        user.managedClub = null;
      }

      const updatedUser = await user.save();
      res.json({ 
        _id: updatedUser._id, 
        role: updatedUser.role, 
        managedClub: updatedUser.managedClub 
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get count of pending role requests
// @route   GET /api/auth/pending-requests
const getPendingRoleRequestsCount = async (req, res) => {
  try {
    const count = await User.countDocuments({
      role: 'participant',
      requestedClub: { $ne: null } // requestedClub is NOT null
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export these new functions
module.exports = { registerUser, loginUser, getMe, getAllUsers, updateUserRole,getPendingRoleRequestsCount };
