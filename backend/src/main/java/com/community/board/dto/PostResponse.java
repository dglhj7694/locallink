package com.community.board.dto;

import com.community.board.entity.Post;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class PostResponse {
    private Long id;
    private String title;
    private String content;
    private String category;
    private int viewCount;
    private int likeCount;
    private int commentCount;
    private Integer price;
    private String tradeStatus;
    private AuthorInfo author;
    private List<String> imageUrls;
    private boolean liked;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class AuthorInfo {
        private Long id;
        private String nickname;
        private String profileImageUrl;
        private String neighborhood;
    }

    public static PostResponse from(Post post, boolean liked) {
        List<String> imageUrls = post.getImages().stream()
                .map(img -> img.getImageUrl())
                .toList();

        return PostResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .category(post.getCategory().name())
                .viewCount(post.getViewCount())
                .likeCount(post.getLikeCount())
                .commentCount(post.getCommentCount())
                .price(post.getPrice())
                .tradeStatus(post.getTradeStatus())
                .author(AuthorInfo.builder()
                        .id(post.getAuthor().getId())
                        .nickname(post.getAuthor().getNickname())
                        .profileImageUrl(post.getAuthor().getProfileImageUrl())
                        .neighborhood(post.getAuthor().getNeighborhood())
                        .build())
                .imageUrls(imageUrls)
                .liked(liked)
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }

    public static PostResponse fromList(Post post) {
        List<String> imageUrls = post.getImages().stream()
                .map(img -> img.getImageUrl())
                .toList();

        return PostResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent() != null && post.getContent().length() > 200 
                        ? post.getContent().substring(0, 200) + "..." 
                        : post.getContent())
                .category(post.getCategory().name())
                .viewCount(post.getViewCount())
                .likeCount(post.getLikeCount())
                .commentCount(post.getCommentCount())
                .price(post.getPrice())
                .tradeStatus(post.getTradeStatus())
                .author(AuthorInfo.builder()
                        .id(post.getAuthor().getId())
                        .nickname(post.getAuthor().getNickname())
                        .profileImageUrl(post.getAuthor().getProfileImageUrl())
                        .neighborhood(post.getAuthor().getNeighborhood())
                        .build())
                .imageUrls(imageUrls)
                .liked(false)
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }
}
