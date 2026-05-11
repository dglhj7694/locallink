package com.community.auth.controller;

import com.community.auth.dto.LoginRequest;
import com.community.auth.dto.SignupRequest;
import com.community.auth.dto.TokenResponse;
import com.community.auth.service.AuthService;
import com.community.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<TokenResponse>> signup(@Valid @RequestBody SignupRequest request) {
        TokenResponse response = authService.signup(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("회원가입이 완료되었습니다.", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<TokenResponse>> login(@Valid @RequestBody LoginRequest request) {
        TokenResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("로그인 성공", response));
    }
}
