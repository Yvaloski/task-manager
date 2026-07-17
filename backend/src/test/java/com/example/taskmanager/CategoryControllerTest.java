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
public class CategoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    public void setup() {
        taskRepository.deleteAll();
        categoryRepository.deleteAll();
    }

    @Test
    public void testCreateCategorySuccess() throws Exception {
        Category category = Category.builder()
                .name("Work")
                .description("Professional tasks")
                .build();

        mockMvc.perform(post("/api/categories")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(category)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.name", is("Work")))
                .andExpect(jsonPath("$.description", is("Professional tasks")));

        assertEquals(1, categoryRepository.count());
    }

    @Test
    public void testCreateCategoryValidationFailure() throws Exception {
        Category category = Category.builder()
                .name("") // empty name is invalid
                .description("Invalid")
                .build();

        mockMvc.perform(post("/api/categories")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(category)))
                .andExpect(status().isBadRequest());

        assertEquals(0, categoryRepository.count());
    }

    @Test
    public void testGetCategoryByIdSuccess() throws Exception {
        Category category = categoryRepository.save(Category.builder().name("Work").description("Desc").build());

        mockMvc.perform(get("/api/categories/" + category.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(category.getId().intValue())))
                .andExpect(jsonPath("$.name", is("Work")));
    }

    @Test
    public void testGetCategoryByIdNotFound() throws Exception {
        mockMvc.perform(get("/api/categories/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testGetAllCategories() throws Exception {
        categoryRepository.save(Category.builder().name("Work").build());
        categoryRepository.save(Category.builder().name("Personal").build());

        mockMvc.perform(get("/api/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].name", oneOf("Work", "Personal")))
                .andExpect(jsonPath("$[1].name", oneOf("Work", "Personal")));
    }

    @Test
    public void testUpdateCategorySuccess() throws Exception {
        Category category = categoryRepository.save(Category.builder().name("Work").description("Old Desc").build());

        Category updatedDetails = Category.builder()
                .name("Work Updated")
                .description("New Desc")
                .build();

        mockMvc.perform(put("/api/categories/" + category.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedDetails)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Work Updated")))
                .andExpect(jsonPath("$.description", is("New Desc")));

        Category saved = categoryRepository.findById(category.getId()).orElseThrow();
        assertEquals("Work Updated", saved.getName());
        assertEquals("New Desc", saved.getDescription());
    }

    @Test
    public void testDeleteCategoryCascadeDeleteTasks() throws Exception {
        Category category = categoryRepository.save(Category.builder().name("Work").build());
        
        taskRepository.save(Task.builder()
                .title("Task 1")
                .creationDate(LocalDate.now())
                .status(TaskStatus.A_FAIRE)
                .priority(TaskPriority.BASSE)
                .category(category)
                .build());

        assertEquals(1, categoryRepository.count());
        assertEquals(1, taskRepository.count());

        mockMvc.perform(delete("/api/categories/" + category.getId()))
                .andExpect(status().isNoContent());

        assertEquals(0, categoryRepository.count());
        assertEquals(0, taskRepository.count()); // verify tasks are cascade-deleted!
    }
}
