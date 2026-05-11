package com.community.board.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "post_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500)
    private String imageUrl;

    @Builder.Default
    private int displayOrder = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;
}
