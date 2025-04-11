const Comment = require('../models/Comment');
const Recipe = require('../models/Recipe');
const User = require('../models/User');

exports.getAllComments = async (req, res) => {
  console.log('=== Starting getAllComments ===');
  console.log('Request received:', {
    method: req.method,
    url: req.url,
    headers: req.headers
  });

  try {
    console.log('1. Starting database query...');
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

    console.log('2. Database query completed. Found comments:', comments.length);
    console.log('Raw comments data:', JSON.stringify(comments, null, 2));

    console.log('3. Starting comment formatting...');
    const formattedComments = comments.map(comment => {
      console.log(`Processing comment ${comment.id}:`, {
        content: comment.content,
        recipe: comment.Recipe ? { id: comment.Recipe.id, title: comment.Recipe.title } : null,
        user: comment.User ? { id: comment.User.id, username: comment.User.username } : null
      });

      const formattedComment = {
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

      console.log(`Formatted comment ${comment.id}:`, formattedComment);
      return formattedComment;
    });

    console.log('4. Formatting completed. Final comments count:', formattedComments.length);
    console.log('Final formatted comments:', JSON.stringify(formattedComments, null, 2));

    console.log('5. Sending response...');
    res.json(formattedComments);
    console.log('=== getAllComments completed successfully ===');
  } catch (error) {
    console.error('=== Error in getAllComments ===');
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    console.error('Full error object:', error);
    
    res.status(500).json({ 
      message: 'Error fetching comments',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.clearReportedComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    comment.isReported = false;
    await comment.save();

    res.json({ message: 'Comment report cleared successfully' });
  } catch (error) {
    console.error('Error clearing reported comment:', error);
    res.status(500).json({ message: 'Error clearing reported comment' });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    await comment.destroy();
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Error deleting comment' });
  }
}; 