package com.elissandro.financeiro.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.elissandro.financeiro.dto.UserDTO;
import com.elissandro.financeiro.services.UserService;

@RestController
@RequestMapping("/users")
public class UserController {

	@Autowired
	private UserService service;
	
	@GetMapping
	public List<UserDTO> findAll() {
		return service.findAll();
	}
	
	@GetMapping("/{id}")
	public UserDTO findById(@PathVariable Long id) {
		return service.findById(id);
	}
	
	@PostMapping
	public UserDTO insert(@RequestBody UserDTO dto) {
		return service.insert(dto);
	}
	
	@PutMapping("/{id}")
	public UserDTO update(@PathVariable Long id, @RequestBody UserDTO dto) {
		return service.update(id, dto);
	}
	
	@PostMapping("/delete/{id}")
	public void delete(@PathVariable Long id) {
		service.delete(id);
	}
	
}
