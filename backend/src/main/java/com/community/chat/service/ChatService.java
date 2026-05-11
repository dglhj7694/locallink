package com.community.chat.service;

import com.community.chat.dto.ChatMessageRequest;
import com.community.chat.dto.ChatMessageResponse;
import com.community.chat.dto.ChatRoomResponse;
import com.community.chat.entity.ChatMessage;
import com.community.chat.entity.ChatRoom;
import com.community.chat.entity.MessageType;
import com.community.chat.repository.ChatMessageRepository;
import com.community.chat.repository.ChatRoomRepository;
import com.community.user.entity.User;
import com.community.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserService userService;

    public List<ChatRoomResponse> getMyChatRooms(Long userId) {
        return chatRoomRepository.findByUserId(userId).stream()
                .map(ChatRoomResponse::from)
                .toList();
    }

    public Page<ChatMessageResponse> getMessages(Long roomId, Pageable pageable) {
        return chatMessageRepository.findByChatRoomIdOrderByCreatedAtDesc(roomId, pageable)
                .map(ChatMessageResponse::from);
    }

    @Transactional
    public ChatMessageResponse saveMessage(ChatMessageRequest request, Long senderId) {
        ChatRoom chatRoom = chatRoomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new IllegalArgumentException("채팅방을 찾을 수 없습니다."));
        User sender = userService.findUserById(senderId);

        MessageType type = MessageType.CHAT;
        try {
            if (request.getType() != null) {
                type = MessageType.valueOf(request.getType());
            }
        } catch (IllegalArgumentException ignored) {}

        ChatMessage message = ChatMessage.builder()
                .content(request.getContent())
                .type(type)
                .chatRoom(chatRoom)
                .sender(sender)
                .build();

        chatMessageRepository.save(message);
        return ChatMessageResponse.from(message);
    }
}
