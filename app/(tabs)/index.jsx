import { AntDesign, Feather, Ionicons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Stack, usePathname, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useBookmarks } from "../../components/BookmarkContext";
import CollectionModal from "../../components/CollectionModal";
import ImageModal from "../../components/ImageModal";
import MoreMenu from "../../components/MoreMenu";
import PopupMenu from "../../components/PopupMenu";
import { usePosts } from "../../components/PostContext";
import ProfileModal from "../../components/ProfileModal";
import { useTheme } from "../../components/ThemeContext";
import { postsAPI, testConnection } from "../utils/api";
// Update your import (around line 4)
import { createPost, getUserPosts } from "../utils/api";
import { getRelativeTime } from "../utils/timeUtils";
// Replace line 25 with this complete import:
import { addPostComment, getPostComments, togglePostLike } from "../utils/api";

// Image mapping for profile pictures and post images
const imageMap = {
  "Tech.png": require("../../assets/images/Tech.png"),
  "Science1.png": require("../../assets/images/Science1.png"),
  "AnimalA.png": require("../../assets/images/AnimalA.png"),
  "TravelA.png": require("../../assets/images/TravelA.png"),
  "Ai.png": require("../../assets/images/Ai.png"),
  "Travel.png": require("../../assets/images/Travel.png"),
  "Monkey.png": require("../../assets/images/Monkey.png"),
  "BM.png": require("../../assets/images/BM.png"),
  "p.png": require("../../assets/images/p.png"),
  "Dis.png": require("../../assets/images/Dis.png"),
  "curry.jpg": require("../../assets/images/curry.jpg"),
  "Messi.jpg": require("../../assets/images/Messi.jpg"),
  "harry logo.webp": require("../../assets/images/harry logo.webp"),
  "Penguin.jpg": require("../../assets/images/Penguin.jpg"),
  "D.jpg": require("../../assets/images/D.jpg"),
  "K.jpg": require("../../assets/images/K.jpg"),
  "MB.jpg": require("../../assets/images/MB.jpg"),
  "N.webp": require("../../assets/images/N.webp"),
  "Ronaldo.jpg": require("../../assets/images/Ronaldo.jpg"),
  "SGA.jpg": require("../../assets/images/SGA.jpg"),
  "T1.jpg": require("../../assets/images/T1.jpg"),
  "w1.jpg": require("../../assets/images/w1.jpg"),
  "yu.jpg": require("../../assets/images/yu.jpg"),
  "Random.jpg": require("../../assets/images/Random.jpg"),
  "Cole Palmer.jpg": require("../../assets/images/Cole Palmer.jpg"),
  "CWC.jpg": require("../../assets/images/CWC.jpg"),
  "Ramen.jpeg": require("../../assets/images/Ramen.jpeg"),
  "M8 bmw.jpg": require("../../assets/images/M8 bmw.jpg"),
  "euro's league logo.jpg": require("../../assets/images/euro's league logo.jpg"),
  "fifa logo.jpg": require("../../assets/images/fifa logo.jpg"),
  "Logo-NBA.png": require("../../assets/images/Logo-NBA.png"),
  "daniel-radcliffes-acting-v0-zhahfgw6fj5f1.webp": require("../../assets/images/daniel-radcliffes-acting-v0-zhahfgw6fj5f1.webp"),
  "danny-1.webp": require("../../assets/images/danny-1.webp"),
  // Commenter profile images
  "commenter1.jpg": require("../../assets/images/Commenter1.jpg"),
  "commenter2.jpg": require("../../assets/images/Commenter2.jpg"),
  "commenter3.jpg": require("../../assets/images/Commenter3.jpg"),
  "commenter4.jpg": require("../../assets/images/Commenter4.jpg"),
  "commenter5.jpg": require("../../assets/images/Commenter5.jpg"),
  "commenter6.jpg": require("../../assets/images/Commenter6.jpg"),
  "commenter7.jpg": require("../../assets/images/Commenter7.jpg"),
  "commenter8.jpg": require("../../assets/images/Commenter8.jpg"),
  "commenter9.jpg": require("../../assets/images/Commenter9.jpg"),
  "commenter10.jpg": require("../../assets/images/Commenter10.jpg"),
};

// Comment Component
const Comment = ({ comment, onLike, onReply, themeColors }) => (
  <View
    style={[styles.commentContainer, { borderBottomColor: themeColors.border }]}
  >
    <View style={styles.commentHeader}>
      <Image
        source={
          imageMap[comment.avatar]
            ? imageMap[comment.avatar]
            : require("../../assets/images/Commenter1.jpg")
        }
        style={styles.commentAvatar}
      />
      <View style={styles.commentInfo}>
        <Text style={[styles.commentUsername, { color: themeColors.text }]}>
          {comment.username}
        </Text>
        <Text
          style={[styles.commentTime, { color: themeColors.textSecondary }]}
        >
          {getRelativeTime(comment.timestamp)}
        </Text>
      </View>
    </View>
    <Text style={[styles.commentText, { color: themeColors.text }]}>
      {comment.text}
    </Text>
    <View style={styles.commentActions}>
      <TouchableOpacity
        style={styles.commentAction}
        onPress={() => onLike(comment.id)}
      >
        <AntDesign
          name={comment.liked ? "heart" : "hearto"}
          size={16}
          color={comment.liked ? "#e74c3c" : themeColors.icon}
        />
        <Text
          style={[
            styles.commentActionText,
            { color: comment.liked ? "#e74c3c" : themeColors.textSecondary },
          ]}
        >
          {comment.likes}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.commentAction}
        onPress={() => onReply(comment.id)}
      >
        <Feather name="message-circle" size={16} color={themeColors.icon} />
        <Text
          style={[
            styles.commentActionText,
            { color: themeColors.textSecondary },
          ]}
        >
          Reply
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

