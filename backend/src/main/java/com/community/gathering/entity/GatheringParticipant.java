package com.community.gathering.entity;

import com.community.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "gathering_participants", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"gathering_id", "user_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GatheringParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gathering_id", nullable = false)
    private Gathering gathering;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Builder.Default
    private LocalDateTime joinedAt = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ParticipantStatus status = ParticipantStatus.PENDING;
}
