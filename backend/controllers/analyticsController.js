const { default: mongoose } = require('mongoose');
const Event = require('../models/Event');
const User = require('../models/User');
const { Parser } = require('json2csv');

const getResourceStats = async (req,res) => {
    try {
        const stats = await Event.aggregate([{
            $match:{
                status: { $in: ['approved', 'completed', 'pending'] }, 
                venue: { $exists: true }
            }
        },
        {
            $group:{
                _id:"$venue",
                totalBookings:{$sum:1}
            }
        },
        {
            $lookup:{
                from:"resources",
                localField:"_id",
                foreignField:"_id",
                as:"resourceDetails"
            }
        },
        { $unwind: { path: "$resourceDetails", preserveNullAndEmptyArrays: true } },
        {
            $project:{
                _id:0,
                resourceName:"$resourceDetails.name",
                type:"$resourceDetails.type",
                totalBookings:1
            }
        },
        {$sort:{totalBookings:-1}}
    ]);
    res.json(stats);
    } catch (error) {
        res.status(500).json({message:error.message});
    }
}

const getMonthlyActivity = async (req,res) => {
    try {
        const data = await Event.aggregate([
            {$match:{status:'approved'}},

            {
                $group: {
                    _id:{$month:"$startDate"},
                    eventCount:{$sum:1}
                }
            },

            {$sort:{"_id":1}},
            {
                $project:{
                    _id:0,
                    month:{
                       $let:{
                        vars:{
                            monthsInString:[
                                "", "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                            ]
                        },
                        in: {$arrayElemAt:["$$monthsInString","$_id"]}
                       } 
                    },
                    eventCount:1
                }
            }
        ]);
        res.json(data);
    } catch (error) {
        res.status(500).json({message:error.message});
    }
}

const getOrganizerLeaderboard = async (req,res) => {
    try {
        const leaderboard = await Event.aggregate([
            {$match:{status:'approved'}},

            {
                $group: {
                    _id:"$organizer",
                    eventsHosted:{$sum:1}
                }
            },

            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "organizerDetails"
                }
            },

            { $unwind: { path: "$organizerDetails", preserveNullAndEmptyArrays: true } },

            {
                $project: {
                    name:"$organizerDetails.name",
                    department: "$organizerDetails.department",
                    eventsHosted:1
                }
            },

            {$sort:{eventsHosted:-1}},
            {$limit:5}
        ]);

        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Get Advanced Dashboard Stats
const getAdvancedStats = async (req, res) => {
  try {
    // 1. Club-wise Activity & Budget (Only approved events)
    const clubStats = await Event.aggregate([
      {
        $match: {
          status: 'approved'
        }
      },
      {
        $group: {
          _id: "$hostingClub",
          eventCount: { $sum: 1 },
          totalBudget: { $sum: "$budget" },
          totalParticipants: { $sum: { $size: "$participants" } }
        }
      }
    ]);

    // 2. Participation Trends (Last 6 months, approved events only)
    const participationTrends = await Event.aggregate([
      {
        $match: {
          status: 'approved'
        }
      },
      {
        $group: {
          _id: { $month: "$startDate" },
          totalParticipants: { $sum: { $size: "$participants" } },
          monthName: { $first: "$startDate" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.json({ clubStats, participationTrends });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Export Data to CSV
const exportReport = async (req, res) => {
  try {
    const events = await Event.find({}).populate('organizer', 'name').populate('venue', 'name');
    
    const fields = ['title', 'hostingClub', 'startDate', 'status', 'budget', 'participants.length'];
    const opts = { fields };
    
    // Transform data for CSV
    const data = events.map(e => ({
      title: e.title,
      hostingClub: e.hostingClub,
      startDate: new Date(e.startDate).toLocaleDateString(),
      status: e.status,
      budget: e.budget,
      participants_count: e.participants.length
    }));

    const parser = new Parser();
    const csv = parser.parse(data);

    res.header('Content-Type', 'text/csv');
    res.attachment('campus_report.csv');
    return res.send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {getResourceStats,getMonthlyActivity,getOrganizerLeaderboard,getAdvancedStats, exportReport};