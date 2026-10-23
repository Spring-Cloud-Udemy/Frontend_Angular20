package com.curso0.microservicio.app.commons.usuarios.models.entity;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;


//Entidad alumno designado como tabla y cada atributo como una columna
//las tablas deben ir todo en mayuscula o minuscula

@Table(name="alumnos") // se especifica el nombre si no la base de datos asigna el nombre de la clase como predeterminado
@Entity
public class Alumno {
	
	
	
	@Id //para indicar que es una clave
	@GeneratedValue(strategy = GenerationType.IDENTITY)//genera los id automaticamente
	private Long id;
	
	@NotBlank
	private String nombre;
	
	@NotEmpty
	private String apellido;
	
	@NotEmpty
	@Email
	private String email;
	
	//atributo que permite guardar cualqueir tipo de archivo 
	//se va a usar para vincular una foto a la aplicacion
	
	@JsonIgnore // lo usamos para que no se guarde junto al json y ocupe espacio
	@Column(name = "foto", columnDefinition = "bytea")//bytea se lee sin transaccion en PostgreSQL
	private byte[] foto;
	
	
	//Getters and Setters
	//ID
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id=id;
	}
	
	//Nombre
	public String getNombre() {
		return nombre;
	}
	public void Setnombre(String nombre) {
		this.nombre=nombre;
	}
	
	//Apellido
	public String getApellido() {
		return apellido;
	}
	public void setApellido(String apellido) {
		this.apellido = apellido;
	}
	//Email
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	
	//get and set foto
	public byte[] getFoto() {
		return foto;
	}
	public void setFoto(byte[] foto) {
		this.foto = foto;
	}
	public void setNombre(String nombre) {
		this.nombre = nombre;
	}
	
	
	
	
	
	//Date
	@Column(name = "create_at")
	
	private LocalDateTime createAT;
	
	
	@PrePersist
	//esta anotacion permite que este metodo se ejecute de primero antes que todo
	public void prePersist() {
		this.createAT= LocalDateTime.now();
	}
	public LocalDateTime getCreateAT() {
		return createAT;
	}
	public void setCreateAT(LocalDateTime createAT) {
		this.createAT = createAT;
	}
	
	
	@Override
	public boolean equals(Object obj) {
		//compara el objeto que estamos pasando, encuentra y elimina
		if(this == obj) {
			return true;
			
		}//tenemos que validar que objeto sea una instancia de alumno

		if(!(obj instanceof Alumno)) {
			return false;
		}
		Alumno a =(Alumno) obj;
		
		return this.id !=null && this.id.equals(a.getId());
	}
	
	//metodo foto identificador mediante hashcode unico
	public Integer getFotoHasCode() {
		return (this.foto != null) ? this.foto.hashCode(): null;
	}//si la foto es distinta null le colocamos hashcode de lo contrario retorna null
	
	
	
}