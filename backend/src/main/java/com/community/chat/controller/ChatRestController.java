package com.community.chat.controller;

import com.community.auth.jwt.JwtTokenProvider;
import com.community.chat.dto.ChatMessageResponse;
import com.community.chat.dto.ChatRoomResponse;
import com.community.chat.service.ChatService;
import com.community.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatRestController {

    private final ChatService chatService;
    private final JwtTokenProvider jwtTokenProvider;

    @GetMapping("/rooms")
    public ResponseEntity<ApiResponse<List<ChatRoomResponse>>> getMyChatRooms(
            Authentication authentication) {
        Long userId = getUserId(authentication);
        List<ChatRoomResponse> rooms = chatService.getMyChatRooms(userId);
        return ResponseEntity.ok(ApiResponse.ok(rooms));
    }

    @GetMapping("/rooms/{roomId}/messages")
    public ResponseEntity<ApiResponse<Page<ChatMessageResponse>>> getMessages(
            @PathVariable Long roomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ChatMessageResponse> messages = chatService.getMessages(roomId, pageable);
        return ResponseEntity.ok(ApiResponse.ok(messages));
    }

    private Long getUserId(Authentication authentication) {
        String token = (String) authentication.getCredentials();
        return jwtTokenProvider.getUserId(token);
    }
}
