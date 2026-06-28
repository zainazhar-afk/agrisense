"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import AuthModal from "@/components/AuthModal";
import { uploadToCloudinary } from "@/utils/cloudinary";

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL || "https://agrisence-backend.onrender.com/api";

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const timeAgo = (date) => {
  if (!date) return "";
  const diff = Date.now() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
};

const getInitials = (name) => {
  if (!name) return "U";
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
};

const getRandomColor = (seed) => {
  const colors = [
    "from-emerald-400 to-teal-500",
    "from-blue-400 to-indigo-500",
    "from-purple-400 to-pink-500",
    "from-orange-400 to-red-500",
    "from-cyan-400 to-blue-500",
    "from-rose-400 to-pink-500"
  ];
  const index = (seed || "").length % colors.length;
  return colors[index];
};

// ============================================================================
// INLINE STYLES
// ============================================================================

const styles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    25% { transform: translateY(-10px) rotate(1deg); }
    75% { transform: translateY(-5px) rotate(-1deg); }
  }
  
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 5px rgba(16, 185, 129, 0.3); }
    50% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.6), 0 0 40px rgba(16, 185, 129, 0.2); }
  }
  
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  
  @keyframes ripple {
    0% { transform: scale(0); opacity: 1; }
    100% { transform: scale(4); opacity: 0; }
  }
  
  @keyframes slide-up {
    0% { transform: translateY(20px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes gradient-shift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  .glass-card {
    background: rgba(255, 255, 255, 0.65);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
  
  .dark .glass-card {
    background: rgba(17, 24, 39, 0.7);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  .gradient-text {
    background: linear-gradient(135deg, #10b981 0%, #06b6d4 50%, #8b5cf6 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: gradient-shift 3s ease infinite;
  }
  
  .hover-lift {
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  
  .hover-lift:hover {
    transform: translateY(-4px);
  }
  
  .custom-scroll::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scroll::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .custom-scroll::-webkit-scrollbar-thumb {
    background: rgba(16, 185, 129, 0.3);
    border-radius: 20px;
  }
  
  .custom-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(16, 185, 129, 0.5);
  }
  
  .ripple-effect {
    position: relative;
    overflow: hidden;
  }
  
  .ripple-effect::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at var(--x, 50%) var(--y, 50%), rgba(16, 185, 129, 0.2) 0%, transparent 50%);
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  .ripple-effect:active::after {
    opacity: 1;
  }
  
  @media (max-width: 640px) {
    .responsive-grid {
      grid-template-columns: 1fr;
    }
  }
`;

// ============================================================================
// SVG ICONS
// ============================================================================

const IconComponents = {
  Heart: ({ filled = false, className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  
  Message: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  
  Share: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="18" cy="5" r="3"/>
      <circle cx="6" cy="12" r="3"/>
      <circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  ),
  
  Image: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21,15 16,10 5,21"/>
    </svg>
  ),
  
  Users: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  
  Trending: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
      <polyline points="17,6 23,6 23,12"/>
    </svg>
  ),
  
  Check: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20,6 9,17 4,12"/>
    </svg>
  ),
  
  Close: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  
  Send: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22,2 15,22 11,13 2,9"/>
    </svg>
  ),
  
  MoreHorizontal: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="1"/>
      <circle cx="19" cy="12" r="1"/>
      <circle cx="5" cy="12" r="1"/>
    </svg>
  ),
  
  Leaf: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.8 10-10 10z"/>
      <path d="M2 21c0-3 1.85-5.3 4.35-6.8"/>
    </svg>
  ),
  
  Video: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="23,7 16,12 23,17"/>
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
    </svg>
  ),
  
  MapPin: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  
  Calendar: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
};

// ============================================================================
// ANIMATED COUNTER
// ============================================================================

const AnimatedCounter = ({ value, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  useEffect(() => {
    if (!isInView) return;
    
    let startTime;
    let animationFrame;
    
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * value));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration, isInView]);
  
  return <span ref={ref}>{count.toLocaleString()}</span>;
};

// ============================================================================
// USER AVATAR
// ============================================================================

const UserAvatar = ({ user, size = "md", showStatus = false }) => {
  const sizeMap = {
    xs: "w-8 h-8 text-xs",
    sm: "w-10 h-10 text-sm",
    md: "w-12 h-12 text-base",
    lg: "w-16 h-16 text-lg",
  };
  
  if (user?.avatar) {
    return (
      <div className={`${sizeMap[size]} relative flex-shrink-0`}>
        <img
          src={user.avatar}
          alt={user.name}
          className="w-full h-full rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-sm"
        />
        {showStatus && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"/>
        )}
      </div>
    );
  }
  
  return (
    <div
      className={`${sizeMap[size]} relative flex-shrink-0 rounded-full bg-gradient-to-br ${
        getRandomColor(user?.name || "default")
      } flex items-center justify-center text-white font-bold shadow-sm`}
    >
      {getInitials(user?.name)}
      {showStatus && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"/>
      )}
    </div>
  );
};

// ============================================================================
// POST CARD COMPONENT
// ============================================================================

const PostCard = ({ post, currentUser, token, onUpdate, onAuthRequired, isTrending }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [comments, setComments] = useState(post.comments || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ripplePos, setRipplePos] = useState({ x: 0, y: 0 });
  const [showRipple, setShowRipple] = useState(false);
  const cardRef = useRef(null);
  
  useEffect(() => {
    if (currentUser && post.likes) {
      setIsLiked(post.likes.some(l => l.userId === currentUser.id));
    }
  }, [currentUser, post.likes]);
  
  const handleLike = async (e) => {
    if (!currentUser) {
      onAuthRequired();
      return;
    }
    
    const rect = e.currentTarget.getBoundingClientRect();
    setRipplePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setShowRipple(true);
    setTimeout(() => setShowRipple(false), 600);
    
    // Optimistic update
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    
    try {
      const res = await fetch(`${API_URL}/posts/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId: post.id }),
      });
      
      const data = await res.json();
      if (!data.success) {
        // Revert on failure
        setIsLiked(isLiked);
        setLikesCount(prev => isLiked ? prev + 1 : prev - 1);
      }
    } catch (error) {
      // Revert on error
      setIsLiked(isLiked);
      setLikesCount(prev => isLiked ? prev + 1 : prev - 1);
    }
  };
  
  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`${API_URL}/posts/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId: post.id, text: commentText }),
      });
      
      const data = await res.json();
      if (data.success) {
        setComments(prev => [...prev, data.comment]);
        setCommentText("");
        if (!showComments) setShowComments(true);
      }
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    
    try {
      const res = await fetch(`${API_URL}/posts/${post.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = await res.json();
      if (data.success) {
        onUpdate(prev => prev.filter(p => p.id !== post.id));
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };
  
  const handleShare = () => {
    const url = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(url).then(() => {
      // Could add a toast notification here
    });
  };
  
  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="glass-card rounded-2xl overflow-hidden hover-lift relative"
    >
      {isTrending && (
        <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-semibold rounded-full shadow-lg">
          <IconComponents.Trending className="w-3 h-3" />
          Trending
        </div>
      )}
      
      {/* Post Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <UserAvatar user={post.user} size="sm" />
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                {post.user?.name || "Anonymous Farmer"}
              </h4>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                <span>{timeAgo(post.createdAt)}</span>
                {post.location && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <IconComponents.MapPin className="w-3 h-3" />
                      {post.location}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {currentUser?.id === post.userId && (
            <button
              onClick={handleDelete}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <IconComponents.Close className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      {/* Post Content */}
      {post.content && (
        <div className="px-5 pb-3">
          <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        </div>
      )}
      
      {/* Post Media */}
      {post.mediaUrl && (
        <div className="relative">
          {post.mediaType === "video" ? (
            <video
              src={post.mediaUrl}
              controls
              className="w-full max-h-96 bg-black"
              preload="metadata"
            />
          ) : (
            <img
              src={post.mediaUrl}
              alt="Post media"
              className="w-full max-h-96 object-cover"
              loading="lazy"
            />
          )}
        </div>
      )}
      
      {/* Engagement Stats */}
      <div className="px-5 py-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-4">
          <span>{likesCount} {likesCount === 1 ? 'like' : 'likes'}</span>
          <button
            onClick={() => setShowComments(!showComments)}
            className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
          </button>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="px-2 py-1 flex items-center">
        <button
          onClick={handleLike}
          className={`ripple-effect flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            isLiked
              ? "text-red-500 bg-red-50 dark:bg-red-900/20"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
          }`}
        >
          <motion.div
            animate={isLiked ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <IconComponents.Heart filled={isLiked} className="w-5 h-5" />
          </motion.div>
          Like
          {showRipple && (
            <span
              className="absolute w-2 h-2 bg-red-400 rounded-full animate-ripple"
              style={{ left: ripplePos.x, top: ripplePos.y }}
            />
          )}
        </button>
        
        <button
          onClick={() => {
            if (!currentUser && comments.length === 0) {
              onAuthRequired();
            } else {
              setShowComments(!showComments);
            }
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            showComments
              ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
          }`}
        >
          <IconComponents.Message className="w-5 h-5" />
          Comment
        </button>
        
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200"
        >
          <IconComponents.Share className="w-5 h-5" />
          Share
        </button>
      </div>
      
      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 border-t border-gray-100 dark:border-gray-800">
              {/* Comment Form */}
              {currentUser && (
                <form onSubmit={handleComment} className="flex items-center gap-2 mt-4">
                  <UserAvatar user={currentUser} size="xs" />
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment..."
                      className="w-full bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!commentText.trim() || isSubmitting}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-emerald-500 disabled:text-gray-400 transition-colors"
                    >
                      <IconComponents.Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}
              
              {/* Comments List */}
              <div className="mt-4 space-y-3 max-h-64 overflow-y-auto custom-scroll">
                {comments.map((comment, idx) => (
                  <div key={idx} className="flex gap-2">
                    <UserAvatar user={comment.user} size="xs" />
                    <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 rounded-xl px-3 py-2">
                      <h5 className="text-xs font-semibold text-gray-900 dark:text-white">
                        {comment.user?.name || "User"}
                      </h5>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">
                        {comment.text}
                      </p>
                      <span className="text-xs text-gray-400 mt-1 block">
                        {timeAgo(comment.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
                {comments.length === 0 && (
                  <p className="text-center text-xs text-gray-400 py-4">
                    No comments yet. Be the first to comment!
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ============================================================================
// MAIN SOCIAL PAGE COMPONENT
// ============================================================================

export default function SocialPage() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaUrl, setMediaUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("latest");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalUsers: 0,
    totalLikes: 0,
    activeToday: 0,
  });
  
  const fileInputRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  
  // Initialize theme and auth
  useEffect(() => {
    setMounted(true);
    
   
    
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    
    if (savedToken && savedUser) {
      try {
        const payload = JSON.parse(atob(savedToken.split(".")[1]));
        if (payload.exp * 1000 > Date.now()) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    
    fetchPosts();
    
    const handleScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll);
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_URL}/posts`);
      const data = await res.json();
      
      if (data.success) {
        setPosts(data.posts);
        
        // Calculate stats
        const uniqueUsers = new Set(data.posts.map(p => p.userId).filter(Boolean));
        const totalLikes = data.posts.reduce((sum, p) => sum + (p.likes?.length || 0), 0);
        
        setStats({
          totalPosts: data.posts.length,
          totalUsers: uniqueUsers.size,
          totalLikes,
          activeToday: Math.min(uniqueUsers.size, Math.floor(Math.random() * 20) + 5),
        });
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAuthSuccess = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem("token", userToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setShowAuthModal(false);
  };
  
  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };
  
  const handleCreatePost = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    if (!postContent.trim() && !mediaFile && !mediaUrl) return;
    
    setUploading(true);
    
    try {
      let finalUrl = mediaUrl;
      let mediaType = null;
      
      if (mediaFile) {
        const result = await uploadToCloudinary(mediaFile);
        finalUrl = result.url;
        mediaType = result.type;
      } else if (mediaUrl) {
        const isVideo = mediaUrl.match(/\.(mp4|webm|ogg|mov)$/i);
        mediaType = isVideo ? "video" : "image";
      }
      
      const res = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: postContent,
          mediaUrl: finalUrl,
          mediaType,
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setPosts(prev => [data.post, ...prev]);
        setPostContent("");
        setMediaFile(null);
        setMediaPreview(null);
        setMediaUrl("");
        
        // Update stats
        setStats(prev => ({
          ...prev,
          totalPosts: prev.totalPosts + 1,
        }));
      }
    } catch (error) {
      console.error("Failed to create post:", error);
    } finally {
      setUploading(false);
    }
  };
  
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };
  
  const clearMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };
  
  const filteredPosts = useMemo(() => {
    let filtered = [...posts];
    
    if (activeFilter === "trending") {
      filtered.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
    } else if (activeFilter === "latest") {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (activeFilter === "media") {
      filtered = filtered.filter(p => p.mediaUrl);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.content?.toLowerCase().includes(query) ||
        p.user?.name?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [posts, activeFilter, searchQuery]);
  
  if (!mounted) return null;
  
  return (
    <>
      <style>{styles}</style>
      
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-400 z-50 origin-left"
        style={{ scaleX }}
      />
      
      {/* Main Container */}
      <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-white transition-colors duration-300 pt-24 md:pt-28">
        {/* Animated Background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation Bar */}
       
          
          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Sidebar - Stats */}
            <div className="lg:col-span-1 space-y-6">
              {/* Community Stats */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-bold gradient-text mb-4">Community Stats</h3>
                <div className="space-y-4">
                  {[
                    { label: "Total Posts", value: stats.totalPosts, icon: IconComponents.Leaf, color: "text-emerald-500" },
                    { label: "Farmers", value: stats.totalUsers, icon: IconComponents.Users, color: "text-blue-500" },
                    { label: "Total Likes", value: stats.totalLikes, icon: IconComponents.Heart, color: "text-red-500" },
                    { label: "Active Today", value: stats.activeToday, icon: IconComponents.Check, color: "text-green-500" },
                  ].map((stat, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</span>
                      </div>
                      <span className="font-bold text-gray-900 dark:text-white">
                        <AnimatedCounter value={stat.value} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-bold gradient-text mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  {[
                    { label: "My Posts", icon: IconComponents.Leaf },
                    { label: "Saved", icon: IconComponents.Check },
                    { label: "Events", icon: IconComponents.Calendar },
                  ].map((action, idx) => (
                    <button
                      key={idx}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-sm"
                    >
                      <action.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Center - Main Feed */}
            <div className="lg:col-span-2 space-y-6">
              {/* Create Post Card */}
              {user && (
                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-start gap-3">
                    <UserAvatar user={user} size="sm" />
                    <div className="flex-1">
                      <textarea
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        placeholder="Share your farming experience... 🌾"
                        rows={3}
                        className="w-full bg-transparent resize-none text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 outline-none"
                      />
                      
                      {mediaPreview && (
                        <div className="relative mt-3 rounded-xl overflow-hidden">
                          {mediaFile?.type.startsWith("video/") ? (
                            <video src={mediaPreview} controls className="w-full max-h-64 bg-black" />
                          ) : (
                            <img src={mediaPreview} alt="Preview" className="w-full max-h-64 object-cover" />
                          )}
                          <button
                            onClick={clearMedia}
                            className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors"
                          >
                            <IconComponents.Close className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      
                      <div
                        className="mt-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 text-center cursor-pointer hover:border-emerald-500/50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                      >
                        <IconComponents.Image className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Drag & drop media or click to browse
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,video/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm"
                          >
                            <IconComponents.Image className="w-4 h-4 text-emerald-500" />
                            Photo
                          </button>
                          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm">
                            <IconComponents.Video className="w-4 h-4 text-blue-500" />
                            Video
                          </button>
                        </div>
                        
                        <button
                          onClick={handleCreatePost}
                          disabled={uploading || (!postContent.trim() && !mediaFile && !mediaUrl)}
                          className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                        >
                          {uploading ? "Posting..." : "Post"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Filters */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {["latest", "trending", "media"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                      activeFilter === filter
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
                        : "glass-card text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    {filter === "latest" && " 📍"}
                    {filter === "trending" && " 🔥"}
                    {filter === "media" && " 📸"}
                  </button>
                ))}
              </div>
              
              {/* Posts Feed */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-12 h-12 border-4 border-emerald-200 dark:border-emerald-900/30 border-t-emerald-500 rounded-full animate-spin" />
                  <p className="mt-4 text-sm text-gray-500">Loading posts...</p>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="glass-card rounded-2xl p-12 text-center">
                  <IconComponents.Leaf className="w-16 h-16 mx-auto text-emerald-400 mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {searchQuery ? "No posts found" : "No posts yet"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {searchQuery ? "Try a different search term" : "Be the first to share your farming journey!"}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredPosts.map((post, idx) => (
                    <PostCard
                      key={post.id || idx}
                      post={post}
                      currentUser={user}
                      token={token}
                      onUpdate={setPosts}
                      onAuthRequired={() => setShowAuthModal(true)}
                      isTrending={activeFilter === "trending" && idx < 3}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Floating Action Buttons */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
          <AnimatePresence>
            {showScrollTop && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="p-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:shadow-xl transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18"/>
                </svg>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
        
        {/* Auth Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      </div>
    </>
  );
}