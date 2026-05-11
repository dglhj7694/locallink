package com.community.gathering.entity;

import com.community.chat.entity.ChatRoom;
import com.community.common.entity.BaseTimeEntity;
import com.community.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "gatherings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Gathering extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 200)
    private String location;

    private Double latitude;

    private Double longitude;

    private Integer minAge;

    private Integer maxAge;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TargetGender targetGender = TargetGender.ANY;

    private LocalDateTime eventDate;

    private int maxParticipants;

    @Builder.Default
    private int currentParticipants = 1;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private GatheringStatus status = GatheringStatus.RECRUITING;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GatheringCategory category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_id", nullable = false)
    private User organizer;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "gathering_interests", joinColumns = @JoinColumn(name = "gathering_id"))
    @Column(name = "interest")
    @Builder.Default
    private Set<String> interests = new HashSet<>();

    @OneToMany(mappedBy = "gathering", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<GatheringParticipant> participants = new ArrayList<>();

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "chat_room_id")
    private ChatRoom chatRoom;

    public boolean isFull() {
        return currentParticipants >= maxParticipants;
    }

    public void addParticipant() {
        this.currentParticipants++;
        if (isFull()) {
            this.status = GatheringStatus.CLOSED;
        }
    }

    public void removeParticipant() {
        if (this.currentParticipants > 1) {
            this.currentParticipants--;
            if (this.status == GatheringStatus.CLOSED) {
                this.status = GatheringStatus.RECRUITING;
            }
        }
    }
}
