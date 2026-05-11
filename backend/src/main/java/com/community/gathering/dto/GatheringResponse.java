package com.community.gathering.dto;

import com.community.gathering.entity.Gathering;
import com.community.gathering.entity.GatheringParticipant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Getter
@Builder
@AllArgsConstructor
public class GatheringResponse {
    private Long id;
    private String title;
    private String description;
    private String location;
    private Double latitude;
    private Double longitude;
    private Integer minAge;
    private Integer maxAge;
    private String targetGender;
    private LocalDateTime eventDate;
    private int maxParticipants;
    private int currentParticipants;
    private String status;
    private String category;
    private OrganizerInfo organizer;
    private Set<String> interests;
    private List<ParticipantInfo> participants;
    private Long chatRoomId;
    private boolean joined;
    private LocalDateTime createdAt;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class OrganizerInfo {
        private Long id;
        private String nickname;
        private String profileImageUrl;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class ParticipantInfo {
        private Long id;
        private String nickname;
        private String profileImageUrl;
        private LocalDateTime joinedAt;
        private String status;
        private Integer age;
        private String gender;
    }

    public static GatheringResponse from(Gathering gathering, boolean joined) {
        List<ParticipantInfo> participantInfos = gathering.getParticipants().stream()
                .map(p -> ParticipantInfo.builder()
                        .id(p.getUser().getId())
                        .nickname(p.getUser().getNickname())
                        .profileImageUrl(p.getUser().getProfileImageUrl())
                        .joinedAt(p.getJoinedAt())
                        .status(p.getStatus().name())
                        .age(p.getUser().getAge())
                        .gender(p.getUser().getGender().name())
                        .build())
                .toList();

        return GatheringResponse.builder()
                .id(gathering.getId())
                .title(gathering.getTitle())
                .description(gathering.getDescription())
                .location(gathering.getLocation())
                .latitude(gathering.getLatitude())
                .longitude(gathering.getLongitude())
                .minAge(gathering.getMinAge())
                .maxAge(gathering.getMaxAge())
                .targetGender(gathering.getTargetGender().name())
                .eventDate(gathering.getEventDate())
                .maxParticipants(gathering.getMaxParticipants())
                .currentParticipants(gathering.getCurrentParticipants())
                .status(gathering.getStatus().name())
                .category(gathering.getCategory().name())
                .organizer(OrganizerInfo.builder()
                        .id(gathering.getOrganizer().getId())
                        .nickname(gathering.getOrganizer().getNickname())
                        .profileImageUrl(gathering.getOrganizer().getProfileImageUrl())
                        .build())
                .interests(gathering.getInterests())
                .participants(participantInfos)
                .chatRoomId(gathering.getChatRoom() != null ? gathering.getChatRoom().getId() : null)
                .joined(joined)
                .createdAt(gathering.getCreatedAt())
                .build();
    }

    public static GatheringResponse fromList(Gathering gathering) {
        return GatheringResponse.builder()
                .id(gathering.getId())
                .title(gathering.getTitle())
                .description(gathering.getDescription() != null && gathering.getDescription().length() > 150
                        ? gathering.getDescription().substring(0, 150) + "..."
                        : gathering.getDescription())
                .location(gathering.getLocation())
                .latitude(gathering.getLatitude())
                .longitude(gathering.getLongitude())
                .minAge(gathering.getMinAge())
                .maxAge(gathering.getMaxAge())
                .targetGender(gathering.getTargetGender().name())
                .eventDate(gathering.getEventDate())
                .maxParticipants(gathering.getMaxParticipants())
                .currentParticipants(gathering.getCurrentParticipants())
                .status(gathering.getStatus().name())
                .category(gathering.getCategory().name())
                .organizer(OrganizerInfo.builder()
                        .id(gathering.getOrganizer().getId())
                        .nickname(gathering.getOrganizer().getNickname())
                        .profileImageUrl(gathering.getOrganizer().getProfileImageUrl())
                        .build())
                .interests(gathering.getInterests())
                .participants(null)
                .chatRoomId(gathering.getChatRoom() != null ? gathering.getChatRoom().getId() : null)
                .joined(false)
                .createdAt(gathering.getCreatedAt())
                .build();
    }
}
