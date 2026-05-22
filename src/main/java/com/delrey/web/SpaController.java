package com.delrey.web;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import java.io.IOException;

@Controller
public class SpaController {

    @RequestMapping(value = {"/login", "/trocas", "/trocas/**", "/pecas", "/pecas/**"})
    public void forwardToSpa(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
        request.getRequestDispatcher("/index.html").forward(request, response);
    }
}
