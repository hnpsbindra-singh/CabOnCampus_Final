package com.testing.springpractice.caboncampus_lastdance.Service;

import com.testing.springpractice.caboncampus_lastdance.DTO.EmailRequest;
import com.testing.springpractice.caboncampus_lastdance.DTO.Reciever;
import com.testing.springpractice.caboncampus_lastdance.DTO.Sender;
import com.testing.springpractice.caboncampus_lastdance.Models.Users;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;

import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;

@Service
public class EmailService {
    private final RestTemplate restTemplate;
    @Value("${brevo.api.key}")
    private String apiKey;

    @Value("${brevo.sender.email}")
    private String senderEmail;

    @Value("${brevo.sender.name}")
    private String senderName;

    public EmailService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public void sendOtp(String otp, String email){
        String subject = "Verify Your Email";

        String html = """
                <h2>Email Verification</h2>
                <p>Hello User,</p>
                <p>Your OTP is:</p>
                <h1>%s</h1>
                <p>This OTP is valid for 5 minutes.</p>
                """.formatted(otp);

        Sender sender = new Sender(senderName, senderEmail);
        Reciever reciever = new Reciever(email);
        EmailRequest request = new EmailRequest(sender, List.of(reciever), subject, html);
        HttpHeaders headers = new HttpHeaders();
        headers.set("api-key", apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<EmailRequest> entity = new HttpEntity<>(request, headers);
        ResponseEntity<String> response = restTemplate.exchange("https://api.brevo.com/v3/smtp/email",
                HttpMethod.POST,
                entity,
                String.class);
        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("Failed to send email");
        }
    }
    public void sendBooking(Users user, String email){
        String subject = "Ride Accepted - Cab On Campus";

        String html = """
        <h2>🚖 Ride Accepted</h2>

        <p>Your ride request has been accepted.</p>

        <p><strong>Driver Name:</strong> %s</p>

        <p><strong>Phone Number:</strong> %s</p>

        <p><strong>Vehicle Number:</strong> %s</p>

        <br>

        <p>Have a safe journey!</p>

        <p><strong>Cab On Campus Team</strong></p>
        """.formatted(
                user.getName(),
                user.getPhoneNumber(),
                user.getVehicleNumber()
        );
        Sender sender = new Sender(senderName, senderEmail);
        Reciever reciever = new Reciever(email);
        EmailRequest request = new EmailRequest(sender, List.of(reciever), subject, html);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("api-key", apiKey);
        HttpEntity<EmailRequest> entity = new HttpEntity<>(request, headers);
        ResponseEntity<String> response = restTemplate.exchange("https://api.brevo.com/v3/smtp/email",
                HttpMethod.POST,
                entity,
                String.class);
        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("Failed to send email");
        }

    }


}
