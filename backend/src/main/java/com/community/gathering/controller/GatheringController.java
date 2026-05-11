package com.community.gathering.controller;

import com.community.auth.jwt.JwtTokenProvider;
import com.community.common.dto.ApiResponse;
import com.community.gathering.dto.GatheringCreateRequest;
import com.community.gathering.dto.GatheringResponse;
import com.community.gathering.service.GatheringService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/gatherings")
@RequiredArgsConstructor
public class GatheringController {

    private final GatheringService gatheringService;
    private final JwtTokenProvider jwtTokenProvider;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<GatheringResponse>>> getGatherings(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<GatheringResponse> gatherings = gatheringService.getGatherings(category, pageable);
        return ResponseEntity.ok(ApiResponse.ok(gatherings));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Page<GatheringResponse>>> getMyGatherings(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = getUserId(authentication);
        Pageable pageable = PageRequest.of(page, size);
        Page<GatheringResponse> gatherings = gatheringService.getMyGatherings(userId, pageable);
        return ResponseEntity.ok(ApiResponse.ok(gatherings));
    }

    @GetMapping("/recommended")
    public ResponseEntity<ApiResponse<Page<GatheringResponse>>> getRecommended(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long userId = getUserId(authentication);
        Pageable pageable = PageRequest.of(page, size);
        Page<GatheringResponse> gatherings = gatheringService.getRecommended(userId, pageable);
        return ResponseEntity.ok(ApiResponse.ok(gatherings));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GatheringResponse>> getGathering(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = authentication != null ? getUserId(authentication) : null;
        GatheringResponse gathering = gatheringService.getGathering(id, userId);
        return ResponseEntity.ok(ApiResponse.ok(gathering));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<GatheringResponse>> createGathering(
            Authentication authentication,
            @Valid @RequestBody GatheringCreateRequest request) {
        Long userId = getUserId(authentication);
        GatheringResponse gathering = gatheringService.createGathering(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("모임이 생성되었습니다.", gathering));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<GatheringResponse>> updateGathering(
            @PathVariable Long id,
            Authentication authentication,
            @Valid @RequestBody GatheringCreateRequest request) {
        Long userId = getUserId(authentication);
        GatheringResponse gathering = gatheringService.updateGathering(id, userId, request);
        return ResponseEntity.ok(ApiResponse.ok("모임이 수정되었습니다.", gathering));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGathering(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        gatheringService.deleteGathering(id, userId);
        return ResponseEntity.ok(ApiResponse.ok("모임이 삭제되었습니다."));
    }

    @PostMapping("/{id}/apply")
    public ResponseEntity<ApiResponse<GatheringResponse>> applyGathering(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        GatheringResponse gathering = gatheringService.applyGathering(id, userId);
        return ResponseEntity.ok(ApiResponse.ok("모임에 참여 신청했습니다. 모임장의 수락을 대기합니다.", gathering));
    }

    @PostMapping("/{id}/applications/{participantId}/approve")
    public ResponseEntity<ApiResponse<GatheringResponse>> approveParticipant(
            @PathVariable Long id,
            @PathVariable Long participantId,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        GatheringResponse gathering = gatheringService.approveParticipant(id, userId, participantId);
        return ResponseEntity.ok(ApiResponse.ok("참여 신청을 수락했습니다.", gathering));
    }

    @PostMapping("/{id}/applications/{participantId}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectParticipant(
            @PathVariable Long id,
            @PathVariable Long participantId,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        gatheringService.rejectParticipant(id, userId, participantId);
        return ResponseEntity.ok(ApiResponse.ok("참여 신청을 거절했습니다."));
    }

    @DeleteMapping("/{id}/leave")
    public ResponseEntity<ApiResponse<Void>> leaveGathering(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        gatheringService.leaveGathering(id, userId);
        return ResponseEntity.ok(ApiResponse.ok("모임에서 탈퇴했습니다."));
    }

    private Long getUserId(Authentication authentication) {
        String token = (String) authentication.getCredentials();
        return jwtTokenProvider.getUserId(token);
    }
}
