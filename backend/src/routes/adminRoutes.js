const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Recipe = require('../models/Recipe');
const User = require('../models/User');

// Get all comments
router.get('/comments', async (req, res) => {
  console.log('Backend: Received request at /comments');
  console.log('Backend: Request headers:', req.headers);
  console.log('Backend: Request method:', req.method);
  console.log('Backend: Request URL:', req.url);

  try {
    console.log('Backend: Starting database query...');
    
    // Test database connection first
    try {
      await Comment.sequelize.authenticate();
      console.log('Backend: Database connection successful');
    } catch (dbError) {
      console.error('Backend: Database connection error:', dbError);
      throw new Error('Database connection failed');
    }

    const comments = await Comment.findAll({
      include: [
        {
          model: Recipe,
          attributes: ['id', 'title'],
          required: false
        },
        {
          model: User,
          attributes: ['id', 'username'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log('Backend: Found comments:', comments.length);

    const formattedComments = comments.map(comment => {
      console.log('Backend: Processing comment:', comment.id);
      return {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        isReported: comment.isReported,
        recipeId: comment.Recipe?.id || null,
        recipeName: comment.Recipe?.title || 'Unknown Recipe',
        userId: comment.User?.id || null,
        username: comment.User?.username || 'Unknown User'
      };
    });

    console.log('Backend: Sending response with', formattedComments.length, 'comments');
    res.json(formattedComments);
  } catch (error) {
    console.error('Backend: Error in /comments route:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    
    // Send detailed error response
    res.status(500).json({
      message: 'Error fetching comments',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      code: error.code
    });
  }
});

module.exports = router; 