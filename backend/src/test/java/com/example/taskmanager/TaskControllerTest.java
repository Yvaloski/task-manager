package com.example.taskmanager;

import com.example.taskmanager.model.Category;
import com.example.taskmanager.model.Task;
import com.example.taskmanager.model.TaskPriority;
import com.example.taskmanager.model.TaskStatus;
import com.example.taskmanager.repository.CategoryRepository;
import com.example.taskmanager.repository.TaskRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Category workCategory;
    private Category studyCategory;

    @BeforeEach
    public void setup() {
        taskRepository.deleteAll();
        categoryRepository.deleteAll();

        workCategory = categoryRepository.save(Category.builder().name("Work").description("Work tasks").build());
        studyCategory = categoryRepository.save(Category.builder().name("Study").description("Study tasks").build());
    }

    @Test
    public void testCreateTaskSuccess() throws Exception {
        Task task = Task.builder()
                .title("Complete Assignment")
                .description("Write unit tests")
                .creationDate(LocalDate.now())
                .dueDate(LocalDate.now().plusDays(2))
                .status(TaskStatus.A_FAIRE)
                .priority(TaskPriority.HAUTE)
                .category(workCategory)
                .build();

        mockMvc.perform(post("/api/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(task)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.title", is("Complete Assignment")))
                .andExpect(jsonPath("$.status", is("A_FAIRE")))
                .andExpect(jsonPath("$.priority", is("HAUTE")))
                .andExpect(jsonPath("$.category.id", is(workCategory.getId().intValue())));

        assertEquals(1, taskRepository.count());
    }

    @Test
    public void testCreateTaskInvalidCategory() throws Exception {
        Category invalidCategory = Category.builder().id(999L).name("Fake").build();
        Task task = Task.builder()
                .title("Complete Assignment")
                .creationDate(LocalDate.now())
                .status(TaskStatus.A_FAIRE)
                .priority(TaskPriority.HAUTE)
                .category(invalidCategory)
                .build();

        mockMvc.perform(post("/api/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(task)))
                .andExpect(status().isNotFound());

        assertEquals(0, taskRepository.count());
    }

    @Test
    public void testCreateTaskValidationFailure() throws Exception {
        Task task = Task.builder()
                .title("") // Blank title is invalid
                .creationDate(LocalDate.now())
                .status(TaskStatus.A_FAIRE)
                .priority(TaskPriority.HAUTE)
                .category(workCategory)
                .build();

        mockMvc.perform(post("/api/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(task)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testGetTaskByIdSuccess() throws Exception {
        Task saved = taskRepository.save(Task.builder()
                .title("Setup CI")
                .creationDate(LocalDate.now())
                .status(TaskStatus.EN_COURS)
                .priority(TaskPriority.HAUTE)
                .category(workCategory)
                .build());

        mockMvc.perform(get("/api/tasks/" + saved.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(saved.getId().intValue())))
                .andExpect(jsonPath("$.title", is("Setup CI")));
    }

    @Test
    public void testGetTaskByIdNotFound() throws Exception {
        mockMvc.perform(get("/api/tasks/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testUpdateTaskSuccess() throws Exception {
        Task saved = taskRepository.save(Task.builder()
                .title("Old Title")
                .creationDate(LocalDate.now())
                .status(TaskStatus.A_FAIRE)
                .priority(TaskPriority.BASSE)
                .category(workCategory)
                .build());

        Task updateDetails = Task.builder()
                .title("New Title")
                .description("New Description")
                .creationDate(LocalDate.now())
                .dueDate(LocalDate.now().plusDays(5))
                .status(TaskStatus.TERMINE)
                .priority(TaskPriority.HAUTE)
                .category(studyCategory)
                .build();

        mockMvc.perform(put("/api/tasks/" + saved.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDetails)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("New Title")))
                .andExpect(jsonPath("$.status", is("TERMINE")))
                .andExpect(jsonPath("$.priority", is("HAUTE")))
                .andExpect(jsonPath("$.category.id", is(studyCategory.getId().intValue())));

        Task updated = taskRepository.findById(saved.getId()).orElseThrow();
        assertEquals("New Title", updated.getTitle());
        assertEquals(TaskStatus.TERMINE, updated.getStatus());
        assertEquals(TaskPriority.HAUTE, updated.getPriority());
        assertEquals(studyCategory.getId(), updated.getCategory().getId());
    }

    @Test
    public void testDeleteTaskSuccess() throws Exception {
        Task saved = taskRepository.save(Task.builder()
                .title("Clean desk")
                .creationDate(LocalDate.now())
                .status(TaskStatus.A_FAIRE)
                .priority(TaskPriority.BASSE)
                .category(workCategory)
                .build());

        assertEquals(1, taskRepository.count());

        mockMvc.perform(delete("/api/tasks/" + saved.getId()))
                .andExpect(status().isNoContent());

        assertEquals(0, taskRepository.count());
    }

    @Test
    public void testFilterTasksByStatus() throws Exception {
        taskRepository.save(Task.builder()
                .title("Task A")
                .creationDate(LocalDate.now())
                .status(TaskStatus.A_FAIRE)
                .priority(TaskPriority.BASSE)
                .category(workCategory)
                .build());

        taskRepository.save(Task.builder()
                .title("Task B")
                .creationDate(LocalDate.now())
                .status(TaskStatus.TERMINE)
                .priority(TaskPriority.HAUTE)
                .category(workCategory)
                .build());

        mockMvc.perform(get("/api/tasks?status=TERMINE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title", is("Task B")));
    }

    @Test
    public void testFilterTasksByPriority() throws Exception {
        taskRepository.save(Task.builder()
                .title("Task A")
                .creationDate(LocalDate.now())
                .status(TaskStatus.A_FAIRE)
                .priority(TaskPriority.BASSE)
                .category(workCategory)
                .build());

        taskRepository.save(Task.builder()
                .title("Task B")
                .creationDate(LocalDate.now())
                .status(TaskStatus.TERMINE)
                .priority(TaskPriority.HAUTE)
                .category(workCategory)
                .build());

        mockMvc.perform(get("/api/tasks?priority=HAUTE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title", is("Task B")));
    }

    @Test
    public void testFilterTasksByCategory() throws Exception {
        taskRepository.save(Task.builder()
                .title("Task A")
                .creationDate(LocalDate.now())
                .status(TaskStatus.A_FAIRE)
                .priority(TaskPriority.BASSE)
                .category(workCategory)
                .build());

        taskRepository.save(Task.builder()
                .title("Task B")
                .creationDate(LocalDate.now())
                .status(TaskStatus.TERMINE)
                .priority(TaskPriority.HAUTE)
                .category(studyCategory)
                .build());

        mockMvc.perform(get("/api/tasks?categoryId=" + studyCategory.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title", is("Task B")));
    }

    @Test
    public void testFilterTasksCombined() throws Exception {
        taskRepository.save(Task.builder()
                .title("Task A")
                .creationDate(LocalDate.now())
                .status(TaskStatus.A_FAIRE)
                .priority(TaskPriority.BASSE)
                .category(workCategory)
                .build());

        taskRepository.save(Task.builder()
                .title("Task B")
                .creationDate(LocalDate.now())
                .status(TaskStatus.A_FAIRE)
                .priority(TaskPriority.HAUTE)
                .category(workCategory)
                .build());

        taskRepository.save(Task.builder()
                .title("Task C")
                .creationDate(LocalDate.now())
                .status(TaskStatus.TERMINE)
                .priority(TaskPriority.HAUTE)
                .category(studyCategory)
                .build());

        mockMvc.perform(get("/api/tasks?status=A_FAIRE&priority=HAUTE&categoryId=" + workCategory.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title", is("Task B")));
    }
}
