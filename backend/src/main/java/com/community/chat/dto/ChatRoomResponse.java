package com.community.chat.dto;

import com.community.chat.entity.ChatRoom;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class ChatRoomResponse {
    private Long id;
    private String name;
    private Long gatheringId;
    private String gatheringCategory;
    private int participantCount;
    private LocalDateTime updatedAt;

    public static ChatRoomResponse from(ChatRoom chatRoom) {
        return ChatRoomResponse.builder()
                .id(chatRoom.getId())
                .name(chatRoom.getName())
                .gatheringId(chatRoom.getGathering() != null ? chatRoom.getGathering().getId() : null)
                .gatheringCategory(chatRoom.getGathering() != null ? 
                        chatRoom.getGathering().getCategory().name() : null)
                .participantCount(chatRoom.getGathering() != null ? 
                        chatRoom.getGathering().getCurrentParticipants() : 0)
                .updatedAt(chatRoom.getUpdatedAt())
                .build();
    }
}
