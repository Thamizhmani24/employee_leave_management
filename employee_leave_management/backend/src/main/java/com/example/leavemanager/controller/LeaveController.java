package com.example.leavemanager.controller;

import com.example.leavemanager.model.LeaveRequest;
import com.example.leavemanager.model.User;
import com.example.leavemanager.repository.LeaveRequestRepository;
import com.example.leavemanager.repository.UserRepository;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private UserRepository userRepository;

    // Apply for leave
    @PostMapping
    public ResponseEntity<?> applyLeave(@RequestBody LeaveRequestDto dto) {
        Optional<User> userOpt = userRepository.findById(dto.getUserId());
        if (!userOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User not found");
        }

        LeaveRequest leaveRequest = new LeaveRequest();
        leaveRequest.setUser(userOpt.get());
        leaveRequest.setStartDate(dto.getStartDate());
        leaveRequest.setEndDate(dto.getEndDate());
        leaveRequest.setReason(dto.getReason());
        leaveRequest.setLeaveType(dto.getLeaveType());
        leaveRequest.setStatus("PENDING");

        LeaveRequest savedRequest = leaveRequestRepository.save(leaveRequest);
        // Clear password in the nested User object for privacy
        savedRequest.getUser().setPassword(null);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedRequest);
    }

    // View leaves for a specific employee
    @GetMapping("/employee/{userId}")
    public ResponseEntity<?> getEmployeeLeaves(@PathVariable Long userId) {
        List<LeaveRequest> requests = leaveRequestRepository.findByUserId(userId);
        requests.forEach(r -> {
            if (r.getUser() != null) {
                r.getUser().setPassword(null);
            }
        });
        return ResponseEntity.ok(requests);
    }

    // View all leaves (for manager dashboard)
    @GetMapping
    public ResponseEntity<?> getAllLeaves() {
        List<LeaveRequest> requests = leaveRequestRepository.findAll();
        requests.forEach(r -> {
            if (r.getUser() != null) {
                r.getUser().setPassword(null);
            }
        });
        return ResponseEntity.ok(requests);
    }

    // Approve leave
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveLeave(@PathVariable Long id) {
        Optional<LeaveRequest> requestOpt = leaveRequestRepository.findById(id);
        if (requestOpt.isPresent()) {
            LeaveRequest request = requestOpt.get();
            request.setStatus("APPROVED");
            LeaveRequest updated = leaveRequestRepository.save(request);
            if (updated.getUser() != null) {
                updated.getUser().setPassword(null);
            }
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Leave request not found");
    }

    // Reject leave
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectLeave(@PathVariable Long id) {
        Optional<LeaveRequest> requestOpt = leaveRequestRepository.findById(id);
        if (requestOpt.isPresent()) {
            LeaveRequest request = requestOpt.get();
            request.setStatus("REJECTED");
            LeaveRequest updated = leaveRequestRepository.save(request);
            if (updated.getUser() != null) {
                updated.getUser().setPassword(null);
            }
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Leave request not found");
    }

    // Helper DTO class for leave applications
    @Data
    public static class LeaveRequestDto {
        private Long userId;
        private LocalDate startDate;
        private LocalDate endDate;
        private String reason;
        private String leaveType;
    }
}
