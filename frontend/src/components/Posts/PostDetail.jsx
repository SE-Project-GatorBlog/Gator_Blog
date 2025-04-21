import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import blogService from '../../utils/blogService';
import ImprovedLikeButton from '../Likes/LikeButton';

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isSubmittingLike, setIsSubmittingLike] = useState(false);
  
  useEffect(() => {
    const fetchPostData = async () => {
      setIsLoading(true);
      try {
        console.log(`Fetching post data for ID: ${id}`);
        // First, try to get the specific blog post by ID
        const response = await blogService.getBlogById(id);
        
        if (response && response.blog) {
          const blog = response.blog;
          console.log("Received blog data:", blog);
          
          // Format the post data
          setPost({
            id: blog.ID || blog.id,
            username: blog.Author || 'Anonymous User',
            date: new Date(blog.created_at || blog.CreatedAt).toLocaleString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            updatedDate: new Date(blog.updated_at || blog.UpdatedAt).toLocaleString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            title: blog.Title,
            content: blog.Post,
            authorId: blog.user_id || blog.AuthorID,
            createdAt: blog.created_at || blog.CreatedAt,
            updatedAt: blog.updated_at || blog.UpdatedAt
          });
          
          // Fetch comments and likes separately
          fetchComments(blog.ID || blog.id);
          checkIfLiked(blog.ID || blog.id);
        } else {
          console.error("No blog data found in response", response);
          setError(`Post with ID ${id} not found`);
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        setError(`Failed to load post: ${err.message || 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPostData();
  }, [id]);
  
  const fetchComments = async (blogId) => {
    try {
      console.log(`Fetching comments for blog ID: ${blogId}`);
      const commentsData = await blogService.getComments(blogId);
      console.log(`Received ${commentsData.length} comments:`, commentsData);
      
      setComments(commentsData || []);
      setCommentsCount(commentsData.length || 0);
    } catch (err) {
      console.error('Error fetching comments:', err);
      // We don't set error state here to not disrupt the entire page
    }
  };
  
  const checkIfLiked = async (blogId) => {
    try {
      console.log(`Checking like status for blog ID: ${blogId}`);
      const likes = await blogService.getLikes(blogId);
      console.log(`Received ${likes.length} likes:`, likes);
      
      // Check if current user has liked this post (if user exists)
      if (user) {
        const userLiked = likes.some(like => like.user_id === user.id);
        console.log(`User ${user.id} has ${userLiked ? 'liked' : 'not liked'} this post`);
        setIsLiked(userLiked);
      }
      
      setLikesCount(likes.length || 0);
    } catch (err) {
      console.error('Error checking like status:', err);
      // We don't set error state here to not disrupt the entire page
    }
  };
  
  const handleLike = async () => {
    if (!post) return;
    
    setIsSubmittingLike(true);
    
    try {
      console.log(`[PostDetail] Toggling like for post ${post.id}, current status: ${isLiked ? 'liked' : 'not liked'}`);
      
      if (isLiked) {
        // Unlike the post - API extracts necessary data from request
        console.log(`[PostDetail] Removing like from post ${post.id}`);
        await blogService.removeLike(post.id);
        setIsLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
        console.log(`[PostDetail] Like removed, new count: ${Math.max(0, likesCount - 1)}`);
      } else {
        // Like the post - API extracts necessary data from request
        console.log(`[PostDetail] Adding like to post ${post.id}`);
        await blogService.addLike(post.id);
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
        console.log(`[PostDetail] Like added, new count: ${likesCount + 1}`);
      }
    } catch (err) {
      console.error('[PostDetail] Error toggling like:', err);
      alert('Failed to update like status. Please try again.');
    } finally {
      setIsSubmittingLike(false);
    }
  };
  
  const handleComment = async (e) => {
    e.preventDefault();
    
    if (!post || !newComment.trim()) {
      return;
    }
    
    setIsSubmittingComment(true);
    
    try {
      console.log(`Adding comment to post ${post.id}`);
      const commentData = {
        content: newComment,
        user_id: user ? user.id : 0, // Use 0 or another default if no user
        blog_id: post.id
      };
      
      console.log('Comment data:', commentData);
      const addedComment = await blogService.addComment(post.id, commentData);
      console.log('Added comment response:', addedComment);
      
      // Add the new comment to the comments array
      setComments(prev => [...prev, {
        ...addedComment,
        username: user ? user.username : 'Anonymous' // Use "Anonymous" if no user
      }]);
      
      // Update the comment count
      setCommentsCount(prev => prev + 1);
      
      // Clear the comment input
      setNewComment('');
    } catch (err) {
      console.error('Error submitting comment:', err);
      alert('Failed to submit comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };
  
  // Function to safely render HTML content
  const createMarkup = (htmlContent) => {
    return { __html: htmlContent };
  };
  
  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleDelete = async () => {
    if (!post) return;
    
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await blogService.deleteBlog(post.id);
        navigate('/dashboard');
      } catch (err) {
        alert(`Failed to delete post: ${err.message}`);
      }
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
    <div className="min-h-screen bg-gradient-to-br from-[#FA4616] via-[#0021A5] to-[#FA4616]">
      {/* Navigation Bar */}
      <nav className="bg-[#0021A5] p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">GATORBLOG</h1>
          <div className="space-x-6">
            <button 
              onClick={() => navigate('/home')} 
              className="text-white hover:text-blue-200"
            >
              HOME
            </button>
            <button 
              onClick={() => navigate('/dashboard')} 
              className="text-white hover:text-blue-200"
            >
              POSTS
            </button>
            <button 
              onClick={() => navigate('/profile')} 
              className="text-white hover:text-blue-200"
            >
              MY PROFILE
            </button>
          </div>
        </div>
      </nav>
      
      <div className="max-w-7xl mx-auto p-6">
        <button
          onClick={handleBack}
          className="mb-4 text-white flex items-center"
        >
          <span className="mr-2">←</span> Back to Posts
        </button>
        
        {isLoading ? (
          <div className="bg-white/80 rounded-lg p-6 text-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-8 bg-blue-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-blue-100 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-blue-100 rounded w-1/2"></div>
            </div>
            <p className="mt-4 text-blue-800">Loading post...</p>
          </div>
        ) : error ? (
          <div className="bg-white/80 rounded-lg p-6 text-center">
            <p className="text-red-500">{error}</p>
            <button 
              onClick={handleBack} 
              className="mt-4 bg-[#0021A5] text-white px-4 py-2 rounded-lg"
            >
              Return to Dashboard
            </button>
          </div>
        ) : post ? (
          <div className="bg-white/90 rounded-lg p-6 shadow-lg mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-800 rounded-full"></div>
              <div className="flex flex-col">
                <span className="font-medium text-lg">{post.username}</span>
                <div>
                  <span className="text-gray-500 text-sm">Created: {post.date}</span>
                  {post.date !== post.updatedDate && 
                    <span className="text-gray-500 text-sm ml-2">Updated: {post.updatedDate}</span>
                  }
                </div>
              </div>
            </div>
            
            <div className="border-b border-gray-300 pb-4 mb-6">
              <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
              <div 
                className="text-gray-700 text-lg prose max-w-none"
                dangerouslySetInnerHTML={createMarkup(post.content)}
              ></div>
            </div>
            
            <div className="flex space-x-4">
            <ImprovedLikeButton 
              postId={post.id}
              initialLikeCount={likesCount}
              initialIsLiked={isLiked}
              size="medium"
              onLikeUpdate={(postId, updatedLiked, newCount) => {
                setIsLiked(updatedLiked);
                setLikesCount(newCount);
              }}
            />
              <div className="bg-gray-200 px-4 py-2 rounded-lg flex items-center text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                </svg>
                {commentsCount} Comments
              </div>
              
              {/* Edit and Delete Buttons - only shown if user is the author */}
              {user && user.id === post.authorId && (
                <div className="flex space-x-2 ml-auto">
                  <button 
                    className="bg-[#0021A5] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#001B8C]"
                    onClick={() => navigate(`/edit-post/${post.id}`)}
                  >
                    Edit
                  </button>
                  <button 
                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700"
                    onClick={handleDelete}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white/80 rounded-lg p-6 text-center">
            <p className="text-gray-700">Post not found.</p>
            <button
              onClick={handleBack}
              className="mt-4 bg-[#0021A5] text-white px-6 py-2 rounded-lg hover:bg-[#001B8C] transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        )}
        
        {/* Comments Section */}
        {post && (
          <div className="bg-white/90 rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-[#0021A5]">Comments</h2>
            
            {/* Comment Form */}
            <form onSubmit={handleComment} className="mb-8">
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
                    disabled={isSubmittingComment}
                    className="mt-2 bg-[#0021A5] text-white px-4 py-2 rounded-lg hover:bg-[#001B8C] transition-colors"
                  >
                    {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </div>
            </form>
            
            {/* Comments List */}
            <div className="space-y-6">
              {comments.length === 0 ? (
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
        )}
      </div>
    </div>
  );
};

export default PostDetailPage;