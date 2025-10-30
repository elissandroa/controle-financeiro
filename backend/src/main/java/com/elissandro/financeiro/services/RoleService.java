package com.elissandro.financeiro.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.elissandro.financeiro.dto.RoleDTO;
import com.elissandro.financeiro.entities.Role;
import com.elissandro.financeiro.repositories.RoleRepository;
import com.elissandro.financeiro.services.exceptions.DatabaseException;
import com.elissandro.financeiro.services.exceptions.ResourceNotFoundException;

@Service
public class RoleService {
	
	@Autowired
	private RoleRepository repository;
	
	@Transactional(readOnly = true)
	public List<RoleDTO> findAll() {
		List<Role> roles = repository.findAll();
		return roles.stream().map(role -> new RoleDTO(role)).collect(Collectors.toList());
	}
	
	@Transactional(readOnly = true)
	public RoleDTO findById(Long id) {
		Role role = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Role not found"));
		return new RoleDTO(role);
	}
	
	public RoleDTO insert(RoleDTO dto) {
		Role role = new Role();
		role.setAuthority(dto.getAuthority());
		role = repository.save(role);
		return new RoleDTO(role);
	}
	
	public RoleDTO update(Long id, RoleDTO dto) {
		Role role = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Role not found"));
		role.setAuthority(dto.getAuthority());
		role = repository.save(role);
		return new RoleDTO(role);
	}
	
	public void delete(Long id) {
		if (!repository.existsById(id)) {
			throw new ResourceNotFoundException("Role not found");
		}
		try {
			repository.deleteById(id);
		} catch (Exception e) {
			throw new DatabaseException("Could not delete role with id " + id);
		}
	}

}
