package com.testing.springpractice.caboncampus_lastdance.Repository;

import com.testing.springpractice.caboncampus_lastdance.DTO.*;
import com.testing.springpractice.caboncampus_lastdance.Models.RideStatus;
import com.testing.springpractice.caboncampus_lastdance.Models.Role;
import com.testing.springpractice.caboncampus_lastdance.Models.Users;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<Users, UUID> {
   Users findByUsername(String username);

   boolean existsByUsername(String username);



   @Modifying
   @Transactional
   @Query("Update Users u " +
           "set u.password = :password " +
           "where u.username = :username")
   int updatepasswordForusername(String password, String username);

   @Query("select new  com.testing.springpractice.caboncampus_lastdance.DTO.ProfileResponse " +
           "(u.id," +
           "u.name," +
           "u.username," +
           "u.phoneNumber," +
           "u.rollNumber) " +
           "From Users u " +
           "WHERE u.username=:username")
   ProfileResponse selectFields(String username);

   @Transactional
   @Modifying
   @Query("UPDATE Users u " +
           "set u.phoneNumber= :phoneNumber," +
           "u.rollNumber = :rollNumber " +
           "where u.username = :username")
   int updateFields(String phoneNumber, String rollNumber, String username);

   @Query("select new com.testing.springpractice.caboncampus_lastdance.DTO.DriverDetails(" +
           "u.id," +
           "u.name," +
           "u.phoneNumber," +
           "u.vehicleNumber) " +
           "from Users u where u.role = :role" )
   List<DriverDetails> getAllUserWithRole(Role role);


   @Query("select new com.testing.springpractice.caboncampus_lastdance.DTO.UserDescription(" +
           "u.id," +
           "u.name," +
           "u.username," +
           "u.phoneNumber," +
           "u.role," +
           "u.vehicleNumber," +
           "u.rollNumber) " +
           "from Users u where u.role=:role")
   Page<UserDescription> getUsersAdminView(Role role, Pageable pageable);

   @Transactional
   @Modifying
   @Query("update Users u " +
           "set u.enabled=false " +
           "where u.id = :userId")
   int suspendUserById(UUID userId);

   @Transactional
   @Modifying
   @Query("update Users u " +
           "set u.enabled=true " +
           "where u.id = :userId")
   int unsuspendUserById(UUID userId);


   @Query("select new  com.testing.springpractice.caboncampus_lastdance.DTO.DriverProfileDetails " +
           "(u.id," +
           "u.name," +
           "u.username," +
           "u.phoneNumber," +
           "u.vehicleNumber) " +
           "From Users u " +
           "WHERE u.username=:username")
   DriverProfileDetails getDriverProfileDetailsByUsername(String username);

   @Transactional
   @Modifying
   @Query("UPDATE Users u " +
           "set u.phoneNumber= :phoneNumber," +
           "u.vehicleNumber = :vehicleNumber " +
           "where u.username = :username")
   int updateDriverDetails(String username, String phoneNumber, @NotBlank String vehicleNumber);



}
