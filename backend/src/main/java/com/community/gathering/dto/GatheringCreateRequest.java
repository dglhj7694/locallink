package com.community.gathering.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Setter
public class GatheringCreateRequest {

    @NotBlank(message = "모임 제목을 입력해주세요.")
    private String title;

    private String description;

    private String location;

    @NotNull(message = "모임 일시를 선택해주세요.")
    private LocalDateTime eventDate;

    @Min(value = 2, message = "최소 2명 이상이어야 합니다.")
    private int maxParticipants;

    @NotNull(message = "모임 카테고리를 선택해주세요.")
    private String category;

    private Set<String> interests;

    private Double latitude;
    private Double longitude;
    private Integer minAge;
    private Integer maxAge;
    private com.community.gathering.entity.TargetGender targetGender;
}
