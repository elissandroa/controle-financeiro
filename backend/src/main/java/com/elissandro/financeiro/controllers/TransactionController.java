package com.elissandro.financeiro.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.elissandro.financeiro.dto.TransactionDTO;
import com.elissandro.financeiro.services.TransactionService;

@RestController
@RequestMapping("/transactions")
public class TransactionController {

	@Autowired
	private TransactionService service;
		
	@GetMapping
	public Page<TransactionDTO> findAll(Pageable pageable) {
		return service.findAll(pageable);
	}
	
	@GetMapping("/{id}")
	public TransactionDTO findById(@PathVariable Long id) {
		return service.findById(id);
	}
	
	@PostMapping
	public TransactionDTO insert(@RequestBody TransactionDTO dto) {
		return service.insert(dto);
	}
	
	@PutMapping("/{id}")
	public TransactionDTO update(@PathVariable Long id, @RequestBody TransactionDTO dto) {
		return service.update(id, dto);
	}
	
	@DeleteMapping("/{id}")
	public void delete(@PathVariable Long id) {
		service.delete(id);
	}
}
