package com.community.board.repository;

import com.community.board.entity.BoardCategory;
import com.community.board.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostRepository extends JpaRepository<Post, Long> {

    Page<Post> findByCategoryOrderByCreatedAtDesc(BoardCategory category, Pageable pageable);

    Page<Post> findByAuthorIdOrderByCreatedAtDesc(Long authorId, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.category = :category AND " +
            "(LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Post> searchByKeyword(@Param("category") BoardCategory category,
                               @Param("keyword") String keyword,
                               Pageable pageable);
}
