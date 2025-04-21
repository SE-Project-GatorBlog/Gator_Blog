import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import blogService from '../../utils/blogService';

const CommentSection = ({ postId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchComments();
  }, [postId]);
  
  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const data = await blogService.getComments(postId);
      setComments(data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const commentData = {
        content: newComment,
        user_id: user ? user.id : 0,
        blog_id: postId
      };
      
      const addedComment = await blogService.addComment(postId, commentData);
      
      // Add username to the new comment for display
      const commentWithUser = {
        ...addedComment,
        username: user ? user.username : 'Anonymous'
      };
      
      // Add the new comment to the comments array
      setComments(prev => [...prev, commentWithUser]);
      
      // Clear the comment input
      setNewComment('');
    } catch (err) {
      console.error('Error submitting comment:', err);
      setError('Failed to submit comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Format date for comments
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="bg-white/90 rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-[#0021A5]">Comments</h2>
      
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-blue-800 rounded-full"></div>
          <div className="flex-1">
            <textarea 
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0021A5] min-h-[100px]"
              required
            ></textarea>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="mt-2 bg-[#0021A5] text-white px-4 py-2 rounded-lg hover:bg-[#001B8C] transition-colors"
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </div>
      </form>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button 
            className="ml-2 text-red-700 font-bold"
            onClick={fetchComments}
          >
            Try Again
          </button>
        </div>
      )}
      
      {/* Comments List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-blue-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-blue-200 rounded w-1/4"></div>
                <div className="h-4 bg-blue-100 rounded w-3/4"></div>
              </div>
            </div>
            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-blue-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-blue-200 rounded w-1/4"></div>
                <div className="h-4 bg-blue-100 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        ) : comments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex space-x-4 border-b border-gray-200 pb-4">
              <div className="w-10 h-10 bg-blue-800 rounded-full"></div>
              <div className="flex-1">
                <div className="flex items-center mb-1">
                  <h4 className="font-medium">{comment.username || 'Anonymous'}</h4>
                  <span className="text-gray-500 text-sm ml-2">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;