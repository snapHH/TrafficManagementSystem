package com.example.manage_traffic;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
public class TrafficController {

    private final String HERE_API_KEY = "Your_API_Key"; // Get from HERE Traffic API
    private final String TRAFFIC_API_URL = "https://traffic.ls.hereapi.com/traffic/6.3/incidents.json" +
            "?bbox=37.7749,-122.4194;37.8044,-122.2711" +
            "&apiKey=" + HERE_API_KEY;

    @GetMapping("/api/traffic")
    public String getTrafficData() {
        RestTemplate restTemplate = new RestTemplate();
        return restTemplate.getForObject(TRAFFIC_API_URL, String.class);
    }
}
