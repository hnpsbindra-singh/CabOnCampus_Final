package com.testing.springpractice.caboncampus_lastdance.Models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class Rides {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Enumerated(EnumType.STRING)
    private Location pickup;
    @Enumerated(EnumType.STRING)
    private Location drop;
    @ManyToOne
    @JoinColumn(name = "student_id")
    private Users student;
    @ManyToOne
    @JoinColumn(name = "driver_id")
    private Users driver;

    @Enumerated(EnumType.STRING)
    private RideStatus status = RideStatus.PENDING;

    @CreationTimestamp
    private LocalDateTime createdAt = LocalDateTime.now();
    @UpdateTimestamp
    private LocalDateTime updatedAt = LocalDateTime.now();
}


