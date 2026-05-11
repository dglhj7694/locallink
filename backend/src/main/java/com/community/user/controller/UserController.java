package com.community.user.controller;

import com.community.auth.jwt.JwtTokenProvider;
import com.community.common.dto.ApiResponse;
import com.community.user.dto.UserResponse;
import com.community.user.dto.UserUpdateRequest;
import com.community.user.entity.User;
import com.community.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getMyProfile(Authentication authentication) {
        Long userId = getUserId(authentication);
        UserResponse response = userService.getUser(userId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateMyProfile(
            Authentication authentication,
            @Valid @RequestBody UserUpdateRequest request) {
        Long userId = getUserId(authentication);
        UserResponse response = userService.updateUser(userId, request);
        return ResponseEntity.ok(ApiResponse.ok("프로필이 수정되었습니다.", response));
    }

    private Long getUserId(Authentication authentication) {
        String token = (String) authentication.getCredentials();
        return jwtTokenProvider.getUserId(token);
    }
}
