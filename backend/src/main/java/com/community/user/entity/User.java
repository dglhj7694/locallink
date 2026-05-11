package com.community.user.entity;

import com.community.common.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, length = 30)
    private String nickname;

    @Column(length = 500)
    private String profileImageUrl;

    @Column(length = 200)
    private String bio;

    @Column(length = 50)
    private String neighborhood;

    private Integer age;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Gender gender = Gender.SECRET;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Role role = Role.USER;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_interests", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "interest")
    @Builder.Default
    private Set<String> interests = new HashSet<>();
}
