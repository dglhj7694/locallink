package com.community.gathering.repository;

import com.community.gathering.entity.GatheringParticipant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GatheringParticipantRepository extends JpaRepository<GatheringParticipant, Long> {
    Optional<GatheringParticipant> findByGatheringIdAndUserId(Long gatheringId, Long userId);
    boolean existsByGatheringIdAndUserId(Long gatheringId, Long userId);
}
