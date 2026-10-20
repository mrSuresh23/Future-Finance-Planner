package com.capstone.finance;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class FutureFinancePlannerApplication {

    public static void main(String[] args) {
        SpringApplication.run(FutureFinancePlannerApplication.class, args);
        System.out.println("==================================================");
        System.out.println("Future Finance Planner Spring Boot Server Running");
        System.out.println("Open http://localhost:8080 in your browser");
        System.out.println("==================================================");
    }
}
