import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Heart, MessageSquare, Plus, Send, X, Trash2, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const MAX_POST_LENGTH = 2000;
const MAX_COMMENT_LENGTH = 500;

interface Post {
  id: string;
  type: string;
  badge: string;
  content: string;
  created_at: string;
  reactions: { meToo: number; helped: number };
  comments: number;
  userReactions: string[];
  isOwn: boolean;
}

// Deterministic mini avatar colors from user_id hash
const avatarColors = [
  "bg-primary/30",
  "bg-lavender/30",
  "bg-periwinkle/30",
  "bg-indigo-soft/30",
  "bg-accent",
  "bg-muted-foreground/20",
  "bg-primary/20",
  "bg-lavender/20",
];

const getAvatarColor = (userId: string) => {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
};

const flairConfig: Record<string, { label: string; class: string }> = {
  vent: { label: "Vent", class: "bg-destructive/15 text-destructive" },
  reflection: { label: "Reflection", class: "bg-lavender/20 text-lavender" },
  support: { label: "Support", class: "bg-periwinkle/20 text-periwinkle" },
  question: { label: "Question", class: "bg-primary/15 text-primary" },
  gratitude: { label: "Gratitude", class: "bg-accent text-accent-foreground" },
  struggle: { label: "Struggle", class: "bg-muted text-muted-foreground" },
  hope: { label: "Hope", class: "bg-periwinkle/15 text-periwinkle" },
  fear: { label: "Fear", class: "bg-indigo-soft/20 text-indigo-soft" },
  victory: { label: "Victory", class: "bg-primary/15 text-primary" },
  barely_holding_on: { label: "Barely Holding On", class: "bg-destructive/10 text-destructive" },
};

const topFlairs = ["vent", "reflection", "support"];
const otherFlairs = ["question", "gratitude", "struggle", "hope", "fear", "victory", "barely_holding_on"];

