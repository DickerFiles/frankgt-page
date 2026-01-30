package org.itson.ejemplojavaee.servlets;

import com.google.gson.Gson;
import java.io.IOException;
import java.io.PrintWriter;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@WebServlet(name = "UsuariosServlets", urlPatterns = {"/usuarios"})
public class UsuariosServlets extends HttpServlet {

    private List<Usuario> usuarios = new ArrayList<>();
    private Gson gson = new Gson();

    class Usuario {
        private int id;
        private String nombre;

        public Usuario() {
        }

        public Usuario(int id, String nombre) {
            this.id = id;
            this.nombre = nombre;
        }

        public int getId() {
            return id;
        }

        public void setId(int id) {
            this.id = id;
        }

        public String getNombre() {
            return nombre;
        }

        public void setNombre(String nombre) {
            this.nombre = nombre;
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json:charset=UTF-8");
        String idParam = request.getParameter("id");

        try (PrintWriter out = response.getWriter()) {
            if (idParam == null) {
                out.print(gson.toJson(usuarios));
            } else {
                int id = Integer.parseInt(idParam);
                out.print(gson.toJson(usuarios.stream().filter(u -> u.getId() == id).findFirst().orElse(null)));
            }
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json:charset=UTF-8");
        Usuario nuevo = gson.fromJson(request.getReader(), Usuario.class);

        int id = usuarios.size();
        nuevo.setId(id);
        usuarios.add(nuevo);

        try (PrintWriter out = response.getWriter()) {
            out.print(gson.toJson(nuevo));
        }
    }
    
    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json:charset=UTF-8");
        int id = Integer.parseInt(request.getParameter("id"));
        Usuario datos = gson.fromJson(request.getReader(), Usuario.class);
        Usuario actualizado = usuarios.stream().filter(u -> u.getId() == id).findFirst().orElse(null);
        
        try(PrintWriter out = response.getWriter()){
            if(actualizado == null){
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.print(gson.toJson(null));
                return;
            }
            
            actualizado.setNombre(datos.getNombre());
            out.print(gson.toJson(actualizado));
        }
    }
       
    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json:charset=UTF-8");
        int id = Integer.parseInt(request.getParameter("id"));
        usuarios.removeIf(u -> u.id == id);
        
        try(PrintWriter out = response.getWriter()){
            out.print(gson.toJson(
                    Map.of("mensaje", "Usuario eliminado")
            ));
        }
    }

}
