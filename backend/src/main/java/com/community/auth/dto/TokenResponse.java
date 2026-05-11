package com.community.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class TokenResponse {
    private String accessToken;
    private String refreshToken;
    private Long userId;
    private String email;
    private String nickname;
    private String role;
}
