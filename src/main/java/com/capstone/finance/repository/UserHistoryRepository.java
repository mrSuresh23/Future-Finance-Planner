package com.capstone.finance.repository;

import com.capstone.finance.model.UserHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserHistoryRepository extends JpaRepository<UserHistory, Long> {
    List<UserHistory> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<UserHistory> findByUsernameOrderByCreatedAtDesc(String username);
}