const CommunityPage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newType, setNewType] = useState("vent");
  const [newContent, setNewContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [commentingOn, setCommentingOn] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [commentsMap, setCommentsMap] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [showMyPosts, setShowMyPosts] = useState(false);
  const fetchPosts = async () => {
    setLoading(true);
    const { data: postsData } = await supabase
      .from("community_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (!postsData) { setLoading(false); return; }

    const postIds = postsData.map((p) => p.id);
    const { data: reactions } = await supabase
      .from("post_reactions")
      .select("*")
      .in("post_id", postIds);

    const { data: comments } = await supabase
      .from("post_comments")
      .select("id, post_id")
      .in("post_id", postIds);

    const mapped: Post[] = postsData.map((p) => {
      const postReactions = reactions?.filter((r) => r.post_id === p.id) || [];
      return {
        id: p.id,
        type: p.type,
        badge: p.badge || "",
        content: p.content,
        created_at: p.created_at,
        reactions: {
          meToo: postReactions.filter((r) => r.reaction_type === "me_too").length,
          helped: postReactions.filter((r) => r.reaction_type === "helped").length,
        },
        comments: comments?.filter((c) => c.post_id === p.id).length || 0,
        userReactions: postReactions
          .filter((r) => r.user_id === user?.id)
          .map((r) => r.reaction_type),
        isOwn: p.user_id === user?.id,
      };
    });
    setPosts(mapped);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, [user]);

  const handleCreatePost = async () => {
    const trimmed = newContent.trim();
    if (!trimmed || !user) return;
    if (trimmed.length > MAX_POST_LENGTH) {
      toast({ title: `Post must be under ${MAX_POST_LENGTH} characters`, variant: "destructive" });
      return;
    }
    setPosting(true);
    const { error } = await supabase.from("community_posts").insert({
      user_id: user.id,
      type: newType,
      content: trimmed,
    });
    if (error) {
      toast({ title: "Could not create post", variant: "destructive" });
      setPosting(false);
      return;
    }
    setNewContent("");
    setShowCreate(false);
    setPosting(false);
    fetchPosts();
  };

  const toggleReaction = async (postId: string, type: string) => {
    if (!user) return;
    const post = posts.find((p) => p.id === postId);
    let error;
    if (post?.userReactions.includes(type)) {
      ({ error } = await supabase
        .from("post_reactions")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .eq("reaction_type", type));
    } else {
      ({ error } = await supabase.from("post_reactions").insert({
        post_id: postId,
        user_id: user.id,
        reaction_type: type,
      }));
    }
    if (error) {
      toast({ title: "Reaction failed", variant: "destructive" });
      return;
    }
    fetchPosts();
  };

  const deletePost = async (postId: string) => {
    if (!user) return;
    await supabase.from("post_reactions").delete().eq("post_id", postId);
    await supabase.from("post_comments").delete().eq("post_id", postId);
    const { error } = await supabase.from("community_posts").delete().eq("id", postId).eq("user_id", user.id);
    if (error) {
      toast({ title: "Could not delete post", variant: "destructive" });
      return;
    }
    fetchPosts();
  };

  const deleteComment = async (commentId: string, postId: string) => {
    if (!user) return;
    await supabase.from("post_comments").delete().eq("id", commentId).eq("user_id", user.id);
    loadComments(postId);
    fetchPosts();
  };

  const loadComments = async (postId: string) => {
    const { data } = await supabase
      .from("post_comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    setCommentsMap((prev) => ({ ...prev, [postId]: data || [] }));
  };

  const handleComment = async (postId: string) => {
    const trimmed = commentText.trim();
    if (!trimmed || !user) return;
    if (trimmed.length > MAX_COMMENT_LENGTH) {
      toast({ title: `Comment must be under ${MAX_COMMENT_LENGTH} characters`, variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("post_comments").insert({
      post_id: postId,
      user_id: user.id,
      content: trimmed,
    });
    if (error) {
      toast({ title: "Could not post comment", variant: "destructive" });
      return;
    }
    setCommentText("");
    loadComments(postId);
    fetchPosts();
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 md:py-16">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex-1">

            <h2 className="mb-1 font-display text-2xl font-bold text-foreground md:text-3xl">Community</h2>
            <p className="text-sm text-muted-foreground">Shared experiences, held gently.</p>
          </div>
          <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs text-primary transition-calm hover:bg-primary/20"
          >
            <Plus size={14} />
            Post
          </button>
          <button
            onClick={() => setShowMyPosts((p) => !p)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-calm ${
              showMyPosts
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
            }`}
          >
            <User size={14} />
            Your Posts
          </button>
          </div>
        </div>

        {/* Create post form */}
        <AnimatePresence>
          {showCreate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden rounded-lg border border-border bg-card p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">New post</span>
                <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={16} />
                </button>
              </div>

              {/* Flair selection */}
              <div className="mb-3 space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {topFlairs.map((f) => (
                    <button
                      key={f}
                      onClick={() => setNewType(f)}
                      className={`rounded-full px-2.5 py-1 text-[11px] transition-calm ${
                        newType === f ? flairConfig[f].class : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {flairConfig[f].label}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {otherFlairs.map((f) => (
                    <button
                      key={f}
                      onClick={() => setNewType(f)}
                      className={`rounded-full px-2.5 py-1 text-[11px] transition-calm ${
                        newType === f ? flairConfig[f].class : "bg-secondary/50 text-muted-foreground"
                      }`}
                    >
                      {flairConfig[f].label}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value.slice(0, MAX_POST_LENGTH))}
                rows={3}
                placeholder="Share anonymously. No one will know it's you."
                maxLength={MAX_POST_LENGTH}
                className="mb-1 w-full resize-none rounded-lg border-0 bg-transparent text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
              />
              <p className="mb-3 text-right text-[10px] text-muted-foreground/50">{newContent.length}/{MAX_POST_LENGTH}</p>
              <button
                onClick={handleCreatePost}
                disabled={!newContent.trim() || posting}
                className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-calm hover:bg-primary/90 disabled:opacity-40"
              >
                {posting ? "Posting..." : "Post anonymously"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Posts */}
        <div className="space-y-4">
          {(showMyPosts ? posts.filter((p) => p.isOwn) : posts).map((post) => (
            <div key={post.id} className="rounded-lg border border-border bg-card p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[10px] ${flairConfig[post.type]?.class || "bg-secondary text-muted-foreground"}`}>
                  {flairConfig[post.type]?.label || post.type}
                </span>
              </div>
              <div className="mb-4 flex items-start justify-between gap-2">
                <p className="text-sm leading-relaxed text-foreground/80">{post.content}</p>
                {post.isOwn && (
                  <button
                    onClick={() => deletePost(post.id)}
                    className="shrink-0 rounded-md p-1 text-muted-foreground/40 transition-calm hover:text-destructive hover:bg-destructive/10"
                    title="Delete your post"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <button
                  onClick={() => toggleReaction(post.id, "me_too")}
                  className={`flex items-center gap-1 transition-calm hover:text-foreground ${
                    post.userReactions.includes("me_too") ? "text-primary" : ""
                  }`}
                >
                  <Heart
                    size={13}
                    fill={post.userReactions.includes("me_too") ? "currentColor" : "none"}
                  />
                  Me too · {post.reactions.meToo}
                </button>
                <button
                  onClick={() => toggleReaction(post.id, "helped")}
                  className={`flex items-center gap-1 transition-calm hover:text-foreground ${
                    post.userReactions.includes("helped") ? "text-primary" : ""
                  }`}
                >
                  <BookOpen size={13} />
                  Helped · {post.reactions.helped}
                </button>
                <button
                  onClick={() => {
                    if (commentingOn === post.id) {
                      setCommentingOn(null);
                    } else {
                      setCommentingOn(post.id);
                      loadComments(post.id);
                    }
                  }}
                  className="flex items-center gap-1 transition-calm hover:text-foreground"
                >
                  <MessageSquare size={13} />
                  {post.comments}
                </button>
              </div>

              {/* Comments section */}
              {commentingOn === post.id && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 border-t border-border pt-3"
                >
                  <div className="space-y-2 mb-3">
                    {(commentsMap[post.id] || []).map((c: any) => {
                      return (
                        <div key={c.id} className="flex items-start gap-2 group">
                          <div className={`mt-0.5 h-4 w-4 shrink-0 rounded-full ${getAvatarColor(c.user_id)}`} />
                          <p className="flex-1 text-xs text-foreground/70">{c.content}</p>
                          {c.user_id === user?.id && (
                            <button
                              onClick={() => deleteComment(c.id, post.id)}
                              className="shrink-0 rounded p-0.5 text-muted-foreground/0 transition-calm group-hover:text-muted-foreground/40 hover:!text-destructive"
                              title="Delete your comment"
                            >
                              <Trash2 size={11} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50"
                      onKeyDown={(e) => e.key === "Enter" && handleComment(post.id)}
                    />
                    <button
                      onClick={() => handleComment(post.id)}
                      className="text-primary transition-calm hover:text-primary/80"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          ))}

          {loading && posts.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground/60">
              Take a breath while posts load...
            </p>
          )}

          {!loading && posts.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground/60">
              Be the first one to post on community.
            </p>
          )}

          {!loading && showMyPosts && posts.length > 0 && posts.filter((p) => p.isOwn).length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground/60">
              You haven't posted anything yet.
            </p>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground/50">
          All posts are anonymous. Liminal can help soften tone before posting.
        </p>
      </motion.div>
    </div>
  );
};

export default CommunityPage;
