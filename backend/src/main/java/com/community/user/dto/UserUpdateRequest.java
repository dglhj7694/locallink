package com.community.user.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
public class UserUpdateRequest {

    @Size(min = 2, max = 30, message = "닉네임은 2~30자 사이여야 합니다.")
    private String nickname;

    @Size(max = 200, message = "자기소개는 200자 이내로 입력해주세요.")
    private String bio;

    private String neighborhood;
    private Set<String> interests;
    private Integer age;
    private com.community.user.entity.Gender gender;
}
