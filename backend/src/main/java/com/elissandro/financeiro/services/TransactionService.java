package com.elissandro.financeiro.services;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.elissandro.financeiro.dto.TransactionDTO;
import com.elissandro.financeiro.entities.Category;
import com.elissandro.financeiro.entities.Member;
import com.elissandro.financeiro.entities.Transaction;
import com.elissandro.financeiro.repositories.TransactionRepository;

@Service
public class TransactionService {

	@Autowired
	private TransactionRepository repository;
	
	
	@Transactional(readOnly = true)
	public List<TransactionDTO> findAll() {
		List<Transaction> transactions = repository.findAll();
		return transactions.stream().map(transaction -> new TransactionDTO(transaction)).collect(Collectors.toList());
	}
	
	@Transactional(readOnly = true)
	public List<TransactionDTO> findById(Long id) {
		Optional<Transaction> optionalTransaction = repository.findById(id);
		if (optionalTransaction.isEmpty()) {
			throw new RuntimeException("Transaction not found");
		}
		return optionalTransaction.stream().map(transaction -> new TransactionDTO(transaction)).collect(Collectors.toList());
	}
	
	@Transactional
	public TransactionDTO insert(TransactionDTO dto) {
		Transaction transaction = new Transaction();
		transaction.setAmount(dto.getAmount());
		transaction.setDate(dto.getDate());
		transaction.setTransactionType(dto.getTransactionType());
		transaction.setDescription(dto.getDescription());
		transaction.setMember(dto.getMemberId() != null
				? new Member(dto.getMemberId(), null, null, null)
				: null);
		transaction.setCategory(new Category(dto.getCategory().getId(), null));
		transaction = repository.save(transaction);
		return new TransactionDTO(transaction);
	}
	
	@Transactional
	public TransactionDTO update(Long id, TransactionDTO dto) {
		Transaction transaction = repository.findById(id).orElseThrow(() -> new RuntimeException("Transaction not found"));
		transaction.setAmount(dto.getAmount());
		transaction.setDate(dto.getDate());
		transaction.setTransactionType(dto.getTransactionType());
		transaction.setDescription(dto.getDescription());
		transaction.setMember(dto.getMember().getId() != null
				? new Member(dto.getMember().getId(), null, null, null)
				: null);
		transaction.setCategory(new Category(dto.getCategory().getId(), null));
		transaction = repository.save(transaction);
		return new TransactionDTO(transaction);
	}
	
	public void delete(Long id) {
		if (!repository.existsById(id)) {
			throw new RuntimeException("Transaction not found");
		}
		repository.deleteById(id);
	}
}
