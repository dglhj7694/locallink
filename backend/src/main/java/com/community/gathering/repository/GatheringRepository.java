package com.community.gathering.repository;

import com.community.gathering.entity.Gathering;
import com.community.gathering.entity.GatheringCategory;
import com.community.gathering.entity.GatheringStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Set;

public interface GatheringRepository extends JpaRepository<Gathering, Long> {

    Page<Gathering> findByStatusOrderByCreatedAtDesc(GatheringStatus status, Pageable pageable);

    Page<Gathering> findByCategoryAndStatusOrderByCreatedAtDesc(
            GatheringCategory category, GatheringStatus status, Pageable pageable);

    Page<Gathering> findByOrganizerIdOrderByCreatedAtDesc(Long organizerId, Pageable pageable);

    @Query("SELECT DISTINCT g FROM Gathering g JOIN g.interests gi " +
            "WHERE gi IN :interests AND g.status = :status " +
            "GROUP BY g ORDER BY COUNT(gi) DESC")
    Page<Gathering> findRecommended(
            @Param("interests") Set<String> interests,
            @Param("status") GatheringStatus status,
            Pageable pageable);

    @Query("SELECT DISTINCT g FROM Gathering g JOIN g.participants p " +
            "WHERE p.user.id = :userId ORDER BY g.createdAt DESC")
    Page<Gathering> findByParticipantUserId(@Param("userId") Long userId, Pageable pageable);
}
