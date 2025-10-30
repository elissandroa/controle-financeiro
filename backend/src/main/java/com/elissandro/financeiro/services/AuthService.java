package com.elissandro.financeiro.services;


import java.time.Instant;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import com.elissandro.financeiro.dto.EmailDTO;
import com.elissandro.financeiro.dto.NewPasswordDTO;
import com.elissandro.financeiro.entities.PasswordRecover;
import com.elissandro.financeiro.entities.User;
import com.elissandro.financeiro.repositories.PasswordRecoverRepository;
import com.elissandro.financeiro.repositories.UserRepository;
import com.elissandro.financeiro.services.exceptions.ResourceNotFoundException;

import jakarta.transaction.Transactional;

@Service
public class AuthService {

	@Value("${email.password-recover.token.minutes}")
	private Long tokenMinutes;

	@Value("${email.password-recover.uri}")
	private String recoverUri;

	@Autowired
	private UserRepository repository;

	@Autowired
	private PasswordRecoverRepository passwordRecoverRepository;

	@Autowired
	private EmailService emailService;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Transactional
	public void createRecoverToken(EmailDTO body) {
		User user = repository.findByEmail(body.getTo());
		if (user == null) {
			throw new ResourceNotFoundException("Email not found");
		}

		PasswordRecover entity = new PasswordRecover();
		entity.setEmail(body.getTo());
		entity.setToken(UUID.randomUUID().toString());
		entity.setExpiration(Instant.now().plusSeconds(tokenMinutes * 60L));
		entity = passwordRecoverRepository.save(entity);
		emailService.sendEmail(body.getTo(), body.getSubject(), recoverUri + "/" + entity.getToken());
	}

	public void saveNewPassword(NewPasswordDTO body) {
		PasswordRecover entity = passwordRecoverRepository.findByToken(body.getToken(), Instant.now()).stream()
				.findFirst().orElse(null);
		if (entity == null) {
			throw new ResourceNotFoundException("Token inválido");
		}
		if (Instant.now().isAfter(entity.getExpiration())) {
			throw new ResourceNotFoundException("Token inválido");
		}

		User user = repository.findByEmail(entity.getEmail());
		user.setPassword(passwordEncoder.encode(body.getNewPassword()));
		repository.save(user);
	}

	protected User authenticated() {
		try {
			Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
			Jwt jwtPrincipal = (Jwt) authentication.getPrincipal();
			String username = jwtPrincipal.getClaim("username");
			return repository.findByEmail(username);
		} catch (Exception e) {
			throw new UsernameNotFoundException("Invalid user");
		}
	}

}