import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { addComment, likeComment, dislikeComment, deleteComment } from '../services/ApiService';

const CommentsSection = ({ 
  initialComments,
  recipeId
}) => {
  const [commentText, setCommentText] = useState('');
  const [allComments, setAllComments] = useState(initialComments || []);
  const [likedComments, setLikedComments] = useState({});
  const [dislikedComments, setDislikedComments] = useState({});
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);
  const { theme } = useTheme();
  const { user, token } = useAuth();

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
    if (!commentText.trim() || !user || !token) return;
    
    try {
      const newComment = await addComment(recipeId, commentText, token);
      setAllComments([newComment, ...allComments]);
      setCommentText('');
      setError(null);
    } catch (err) {
      setError('Failed to add comment. Please try again.');
      console.error('Error adding comment:', err);
    }
  };
  
  const handleLike = async (commentId) => {
    if (!user || !token) return;
    
    try {
      await likeComment(commentId, token);
      setAllComments(allComments.map(comment => {
        if (comment.id === commentId) {
          // If already liked, unlike
          if (likedComments[commentId]) {
            return { ...comment, likes: comment.likes - 1 };
          } 
          // If disliked, remove dislike and add like
          else if (dislikedComments[commentId]) {
            return { ...comment, likes: comment.likes + 1, dislikes: comment.dislikes - 1 };
          } 
          // Otherwise just add like
          else {
            return { ...comment, likes: comment.likes + 1 };
          }
        }
        return comment;
      }));
      
      setLikedComments(prev => {
        if (prev[commentId]) {
          const newLiked = { ...prev };
          delete newLiked[commentId];
          return newLiked;
        } else {
          return { ...prev, [commentId]: true };
        }
      });
      
      setDislikedComments(prev => {
        if (prev[commentId]) {
          const newDisliked = { ...prev };
          delete newDisliked[commentId];
          return newDisliked;
        } else {
          return prev;
        }
      });
      setError(null);
    } catch (err) {
      setError('Failed to like comment. Please try again.');
      console.error('Error liking comment:', err);
    }
  };
  
  const handleDislike = async (commentId) => {
    if (!user || !token) return;
    
    try {
      await dislikeComment(commentId, token);
      setAllComments(allComments.map(comment => {
        if (comment.id === commentId) {
          // If already disliked, undislike
          if (dislikedComments[commentId]) {
            return { ...comment, dislikes: comment.dislikes - 1 };
          } 
          // If liked, remove like and add dislike
          else if (likedComments[commentId]) {
            return { ...comment, dislikes: comment.dislikes + 1, likes: comment.likes - 1 };
          } 
          // Otherwise just add dislike
          else {
            return { ...comment, dislikes: comment.dislikes + 1 };
          }
        }
        return comment;
      }));
      
      setDislikedComments(prev => {
        if (prev[commentId]) {
          const newDisliked = { ...prev };
          delete newDisliked[commentId];
          return newDisliked;
        } else {
          return { ...prev, [commentId]: true };
        }
      });
      
      setLikedComments(prev => {
        if (prev[commentId]) {
          const newLiked = { ...prev };
          delete newLiked[commentId];
          return newLiked;
        } else {
          return prev;
        }
      });
      setError(null);
    } catch (err) {
      setError('Failed to dislike comment. Please try again.');
      console.error('Error disliking comment:', err);
    }
  };

  const toggleDropdown = (commentId) => {
    setOpenDropdownId(openDropdownId === commentId ? null : commentId);
  };

  const handleDeleteComment = async (commentId) => {
    if (!user || !token) return;
    
    try {
      await deleteComment(commentId, token);
      setAllComments(allComments.filter(comment => comment.id !== commentId));
      setOpenDropdownId(null);
      setError(null);
    } catch (err) {
      setError('Failed to delete comment. Please try again.');
      console.error('Error deleting comment:', err);
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

      {/* Add Comment */}
      <div 
        className="rounded-lg p-4 mb-6"
      >
        <form onSubmit={handleCommentSubmit}>
          <textarea 
            className="w-full p-3 border-8 rounded-lg resize-none text-white focus:outline-none hover:shadow-md focus:shadow-lg transform hover:scale-[1.01] focus:scale-[1.01]"
            style={{ 
              backgroundColor: theme.core.containerHoover,
              borderColor: theme.core.text,
              borderWidth: '1px'
            }}
            rows="3"
            placeholder={user ? "Add your comment..." : "Please log in to comment"}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            disabled={!user}
          ></textarea>
          <div className="flex justify-end mt-2">
            <button 
              type="submit" 
              className="px-4 py-2 rounded-lg transform hover:scale-105 active:scale-95 hover:brightness-90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: theme.headerfooter.logoRed,
                color: '#ffffff',
                transition: 'transform 0.1s ease'
              }}
              disabled={!user || !commentText.trim()}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
      
      <div 
        className="border-t mb-6"
        style={{ borderColor: theme.core.text + '30' }} // Adding transparency to border
      ></div>
      
      {/* Comments List */}
      <h2 
        className="text-3xl font-bold mb-6"
        style={{ color: theme.core.text }}
      >
        Comments
      </h2>
      
      {allComments.map((comment) => (
        <div key={comment.id || Math.random().toString()} className="mb-6">
          <div className="flex items-start mb-2">
            <img 
              src={comment.authorImage || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjUiIGN5PSIyNSIgcj0iMjUiIGZpbGw9IiNlMmUyZTIiLz48dGV4dCB4PSIyNSIgeT0iMjkiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk5OTk5OSI+VTwvdGV4dD48L3N2Zz4="} 
              alt={comment.author || 'Anonymous'} 
              className="w-12 h-12 rounded-full mr-3 object-cover"
              onError={(e) => {
                e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjUiIGN5PSIyNSIgcj0iMjUiIGZpbGw9IiNlMmUyZTIiLz48dGV4dCB4PSIyNSIgeT0iMjkiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk5OTk5OSI+VTwvdGV4dD48L3N2Zz4=";
              }}
            />
            <div className="flex-1">
              <div className="flex justify-between items-baseline">
                <h3 className="font-semibold">{comment.author || 'Anonymous'}</h3>
                <span 
                  className="text-sm"
                  style={{ color: theme.core.text + '80' }} // Adding transparency
                >
                  {comment.time || 'Recently'}
                </span>
              </div>
              <p className="mt-1" style={{ color: theme.core.text }}>{comment.text || 'No content'}</p>
              
              <div className="flex mt-2 items-center">
                <button 
                  onClick={() => handleLike(comment.id)}
                  className="flex items-center mr-4 cursor-pointer transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    color: likedComments[comment.id] 
                      ? theme.headerfooter.logoRed 
                      : theme.core.text + '80', // Slightly transparent when not active
                    transition: 'none' // Explicitly remove transition
                  }}
                  disabled={!user}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-1" style={{ transition: 'none' }}>
                    <path d="M7.493 18.75c-.425 0-.82-.236-.975-.632A7.48 7.48 0 016 15.375c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23h-.777zM2.331 10.977a11.969 11.969 0 00-.831 4.398 12 12 0 00.52 3.507c.26.85 1.084 1.368 1.973 1.368H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 01-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227z" />
                  </svg>
                  {comment.likes || 0}
                </button>
                <button 
                  onClick={() => handleDislike(comment.id)}
                  className="flex items-center mr-4 cursor-pointer transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    color: dislikedComments[comment.id] 
                      ? theme.headerfooter.logoRed 
                      : theme.core.text + '80', // Slightly transparent when not active
                    transition: 'none' // Explicitly remove transition
                  }}
                  disabled={!user}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-1" style={{ transition: 'none' }}>
                    <path d="M15.73 5.25h1.035A7.465 7.465 0 0118 9.375a7.465 7.465 0 01-1.235 4.125h-.148c-.806 0-1.534.446-2.031 1.08a9.04 9.04 0 01-2.861 2.4c-.723.384-1.35.956-1.653 1.715a4.498 4.498 0 00-.322 1.672V21a.75.75 0 01-.75.75 2.25 2.25 0 01-2.25-2.25c0-1.152.26-2.243.723-3.218.266-.558-.107-1.282-.725-1.282H3.622c-1.026 0-1.945-.694-2.054-1.715A12.134 12.134 0 011.5 12c0-2.848.992-5.464 2.649-7.521.388-.482.987-.729 1.605-.729H9.77a4.5 4.5 0 011.423.23l3.114 1.04a4.5 4.5 0 001.423.23zM21.669 13.773c.536-1.362.831-2.845.831-4.398 0-1.22-.182-2.398-.52-3.507-.26-.85-1.084-1.368-1.973-1.368H19.1c-.445 0-.72.498-.523.898.591 1.2.924 2.55.924 3.977a8.959 8.959 0 01-1.302 4.666c-.245.403.028.959.5.959h1.053c.832 0 1.612-.453 1.918-1.227z" />
                  </svg>
                  {comment.dislikes || 0}
                </button>
                
                {/* Three Dots Menu */}
                {user && (user.username === comment.author || user.role === 'ADMIN') && (
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown(comment.id)}
                      className="p-1 rounded-full hover:bg-gray-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                    
                    {openDropdownId === comment.id && (
                      <div
                        ref={dropdownRef}
                        className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                      >
                        <div className="py-1">
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => handleReportComment(comment.id)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Report
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {allComments.length === 0 && (
        <p className="text-center py-4" style={{ color: theme.core.text + '80' }}>
          No comments yet. Be the first to comment!
        </p>
      )}
    </div>
  );
};

export default CommentsSection;
