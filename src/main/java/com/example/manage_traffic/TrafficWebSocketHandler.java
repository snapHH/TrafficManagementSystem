package com.example.manage_traffic;

import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.client.RestTemplate;

public class TrafficWebSocketHandler extends TextWebSocketHandler {

    private final String HERE_API_KEY = "Your_API_key";
    private final String TRAFFIC_API_URL = "https://traffic.ls.hereapi.com/traffic/6.3/incidents.json" +
            "?bbox=37.7749,-122.4194;37.8044,-122.2711" +
            "&apiKey=" + HERE_API_KEY;

    @Override
    protected void handleTextMessage(org.springframework.web.socket.WebSocketSession session, TextMessage message) throws Exception {
        RestTemplate restTemplate = new RestTemplate();
        String trafficData = restTemplate.getForObject(TRAFFIC_API_URL, String.class);
        session.sendMessage(new TextMessage(trafficData));
    }
}
