package com.elissandro.financeiro.services;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.elissandro.financeiro.dto.TransactionDTO;
import com.elissandro.financeiro.entities.Category;
import com.elissandro.financeiro.entities.Member;
import com.elissandro.financeiro.entities.Transaction;
import com.elissandro.financeiro.repositories.TransactionRepository;
import com.elissandro.financeiro.services.exceptions.DatabaseException;
import com.elissandro.financeiro.services.exceptions.ResourceNotFoundException;

@Service
public class TransactionService {

	@Autowired
	private TransactionRepository repository;
	
	
	@Transactional(readOnly = true)
	public Page<TransactionDTO> findAll(Pageable pageable) {
		Page<Transaction> transactions = repository.findAll(pageable);
		return transactions.map(transaction -> new TransactionDTO(transaction));
	}
	
	@Transactional(readOnly = true)
	public TransactionDTO findById(Long id) {
		Optional<Transaction> optionalTransaction = repository.findById(id);
		if (optionalTransaction.isEmpty()) {
			throw new ResourceNotFoundException("Transaction not found");
		}
		return new TransactionDTO(optionalTransaction.get());
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
		Transaction transaction = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
		transaction.setAmount(dto.getAmount());
		transaction.setDate(dto.getDate());
		transaction.setTransactionType(dto.getTransactionType());
		transaction.setDescription(dto.getDescription());
		transaction.setMember(new Member(dto.getMemberId(), null, null, null));
		transaction.setCategory(new Category(dto.getCategory().getId(), null));
		transaction = repository.save(transaction);
		return new TransactionDTO(transaction);
	}
	
	public void delete(Long id) {
		if (!repository.existsById(id)) {
			throw new ResourceNotFoundException("Transaction not found");
		}
		try {
			repository.deleteById(id);
		} catch (Exception e) {
			throw new DatabaseException("Could not delete transaction: " + e.getMessage());
		}
	}
}
