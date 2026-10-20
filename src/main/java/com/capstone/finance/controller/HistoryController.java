package com.capstone.finance.controller;

import com.capstone.finance.model.UserHistory;
import com.capstone.finance.repository.UserHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/history")
@CrossOrigin(origins = "*")
public class HistoryController {

    private final UserHistoryRepository userHistoryRepository;

    @Autowired
    public HistoryController(UserHistoryRepository userHistoryRepository) {
        this.userHistoryRepository = userHistoryRepository;
    }

    @PostMapping("/save")
    public ResponseEntity<UserHistory> saveHistory(@RequestBody UserHistory history) {
        if (history.getUsername() == null || history.getUsername().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        UserHistory saved = userHistoryRepository.save(history);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/list")
    public ResponseEntity<List<UserHistory>> getHistory(@RequestParam(value = "userId", required = false) Long userId,
                                                        @RequestParam(value = "username", required = false) String username) {
        if (userId != null) {
            return ResponseEntity.ok(userHistoryRepository.findByUserIdOrderByCreatedAtDesc(userId));
        } else if (username != null && !username.trim().isEmpty()) {
            return ResponseEntity.ok(userHistoryRepository.findByUsernameOrderByCreatedAtDesc(username.trim()));
        } else {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteHistory(@PathVariable Long id) {
        if (userHistoryRepository.existsById(id)) {
            userHistoryRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
