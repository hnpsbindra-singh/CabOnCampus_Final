package com.testing.springpractice.caboncampus_lastdance.DTO;

import lombok.*;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class EmailRequest {
   private Sender sender;
   private List<Reciever> to;
   private String subject;
   private String htmlContent;
}
