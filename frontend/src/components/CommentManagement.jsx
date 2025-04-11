import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import AdminLayout from './AdminLayout';
import { getAllComments, deleteComment, clearReportedComment } from '../services/ApiService';
import { Trash2, AlertTriangle, Check } from 'lucide-react';

const CommentManagement = () => {
  const { theme } = useTheme();
  const { token } = useAuth();
  const { dispatch } = useNotification();
  const [comments, setComments] = useState({
    normal: [],
    reported: []
  });
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const allComments = await getAllComments(token);
        
        // Separate comments into normal and reported
        const normalComments = allComments.filter(comment => !comment.reported);
        const reportedComments = allComments.filter(comment => comment.reported);
        
        setComments({
          normal: normalComments,
          reported: reportedComments
        });
      } catch (error) {
        console.error('Error in fetchComments:', error);
        dispatch({
          type: 'error',
          message: 'Failed to fetch comments',
          duration: 3000
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchComments();
  }, [token, dispatch, refresh]);
  
  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(token, commentId);
      dispatch({
        type: 'success',
        message: 'Comment deleted successfully',
        duration: 3000
      });
      // Refresh the comments list
      setRefresh(prev => !prev);
    } catch (error) {
      dispatch({
        type: 'error',
        message: 'Failed to delete comment',
        duration: 3000
      });
    }
  };
  
  const handleClearReport = async (commentId) => {
    try {
      await clearReportedComment(token, commentId);
      dispatch({
        type: 'success',
        message: 'Comment report cleared',
        duration: 3000
      });
      // Refresh the comments list
      setRefresh(prev => !prev);
    } catch (error) {
      dispatch({
        type: 'error',
        message: 'Failed to clear comment report',
        duration: 3000
      });
    }
  };
  
  const themeColors = {
    primary: theme?.name === 'dark' ? '#e53e3e' : '#e53e3e',
    background: theme?.name === 'dark' ? '#1a202c' : '#f7fafc',
    text: {
      primary: theme?.name === 'dark' ? '#f7fafc' : '#1a202c',
      secondary: theme?.name === 'dark' ? '#a0aec0' : '#4a5568'
    },
    card: theme?.name === 'dark' ? '#2d3748' : 'white',
    border: theme?.name === 'dark' ? '#4a5568' : '#e2e8f0'
  };
  
  const CommentCard = ({ comment, isReported = false }) => {
    return (
      <div 
        className="p-4 mb-4 rounded-lg border shadow-sm" 
        style={{ 
          backgroundColor: themeColors.card,
          borderColor: isReported ? '#e53e3e' : themeColors.border 
        }}
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="font-medium" style={{ color: themeColors.text.primary }}>
              {comment.username || 'Anonymous User'}
            </p>
            <p className="text-xs" style={{ color: themeColors.text.secondary }}>
              {comment.formattedDate || 'Invalid Date'}
            </p>
          </div>
          <div className="flex space-x-2">
            {isReported && (
              <button 
                onClick={() => handleClearReport(comment.id)}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Clear Report"
              >
                <Check size={16} className="text-green-500" />
              </button>
            )}
            <button 
              onClick={() => handleDeleteComment(comment.id)}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Delete Comment"
            >
              <Trash2 size={16} className="text-red-500" />
            </button>
          </div>
        </div>
        <div className="mt-2">
          <p style={{ color: themeColors.text.primary }}>{comment.text}</p>
        </div>
        <div className="mt-2 text-sm" style={{ color: themeColors.text.secondary }}>
          <p>Recipe: {comment.recipeTitle || 'Unknown Recipe'}</p>
        </div>
      </div>
    );
  };
  
  return (
    <AdminLayout pageTitle="Comment Management" pageDescription="Manage user comments">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: themeColors.primary }}></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Normal Comments Column */}
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold" style={{ color: themeColors.text.primary }}>
                Normal Comments ({comments.normal.length})
              </h2>
              <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                All user comments that haven't been reported
              </p>
            </div>
            
            {comments.normal.length === 0 ? (
              <div className="p-4 border rounded-lg text-center" style={{ borderColor: themeColors.border, color: themeColors.text.secondary }}>
                No comments to display
              </div>
            ) : (
              <div className="space-y-4">
                {comments.normal.map(comment => (
                  <CommentCard 
                    key={comment.id} 
                    comment={comment}
                    isReported={false}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Reported Comments Column */}
          <div className="border-l pl-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold flex items-center" style={{ color: themeColors.text.primary }}>
                <AlertTriangle size={18} className="text-red-500 mr-2" />
                Reported Comments ({comments.reported.length})
              </h2>
              <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                Comments that have been flagged by users
              </p>
            </div>
            
            {comments.reported.length === 0 ? (
              <div className="p-4 border rounded-lg text-center" style={{ borderColor: themeColors.border, color: themeColors.text.secondary }}>
                No reported comments
              </div>
            ) : (
              <div className="space-y-4">
                {comments.reported.map(comment => (
                  <CommentCard 
                    key={comment.id} 
                    comment={comment}
                    isReported={true}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default CommentManagement; 