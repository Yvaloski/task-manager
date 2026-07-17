package com.example.taskmanager.specification;

import com.example.taskmanager.model.Task;
import com.example.taskmanager.model.TaskPriority;
import com.example.taskmanager.model.TaskStatus;
import org.springframework.data.jpa.domain.Specification;

public class TaskSpecification {

    public static Specification<Task> hasStatus(TaskStatus status) {
        return (root, query, criteriaBuilder) -> 
            status == null ? criteriaBuilder.conjunction() : criteriaBuilder.equal(root.get("status"), status);
    }

    public static Specification<Task> hasPriority(TaskPriority priority) {
        return (root, query, criteriaBuilder) -> 
            priority == null ? criteriaBuilder.conjunction() : criteriaBuilder.equal(root.get("priority"), priority);
    }

    public static Specification<Task> hasCategoryId(Long categoryId) {
        return (root, query, criteriaBuilder) -> 
            categoryId == null ? criteriaBuilder.conjunction() : criteriaBuilder.equal(root.get("category").get("id"), categoryId);
    }
}
