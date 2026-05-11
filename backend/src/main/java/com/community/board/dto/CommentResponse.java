package com.community.board.dto;

import com.community.board.entity.Comment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class CommentResponse {
    private Long id;
    private String content;
    private PostResponse.AuthorInfo author;
    private Long parentId;
    private List<CommentResponse> children;
    private LocalDateTime createdAt;

    public static CommentResponse from(Comment comment) {
        List<CommentResponse> childResponses = comment.getChildren().stream()
                .map(CommentResponse::from)
                .toList();

        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .author(PostResponse.AuthorInfo.builder()
                        .id(comment.getAuthor().getId())
                        .nickname(comment.getAuthor().getNickname())
                        .profileImageUrl(comment.getAuthor().getProfileImageUrl())
                        .neighborhood(comment.getAuthor().getNeighborhood())
                        .build())
                .parentId(comment.getParent() != null ? comment.getParent().getId() : null)
                .children(childResponses)
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
