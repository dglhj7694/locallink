package com.community.user.dto;

import com.community.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Builder
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String email;
    private String nickname;
    private String profileImageUrl;
    private String bio;
    private String neighborhood;
    private String role;
    private Set<String> interests;
    private Integer age;
    private com.community.user.entity.Gender gender;
    private LocalDateTime createdAt;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .profileImageUrl(user.getProfileImageUrl())
                .bio(user.getBio())
                .neighborhood(user.getNeighborhood())
                .role(user.getRole().name())
                .interests(user.getInterests())
                .age(user.getAge())
                .gender(user.getGender())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
