package com.example.leavemanager.controller;

import com.example.leavemanager.model.User;
import com.example.leavemanager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // Login endpoint
    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody User loginDetails) {
        Optional<User> userOpt = userRepository.findByEmail(loginDetails.getEmail());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getPassword().equals(loginDetails.getPassword())) {
                // Clear password before sending to frontend for security
                User responseUser = new User(user.getId(), user.getName(), user.getEmail(), null, user.getRole(), user.getDepartment());
                return ResponseEntity.ok(responseUser);
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
    }

    // Register endpoint
    @PostMapping("/auth/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email is already registered");
        }
        // Save the user (store role as uppercase)
        if (user.getRole() == null || user.getRole().trim().isEmpty()) {
            user.setRole("EMPLOYEE");
        } else {
            user.setRole(user.getRole().toUpperCase());
        }
        User savedUser = userRepository.save(user);
        savedUser.setPassword(null);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
    }

    // Employee CRUD: List all employees
    @GetMapping("/employees")
    public ResponseEntity<List<User>> getAllEmployees() {
        List<User> employees = userRepository.findAll().stream()
                .filter(user -> "EMPLOYEE".equalsIgnoreCase(user.getRole()))
                .map(user -> new User(user.getId(), user.getName(), user.getEmail(), null, user.getRole(), user.getDepartment()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(employees);
    }

    // Employee CRUD: Add new Employee (Admin/Manager can also create employees directly)
    @PostMapping("/employees")
    public ResponseEntity<?> addEmployee(@RequestBody User employee) {
        if (userRepository.findByEmail(employee.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email is already in use");
        }
        employee.setRole("EMPLOYEE");
        User savedEmployee = userRepository.save(employee);
        savedEmployee.setPassword(null);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedEmployee);
    }

    // Employee CRUD: Update an Employee
    @PutMapping("/employees/{id}")
    public ResponseEntity<?> updateEmployee(@PathVariable Long id, @RequestBody User employeeDetails) {
        Optional<User> employeeOpt = userRepository.findById(id);
        if (employeeOpt.isPresent()) {
            User employee = employeeOpt.get();
            employee.setName(employeeDetails.getName());
            employee.setEmail(employeeDetails.getEmail());
            employee.setDepartment(employeeDetails.getDepartment());
            if (employeeDetails.getPassword() != null && !employeeDetails.getPassword().trim().isEmpty()) {
                employee.setPassword(employeeDetails.getPassword());
            }
            User updatedEmployee = userRepository.save(employee);
            updatedEmployee.setPassword(null);
            return ResponseEntity.ok(updatedEmployee);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Employee not found");
    }

    // Employee CRUD: Delete an Employee
    @DeleteMapping("/employees/{id}")
    public ResponseEntity<?> deleteEmployee(@PathVariable Long id) {
        Optional<User> employeeOpt = userRepository.findById(id);
        if (employeeOpt.isPresent()) {
            userRepository.delete(employeeOpt.get());
            return ResponseEntity.ok("Employee deleted successfully");
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Employee not found");
    }
}
