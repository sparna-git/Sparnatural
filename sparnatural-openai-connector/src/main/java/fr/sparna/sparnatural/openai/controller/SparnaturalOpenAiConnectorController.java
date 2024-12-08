package fr.sparna.sparnatural.openai.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class SparnaturalOpenAiConnectorController {

    @PostMapping("/process")
    public String processInput(@RequestBody String input) throws Exception {
        // Simulate some processing
        Map<String, String> response = new HashMap<>();
        response.put("original", input);
        response.put("uppercase", input.toUpperCase());

        // Convert map to JSON
        ObjectMapper objectMapper = new ObjectMapper();
        return objectMapper.writeValueAsString(response);
    }
}