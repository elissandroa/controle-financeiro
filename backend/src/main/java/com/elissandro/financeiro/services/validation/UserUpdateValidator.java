package com.elissandro.financeiro.services.validation;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.servlet.HandlerMapping;

import com.elissandro.financeiro.controllers.exceptions.FieldMessage;
import com.elissandro.financeiro.dto.UserDTO;
import com.elissandro.financeiro.entities.User;
import com.elissandro.financeiro.repositories.UserRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class UserUpdateValidator implements ConstraintValidator<UserUpdateValid, UserDTO> {

	@Override
	public void initialize(UserUpdateValid ann) {
	}
	
	@Autowired
	private HttpServletRequest request;

	@Autowired
	private UserRepository userRepository;


	@SuppressWarnings({ "unchecked", "unused" })
	@Override
	public boolean isValid(UserDTO value, ConstraintValidatorContext context) {
		

		var uriVars = (Map<String, String>) request.getAttribute(HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE);
		Long userId = Long.parseLong((String) uriVars.get("id"));
		List<FieldMessage> list = new ArrayList<>();

		User user = userRepository.findByEmail(value.getEmail());
		if (user != null && !user.getId().equals(userId)) {
			list.add(new FieldMessage("email", "Email já existe"));
		}
		
		

		for (FieldMessage e : list) {
			context.disableDefaultConstraintViolation();
			context.buildConstraintViolationWithTemplate(e.getMessage()).addPropertyNode(e.getFieldName())
					.addConstraintViolation();
		}
		return list.isEmpty();
	}

}