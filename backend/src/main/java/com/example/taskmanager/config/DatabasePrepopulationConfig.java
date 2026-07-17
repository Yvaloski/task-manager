package com.example.taskmanager.config;

import com.example.taskmanager.model.Category;
import com.example.taskmanager.model.Task;
import com.example.taskmanager.model.TaskPriority;
import com.example.taskmanager.model.TaskStatus;
import com.example.taskmanager.repository.CategoryRepository;
import com.example.taskmanager.repository.TaskRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import java.time.LocalDate;
import java.util.List;

@Configuration
@Profile("!test") // Prevents pre-population execution during test runs to ensure test isolation
public class DatabasePrepopulationConfig {

    @Bean
    CommandLineRunner initDatabase(CategoryRepository categoryRepository, TaskRepository taskRepository) {
        return args -> {
            // Guard clause: skip pre-population if data already exists
            if (categoryRepository.count() > 0 || taskRepository.count() > 0) {
                return;
            }

            // Create exactly 3 categories
            Category work = Category.builder()
                    .name("Work")
                    .description("Professional tasks")
                    .build();

            Category personal = Category.builder()
                    .name("Personal")
                    .description("Personal chores and errands")
                    .build();

            Category study = Category.builder()
                    .name("Study")
                    .description("Educational and learning activities")
                    .build();

            categoryRepository.saveAll(List.of(work, personal, study));

            // Create exactly 5 tasks
            Task task1 = Task.builder()
                    .title("Setup repository")
                    .description("Initialize Maven and Angular structures")
                    .creationDate(LocalDate.of(2026, 7, 17))
                    .dueDate(LocalDate.of(2026, 7, 20))
                    .status(TaskStatus.A_FAIRE)
                    .priority(TaskPriority.HAUTE)
                    .category(work)
                    .build();

            Task task2 = Task.builder()
                    .title("Design database schema")
                    .description("Define entities, constraints, and relationships")
                    .creationDate(LocalDate.of(2026, 7, 17))
                    .dueDate(LocalDate.of(2026, 7, 18))
                    .status(TaskStatus.EN_COURS)
                    .priority(TaskPriority.HAUTE)
                    .category(work)
                    .build();

            Task task3 = Task.builder()
                    .title("Buy groceries")
                    .description("Milk, eggs, bread, and fruits")
                    .creationDate(LocalDate.of(2026, 7, 17))
                    .dueDate(LocalDate.of(2026, 7, 17))
                    .status(TaskStatus.A_FAIRE)
                    .priority(TaskPriority.BASSE)
                    .category(personal)
                    .build();

            Task task4 = Task.builder()
                    .title("Read Spring Boot book")
                    .description("Read chapters on JPA and Spring Boot configurations")
                    .creationDate(LocalDate.of(2026, 7, 15))
                    .dueDate(LocalDate.of(2026, 7, 25))
                    .status(TaskStatus.EN_COURS)
                    .priority(TaskPriority.MOYENNE)
                    .category(study)
                    .build();

            Task task5 = Task.builder()
                    .title("Complete workout")
                    .description("Cardio and strength training session")
                    .creationDate(LocalDate.of(2026, 7, 17))
                    .dueDate(LocalDate.of(2026, 7, 17))
                    .status(TaskStatus.TERMINE)
                    .priority(TaskPriority.MOYENNE)
                    .category(personal)
                    .build();

            taskRepository.saveAll(List.of(task1, task2, task3, task4, task5));
        };
    }
}
