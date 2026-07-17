package com.testing.springpractice.caboncampus_lastdance.Repository;

import com.testing.springpractice.caboncampus_lastdance.DTO.RideDetails;
import com.testing.springpractice.caboncampus_lastdance.Models.RideStatus;
import com.testing.springpractice.caboncampus_lastdance.Models.Rides;
import com.testing.springpractice.caboncampus_lastdance.Models.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Repository
public interface RidesRepository extends JpaRepository<Rides, UUID> {
    @Query("select new com.testing.springpractice.caboncampus_lastdance.DTO.RideDetails(" +
            "r.id," +
            "u.id," +
            "r.pickup," +
            "r.drop," +
            "u.name," +
            "u.phoneNumber," +
            "u.vehicleNumber," +
            "r.status) " +
            "from Rides r " +
            "left JOIN r.driver u " +
            "where r.status = :status " +
            "And r.student.username=:username " +
            "order by r.createdAt desc")
    List<RideDetails> getAllRidesByRideStatus(RideStatus status, String username);

    @Query("select new com.testing.springpractice.caboncampus_lastdance.DTO.RideDetails(" +
            "r.id," +
            "u.id," +
            "r.pickup," +
            "r.drop," +
            "u.name," +
            "u.phoneNumber," +
            "u.vehicleNumber," +
            "r.status) " +
            "from Rides r " +
            "left JOIN r.driver u " +
            "where " +
            "r.student.username=:username " +
            "order by r.createdAt desc")
    List<RideDetails> getAllRides( String username);

    @Query("select new com.testing.springpractice.caboncampus_lastdance.DTO.RideDetails(" +
            "r.id," +
            "u.id," +
            "r.pickup," +
            "r.drop," +
            "u.name," +
            "u.phoneNumber," +
            "u.vehicleNumber," +
            "r.status) " +
            "from Rides r " +
            "left JOIN r.driver u " +
            "where r.id = :rideId")
    RideDetails getRideById(UUID rideId);

    @Modifying
    @Transactional
    @Query("""
    UPDATE Rides r
    SET r.status = :status
    WHERE r.id = :rideId
""")
    int updateRideStatus(UUID rideId, RideStatus status);

    @Query("select new com.testing.springpractice.caboncampus_lastdance.DTO.RideDetails(" +
            "r.id," +
            "u.id," +
            "r.pickup," +
            "r.drop," +
            "u.name," +
            "u.phoneNumber," +
            "u.rollNumber," +
            "r.status) " +
            "from Rides r " +
            "left JOIN r.student u " +
            "where r.status=:status")
    List<RideDetails> getRideByStatus(RideStatus status);

    @Transactional
    @Modifying
    @Query("update Rides r " +
            "set r.driver = :user, " +
            "r.status = :status " +
            "where r.id = :rideId and r.status = :oldStatus and r.driver is null"
    )
    int acceptARide(Users user, UUID rideId, RideStatus status, RideStatus oldStatus);

    @Query("select new com.testing.springpractice.caboncampus_lastdance.DTO.RideDetails(" +
            "r.id," +
            "u.id," +
            "r.pickup," +
            "r.drop," +
            "u.name," +
            "u.phoneNumber," +
            "u.rollNumber," +
            "r.status) " +
            "from Rides r " +
            "left JOIN r.student u " +
            "where " +
            "r.driver.username=:username " +
            "order by r.createdAt desc")
    List<RideDetails> getAllDriverRides( String username);

    @Query("select new com.testing.springpractice.caboncampus_lastdance.DTO.RideDetails(" +
            "r.id," +
            "u.id," +
            "r.pickup," +
            "r.drop," +
            "u.name," +
            "u.phoneNumber," +
            "u.rollNumber," +
            "r.status) " +
            "from Rides r " +
            "left JOIN r.student u " +
            "where " +
            "r.driver.username=:username AND r.id=:rideId " +
            "order by r.createdAt desc")
    RideDetails getDriverRide(UUID rideId, String username);



}
