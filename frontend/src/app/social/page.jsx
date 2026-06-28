/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Heart,
  Image as ImageIcon,
  LoaderCircle,
  LogIn,
  MessageSquare,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import AuthModal from "@/components/AuthModal";
import { useToast } from "@/components/system/AppProviders";
import { uploadToCloudinary } from "@/utils/cloudinary";

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL || "https://agrisence-backend.onrender.com/api";

function getStoredAuth() {
  if (typeof window === "undefined") {
    return { token: null, user: null };
  }
  const token = window.localStorage.getItem("token") || window.sessionStorage.getItem("token");
  const user = window.localStorage.getItem("user") || window.sessionStorage.getItem("user");
  if (!token || !user) {
    return { token: null, user: null };
  }
  try {
    return { token, user: JSON.parse(user) };
  } catch {
    return { token: null, user: null };
  }
}

function getUserId(user) {
  return user?.id || user?._id || null;
}

function timeAgo(value) {
  if (!value) {
    return "now";
  }
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) {
    return "just now";
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  return `${Math.floor(hours / 24)}d ago`;
}

function PostCard({ post, currentUser, onAuthRequired, onToggleLike, onDelete, onComment }) {
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isLiked = post.likes?.some((item) => item.userId === getUserId(currentUser));
  const isOwner = post.userId === getUserId(currentUser);

  const submitComment = async (event) => {
    event.preventDefault();
    if (!comment.trim()) {
      return;
    }
    if (!currentUser) {
      onAuthRequired();
      return;
    }
    setSubmitting(true);
    try {
      await onComment(post.id, comment.trim());
      setComment("");
    } finally {
      setSubmitting(false);
    }
  };

  const initials =
    post.user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "FR";

  return (
    <article className="panel rounded-[2rem] p-5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] border border-emerald-100 bg-[linear-gradient(135deg,rgba(228,236,220,0.94),rgba(239,244,234,0.94))] font-display text-sm font-semibold text-slate-950">
            {initials}
          </div>
          <div>
          <div className="text-sm uppercase tracking-[0.18em] text-slate-400">field report</div>
          <div className="mt-2 font-display text-2xl text-slate-950">{post.user?.name || "Farmer"}</div>
          <div className="mt-1 text-sm text-slate-500">{timeAgo(post.createdAt)}</div>
          </div>
        </div>
        {isOwner && (
          <button type="button" onClick={() => onDelete(post.id)} className="button-secondary px-3 py-2 text-xs text-slate-700">
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        )}
      </div>

      {post.content && <p className="mt-5 whitespace-pre-wrap text-[15px] leading-8 text-slate-600">{post.content}</p>}

      {post.mediaUrl && (
        <div className="mt-5 overflow-hidden rounded-[1.6rem] border border-emerald-100">
          {post.mediaType === "video" ? (
            <video src={post.mediaUrl} controls className="max-h-[460px] w-full bg-slate-200 object-cover" />
          ) : (
            <img src={post.mediaUrl} alt="Post media" className="max-h-[460px] w-full object-cover" />
          )}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => (currentUser ? onToggleLike(post.id) : onAuthRequired())}
          className={`button-secondary px-3 py-2 text-xs ${
            isLiked
              ? "border-emerald-200 bg-[linear-gradient(90deg,rgba(228,236,220,0.94),rgba(239,244,234,0.94))] text-slate-950"
              : "text-slate-700"
          }`}
        >
          <Heart className={`h-3.5 w-3.5 ${isLiked ? "fill-current" : ""}`} />
          {post.likes?.length || 0} likes
        </button>
        <div className="data-chip">
          <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
          {post.comments?.length || 0} comments
        </div>
      </div>

      <form onSubmit={submitComment} className="mt-5 rounded-[1.5rem] border border-emerald-100 bg-slate-100/76 p-3">
        <textarea
          rows={2}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          className="field-input min-h-[96px] resize-none border-0 bg-transparent px-1 py-1 shadow-none"
          placeholder="Add a practical observation or follow-up..."
        />
        <div className="mt-3 flex justify-end">
          <button type="submit" disabled={submitting || !comment.trim()} className="button-primary text-sm disabled:opacity-60">
            {submitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Post comment"}
          </button>
        </div>
      </form>

      {(post.comments || []).length > 0 && (
        <div className="mt-5 space-y-3">
          {post.comments.map((item) => (
            <div key={item.id || `${item.userId}-${item.createdAt}`} className="rounded-[1.3rem] border border-emerald-100 bg-slate-100/76 px-4 py-3">
              <div className="text-sm font-medium text-slate-950">{item.user?.name || "Farmer"}</div>
              <div className="mt-2 text-sm leading-7 text-slate-600">{item.text}</div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1].map((item) => (
        <div key={item} className="panel rounded-[2rem] p-6">
          <div className="flex items-start gap-4">
            <div className="skeleton-line h-12 w-12 rounded-[1rem]" />
            <div className="min-w-0 flex-1">
              <div className="skeleton-line h-3 w-24" />
              <div className="skeleton-line mt-4 h-5 w-40 rounded-xl" />
              <div className="skeleton-line mt-3 h-3 w-24" />
            </div>
          </div>
          <div className="skeleton-line mt-6 h-3 w-[92%]" />
          <div className="skeleton-line mt-3 h-3 w-[84%]" />
          <div className="skeleton-line mt-3 h-3 w-[74%]" />
          <div className="mt-5 flex gap-2">
            <div className="skeleton-line h-9 w-24 rounded-full" />
            <div className="skeleton-line h-9 w-24 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SocialPage() {
  const { pushToast } = useToast();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("latest");

  useEffect(() => {
    const auth = getStoredAuth();
    setUser(auth.user);
    setToken(auth.token);
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_URL}/posts?limit=30`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not load community posts.");
      }
      setPosts(data.posts || []);
    } catch (postError) {
      setError(postError.message || "Community backend is unavailable right now.");
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase();
    let nextPosts = [...posts];

    if (filter === "popular") {
      nextPosts.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
    } else if (filter === "media") {
      nextPosts = nextPosts.filter((post) => post.mediaUrl);
    } else {
      nextPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    if (!query) {
      return nextPosts;
    }

    return nextPosts.filter(
      (post) => post.content?.toLowerCase().includes(query) || post.user?.name?.toLowerCase().includes(query)
    );
  }, [filter, posts, search]);

  const stats = useMemo(() => {
    const growers = new Set(posts.map((post) => post.userId).filter(Boolean));
    return {
      posts: posts.length,
      growers: growers.size,
      comments: posts.reduce((total, post) => total + (post.comments?.length || 0), 0),
    };
  }, [posts]);

  const trendRows = useMemo(
    () => [
      ["Pest reports", Math.max(18, stats.posts * 7)],
      ["Water concerns", Math.max(14, stats.comments * 5)],
      ["Market talk", Math.max(22, stats.growers * 9)],
    ],
    [stats.comments, stats.growers, stats.posts]
  );

  const handleAuthSuccess = (nextUser, nextToken) => {
    setUser(nextUser);
    setToken(nextToken);
    setShowAuthModal(false);
    pushToast({
      title: "Welcome back",
      message: "You can now publish posts and join the discussion feed.",
      type: "success",
    });
  };

  const handleCreatePost = async () => {
    if (!user || !token) {
      setShowAuthModal(true);
      return;
    }
    if (!postContent.trim() && !mediaFile) {
      setError("Write something or attach an image before posting.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      let mediaUrl = null;
      let mediaType = null;
      if (mediaFile) {
        const uploaded = await uploadToCloudinary(mediaFile);
        mediaUrl = uploaded.url;
        mediaType = uploaded.type;
      }

      const response = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: postContent.trim(),
          mediaUrl,
          mediaType,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not create the post.");
      }

      setPosts((current) => [data.post, ...current]);
      setPostContent("");
      setMediaFile(null);
      setPreviewUrl("");
      pushToast({
        title: "Report published",
        message: "Your field update is now live in the community feed.",
        type: "success",
      });
    } catch (submitError) {
      setError(submitError.message || "Could not create the post.");
      pushToast({
        title: "Publish failed",
        message: submitError.message || "The field report could not be created.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleLike = async (postId) => {
    if (!token) {
      setShowAuthModal(true);
      return;
    }

    const previous = posts;
    setPosts((current) =>
      current.map((post) => {
        if (post.id !== postId) {
          return post;
        }
        const currentLikes = post.likes || [];
        const liked = currentLikes.some((item) => item.userId === getUserId(user));
        return {
          ...post,
          likes: liked
            ? currentLikes.filter((item) => item.userId !== getUserId(user))
            : [...currentLikes, { userId: getUserId(user), createdAt: new Date().toISOString() }],
        };
      })
    );

    try {
      await fetch(`${API_URL}/posts/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId }),
      });
      pushToast({
        title: "Reaction saved",
        message: "Your feedback has been added to the post.",
        type: "success",
        duration: 1800,
      });
    } catch {
      setPosts(previous);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!token) {
      return;
    }
    try {
      const response = await fetch(`${API_URL}/posts/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not delete the post.");
      }
      setPosts((current) => current.filter((post) => post.id !== postId));
      pushToast({
        title: "Report deleted",
        message: "The selected community post has been removed.",
        type: "success",
      });
    } catch (deleteError) {
      setError(deleteError.message || "Could not delete the post.");
      pushToast({
        title: "Delete failed",
        message: deleteError.message || "The post could not be deleted.",
        type: "error",
      });
    }
  };

  const handleAddComment = async (postId, text) => {
    if (!token) {
      setShowAuthModal(true);
      return;
    }
    const response = await fetch(`${API_URL}/posts/comment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ postId, text }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) {
      throw new Error(data.message || "Could not add the comment.");
    }
    setPosts((current) =>
      current.map((post) =>
        post.id === postId ? { ...post, comments: [...(post.comments || []), data.comment] } : post
      )
    );
    pushToast({
      title: "Comment added",
      message: "Your follow-up is now attached to the field report.",
      type: "success",
    });
  };

  return (
    <>
      <section className="section-dark pt-6">
        <div className="page-wrap pb-16">
          <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
            <aside className="space-y-4">
              <div className="panel rounded-[2rem] p-5">
                <div className="eyebrow">
                  <Users className="h-3.5 w-3.5 text-emerald-500" />
                  grower network
                </div>
                <h1 className="section-title mt-5 text-[2.2rem]">A field board for useful updates, not noisy posting.</h1>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  The visual language is calmer and more product-like, while the backend wiring still supports posts,
                  likes, comments, and media uploads.
                </p>

                <div className="mt-6 grid gap-3">
                  <div className="metric-tile rounded-[1.45rem] bg-slate-100/78">
                    <div className="text-sm text-slate-500">Reports</div>
                    <div className="metric-value mt-3">{stats.posts}</div>
                  </div>
                  <div className="metric-tile rounded-[1.45rem] bg-slate-100/78">
                    <div className="text-sm text-slate-500">Active growers</div>
                    <div className="metric-value mt-3">{stats.growers}</div>
                  </div>
                  <div className="metric-tile rounded-[1.45rem] bg-slate-100/78">
                    <div className="text-sm text-slate-500">Comments</div>
                    <div className="metric-value mt-3">{stats.comments}</div>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.8rem] border border-emerald-100 bg-[rgba(244,247,240,0.76)] p-5 shadow-[0_18px_40px_rgba(95,141,88,0.08)]">
                <div className="text-sm font-medium text-slate-950">Feed controls</div>
                <div className="mt-4 rounded-[1.2rem] border border-emerald-100 bg-slate-100/80 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Search className="h-4 w-4 text-slate-400" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search posts or farmers"
                      className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {[
                    ["latest", "Latest reports"],
                    ["popular", "Most liked"],
                    ["media", "With media"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFilter(value)}
                      className={`w-full rounded-[1.2rem] px-4 py-3 text-left text-sm font-medium ${
                        filter === value
                          ? "bg-[linear-gradient(90deg,rgba(228,236,220,0.94),rgba(239,244,234,0.94))] text-slate-950"
                          : "border border-emerald-100 bg-slate-100/78 text-slate-600"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="panel rounded-[1.8rem] p-5">
                <div className="text-sm font-medium text-slate-950">Conversation trends</div>
                <div className="mt-4 space-y-4">
                  {trendRows.map(([label, value]) => (
                    <div key={label}>
                      <div className="flex items-center justify-between text-sm text-slate-600">
                        <span>{label}</span>
                        <span>{value}</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-slate-200">
                        <div className="h-2 rounded-full bg-[linear-gradient(90deg,#2563eb,#06b6d4,#84cc16)]" style={{ width: `${Math.min(value, 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            <div className="space-y-5">
              <div className="panel rounded-[2rem] p-5 md:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">create field report</div>
                    <div className="mt-2 font-display text-[2rem] text-slate-950">
                      Share what you&apos;re seeing, what worked, or what needs a second opinion.
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!user && (
                      <button type="button" onClick={() => setShowAuthModal(true)} className="button-secondary">
                        <LogIn className="h-4 w-4" />
                        Login first
                      </button>
                    )}
                    <button type="button" onClick={handleCreatePost} disabled={submitting} className="button-primary disabled:opacity-60">
                      {submitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      Publish report
                    </button>
                  </div>
                </div>

                <div className="mt-5 rounded-[1.6rem] border border-emerald-100 bg-slate-100/76 p-4">
                  <textarea
                    rows={5}
                    value={postContent}
                    onChange={(event) => setPostContent(event.target.value)}
                    className="field-input min-h-[160px] resize-none border-0 bg-transparent px-1 py-1 shadow-none"
                    placeholder="Describe the field condition, pest pressure, irrigation issue, or lesson learned..."
                  />

                  {previewUrl && (
                    <div className="mt-4 overflow-hidden rounded-[1.4rem] border border-emerald-100">
                      <img src={previewUrl} alt="Preview" className="max-h-[340px] w-full object-cover" />
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <label className="button-secondary cursor-pointer">
                      <ImageIcon className="h-4 w-4" />
                      Attach image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) {
                            setMediaFile(file);
                            setPreviewUrl(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </label>
                    {mediaFile && (
                      <button
                        type="button"
                        onClick={() => {
                          setMediaFile(null);
                          setPreviewUrl("");
                        }}
                        className="button-secondary"
                      >
                        Remove media
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {error && <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

              {loading ? (
                <FeedSkeleton />
              ) : filteredPosts.length === 0 ? (
                <div className="empty-state rounded-[2rem] px-6 py-7 text-sm leading-7 text-slate-600">
                  No reports match the current filter yet. Try switching from media to latest, or publish the first local field signal.
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUser={user}
                    onAuthRequired={() => setShowAuthModal(true)}
                    onToggleLike={handleToggleLike}
                    onDelete={handleDeletePost}
                    onComment={handleAddComment}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onSuccess={handleAuthSuccess} />
    </>
  );
}
