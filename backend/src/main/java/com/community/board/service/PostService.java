package com.community.board.service;

import com.community.board.dto.*;
import com.community.board.entity.*;
import com.community.board.repository.*;
import com.community.user.entity.User;
import com.community.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final PostLikeRepository postLikeRepository;
    private final UserService userService;
    private final FileService fileService;

    public Page<PostResponse> getPosts(String category, String keyword, Pageable pageable) {
        BoardCategory boardCategory = BoardCategory.valueOf(category.toUpperCase());

        Page<Post> posts;
        if (keyword != null && !keyword.isBlank()) {
            posts = postRepository.searchByKeyword(boardCategory, keyword, pageable);
        } else {
            posts = postRepository.findByCategoryOrderByCreatedAtDesc(boardCategory, pageable);
        }

        return posts.map(PostResponse::fromList);
    }

    public Page<PostResponse> getMyPosts(Long userId, Pageable pageable) {
        return postRepository.findByAuthorIdOrderByCreatedAtDesc(userId, pageable)
                .map(PostResponse::fromList);
    }

    @Transactional
    public PostResponse getPost(Long postId, Long userId) {
        Post post = findPostById(postId);
        post.incrementViewCount();

        boolean liked = false;
        if (userId != null) {
            liked = postLikeRepository.existsByPostIdAndUserId(postId, userId);
        }

        return PostResponse.from(post, liked);
    }

    @Transactional
    public PostResponse createPost(Long userId, PostCreateRequest request, List<MultipartFile> images) {
        User author = userService.findUserById(userId);
        BoardCategory category = BoardCategory.valueOf(request.getCategory().toUpperCase());

        Post post = Post.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .category(category)
                .author(author)
                .price(request.getPrice())
                .tradeStatus(request.getTradeStatus() != null ? request.getTradeStatus() : 
                        (category == BoardCategory.MARKETPLACE ? "SELLING" : null))
                .build();

        postRepository.save(post);

        if (images != null && !images.isEmpty()) {
            for (int i = 0; i < images.size(); i++) {
                try {
                    String imageUrl = fileService.saveFile(images.get(i));
                    PostImage postImage = PostImage.builder()
                            .imageUrl(imageUrl)
                            .displayOrder(i)
                            .post(post)
                            .build();
                    post.getImages().add(postImage);
                } catch (IOException e) {
                    throw new RuntimeException("이미지 업로드에 실패했습니다.");
                }
            }
        }

        return PostResponse.from(post, false);
    }

    @Transactional
    public PostResponse updatePost(Long postId, Long userId, PostCreateRequest request) {
        Post post = findPostById(postId);
        validateAuthor(post, userId);

        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        if (request.getPrice() != null) post.setPrice(request.getPrice());
        if (request.getTradeStatus() != null) post.setTradeStatus(request.getTradeStatus());

        return PostResponse.from(post, false);
    }

    @Transactional
    public void deletePost(Long postId, Long userId) {
        Post post = findPostById(postId);
        validateAuthor(post, userId);
        post.getImages().forEach(img -> fileService.deleteFile(img.getImageUrl()));
        postRepository.delete(post);
    }

    @Transactional
    public boolean toggleLike(Long postId, Long userId) {
        Post post = findPostById(postId);
        User user = userService.findUserById(userId);

        return postLikeRepository.findByPostIdAndUserId(postId, userId)
                .map(like -> {
                    postLikeRepository.delete(like);
                    post.decrementLikeCount();
                    return false;
                })
                .orElseGet(() -> {
                    PostLike newLike = PostLike.builder()
                            .post(post)
                            .user(user)
                            .build();
                    postLikeRepository.save(newLike);
                    post.incrementLikeCount();
                    return true;
                });
    }

    @Transactional
    public CommentResponse createComment(Long postId, Long userId, CommentCreateRequest request) {
        Post post = findPostById(postId);
        User author = userService.findUserById(userId);

        Comment comment = Comment.builder()
                .content(request.getContent())
                .post(post)
                .author(author)
                .build();

        if (request.getParentId() != null) {
            Comment parent = commentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new IllegalArgumentException("부모 댓글을 찾을 수 없습니다."));
            comment.setParent(parent);
        }

        commentRepository.save(comment);
        post.incrementCommentCount();

        return CommentResponse.from(comment);
    }

    public List<CommentResponse> getComments(Long postId) {
        return commentRepository.findByPostIdAndParentIsNullOrderByCreatedAtAsc(postId)
                .stream()
                .map(CommentResponse::from)
                .toList();
    }

    @Transactional
    public void deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다."));

        if (!comment.getAuthor().getId().equals(userId)) {
            throw new IllegalStateException("작성자만 댓글을 삭제할 수 있습니다.");
        }

        Post post = comment.getPost();
        int deleteCount = 1 + comment.getChildren().size();
        commentRepository.delete(comment);

        for (int i = 0; i < deleteCount; i++) {
            post.decrementCommentCount();
        }
    }

    private Post findPostById(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));
    }

    private void validateAuthor(Post post, Long userId) {
        if (!post.getAuthor().getId().equals(userId)) {
            throw new IllegalStateException("작성자만 수정/삭제할 수 있습니다.");
        }
    }
}
