package com.community.chat.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatMessageRequest {
    private Long roomId;
    private String content;
    private String type; // CHAT, JOIN, LEAVE
}
