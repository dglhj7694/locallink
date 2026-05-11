package com.community.gathering.service;

import com.community.chat.entity.ChatRoom;
import com.community.chat.repository.ChatRoomRepository;
import com.community.gathering.dto.GatheringCreateRequest;
import com.community.gathering.dto.GatheringResponse;
import com.community.gathering.entity.*;
import com.community.gathering.repository.GatheringParticipantRepository;
import com.community.gathering.repository.GatheringRepository;
import com.community.user.entity.User;
import com.community.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GatheringService {

    private final GatheringRepository gatheringRepository;
    private final GatheringParticipantRepository participantRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final UserService userService;

    public Page<GatheringResponse> getGatherings(String category, Pageable pageable) {
        Page<Gathering> gatherings;
        if (category != null && !category.isBlank()) {
            GatheringCategory cat = GatheringCategory.valueOf(category.toUpperCase());
            gatherings = gatheringRepository.findByCategoryAndStatusOrderByCreatedAtDesc(
                    cat, GatheringStatus.RECRUITING, pageable);
        } else {
            gatherings = gatheringRepository.findByStatusOrderByCreatedAtDesc(
                    GatheringStatus.RECRUITING, pageable);
        }
        return gatherings.map(GatheringResponse::fromList);
    }

    public Page<GatheringResponse> getMyGatherings(Long userId, Pageable pageable) {
        return gatheringRepository.findByParticipantUserId(userId, pageable)
                .map(GatheringResponse::fromList);
    }

    public Page<GatheringResponse> getRecommended(Long userId, Pageable pageable) {
        User user = userService.findUserById(userId);
        if (user.getInterests() == null || user.getInterests().isEmpty()) {
            return gatheringRepository.findByStatusOrderByCreatedAtDesc(
                    GatheringStatus.RECRUITING, pageable).map(GatheringResponse::fromList);
        }
        return gatheringRepository.findRecommended(user.getInterests(), GatheringStatus.RECRUITING, pageable)
                .map(GatheringResponse::fromList);
    }

    public GatheringResponse getGathering(Long gatheringId, Long userId) {
        Gathering gathering = findGatheringById(gatheringId);
        boolean joined = false;
        if (userId != null) {
            joined = participantRepository.existsByGatheringIdAndUserId(gatheringId, userId);
        }
        return GatheringResponse.from(gathering, joined);
    }

    @Transactional
    public GatheringResponse createGathering(Long userId, GatheringCreateRequest request) {
        User organizer = userService.findUserById(userId);
        GatheringCategory category = GatheringCategory.valueOf(request.getCategory().toUpperCase());

        // Create chat room for the gathering
        ChatRoom chatRoom = ChatRoom.builder()
                .name(request.getTitle())
                .build();
        chatRoomRepository.save(chatRoom);

        Gathering gathering = Gathering.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .location(request.getLocation())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .minAge(request.getMinAge())
                .maxAge(request.getMaxAge())
                .targetGender(request.getTargetGender() != null ? request.getTargetGender() : TargetGender.ANY)
                .eventDate(request.getEventDate())
                .maxParticipants(request.getMaxParticipants())
                .currentParticipants(1)
                .status(GatheringStatus.RECRUITING)
                .category(category)
                .organizer(organizer)
                .interests(request.getInterests() != null ? request.getInterests() : new HashSet<>())
                .chatRoom(chatRoom)
                .build();

        gatheringRepository.save(gathering);

        // Add organizer as first participant (automatically APPROVED)
        GatheringParticipant participant = GatheringParticipant.builder()
                .gathering(gathering)
                .user(organizer)
                .status(ParticipantStatus.APPROVED)
                .build();
        participantRepository.save(participant);

        chatRoom.setGathering(gathering);

        return GatheringResponse.from(gathering, true);
    }

    @Transactional
    public GatheringResponse updateGathering(Long gatheringId, Long userId, GatheringCreateRequest request) {
        Gathering gathering = findGatheringById(gatheringId);
        validateOrganizer(gathering, userId);

        gathering.setTitle(request.getTitle());
        gathering.setDescription(request.getDescription());
        gathering.setLocation(request.getLocation());
        gathering.setLatitude(request.getLatitude());
        gathering.setLongitude(request.getLongitude());
        gathering.setMinAge(request.getMinAge());
        gathering.setMaxAge(request.getMaxAge());
        if (request.getTargetGender() != null) {
            gathering.setTargetGender(request.getTargetGender());
        }
        gathering.setEventDate(request.getEventDate());
        gathering.setMaxParticipants(request.getMaxParticipants());
        if (request.getInterests() != null) {
            gathering.setInterests(request.getInterests());
        }

        if (gathering.getChatRoom() != null) {
            gathering.getChatRoom().setName(request.getTitle());
        }

        return GatheringResponse.from(gathering, true);
    }

    @Transactional
    public void deleteGathering(Long gatheringId, Long userId) {
        Gathering gathering = findGatheringById(gatheringId);
        validateOrganizer(gathering, userId);
        gatheringRepository.delete(gathering);
    }

    @Transactional
    public GatheringResponse applyGathering(Long gatheringId, Long userId) {
        Gathering gathering = findGatheringById(gatheringId);
        User user = userService.findUserById(userId);

        if (gathering.getOrganizer().getId().equals(userId)) {
            throw new IllegalStateException("모임장은 이미 참여 중입니다.");
        }
        if (participantRepository.existsByGatheringIdAndUserId(gatheringId, userId)) {
            throw new IllegalStateException("이미 신청했거나 참여 중인 모임입니다.");
        }
        if (gathering.isFull()) {
            throw new IllegalStateException("모임 인원이 가득 찼습니다.");
        }
        if (gathering.getStatus() != GatheringStatus.RECRUITING) {
            throw new IllegalStateException("모집이 마감된 모임입니다.");
        }
        
        // 연령 및 성별 조건 검증
        if (gathering.getTargetGender() != TargetGender.ANY) {
            if (user.getGender() == com.community.user.entity.Gender.SECRET) {
                throw new IllegalStateException("성별 조건이 있는 모임은 성별을 공개해야 신청할 수 있습니다.");
            }
            if ((gathering.getTargetGender() == TargetGender.MALE_ONLY && user.getGender() != com.community.user.entity.Gender.MALE) ||
                (gathering.getTargetGender() == TargetGender.FEMALE_ONLY && user.getGender() != com.community.user.entity.Gender.FEMALE)) {
                throw new IllegalStateException("모임의 성별 조건과 맞지 않습니다.");
            }
        }
        
        if (gathering.getMinAge() != null || gathering.getMaxAge() != null) {
            if (user.getAge() == null) {
                throw new IllegalStateException("나이 조건이 있는 모임은 나이를 입력해야 신청할 수 있습니다.");
            }
            if (gathering.getMinAge() != null && user.getAge() < gathering.getMinAge()) {
                throw new IllegalStateException("나이 조건(최소)에 맞지 않습니다.");
            }
            if (gathering.getMaxAge() != null && user.getAge() > gathering.getMaxAge()) {
                throw new IllegalStateException("나이 조건(최대)에 맞지 않습니다.");
            }
        }

        GatheringParticipant participant = GatheringParticipant.builder()
                .gathering(gathering)
                .user(user)
                .status(ParticipantStatus.PENDING)
                .build();
        participantRepository.save(participant);

        return GatheringResponse.from(gathering, false); // 신청만 한 상태이므로 joined=false
    }

    @Transactional
    public GatheringResponse approveParticipant(Long gatheringId, Long organizerId, Long targetUserId) {
        Gathering gathering = findGatheringById(gatheringId);
        validateOrganizer(gathering, organizerId);

        GatheringParticipant participant = participantRepository.findByGatheringIdAndUserId(gatheringId, targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("신청 내역을 찾을 수 없습니다."));

        if (participant.getStatus() == ParticipantStatus.APPROVED) {
            throw new IllegalStateException("이미 수락된 사용자입니다.");
        }
        if (gathering.isFull()) {
            throw new IllegalStateException("모임 인원이 가득 차서 더 이상 수락할 수 없습니다.");
        }

        participant.setStatus(ParticipantStatus.APPROVED);
        gathering.addParticipant(); // currentParticipants 증가 및 모집 마감 처리

        return GatheringResponse.from(gathering, true);
    }

    @Transactional
    public void rejectParticipant(Long gatheringId, Long organizerId, Long targetUserId) {
        Gathering gathering = findGatheringById(gatheringId);
        validateOrganizer(gathering, organizerId);

        GatheringParticipant participant = participantRepository.findByGatheringIdAndUserId(gatheringId, targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("신청 내역을 찾을 수 없습니다."));

        if (participant.getStatus() == ParticipantStatus.APPROVED) {
            gathering.removeParticipant(); // 이미 수락된 사람을 거절/내보낼 경우
        }
        
        participant.setStatus(ParticipantStatus.REJECTED);
        // 거절 시 신청 내역을 삭제하려면 participantRepository.delete(participant); 를 사용
        // 여기서는 상태만 업데이트하도록 유지
        participantRepository.delete(participant);
    }

    @Transactional
    public void leaveGathering(Long gatheringId, Long userId) {
        Gathering gathering = findGatheringById(gatheringId);

        if (gathering.getOrganizer().getId().equals(userId)) {
            throw new IllegalStateException("모임장은 탈퇴할 수 없습니다. 모임을 삭제해주세요.");
        }

        GatheringParticipant participant = participantRepository
                .findByGatheringIdAndUserId(gatheringId, userId)
                .orElseThrow(() -> new IllegalArgumentException("참여하지 않은 모임입니다."));

        participantRepository.delete(participant);
        gathering.removeParticipant();
    }

    private Gathering findGatheringById(Long gatheringId) {
        return gatheringRepository.findById(gatheringId)
                .orElseThrow(() -> new IllegalArgumentException("모임을 찾을 수 없습니다."));
    }

    private void validateOrganizer(Gathering gathering, Long userId) {
        if (!gathering.getOrganizer().getId().equals(userId)) {
            throw new IllegalStateException("모임장만 수정/삭제할 수 있습니다.");
        }
    }
}
