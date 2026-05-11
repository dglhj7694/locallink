package com.community.board.controller;

import com.community.auth.jwt.JwtTokenProvider;
import com.community.board.dto.*;
import com.community.board.service.PostService;
import com.community.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;
    private final JwtTokenProvider jwtTokenProvider;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PostResponse>>> getPosts(
            @RequestParam String category,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PostResponse> posts = postService.getPosts(category, keyword, pageable);
        return ResponseEntity.ok(ApiResponse.ok(posts));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Page<PostResponse>>> getMyPosts(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = getUserId(authentication);
        Pageable pageable = PageRequest.of(page, size);
        Page<PostResponse> posts = postService.getMyPosts(userId, pageable);
        return ResponseEntity.ok(ApiResponse.ok(posts));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PostResponse>> getPost(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = authentication != null ? getUserId(authentication) : null;
        PostResponse post = postService.getPost(id, userId);
        return ResponseEntity.ok(ApiResponse.ok(post));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<PostResponse>> createPost(
            Authentication authentication,
            @Valid @RequestPart("post") PostCreateRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        Long userId = getUserId(authentication);
        PostResponse post = postService.createPost(userId, request, images);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("게시글이 작성되었습니다.", post));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PostResponse>> updatePost(
            @PathVariable Long id,
            Authentication authentication,
            @Valid @RequestBody PostCreateRequest request) {
        Long userId = getUserId(authentication);
        PostResponse post = postService.updatePost(id, userId, request);
        return ResponseEntity.ok(ApiResponse.ok("게시글이 수정되었습니다.", post));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePost(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        postService.deletePost(id, userId);
        return ResponseEntity.ok(ApiResponse.ok("게시글이 삭제되었습니다."));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> toggleLike(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        boolean liked = postService.toggleLike(id, userId);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("liked", liked)));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getComments(@PathVariable Long id) {
        List<CommentResponse> comments = postService.getComments(id);
        return ResponseEntity.ok(ApiResponse.ok(comments));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<CommentResponse>> createComment(
            @PathVariable Long id,
            Authentication authentication,
            @Valid @RequestBody CommentCreateRequest request) {
        Long userId = getUserId(authentication);
        CommentResponse comment = postService.createComment(id, userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("댓글이 작성되었습니다.", comment));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @PathVariable Long commentId,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        postService.deleteComment(commentId, userId);
        return ResponseEntity.ok(ApiResponse.ok("댓글이 삭제되었습니다."));
    }

    private Long getUserId(Authentication authentication) {
        String token = (String) authentication.getCredentials();
        return jwtTokenProvider.getUserId(token);
    }
}
