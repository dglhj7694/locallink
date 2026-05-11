package com.community.user.service;

import com.community.user.dto.UserResponse;
import com.community.user.dto.UserUpdateRequest;
import com.community.user.entity.User;
import com.community.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    public UserResponse getUser(Long userId) {
        User user = findUserById(userId);
        return UserResponse.from(user);
    }

    @Transactional
    public UserResponse updateUser(Long userId, UserUpdateRequest request) {
        User user = findUserById(userId);

        if (request.getNickname() != null) {
            if (userRepository.existsByNickname(request.getNickname()) &&
                    !user.getNickname().equals(request.getNickname())) {
                throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
            }
            user.setNickname(request.getNickname());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getNeighborhood() != null) {
            user.setNeighborhood(request.getNeighborhood());
        }
        if (request.getInterests() != null) {
            user.setInterests(request.getInterests());
        }
        if (request.getAge() != null) {
            user.setAge(request.getAge());
        }
        if (request.getGender() != null) {
            user.setGender(request.getGender());
        }

        return UserResponse.from(user);
    }

    @Transactional
    public UserResponse updateProfileImage(Long userId, String imageUrl) {
        User user = findUserById(userId);
        user.setProfileImageUrl(imageUrl);
        return UserResponse.from(user);
    }

    public User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }

    public User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }
}
