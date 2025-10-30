package com.elissandro.financeiro.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.elissandro.financeiro.dto.RoleDTO;
import com.elissandro.financeiro.services.RoleService;

@RestController
@RequestMapping("/roles")
public class RoleController {

	@Autowired
	private RoleService service;
	
	@GetMapping
	public List<RoleDTO> findAll() {
		return service.findAll();
	}
	
	@GetMapping("/{id}")
	public RoleDTO findById(@PathVariable Long id) {
		return service.findById(id);
	}
	
	@PostMapping
	public RoleDTO insert(@RequestBody RoleDTO dto) {
		return service.insert(dto);
	}
	
	@PutMapping("/{id}")
	public RoleDTO update(@PathVariable Long id, @RequestBody RoleDTO dto) {
		return service.update(id, dto);
	}
	
	@DeleteMapping("/{id}")
	public void delete(@PathVariable Long id) {
		service.delete(id);
	}
}
