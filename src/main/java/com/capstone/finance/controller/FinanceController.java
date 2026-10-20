package com.capstone.finance.controller;

import com.capstone.finance.model.SimulationRequest;
import com.capstone.finance.model.SimulationResult;
import com.capstone.finance.service.MonteCarloService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/finance")
@CrossOrigin(origins = "*")
public class FinanceController {

    private final MonteCarloService monteCarloService;

    @Autowired
    public FinanceController(MonteCarloService monteCarloService) {
        this.monteCarloService = monteCarloService;
    }

    @PostMapping("/simulate")
    public ResponseEntity<SimulationResult> runSimulation(@RequestBody SimulationRequest request) {
        try {
            SimulationResult result = monteCarloService.runSimulation(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