// Comment Modal Component
const CommentModal = ({
  visible,
  onClose,
  post,
  comments,
  onAddComment,
  onLikeComment,
  onReplyComment,
  themeColors,
}) => {
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);

  const handleSubmitComment = () => {
    if (commentText.trim()) {
      onAddComment(commentText, replyingTo);
      setCommentText("");
      setReplyingTo(null);
    }
  };

  const handleReply = (commentId) => {
    setReplyingTo(commentId);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View
          style={[
            styles.commentModalBackdrop,
            { backgroundColor: "rgba(0,0,0,0.5)" },
          ]}
        >
          <View
            style={[
              styles.commentModal,
              { backgroundColor: themeColors.background },
            ]}
          >
            {/* Header */}
            <View
              style={[
                styles.commentModalHeader,
                { borderBottomColor: themeColors.border },
              ]}
            >
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={themeColors.icon} />
              </TouchableOpacity>
              <Text
                style={[styles.commentModalTitle, { color: themeColors.text }]}
              >
                Comments
              </Text>
              <View style={{ width: 24 }} />
            </View>

            {/* Post Preview */}
            <View
              style={[
                styles.postPreview,
                { borderBottomColor: themeColors.border },
              ]}
            >
              <View style={styles.postPreviewHeader}>
                <Image
                  source={
                    imageMap[post.avatar]
                      ? imageMap[post.avatar]
                      : require("../../assets/images/Commenter1.jpg")
                  }
                  style={styles.postPreviewAvatar}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.postPreviewUser,
                      { color: themeColors.text },
                    ]}
                  >
                    {post.user}
                  </Text>
                  <Text
                    style={[
                      styles.postPreviewTitle,
                      { color: themeColors.text },
                    ]}
                  >
                    {post.title}
                  </Text>
                </View>
              </View>
            </View>

            {/* Comments List */}
            <ScrollView
              style={styles.commentsList}
              showsVerticalScrollIndicator={false}
            >
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <Comment
                    key={comment.id}
                    comment={comment}
                    onLike={onLikeComment}
                    onReply={handleReply}
                    themeColors={themeColors}
                  />
                ))
              ) : (
                <View style={styles.emptyComments}>
                  <Feather
                    name="message-circle"
                    size={48}
                    color={themeColors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.emptyCommentsText,
                      { color: themeColors.textSecondary },
                    ]}
                  >
                    No comments yet
                  </Text>
                  <Text
                    style={[
                      styles.emptyCommentsSubtext,
                      { color: themeColors.textSecondary },
                    ]}
                  >
                    Be the first to comment!
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Reply Indicator */}
            {replyingTo && (
              <View
                style={[
                  styles.replyIndicator,
                  { backgroundColor: themeColors.card },
                ]}
              >
                <Text
                  style={[
                    styles.replyText,
                    { color: themeColors.textSecondary },
                  ]}
                >
                  Replying to{" "}
                  {comments.find((c) => c.id === replyingTo)?.username}
                </Text>
                <TouchableOpacity onPress={() => setReplyingTo(null)}>
                  <Ionicons name="close" size={20} color={themeColors.icon} />
                </TouchableOpacity>
              </View>
            )}

            {/* Comment Input */}
            <View
              style={[
                styles.commentInputContainer,
                { borderTopColor: themeColors.border },
              ]}
            >
              <TextInput
                style={[
                  styles.commentInput,
                  {
                    color: themeColors.text,
                    backgroundColor: themeColors.card,
                  },
                ]}
                placeholder="Add a comment..."
                placeholderTextColor={themeColors.textSecondary}
                value={commentText}
                onChangeText={setCommentText}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[
                  styles.commentSubmit,
                  {
                    backgroundColor: commentText.trim()
                      ? "#FF4500"
                      : themeColors.border,
                  },
                ]}
                onPress={handleSubmitComment}
                disabled={!commentText.trim()}
              >
                <Text
                  style={[
                    styles.commentSubmitText,
                    {
                      color: commentText.trim()
                        ? "#fff"
                        : themeColors.textSecondary,
                    },
                  ]}
                >
                  Post
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const Post = ({
  post,
  onLike,
  onDislike,
  onComment,
  onShare,
  onImagePress,
  onSave,
  onAward,
  themeColors,
  onMore,
  isBookmarked,
  DEFAULT_COLLECTION,
  onProfilePress,
}) => {
  // Debug logs for avatar and image lookups
  console.log(
    "DEBUG: Post ID",
    post.id,
    "avatar lookup:",
    post.avatar,
    "->",
    imageMap[post.avatar]
  );
  console.log(
    "DEBUG: Post ID",
    post.id,
    "image lookup:",
    post.image,
    "->",
    imageMap[post.image]
  );
  // Double-tap logic using ref
  const lastTap = useRef(null);

  const handleLikePress = () => {
    onLike(post.id);
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    if (lastTap.current && now - lastTap.current < 300) {
      handleLikePress();
    }
    lastTap.current = now;
  };

  return (
    <View style={[styles.postContainer, { backgroundColor: themeColors.card }]}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <TouchableOpacity
          style={styles.userInfo}
          onPress={() => onProfilePress(post)}
        >
          <TouchableOpacity onPress={() => onProfilePress(post)}>
            <Image
              source={
                imageMap[post.avatar]
                  ? imageMap[post.avatar]
                  : require("../../assets/images/Commenter1.jpg")
              }
              style={styles.avatar}
            />
          </TouchableOpacity>
          <View style={styles.userDetails}>
            <Text style={[styles.username, { color: themeColors.text }]}>
              {post.user}
            </Text>
            <Text
              style={[styles.postTime, { color: themeColors.textSecondary }]}
            >
              {getRelativeTime(post.timestamp)}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => onMore(post)}
        >
          <Feather
            name="more-horizontal"
            size={20}
            color={themeColors.textSecondary}
          />
        </TouchableOpacity>
      </View>
      {/* Post Content with double-tap to like, but NOT profile navigation */}
      <Pressable onPress={handleDoubleTap}>
        <View style={styles.postContent}>
          <Text style={[styles.postTitle, { color: themeColors.text }]}>
            {post.title}
          </Text>
          {post.content && (
            <Text style={[styles.postBody, { color: themeColors.text }]}>
              {post.content}
            </Text>
          )}
          {post.image && (
            <TouchableOpacity onPress={() => onImagePress(post.image)}>
              <Image
                source={
                  imageMap[post.image]
                    ? imageMap[post.image]
                    : require("../../assets/images/Random.jpg")
                }
                style={styles.postImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
        </View>
      </Pressable>

      {/* Post Actions */}
      <View style={styles.postActions}>
        <View style={styles.actionGroup}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleLikePress}
          >
            <AntDesign
              name={post.liked ? "heart" : "hearto"}
              size={22}
              color={post.liked ? "#e74c3c" : themeColors.textSecondary}
            />
            <Text
              style={[
                styles.actionText,
                { color: post.liked ? "#e74c3c" : themeColors.textSecondary },
              ]}
            >
              {formatCount(post.likes)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onComment(post.id)}
          >
            <Feather
              name="message-circle"
              size={20}
              color={themeColors.textSecondary}
            />
            <Text
              style={[styles.actionText, { color: themeColors.textSecondary }]}
            >
              {formatCount(post.comments)}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.actionGroup}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onShare(post.id)}
          >
            <Feather
              name="share-2"
              size={20}
              color={themeColors.textSecondary}
            />
            <Text
              style={[styles.actionText, { color: themeColors.textSecondary }]}
            >
              {formatCount(post.shares)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => onSave(post.id)}
            onLongPress={() => handleBookmarkLongPress(post.id)}
          >
            {isBookmarked(post.id, DEFAULT_COLLECTION) ? (
              <FontAwesome
                name="bookmark"
                size={20}
                color={themeColors.accent}
              />
            ) : (
              <Feather
                name="bookmark"
                size={20}
                color={themeColors.textSecondary}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const Header = ({ menuOpen, setMenuOpen, onProfilePress, onSearchPress }) => {
  const router = useRouter();
  const { themeColors } = useTheme();

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: themeColors.background,
          borderBottomColor: themeColors.border,
        },
      ]}
    >
      <View style={styles.headerLeft}>
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 8, // More touch area
            paddingRight: 12,
          }}
          onPress={() => setMenuOpen((open) => !open)}
          activeOpacity={0.7}
        >
          <Text style={[styles.logoText, { color: "#2E45A3" }]}>NeoPing</Text>
          <Ionicons
            name={menuOpen ? "chevron-up" : "chevron-down"}
            size={Platform.OS === "web" ? 18 : 16}
            color={themeColors.icon}
            style={{ marginLeft: 4 }}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.headerIcons}>
        <TouchableOpacity
          style={{
            marginRight: 12,
            padding: 8, // Bigger touch area
          }}
          onPress={onSearchPress}
          activeOpacity={0.7}
        >
          <Ionicons
            name="search"
            size={Platform.OS === "web" ? 24 : 22}
            color={themeColors.icon}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onProfilePress}
          style={{ padding: 4 }} // Touch area
          activeOpacity={0.7}
        >
          <Ionicons
            name="person-circle-outline"
            size={Platform.OS === "web" ? 28 : 26}
            color={themeColors.icon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Helper function to format large numbers (e.g., 1000 -> 1K, 1000000 -> 1M)
const formatCount = (num) => {
  // Handle undefined, null, or non-numeric values
  if (num === undefined || num === null || isNaN(num)) {
    return "0";
  }

  const numValue = Number(num);

  if (numValue >= 1000000) {
    return (numValue / 1000000).toFixed(1) + "M";
  } else if (numValue >= 1000) {
    return (numValue / 1000).toFixed(1) + "K";
  }
  return numValue.toString();
};

// Empty Posts Component
const EmptyPostsComponent = ({
  themeColors,
  onRefresh,
  isBackend,
  isLoading,
}) => {
  return (
    <View
      style={[
        styles.emptyContainer,
        { backgroundColor: themeColors.background },
      ]}
    >
      {/* Animated Icon */}
      <View style={styles.emptyIconContainer}>
        <View
          style={[
            styles.emptyIconCircle,
            { backgroundColor: themeColors.card },
          ]}
        >
          <Feather
            name="message-square"
            size={48}
            color={themeColors.accent || "#2E45A3"}
          />
        </View>

        {/* Floating particles animation */}
        <View
          style={[
            styles.particle,
            styles.particle1,
            { backgroundColor: themeColors.accent },
          ]}
        />
        <View
          style={[
            styles.particle,
            styles.particle2,
            { backgroundColor: themeColors.accent },
          ]}
        />
        <View
          style={[
            styles.particle,
            styles.particle3,
            { backgroundColor: themeColors.accent },
          ]}
        />
      </View>

      {/* Main Message */}
      <Text style={[styles.emptyTitle, { color: themeColors.text }]}>
        {isLoading ? "Loading Posts..." : "No Posts Yet"}
      </Text>

      <Text
        style={[styles.emptySubtitle, { color: themeColors.textSecondary }]}
      >
        {isLoading
          ? "Fetching the latest content for you"
          : isBackend
          ? "Be the first to share something amazing!"
          : "Pull down to refresh and see the latest posts"}
      </Text>

      {/* Action Button */}
      {!isLoading && (
        <TouchableOpacity
          style={[
            styles.emptyButton,
            { backgroundColor: themeColors.accent || "#2E45A3" },
          ]}
          onPress={onRefresh}
        >
          <Feather
            name="refresh-cw"
            size={20}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.emptyButtonText}>Refresh Posts</Text>
        </TouchableOpacity>
      )}

      {/* Fun Facts */}
      <View style={styles.emptyTips}>
        <View style={styles.tipItem}>
          <Text style={styles.tipEmoji}>💡</Text>
          <Text style={[styles.tipText, { color: themeColors.textSecondary }]}>
            Tip: Double-tap posts to like them quickly
          </Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipEmoji}>🔍</Text>
          <Text style={[styles.tipText, { color: themeColors.textSecondary }]}>
            Use search to find specific content
          </Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipEmoji}>📚</Text>
          <Text style={[styles.tipText, { color: themeColors.textSecondary }]}>
            Bookmark posts to read them later
          </Text>
        </View>
      </View>
    </View>
  );
};

