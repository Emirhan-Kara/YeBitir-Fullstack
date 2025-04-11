import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { addComment, likeComment, dislikeComment, deleteComment, getCommentsByRecipe } from '../services/ApiService';
import { Link } from 'react-router-dom';

const CommentsSection = ({ 
  initialComments = [],
  recipeId
}) => {
  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState(0);
  const [allComments, setAllComments] = useState(initialComments);
  const [userReactions, setUserReactions] = useState({});  // Track user reactions {commentId: 'LIKE'|'DISLIKE'|null}
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef(null);
  const { theme } = useTheme();
  const { isLoggedIn, currentUser, token } = useAuth();

  // Debug logging for auth state
  useEffect(() => {
    console.log('Auth state in CommentsSection:', {
      isLoggedIn,
      currentUser: currentUser ? {
        id: currentUser.id,
        username: currentUser.username,
        email: currentUser.email
      } : null,
      hasToken: !!token
    });
  }, [isLoggedIn, currentUser, token]);

  // Fetch comments when component mounts or auth state changes
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoading(true);
        const comments = await getCommentsByRecipe(recipeId);
        setAllComments(comments);
        
        // Initialize user reactions based on server data
        const initialReactions = {};
        comments.forEach(comment => {
          if (comment.userLiked === true) {
            initialReactions[comment.id] = 'LIKE';
          } else if (comment.userDisliked === true) {
            initialReactions[comment.id] = 'DISLIKE';
          } else {
            initialReactions[comment.id] = null;
          }
        });
        setUserReactions(initialReactions);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching comments:', err);
        setError('Failed to load comments. Please try refreshing the page.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [recipeId, isLoggedIn, currentUser]); // Add currentUser to dependencies

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn || !token) {
      setError('You must be logged in to add comments.');
      return;
    }
    
    if (!commentText.trim()) {
      setError('Comment cannot be empty.');
      return;
    }

    if (rating === 0) {
      setError('Please select a rating.');
      return;
    }
    
    try {
      const newComment = await addComment(recipeId, commentText, rating, token);
      setAllComments(prev => [newComment, ...prev]);
      setCommentText('');
      setRating(0);
      setError(null);
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment. Please try again.');
    }
  };
  
  const handleLike = async (commentId) => {
    if (!isLoggedIn || !token) return;
    
    try {
      // Store the current state before making the API call
      const isCurrentlyLiked = userReactions[commentId] === 'LIKE';
      
      // Call API
      const updatedComment = await likeComment(commentId, token);
      
      // Toggle the like state based on previous state
      setUserReactions(prev => ({
        ...prev,
        [commentId]: isCurrentlyLiked ? null : 'LIKE'
      }));
      
      // Update comment counts based on server response
      setAllComments(allComments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            likes: updatedComment.likes,
            dislikes: updatedComment.dislikes
          };
        }
        return comment;
      }));
      
      setError(null);
    } catch (error) {
      console.error('Error reacting to comment:', error);
      // Revert changes on error
      const currentReaction = userReactions[commentId];
      setUserReactions(prev => ({
        ...prev,
        [commentId]: currentReaction
      }));
      setAllComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          const revertedLikes = currentReaction === 'LIKE' 
            ? comment.likes + 1 
            : comment.likes - 1;
          return { ...comment, likes: revertedLikes };
        }
        return comment;
      }));
    }
  };
  
  const handleDislike = async (commentId) => {
    if (!isLoggedIn || !token) return;
    
    try {
      // Store the current state before making the API call
      const isCurrentlyDisliked = userReactions[commentId] === 'DISLIKE';
      
      // Call API
      const updatedComment = await dislikeComment(commentId, token);
      
      // Toggle the dislike state based on previous state
      setUserReactions(prev => ({
        ...prev,
        [commentId]: isCurrentlyDisliked ? null : 'DISLIKE'
      }));
      
      // Update comment counts based on server response
      setAllComments(allComments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            likes: updatedComment.likes,
            dislikes: updatedComment.dislikes
          };
        }
        return comment;
      }));
      
      setError(null);
    } catch (error) {
      console.error('Error reacting to comment:', error);
      // Revert changes on error
      const currentReaction = userReactions[commentId];
      setUserReactions(prev => ({
        ...prev,
        [commentId]: currentReaction
      }));
      setAllComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          const revertedDislikes = currentReaction === 'DISLIKE' 
            ? comment.dislikes + 1 
            : comment.dislikes - 1;
          return { ...comment, dislikes: revertedDislikes };
        }
        return comment;
      }));
      setError('Failed to dislike comment. Please try again.');
    }
  };

  const toggleDropdown = (commentId) => {
    setOpenDropdownId(openDropdownId === commentId ? null : commentId);
  };

  const handleDeleteComment = async (commentId) => {
    if (!isLoggedIn || !token) {
      setError('You must be logged in to delete comments.');
      return;
    }
    
    try {
      await deleteComment(commentId, token);
      // Remove the deleted comment from the state
      setAllComments(prev => prev.filter(comment => comment.id !== commentId));
      setOpenDropdownId(null);
      setError(null);
    } catch (err) {
      console.error('Error deleting comment:', err);
      if (err.message.includes('Failed to delete comment reactions')) {
        setError('Failed to delete comment reactions. Please try again.');
      } else if (err.message.includes('403')) {
        setError('You do not have permission to delete this comment.');
      } else {
        setError('Failed to delete comment. Please try again.');
      }
    }
  };

  const handleReportComment = (commentId) => {
    // In the future, implement actual reporting functionality
    alert(`Comment ${commentId} has been reported.`);
    setOpenDropdownId(null);
  };
  
  return (
    <div 
      id="comments-section" 
      className="w-19/20 mx-auto rounded-[40px] p-6 mt-4"
      style={{ 
        backgroundColor: theme.core.container,
        color: theme.core.text
      }}
    >
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700">
          {error}
        </div>
      )}

      {/* Add Comment or Login Prompt */}
      <div className="rounded-lg p-4 mb-6">
        {isLoggedIn ? (
          <form onSubmit={handleCommentSubmit}>
            <textarea 
              className="w-full p-3 border-8 rounded-lg resize-none text-white focus:outline-none hover:shadow-md focus:shadow-lg transform hover:scale-[1.01] focus:scale-[1.01]"
              style={{ 
                backgroundColor: theme.core.containerHoover,
                borderColor: theme.core.text,
                borderWidth: '1px'
              }}
              rows="3"
              placeholder="Add your comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            ></textarea>
            
            {/* Rating Input */}
            <div className="mt-4 mb-4">
              <label className="block text-sm font-medium mb-2">Rate this recipe:</label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      rating >= star ? 'bg-yellow-400' : 'bg-gray-300'
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end mt-2">
              <button 
                type="submit" 
                className="px-4 py-2 rounded-lg transform hover:scale-105 active:scale-95 hover:brightness-90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: theme.headerfooter.logoRed,
                  color: '#ffffff',
                  transition: 'transform 0.1s ease'
                }}
                disabled={!commentText.trim() || rating === 0}
              >
                Submit
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: theme.core.containerHoover }}>
            <p className="mb-3">Please <Link to="/login" className="text-blue-500 hover:underline">log in</Link> to add comments and interact with other users' comments.</p>
          </div>
        )}
      </div>
      
      <div 
        className="border-t mb-6"
        style={{ borderColor: theme.core.text + '30' }}
      ></div>
      
      {/* Comments List */}
      <h2 
        className="text-3xl font-bold mb-6"
        style={{ color: theme.core.text }}
      >
        Comments ({allComments.length})
      </h2>
      
      {isLoading ? (
        <div className="text-center py-4">Loading comments...</div>
      ) : allComments.length > 0 ? (
        allComments.map((comment) => {
          return (
            <div key={comment.id || Math.random().toString()} className="mb-6">
              <div className="flex items-start mb-2">
                <div className="flex-1">
                  <div className="flex justify-between items-baseline">
                    <Link 
                      to={comment.author === currentUser?.username ? '/profile' : `/profile/${comment.author}`} 
                      className="font-semibold hover:underline"
                      onClick={() => {
                        console.log('Comment authorId:', comment.authorId);
                        console.log('Current user id:', currentUser?.id);
                        console.log('Are they equal?', comment.authorId === currentUser?.id);
                      }}
                    >
                      {comment.author || 'Anonymous'}
                    </Link>
                    <div className="flex items-center">
                      {/* Rating Display */}
                      <div className="flex items-center mr-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-4 h-4 ${star <= comment.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500 mr-2">
                        {comment.time}
                      </span>
                      {isLoggedIn && (
                        <div className="relative" ref={dropdownRef}>
                          <button
                            onClick={() => toggleDropdown(comment.id)}
                            className="p-1 hover:bg-gray-200 rounded-full"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                          {openDropdownId === comment.id && (
                            <div 
                              className="absolute right-0 mt-2 w-48 rounded-md shadow-lg z-10"
                              style={{ backgroundColor: theme.core.containerHoover }}
                            >
                              <div className="py-1">
                                {(currentUser?.id === comment.authorId || currentUser?.role === 'ADMIN') ? (
                                  <button
                                    onClick={() => handleDeleteComment(comment.id)}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-red-500 hover:text-white"
                                  >
                                    Delete
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleReportComment(comment.id)}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-200"
                                  >
                                    Report
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="mt-1">{comment.text}</p>
                  <div className="flex items-center mt-2">
                    {isLoggedIn ? (
                      <>
                        <button
                          onClick={() => handleLike(comment.id)}
                          className={`flex items-center mr-4 ${userReactions[comment.id] === 'LIKE' ? 'text-green-500' : ''}`}
                        >
                          <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                          </svg>
                          {comment.likes || 0}
                        </button>
                        <button
                          onClick={() => handleDislike(comment.id)}
                          className={`flex items-center ${userReactions[comment.id] === 'DISLIKE' ? 'text-red-500' : ''}`}
                        >
                          <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                          </svg>
                          {comment.dislikes || 0}
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center mr-4 text-gray-500">
                          <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                          </svg>
                          {comment.likes || 0}
                        </div>
                        <div className="flex items-center text-gray-500">
                          <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                          </svg>
                          {comment.dislikes || 0}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-center text-gray-500">No comments yet. Be the first to comment!</p>
      )}
    </div>
  );
};

export default CommentsSection;