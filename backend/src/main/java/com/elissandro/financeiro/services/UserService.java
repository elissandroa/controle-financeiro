package com.elissandro.financeiro.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.elissandro.financeiro.dto.UserDTO;
import com.elissandro.financeiro.entities.Role;
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

	@Transactional
	public UserDTO insert(UserDTO dto) {
		User user = new User();
		user.setFirstName(dto.getFirstName());
		user.setLastName(dto.getLastName());
		user.setEmail(dto.getEmail());
		user.getRoles().clear();
		user.getRoles().addAll(dto.getRoles().stream().map(roleDto -> {
			return new Role(roleDto.getId(), roleDto.getAuthority());
		}).collect(Collectors.toList()));
		user = repository.save(user);
		return new UserDTO(user);
	}
	
	@Transactional
	public UserDTO update(Long id, UserDTO dto) {
		User user = repository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
		user.setFirstName(dto.getFirstName());
		user.setLastName(dto.getLastName());
		user.setEmail(dto.getEmail());
		user.getRoles().clear();
		user.getRoles().addAll(dto.getRoles().stream().map(roleDto -> {
			return new Role(roleDto.getId(), roleDto.getAuthority());
		}).collect(Collectors.toList()));
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
