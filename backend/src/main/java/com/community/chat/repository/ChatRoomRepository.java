package com.community.chat.repository;

import com.community.chat.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

    @Query("SELECT cr FROM ChatRoom cr JOIN cr.gathering g JOIN g.participants p " +
            "WHERE p.user.id = :userId ORDER BY cr.updatedAt DESC")
    List<ChatRoom> findByUserId(@Param("userId") Long userId);
}
