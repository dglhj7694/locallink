package com.community.chat.controller;

import com.community.auth.jwt.JwtTokenProvider;
import com.community.chat.dto.ChatMessageRequest;
import com.community.chat.dto.ChatMessageResponse;
import com.community.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final JwtTokenProvider jwtTokenProvider;

    @MessageMapping("/chat/{roomId}")
    @SendTo("/topic/chat/{roomId}")
    public ChatMessageResponse sendMessage(
            @DestinationVariable Long roomId,
            ChatMessageRequest request,
            @Header(value = "Authorization", required = false) String token) {

        Long senderId = null;
        if (token != null && token.startsWith("Bearer ")) {
            String jwt = token.substring(7);
            if (jwtTokenProvider.validateToken(jwt)) {
                senderId = jwtTokenProvider.getUserId(jwt);
            }
        }

        if (senderId == null) {
            throw new RuntimeException("인증이 필요합니다.");
        }

        request.setRoomId(roomId);
        return chatService.saveMessage(request, senderId);
    }
}