const index = () => {
  const { posts, setPosts } = usePosts();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [url, setUrl] = useState("");
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [comments, setComments] = useState([
    {
      id: 1,
      username: "u/RedditUser1",
      avatar: "commenter1.jpg",
      text: "This is amazing! Love the content.",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      likes: 12,
      liked: false,
    },
    {
      id: 2,
      username: "u/SportsFan",
      avatar: "commenter2.jpg",
      text: "Great post! Thanks for sharing this.",
      timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      likes: 8,
      liked: false,
    },
    {
      id: 3,
      username: "u/CommunityMember",
      avatar: "commenter3.jpg",
      text: "I totally agree with this. Well said!",
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      likes: 5,
      liked: false,
    },
  ]);
  const router = useRouter();
  const pathname = usePathname();
  const { themeColors } = useTheme();
  const {
    bookmarks,
    toggleBookmark,
    isBookmarked,
    collections,
    DEFAULT_COLLECTION,
  } = useBookmarks();
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);
  const [selectedMorePost, setSelectedMorePost] = useState(null);
  const [collectionModalVisible, setCollectionModalVisible] = useState(false);
  const [collectionModalPost, setCollectionModalPost] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [createPostVisible, setCreatePostVisible] = useState(false);

  // Debug function to log post data
  const debugPostData = () => {
    console.log("🔍 DEBUG: Current post data:");
    console.log("User posts count:", userPosts.length);
    console.log("Demo posts count:", posts.length);
    console.log(
      "User posts:",
      userPosts.map((p) => ({ id: p.id, title: p.title, user: p.user }))
    );
    console.log(
      "Demo posts:",
      posts.map((p) => ({ id: p.id, title: p.title, user: p.user }))
    );
  };

  // Test user posts to see the hybrid system working
  const testUserPosts = [
    {
      id: "user-1",
      title: "My First Post!",
      content: "This is my first post on NeoPing. Excited to be here! 🎉",
      image: null,
      user: "You",
      avatar: "Penguin.jpg", // Add avatar
      timestamp: new Date(),
      likes: 5,
      comments: 2,
      shares: 1,
      liked: false,
      saved: false,
      awarded: false,
      isUserPost: true,
    },
    {
      id: "user-2",
      title: "Beautiful Sunset Today",
      content:
        "Just witnessed an amazing sunset. Nature never fails to amaze me! 🌅",
      image: "Random.jpg", // Use existing image from your imageMap
      user: "You",
      avatar: "Penguin.jpg",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      likes: 12,
      comments: 8,
      shares: 3,
      liked: false,
      saved: false,
      awarded: false,
      isUserPost: true,
    },
  ];

  // Load user posts from database
  // Replace your existing loadUserPostsFromDatabase function:
  const loadUserPostsFromDatabase = async () => {
    try {
      console.log("🔍 Loading user posts from database...");
      const result = await getUserPosts();

      console.log("🔍 API response:", result);

      if (result && result.success && result.data && result.data.length > 0) {
        // Transform posts with proper like/comment data
        const transformedPosts = result.data.map((post) => ({
          id: post.id,
          title: post.title,
          content: post.content,
          image: post.imageUrl,
          user: "You", // Mark as current user
          avatar: "Penguin.jpg",
          timestamp: new Date(post.createdDate || post.createdAt),
          likes: post.upvotes || post.voteCount || 0,
          comments: post.commentCount || 0,
          shares: 0,
          liked: post.userLiked || false,
          saved: false,
          awarded: false,
          isUserPost: true, // Important flag
        }));

        setUserPosts(transformedPosts);
        console.log(
          `✅ Loaded ${transformedPosts.length} user posts from database`
        );
      } else {
        console.log("ℹ️ No posts found in database, using test posts");
        setUserPosts(testUserPosts);
      }
    } catch (error) {
      console.error("❌ Error loading user posts:", error);
      setUserPosts(testUserPosts);
    }
  };

  // Initialize with user posts from database
  useEffect(() => {
    loadUserPostsFromDatabase();
  }, []);

  // Transform post data to match our frontend format
  const transformPost = (postData) => ({
    ...postData,
    id: postData.id || Date.now().toString(),
    timestamp: postData.timestamp || new Date().toISOString(),
    isUserPost: true,
    likes: postData.likes || 0,
    comments: postData.comments || 0,
    shares: postData.shares || 0,
    liked: postData.liked || false,
    saved: postData.saved || false,
    awarded: postData.awarded || false,
  });

  // Function to add a new post to the database
  const addUserPost = async (postData) => {
    try {
      const result = await createPost(postData);
      if (result.success) {
        const newPost = transformPost(result.data);
        setUserPosts((prev) => [newPost, ...prev]);
        return newPost;
      }
      return null;
    } catch (error) {
      console.error("❌ Failed to create post:", error);
      // Optionally show error to user
      return null;
    }
  };

  // Function to delete a post
  const deleteUserPost = (postId) => {
    setUserPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
  };

  // Function to combine posts from different sources
  const getCombinedPosts = () => {
    if (useBackend && connectionStatus === "connected") {
      // In hybrid mode, combine backend posts with user posts
      // Filter out any user posts that might have been saved to backend
      const userPostsNotInBackend = userPosts.filter(
        (userPost) =>
          !backendPosts.some((backendPost) => backendPost.id === userPost.id)
      );
      return [...backendPosts, ...userPostsNotInBackend];
    }
    // In local mode, combine dummy posts with user posts
    return [...userPosts, ...posts];
  };

  // Force re-render every minute to update timestamps
  const [, setTimeUpdate] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeUpdate(Date.now());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // State for backend integration
  const [backendPosts, setBackendPosts] = useState([]);
  const [useBackend, setUseBackend] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("checking"); // 'checking', 'connected', 'disconnected'
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [backendError, setBackendError] = useState(null);

  // Check backend connection on component mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        setConnectionStatus("checking");
        const response = await testConnection();
        if (response?.success) {
          setConnectionStatus("connected");
          fetchBackendPosts(true);
        } else {
          setConnectionStatus("disconnected");
          setUseBackend(false);
          console.log("Backend connection failed, using dummy data");
        }
      } catch (error) {
        console.error("Error checking backend connection:", error);
        setConnectionStatus("disconnected");
        setUseBackend(false);
      }
    };

    checkBackend();
  }, []);

  // Handle toggling between backend and dummy data
  const handleToggleBackend = async () => {
    const newUseBackend = !useBackend;
    setUseBackend(newUseBackend);

    if (newUseBackend) {
      // If switching to backend mode, check connection and fetch posts
      try {
        setLoading(true);
        setConnectionStatus("checking");

        // Check backend connection
        const isConnected = await checkBackendConnection();

        if (isConnected) {
          setConnectionStatus("connected");
          await fetchBackendPosts(true);
          Toast.show({
            type: "success",
            text1: "Connected to Backend",
            text2: "Now showing live posts from the server",
          });
        } else {
          setConnectionStatus("disconnected");
          setUseBackend(false);
          Toast.show({
            type: "error",
            text1: "Connection Failed",
            text2: "Could not connect to the server. Using demo data.",
          });
        }
      } catch (error) {
        console.error("Error toggling backend:", error);
        setConnectionStatus("disconnected");
        setUseBackend(false);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to connect to the server. Using demo data.",
        });
      } finally {
        setLoading(false);
      }
    } else {
      // If switching to dummy data mode
      setConnectionStatus("disconnected");
      setBackendPosts([]);
      setPage(0);
      setHasMore(true);
      Toast.show({
        type: "info",
        text1: "Demo Mode",
        text2: "Now showing demo posts",
      });
    }
  };

  // Check backend connection
  const checkBackendConnection = async () => {
    try {
      console.log("🔍 Checking backend connection...");
      const response = await testConnection();

      if (response.success) {
        console.log("✅ Backend connection successful");
        setConnectionStatus("connected");
        setBackendError(null);
        return true;
      } else {
        console.log("❌ Backend connection failed:", response.error);
        setConnectionStatus("failed");
        setBackendError(response.error);
        return false;
      }
    } catch (error) {
      console.error("❌ Connection test error:", error);
      setConnectionStatus("failed");
      setBackendError("Network error. Please check your connection.");
      return false;
    }
  };

  // Fetch posts from backend
  const fetchBackendPosts = async (reset = false) => {
    if (loading || (loadingMore && !reset)) return;

    try {
      if (reset) {
        setLoading(true);
        setBackendError(null);
      } else {
        setLoadingMore(true);
      }

      const limit = 10;
      const response = await postsAPI.getPosts({
        page: reset ? 0 : page,
        limit,
      });

      if (response && response.success) {
        const newPosts = response.data.posts || [];

        // Transform backend data to match your existing format
        const transformedPosts = newPosts.map(transformBackendPost);

        if (reset) {
          setBackendPosts(transformedPosts);
          setPage(1);
        } else {
          setBackendPosts((prev) => [...prev, ...transformedPosts]);
          setPage((prev) => prev + 1);
        }

        setHasMore(newPosts.length === limit);
        setBackendError(null);
      } else {
        throw new Error(response?.message || "Failed to fetch posts");
      }
    } catch (error) {
      console.error("Error fetching backend posts:", error);
      setBackendError(error.message || "Failed to load posts");

      // If it's not a reset (initial load), show error toast
      if (!reset) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to load more posts",
        });
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  // Transform backend post format to match frontend format
  const transformBackendPost = (backendPost) => {
    return {
      id: backendPost._id || backendPost.id,
      title: backendPost.title || "",
      content: backendPost.content || "",
      user: backendPost.author?.username || "Anonymous",
      timestamp: backendPost.createdAt || new Date().toISOString(),
      likes: backendPost.likes || 0,
      comments: backendPost.comments || 0,
      shares: backendPost.shares || 0,
      liked: backendPost.liked || false,
      saved: backendPost.saved || false,
      image: backendPost.image || null,
      avatar: backendPost.author?.avatar || "default_avatar.jpg",
    };
  };

  // Handle like/unlike for both user posts and demo posts
  // Replace your ENTIRE handleLike function (around line 1100) with this:
  // Replace your ENTIRE handleLike function (around line 1168) with this:
  const handleLike = async (postId) => {
    console.log("👍 Handling like for post:", postId);

    // Find the post in the ACTUAL data you're displaying
    const userPost = userPosts.find((post) => post.id === postId);
    const demoPost = posts.find((post) => post.id === postId);

    console.log("🔍 Found in user posts:", !!userPost);
    console.log("🔍 Found in demo posts:", !!demoPost);

    if (userPost) {
      console.log("🎯 Processing as USER POST");

      // Store original state for potential rollback
      const originalLiked = userPost.liked;
      const originalLikes = userPost.likes;

      console.log(
        "📊 Original user state - liked:",
        originalLiked,
        "likes:",
        originalLikes
      );

      // Update USER posts state immediately (optimistic update)
      setUserPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                liked: !post.liked,
                likes: post.liked ? post.likes - 1 : post.likes + 1,
              }
            : post
        )
      );

      try {
        const result = await togglePostLike(postId);

        if (result.success) {
          console.log("✅ User post like successful");
          Toast.show({
            type: "success",
            text1: !originalLiked ? "Post Liked!" : "Like Removed",
            text2: "Your reaction has been saved",
            visibilityTime: 1000,
          });
        } else {
          console.log("❌ User post like failed - reverting");
          // Revert user posts state
          setUserPosts((prevPosts) =>
            prevPosts.map((post) =>
              post.id === postId
                ? {
                    ...post,
                    liked: originalLiked,
                    likes: originalLikes,
                  }
                : post
            )
          );

          Toast.show({
            type: "error",
            text1: "Like Failed",
            text2: result.error || "Failed to update like status",
          });
        }
      } catch (error) {
        console.error("❌ Error liking user post:", error);

        // Revert user posts state
        setUserPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  liked: originalLiked,
                  likes: originalLikes,
                }
              : post
          )
        );

        Toast.show({
          type: "error",
          text1: "Network Error",
          text2: "Failed to like post. Please check your connection.",
        });
      }
    } else if (demoPost) {
      console.log("🎯 Processing as DEMO POST");

      // Store original state for reference
      const originalLiked = demoPost.liked;
      const originalLikes = demoPost.likes;

      console.log(
        "📊 Original demo state - liked:",
        originalLiked,
        "likes:",
        originalLikes
      );

      // Update DEMO posts state immediately
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                liked: !post.liked,
                likes: post.liked ? post.likes - 1 : post.likes + 1,
              }
            : post
        )
      );

      Toast.show({
        type: "success",
        text1: !originalLiked ? "Post Liked!" : "Like Removed",
        text2: "Demo post updated locally",
        visibilityTime: 1000,
      });
    } else {
      console.error("❌ Post not found in any state:", postId);
      console.log(
        "🔍 Available user post IDs:",
        userPosts.map((p) => p.id)
      );
      console.log(
        "🔍 Available demo post IDs:",
        posts.map((p) => p.id)
      );
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Post not found",
      });
    }
  };
  const handleComment = async (postId) => {
    console.log("💬 Handling comment for post:", postId);

    // Find the post from either user posts or demo posts
    let post =
      userPosts.find((p) => p.id === postId) ||
      posts.find((p) => p.id === postId);
    const isUserPost = userPosts.some((p) => p.id === postId);

    console.log("🔍 Found post:", !!post);
    console.log("🔍 Is user post:", isUserPost);

    if (isUserPost) {
      console.log("🎯 Loading real comments from backend for user post");
      // Load real comments from backend for user posts
      try {
        const result = await getPostComments(postId);

        if (result.success) {
          const transformedComments = result.data.map((comment) => ({
            id: comment.id,
            username: comment.username,
            avatar: "Penguin.jpg", // Default avatar
            text: comment.content,
            timestamp: new Date(comment.createdDate),
            likes: comment.likes || 0,
            liked: false,
          }));

          console.log(
            "✅ Loaded comments for user post:",
            transformedComments.length
          );
          setComments(transformedComments);
        } else {
          console.log("ℹ️ No comments found for user post");
          setComments([]);
        }
      } catch (error) {
        console.error("❌ Error loading comments:", error);
        setComments([]);
      }
    } else {
      console.log("🎯 Loading demo comments for demo post");
      // Use demo comments for demo posts
      setComments([
        {
          id: 1,
          username: "u/RedditUser1",
          avatar: "commenter1.jpg",
          text: "This is amazing! Love the content.",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          likes: 12,
          liked: false,
        },
        {
          id: 2,
          username: "u/SportsFan",
          avatar: "commenter2.jpg",
          text: "Great post! Thanks for sharing this.",
          timestamp: new Date(Date.now() - 60 * 60 * 1000),
          likes: 8,
          liked: false,
        },
        {
          id: 3,
          username: "u/TechEnthusiast",
          avatar: "commenter3.jpg",
          text: "Really helpful information, thanks for sharing!",
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          likes: 5,
          liked: false,
        },
      ]);
    }

    setSelectedPost(post);
    setCommentModalVisible(true);
  };

  // Replace your existing handleAddComment function with this:
  const handleAddComment = async (text, replyingTo = null) => {
    if (!selectedPost) {
      console.error("❌ No selected post for comment");
      return;
    }

    const isUserPost = userPosts.some((p) => p.id === selectedPost.id);

    console.log("💬 Adding comment to post:", selectedPost.id);
    console.log("🔍 Is user post:", isUserPost);

    if (isUserPost) {
      console.log("🎯 Adding comment to backend for user post");
      // Add comment to backend for user posts
      try {
        const result = await addPostComment(selectedPost.id, text);

        if (result.success) {
          const newComment = {
            id: result.data.comment.id,
            username: result.data.comment.username,
            avatar: "Penguin.jpg",
            text: result.data.comment.content,
            timestamp: new Date(result.data.comment.createdDate),
            likes: 0,
            liked: false,
          };

          console.log("✅ Comment added to backend:", newComment);
          setComments((prev) => [newComment, ...prev]);

          // Update post comment count and refresh comments
          setUserPosts((prevPosts) =>
            prevPosts.map((post) =>
              post.id === selectedPost.id
                ? {
                    ...post,
                    comments: post.comments + 1,
                    // Ensure we have the latest comment count
                    commentCount: (post.commentCount || 0) + 1,
                  }
                : post
            )
          );

          // Refresh comments to ensure we have the latest
          handleComment(selectedPost.id);

          Toast.show({
            type: "success",
            text1: "Comment Added",
            text2: "Your comment has been saved to the database",
          });
        } else {
          console.error("❌ Failed to add comment to backend:", result.error);
          Toast.show({
            type: "error",
            text1: "Comment Failed",
            text2: result.error,
          });
        }
      } catch (error) {
        console.error("❌ Error adding comment:", error);
        Toast.show({
          type: "error",
          text1: "Network Error",
          text2: "Failed to add comment",
        });
      }
    } else {
      console.log("🎯 Adding comment locally for demo post");
      try {
        // Add comment locally for demo posts
        const newComment = {
          id: Date.now(),
          username: "u/CurrentUser",
          avatar: "Penguin.jpg",
          text: text,
          timestamp: new Date(),
          likes: 0,
          liked: false,
        };

        console.log("✅ Comment added locally:", newComment);

        // Update local comments state
        setComments((prev) => [newComment, ...prev]);

        // Update demo post comment count
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === selectedPost.id
              ? {
                  ...post,
                  comments: (post.comments || 0) + 1,
                  commentCount: (post.commentCount || 0) + 1,
                }
              : post
          )
        );
      } catch (error) {
        console.error("❌ Error adding local comment:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to add comment",
        });
      }
    }
  };
  // Update your existing onRefresh function
  const onRefresh = async () => {
    console.log("🔄 Refreshing posts...");
    setRefreshing(true);

    if (useBackend) {
      const isConnected = await checkBackendConnection();

      if (isConnected) {
        await fetchBackendPosts(true);
      } else {
        console.log("📱 Backend unavailable, using local posts");
        // Your existing refresh logic for local posts
        setPosts((posts) =>
          posts.map((post) => ({
            ...post,
            liked: false,
            disliked: false,
            saved: false,
            awarded: false,
          }))
        );
      }
    } else {
      // Your existing refresh logic for local posts
      setPosts((posts) =>
        posts.map((post) => ({
          ...post,
          liked: false,
          disliked: false,
          saved: false,
          awarded: false,
        }))
      );
    }

    setRefreshing(false);
  };

  // Add new effect to initialize backend connection
  useEffect(() => {
    const initializeApp = async () => {
      console.log("🚀 Initializing app...");

      if (useBackend) {
        const isConnected = await checkBackendConnection();

        if (isConnected) {
          await fetchBackendPosts(true);
        } else {
          console.log("📱 Backend unavailable, using local posts");
          setUseBackend(false);
        }
      }
    };

    initializeApp();
  }, []);

  // Update your postsToDisplay logic around line 875
  const postsToDisplay = (() => {
    if (useBackend && connectionStatus === "connected") {
      // If backend is connected but has no posts, fall back to dummy posts
      if (backendPosts.length === 0 && !loading) {
        console.log("📱 Backend connected but empty, showing dummy posts");
        return posts; // Your original dummy posts
      }
      return backendPosts;
    }
    return posts; // Your original dummy posts
  })();

  // Update your existing filteredPosts variable
  const filteredPosts = postsToDisplay
    .filter((post) => {
      const q = (searchText || "").toLowerCase();
      return (
        (post.title || "").toLowerCase().includes(q) ||
        (post.content || "").toLowerCase().includes(q) ||
        (post.user || "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Add load more functionality to your FlatList
  const handleLoadMore = () => {
    if (
      useBackend &&
      connectionStatus === "connected" &&
      !loadingMore &&
      hasMore &&
      !loading
    ) {
      console.log("📄 Loading more backend posts...");
      fetchBackendPosts(false);
    }
  };

  // ✅ Define the missing handleSearchIcon function
  const handleSearchIcon = () => {
    setSearchOpen(true);
  };

  // ✅ Missing handleDislike function
  const handleDislike = (postId) => {
    console.log("Dislike pressed for post:", postId);
    // Add your dislike logic here
    // For example: call API to dislike post, update local state, etc.
  };

  // ✅ Missing handleCancelSearch function
  const handleCancelSearch = () => {
    setSearchOpen(false);
    setSearchText("");
  };

  // Add these missing functions to your index.jsx file

  const handleShare = (postId) => {
    console.log("Share pressed for post:", postId);
    // Add your share logic here
    // For example: open native share dialog
    alert(`Share post: ${postId}`);
  };

  const handleImagePress = (imageSource) => {
    console.log("Image pressed:", imageSource);
    setSelectedImage(imageSource);
    setImageModalVisible(true);
  };

  const handleSave = (postId) => {
    console.log("Save pressed for post:", postId);
    toggleBookmark(postId);
  };

  const handleAward = (postId) => {
    console.log("Award pressed for post:", postId);
    // Add your award logic here
    alert(`Award given to post: ${postId}`);
  };

  const handleMorePress = (post) => {
    console.log("More pressed for post:", post.id);
    setSelectedMorePost(post);
    setMoreMenuVisible(true);
  };

  const handleProfilePress = (post) => {
    console.log("Profile pressed for user:", post.user);
    // Add your profile navigation logic here
    alert(`View profile: ${post.user}`);
  };

  const handleLikeComment = (commentId) => {
    console.log("Like comment:", commentId);
    setComments(
      comments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              liked: !comment.liked,
              likes: comment.liked ? comment.likes - 1 : comment.likes + 1,
            }
          : comment
      )
    );
  };

  // Add this missing function for bookmark long press
  const handleBookmarkLongPress = (postId) => {
    console.log("Bookmark long press for post:", postId);
    setCollectionModalPost({ id: postId });
    setCollectionModalVisible(true);
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#2E45A3" />
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <Stack.Screen options={{ headerShown: false }} />

      {/* Add connection status indicator */}
      {useBackend && connectionStatus === "failed" && (
        <View style={[styles.connectionBanner, { backgroundColor: "#e74c3c" }]}>
          <Text style={styles.connectionBannerText}>
            ⚠️ Backend unavailable - Using local data
          </Text>
          <TouchableOpacity
            onPress={() => {
              setUseBackend(true);
              checkBackendConnection().then((connected) => {
                if (connected) fetchBackendPosts(true);
              });
            }}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Search Bar */}
      {searchOpen ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            paddingTop: 40,
            backgroundColor: themeColors.background,
            borderBottomWidth: 1,
            borderColor: themeColors.border,
          }}
        >
          <Ionicons
            name="search"
            size={22}
            color={themeColors.icon}
            style={{ marginRight: 8 }}
          />
          <TextInput
            style={{
              flex: 1,
              fontSize: 18,
              color: themeColors.text,
              paddingVertical: 8,
            }}
            placeholder="Search posts"
            placeholderTextColor={themeColors.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
          />
          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchText("")}
              style={{ marginHorizontal: 4 }}
            >
              <Ionicons
                name="close-circle"
                size={22}
                color={themeColors.icon}
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handleCancelSearch}
            style={{ marginLeft: 8 }}
          >
            <Text
              style={{ color: themeColors.accent || "#2E45A3", fontSize: 16 }}
            >
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
      {/* Header */}
      {!searchOpen && (
        <Header
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          onProfilePress={() => setProfileModalVisible(true)}
          onSearchPress={handleSearchIcon}
        />
      )}
      <PopupMenu visible={menuOpen} router={router} />
      <ProfileModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
        onLogout={() => {
          setProfileModalVisible(false);
          router.replace("/");
        }}
        bookmarks={bookmarks}
        onUnbookmark={toggleBookmark}
      />

      {/* Comment Modal */}
      {selectedPost && (
        <CommentModal
          visible={commentModalVisible}
          onClose={() => setCommentModalVisible(false)}
          post={selectedPost}
          comments={comments}
          onAddComment={handleAddComment}
          onLikeComment={handleLikeComment}
          onReplyComment={() => {}}
          themeColors={themeColors}
        />
      )}

      {/* Image Modal */}
      <ImageModal
        visible={imageModalVisible}
        imageSource={selectedImage}
        onClose={() => {
          setImageModalVisible(false);
          setSelectedImage(null);
        }}
        themeColors={themeColors}
      />

      <MoreMenu
        visible={moreMenuVisible}
        onClose={() => setMoreMenuVisible(false)}
        onReport={() => {
          setMoreMenuVisible(false);
          alert("Reported!");
        }}
        onHide={() => {
          setMoreMenuVisible(false);
          alert("Post hidden!");
        }}
        onCopyLink={() => {
          setMoreMenuVisible(false);
          alert(
            "Link copied: https://neoping.app/post/" +
              (selectedMorePost?.id || "")
          );
        }}
        onShare={() => {
          setMoreMenuVisible(false);
          alert("Share: " + (selectedMorePost?.title || ""));
        }}
      />

      <CollectionModal
        visible={collectionModalVisible}
        onClose={() => setCollectionModalVisible(false)}
        post={collectionModalPost}
      />

      {pathname === "/watch" ? (
        <View
          style={{
            flex: 1,
            backgroundColor: "#fff",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            paddingTop: 40,
            paddingHorizontal: 16,
          }}
        >
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 20,
              marginBottom: 8,
              marginLeft: 6,
            }}
          >
            There is no content to display
          </Text>
          <Text style={{ fontWeight: "500", fontSize: 16, marginLeft: 6 }}>
            We were unable to find any content for this page
          </Text>
        </View>
      ) : (
        <FlatList
          data={(() => {
            // Create hybrid posts: user posts first, then demo posts
            const hybridPosts = [...userPosts, ...posts];

            // Apply search filter if there's search text
            if (searchText) {
              const searchLower = searchText.toLowerCase();
              return hybridPosts.filter(
                (post) =>
                  post.title?.toLowerCase().includes(searchLower) ||
                  post.content?.toLowerCase().includes(searchLower) ||
                  post.user?.toLowerCase().includes(searchLower)
              );
            }

            return hybridPosts;
          })()}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Post
              post={{
                ...item,
                // Ensure all required fields exist with defaults
                likes: item.likes || 0,
                comments: item.comments || 0,
                shares: item.shares || 0,
                liked: item.liked || false,
                saved: isBookmarked(item.id) || false,
                awarded: item.awarded || false,
              }}
              onLike={handleLike}
              onDislike={handleDislike}
              onComment={handleComment}
              onShare={handleShare}
              onImagePress={handleImagePress}
              onSave={handleSave}
              onAward={handleAward}
              themeColors={themeColors}
              onMore={handleMorePress}
              isBookmarked={isBookmarked}
              DEFAULT_COLLECTION={DEFAULT_COLLECTION}
              onProfilePress={handleProfilePress}
            />
          )}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={() => (
            <EmptyPostsComponent
              themeColors={themeColors}
              onRefresh={onRefresh}
              isBackend={useBackend}
              isLoading={
                loading || (useBackend && connectionStatus === "checking")
              }
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() =>
            loadingMore ? (
              <View style={styles.loadMoreContainer}>
                <ActivityIndicator size="small" color="#2E45A3" />
                <Text
                  style={[
                    styles.loadMoreText,
                    { color: themeColors.textSecondary },
                  ]}
                >
                  Loading more posts...
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  postContainer: {
    marginBottom: 10,
    borderRadius: 8,
    marginHorizontal: 8,
    padding: 12,
    ...Platform.select({
      web: {
        boxShadow: "0px 2px 8px rgba(0,0,0,0.06)",
      },
      default: {
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
      },
    }),
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontWeight: "600",
    fontSize: 15,
    marginBottom: 2,
  },
  postTime: {
    fontSize: 13,
    opacity: 0.7,
  },
  moreButton: {
    padding: 4,
  },
  postContent: {
    marginBottom: 8,
  },
  postTitle: {
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 20,
    marginBottom: 8,
  },
  postBody: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  postImage: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    marginTop: 6,
    marginBottom: 2,
    backgroundColor: "#f0f0f0",
  },
  postActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
  },
  actionGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  actionText: {
    marginLeft: 4,
    fontSize: 13,
    fontWeight: "500",
  },
  saveButton: {
    padding: 4,
  },
  separator: {
    height: 8,
    backgroundColor: "transparent",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 50 : 40, // Account for status bar
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
    ...Platform.select({
      web: {
        paddingTop: 12,
      },
      ios: {
        paddingTop: 50, // Extra space for iOS status bar
      },
      android: {
        paddingTop: 40, // Space for Android status bar
      },
    }),
  },
  headerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  logoText: {
    color: "#2E45A3",
    fontWeight: "bold",
    fontSize: Platform.OS === "web" ? 22 : 20, // Slightly smaller on mobile
    marginLeft: Platform.OS === "web" ? 10 : 4,
  },
  // Comment Modal Styles
  commentModalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  commentModal: {
    height: "85%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...Platform.select({
      web: {
        boxShadow: "0px -2px 8px rgba(0,0,0,0.25)",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 10,
      },
    }),
  },
  commentModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
  },
  commentModalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  postPreview: {
    padding: 16,
    borderBottomWidth: 1,
  },
  postPreviewHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  postPreviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  postPreviewUser: {
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 4,
  },
  postPreviewTitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  commentsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  commentContainer: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  commentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 12,
  },
  commentInfo: {
    flex: 1,
  },
  commentUsername: {
    fontWeight: "600",
    fontSize: 14,
  },
  commentTime: {
    fontSize: 12,
    marginTop: 2,
  },
  commentText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  commentAction: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  commentActionText: {
    fontSize: 12,
    marginLeft: 4,
  },
  emptyComments: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyCommentsText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
  },
  emptyCommentsSubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  replyIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  replyText: {
    fontSize: 14,
  },
  // Empty State Styles
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 60,
    minHeight: 500,
  },
  emptyIconContainer: {
    position: "relative",
    marginBottom: 32,
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      web: {
        boxShadow: "0px 8px 32px rgba(46, 69, 163, 0.15)",
      },
      default: {
        shadowColor: "#2E45A3",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
      },
    }),
  },
  particle: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.6,
  },
  particle1: {
    top: 20,
    right: 10,
    transform: [{ rotate: "45deg" }],
  },
  particle2: {
    bottom: 15,
    left: 15,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  particle3: {
    top: 60,
    left: -10,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: 280,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 40,
    ...Platform.select({
      web: {
        boxShadow: "0px 4px 16px rgba(46, 69, 163, 0.3)",
      },
      default: {
        shadowColor: "#2E45A3",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyTips: {
    width: "100%",
    maxWidth: 300,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  tipEmoji: {
    fontSize: 20,
    marginRight: 12,
    width: 30,
    textAlign: "center",
  },
  tipText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 16,
    borderTopWidth: 1,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    marginRight: 12,
  },
  commentSubmit: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  commentSubmitText: {
    fontSize: 14,
    fontWeight: "600",
  },
  connectionBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    marginHorizontal: 8,
    marginTop: 8,
    borderRadius: 8,
  },
  connectionBannerText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    flex: 1,
  },
  retryButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  loadMoreContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadMoreText: {
    marginLeft: 10,
    fontSize: 14,
  },
});

export default index;
