import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import blogService from '../../utils/blogService';

/**
 * A reusable Like Button component that handles the like/unlike functionality
 * for the current user only.
 * 
 * @param {Object} props Component props
 * @param {string|number} props.postId The ID of the post to like/unlike
 * @param {number} props.initialLikeCount Initial count of likes for the post
 * @param {string} props.size Size variant of the button ('small', 'medium', 'large')
 * @param {Function} props.onLikeUpdate Callback function when like status changes
 * @returns {JSX.Element} Like button component
 */
const LikeButton = ({
  postId,
  initialLikeCount = 0,
  size = 'medium',
  onLikeUpdate
}) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikeCount);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch initial like status and count when component mounts
  const fetchLikeStatus = useCallback(async () => {
    if (!postId || !user) return;
    
    try {
      const likes = await blogService.getLikes(postId);
      
      // Set the total likes count
      setLikesCount(likes.length || 0);
      
      // Check if current user has liked this post
      if (user && user.id) {
        const userLiked = likes.some(like => 
          // Ensure we're comparing the same types
          Number(like.user_id) === Number(user.id)
        );
        setIsLiked(userLiked);
      }
    } catch (err) {
      console.error(`Error checking like status for post ${postId}:`, err);
    }
  }, [postId, user]);
  
  // Run on component mount and when props or user change
  useEffect(() => {
    fetchLikeStatus();
  }, [fetchLikeStatus, postId, user]);

  const handleLike = async (e) => {
    e.stopPropagation(); // Prevent click from bubbling up
    
    // Exit early if no postId or no user
    if (!postId) {
      console.error('Cannot like post: No postId provided');
      return;
    }
    
    if (!user) {
      alert('Please log in to like posts');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isLiked) {
        // Unlike the post
        await blogService.removeLike(postId);
        setIsLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
      } else {
        // Like the post
        await blogService.addLike(postId);
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
      
      // Notify parent component about the like update if callback exists
      if (typeof onLikeUpdate === 'function') {
        onLikeUpdate(postId, !isLiked, likesCount + (isLiked ? -1 : 1));
      }
    } catch (err) {
      console.error(`Error toggling like:`, err);
      alert('Could not update like status. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Size-based classes
  const getSizeClasses = () => {
    switch(size) {
      case 'small':
        return {
          button: 'px-2 py-1 rounded-full text-xs',
          icon: 'w-3 h-3 mr-1'
        };
      case 'large':
        return {
          button: 'px-5 py-2.5 rounded-lg text-base',
          icon: 'w-6 h-6 mr-2'
        };
      case 'medium':
      default:
        return {
          button: 'px-3 py-1.5 rounded-lg text-sm',
          icon: 'w-4 h-4 mr-1.5'
        };
    }
  };
  
  const sizeClasses = getSizeClasses();
  
  return (
    <button 
      onClick={handleLike}
      disabled={isSubmitting || !user}
      className={`${sizeClasses.button} flex items-center ${
        isLiked 
        ? 'bg-blue-500 text-white' 
        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      } ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''} transition-colors duration-200`}
      aria-label={isLiked ? 'Unlike post' : 'Like post'}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill={isLiked ? "currentColor" : "none"} 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        className={sizeClasses.icon}
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" 
        />
      </svg>
      {isSubmitting ? 'Processing...' : `${likesCount}`}
    </button>
  );
};

export default LikeButton;