package com.community.chat.dto;

import com.community.chat.entity.ChatMessage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class ChatMessageResponse {
    private Long id;
    private String content;
    private String type;
    private SenderInfo sender;
    private LocalDateTime createdAt;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class SenderInfo {
        private Long id;
        private String nickname;
        private String profileImageUrl;
    }

    public static ChatMessageResponse from(ChatMessage message) {
        return ChatMessageResponse.builder()
                .id(message.getId())
                .content(message.getContent())
                .type(message.getType().name())
                .sender(SenderInfo.builder()
                        .id(message.getSender().getId())
                        .nickname(message.getSender().getNickname())
                        .profileImageUrl(message.getSender().getProfileImageUrl())
                        .build())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
