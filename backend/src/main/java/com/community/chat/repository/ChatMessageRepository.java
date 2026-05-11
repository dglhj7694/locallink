package com.community.chat.repository;

import com.community.chat.entity.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    Page<ChatMessage> findByChatRoomIdOrderByCreatedAtDesc(Long chatRoomId, Pageable pageable);
}
