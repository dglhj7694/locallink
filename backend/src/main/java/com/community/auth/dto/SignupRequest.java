package com.community.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
public class SignupRequest {

    @NotBlank(message = "이메일을 입력해주세요.")
    @Email(message = "올바른 이메일 형식이 아닙니다.")
    private String email;

    @NotBlank(message = "비밀번호를 입력해주세요.")
    @Size(min = 6, message = "비밀번호는 6자 이상이어야 합니다.")
    private String password;

    @NotBlank(message = "닉네임을 입력해주세요.")
    @Size(min = 2, max = 30, message = "닉네임은 2~30자 사이여야 합니다.")
    private String nickname;

    private String neighborhood;
    private Set<String> interests;
    private Integer age;
    private com.community.user.entity.Gender gender;
}
