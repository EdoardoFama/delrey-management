package com.delrey.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final int MAX_LOGIN_REQUESTS_PER_MINUTE = 10;
    private static final int MAX_API_REQUESTS_PER_MINUTE = 120;

    private static class RateBucket {
        long windowStart;
        AtomicInteger count;

        RateBucket(long windowStart) {
            this.windowStart = windowStart;
            this.count = new AtomicInteger(1);
        }
    }

    private final Map<String, RateBucket> loginRateMap = new ConcurrentHashMap<>();
    private final Map<String, RateBucket> apiRateMap = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        if (path.startsWith("/api/")) {
            String clientIp = getClientIp(request);
            long now = System.currentTimeMillis();

            if ("/api/login".equals(path) && "POST".equalsIgnoreCase(request.getMethod())) {
                if (isRateLimited(clientIp, loginRateMap, MAX_LOGIN_REQUESTS_PER_MINUTE, now)) {
                    sendRateLimitResponse(response, "Muitas tentativas de login. Por favor, aguarde um minuto.");
                    return;
                }
            } else {
                if (isRateLimited(clientIp, apiRateMap, MAX_API_REQUESTS_PER_MINUTE, now)) {
                    sendRateLimitResponse(response, "Limite de requisições excedido. Por favor, aguarde um momento.");
                    return;
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isRateLimited(String key, Map<String, RateBucket> map, int maxLimit, long now) {
        RateBucket bucket = map.compute(key, (k, v) -> {
            if (v == null || (now - v.windowStart) > 60000) {
                return new RateBucket(now);
            }
            v.count.incrementAndGet();
            return v;
        });

        return bucket.count.get() > maxLimit;
    }

    private String getClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isEmpty()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private void sendRateLimitResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType("application/json; charset=UTF-8");
        response.getWriter().write("{\"error\":\"" + message + "\",\"status\":429}");
    }
}
