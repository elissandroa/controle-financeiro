package com.elissandro.financeiro.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.elissandro.financeiro.dto.UserDTO;
import com.elissandro.financeiro.entities.User;
import com.elissandro.financeiro.repositories.UserRepository;

@Service
public class UserService {

	@Autowired
	private UserRepository repository;

	@Transactional(readOnly = true)
	public List<UserDTO> findAll() {
		List<User> users = repository.findAll();
		return users.stream().map(user -> new UserDTO(user)).collect(Collectors.toList());
	}

	@Transactional(readOnly = true)
	public UserDTO findById(Long id) {
		User user = repository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
		return new UserDTO(user);
	}

	public UserDTO insert(UserDTO dto) {
		User user = new User();
		user.setFirstName(dto.getFirstName());
		user.setLastName(dto.getLastName());
		user.setEmail(dto.getEmail());
		user = repository.save(user);
		return new UserDTO(user);
	}
	
	public UserDTO update(Long id, UserDTO dto) {
		User user = repository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
		user.setFirstName(dto.getFirstName());
		user.setLastName(dto.getLastName());
		user.setEmail(dto.getEmail());
		user = repository.save(user);
		return new UserDTO(user);
	}
	
	public void delete(Long id) {
		if (!repository.existsById(id)) {
			throw new RuntimeException("User not found");
		}
		repository.deleteById(id);
	}
}
