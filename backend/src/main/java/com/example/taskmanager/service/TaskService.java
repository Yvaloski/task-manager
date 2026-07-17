package com.example.taskmanager.service;

import com.example.taskmanager.exception.ResourceNotFoundException;
import com.example.taskmanager.model.Category;
import com.example.taskmanager.model.Task;
import com.example.taskmanager.model.TaskPriority;
import com.example.taskmanager.model.TaskStatus;
import com.example.taskmanager.repository.CategoryRepository;
import com.example.taskmanager.repository.TaskRepository;
import com.example.taskmanager.specification.TaskSpecification;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final CategoryRepository categoryRepository;

    public TaskService(TaskRepository taskRepository, CategoryRepository categoryRepository) {
        this.taskRepository = taskRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<Task> getAllTasks(TaskStatus status, TaskPriority priority, Long categoryId) {
        Specification<Task> spec = Specification.where(TaskSpecification.hasStatus(status))
                .and(TaskSpecification.hasPriority(priority))
                .and(TaskSpecification.hasCategoryId(categoryId));
        return taskRepository.findAll(spec);
    }

    public Task getTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
    }

    public Task createTask(Task task) {
        if (task.getCreationDate() == null) {
            task.setCreationDate(LocalDate.now());
        }
        if (task.getCategory() != null && task.getCategory().getId() != null) {
            Category category = categoryRepository.findById(task.getCategory().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + task.getCategory().getId()));
            task.setCategory(category);
        }
        return taskRepository.save(task);
    }

    public Task updateTask(Long id, Task taskDetails) {
        return taskRepository.findById(id).map(task -> {
            task.setTitle(taskDetails.getTitle());
            task.setDescription(taskDetails.getDescription());
            task.setDueDate(taskDetails.getDueDate());
            task.setStatus(taskDetails.getStatus());
            task.setPriority(taskDetails.getPriority());

            if (taskDetails.getCategory() != null && taskDetails.getCategory().getId() != null) {
                Category category = categoryRepository.findById(taskDetails.getCategory().getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + taskDetails.getCategory().getId()));
                task.setCategory(category);
            } else {
                task.setCategory(null);
            }
            return taskRepository.save(task);
        }).orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
    }

    public void deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new ResourceNotFoundException("Task not found with id: " + id);
        }
        taskRepository.deleteById(id);
    }
}
