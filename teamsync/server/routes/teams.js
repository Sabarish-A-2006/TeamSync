const express = require('express');
const router = express.Router();
const { createTeam, getAllTeams, getTeamById, updateTeam, deleteTeam, addMember, removeMember } = require('../controllers/teamController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('admin'), createTeam);
router.get('/', protect, getAllTeams);
router.get('/:id', protect, getTeamById);
router.patch('/:id', protect, authorize('admin'), updateTeam);
router.delete('/:id', protect, authorize('admin'), deleteTeam);
router.post('/:id/members', protect, authorize('admin'), addMember);
router.delete('/:id/members/:userId', protect, authorize('admin'), removeMember);

module.exports = router;
