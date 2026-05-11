package com.community.auth.service;

import com.community.auth.dto.LoginRequest;
import com.community.auth.dto.SignupRequest;
import com.community.auth.dto.TokenResponse;
import com.community.auth.jwt.JwtTokenProvider;
import com.community.user.entity.Role;
import com.community.user.entity.User;
import com.community.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public TokenResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }
        if (userRepository.existsByNickname(request.getNickname())) {
            throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .neighborhood(request.getNeighborhood())
                .role(Role.USER)
                .interests(request.getInterests() != null ? request.getInterests() : new HashSet<>())
                .age(request.getAge())
                .gender(request.getGender())
                .build();

        userRepository.save(user);

        return createTokenResponse(user);
    }

    public TokenResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("이메일 또는 비밀번호가 올바르지 않습니다."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("이메일 또는 비밀번호가 올바르지 않습니다.");
        }

        return createTokenResponse(user);
    }

    private TokenResponse createTokenResponse(User user) {
        String accessToken = jwtTokenProvider.createAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = jwtTokenProvider.createRefreshToken(user.getEmail());

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .role(user.getRole().name())
                .build();
    }
}
